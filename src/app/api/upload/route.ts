import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getSessionFromRequest } from '@/lib/auth'
import { getUserById } from '@/lib/database'

// Configure API route to handle larger files
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout for large uploads

// Remove body size limits - accepting all file sizes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2gb', // Effectively unlimited
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    // No file size restrictions - removed size checking
    
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
      // Log the error but don't restrict based on size
      console.log('FormData parsing issue (size restrictions removed):', error.message)
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

    // No file size restrictions - accepting all file sizes

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
    // Use environment-specific upload directory for production
    const baseUploadDir = process.env.UPLOAD_DIR 
      ? process.env.UPLOAD_DIR
      : join(process.cwd(), 'uploads')
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
    // Use the media API route to serve files in both dev and production
    const publicUrl = `/api/media/news/${filename}`

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