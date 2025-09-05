import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getSessionFromRequest } from '@/lib/auth'
import { getUserById } from '@/lib/database'

// Configure API route to handle larger files
export const runtime = 'nodejs'
export const maxDuration = 30 // 30 seconds timeout

// This doesn't work in App Router, but we'll handle size limits in our code
// export const bodyParser = {
//   sizeLimit: '50mb',
// }

export async function POST(request: NextRequest) {
  try {
    // Handle potential body size errors early
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const size = parseInt(contentLength)
      const maxSize = process.env.MAX_FILE_SIZE 
        ? parseInt(process.env.MAX_FILE_SIZE) 
        : 50 * 1024 * 1024 // 50MB
      
      if (size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024))
        return NextResponse.json(
          { error: `Request too large. Maximum size is ${maxSizeMB}MB` },
          { status: 413 }
        )
      }
    }
    
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

    let data
    try {
      data = await request.formData()
    } catch (error: any) {
      console.error('FormData parsing error:', error)
      // This likely means the request body was too large for Next.js to parse
      if (error.message?.includes('body') || error.message?.includes('size') || error.message?.includes('large')) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 50MB' },
          { status: 413 }
        )
      }
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }
    
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
    // In production, use public/uploads to ensure Next.js can serve the files
    // This will be in the Next.js build output directory
    const baseUploadDir = join(process.cwd(), 'public', 'uploads')
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

    // Return URL for the uploaded file
    // Files are stored in public/uploads and served directly by Next.js
    const publicUrl = `/uploads/news/${filename}`

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