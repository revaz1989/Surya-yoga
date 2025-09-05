import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getSessionFromRequest } from '@/lib/auth'
import { getUserById } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = getUserById(session.userId)
    if (!user || !user.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Check file size (configurable via environment or default 50MB)
    const maxSize = process.env.MAX_FILE_SIZE 
      ? parseInt(process.env.MAX_FILE_SIZE) 
      : 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    // Use environment-specific upload directory
    const baseUploadDir = process.env.UPLOAD_DIR 
      ? process.env.UPLOAD_DIR
      : join(process.cwd(), 'public', 'uploads')
    const newsDir = join(baseUploadDir, 'news')
    
    if (!existsSync(baseUploadDir)) {
      await mkdir(baseUploadDir, { recursive: true })
    }
    
    if (!existsSync(newsDir)) {
      await mkdir(newsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    const filepath = join(newsDir, filename)

    // Write file
    await writeFile(filepath, buffer)

    // Return URL that matches nginx configuration
    // In production, nginx serves /uploads directly from /var/lib/suryayoga/uploads
    // In development, we'll fall back to the API route
    const publicUrl = process.env.NODE_ENV === 'production' 
      ? `/uploads/news/${filename}`
      : `/api/media/news/${filename}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}