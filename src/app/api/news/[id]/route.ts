import { NextResponse } from 'next/server'
import { getNewsPostById, updateNewsPost, deleteNewsPost, toggleNewsPostPublication, getUserById } from '@/lib/database'
import { getSessionFromRequest } from '@/lib/auth'

// GET - Fetch single news post
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const postId = parseInt(id)
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }

    const post = getNewsPostById(postId)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if post is published or if user is admin
    const session = getSessionFromRequest(request)
    let isAdmin = false
    if (session) {
      const user = getUserById(session.userId)
      isAdmin = user?.is_admin === 1
    }
    if (!post.is_published && !isAdmin) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      post
    })
  } catch (error) {
    console.error('Failed to fetch news post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news post' },
      { status: 500 }
    )
  }
}

// PUT - Update news post (admin only)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params
    const postId = parseInt(id)
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }

    const {
      title_en,
      title_ge,
      content_en,
      content_ge,
      excerpt_en,
      excerpt_ge,
      featured_image,
      media_files,
      is_published
    } = await request.json()

    if (!title_en || !title_ge || !content_en || !content_ge) {
      return NextResponse.json(
        { error: 'Title and content are required in both languages' },
        { status: 400 }
      )
    }

    const success = updateNewsPost(
      postId,
      title_en,
      title_ge,
      content_en,
      content_ge,
      excerpt_en || '',
      excerpt_ge || '',
      featured_image || null,
      media_files || null,
      is_published || false
    )

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'News post updated successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to update news post' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Failed to update news post:', error)
    return NextResponse.json(
      { error: 'Failed to update news post' },
      { status: 500 }
    )
  }
}

// DELETE - Delete news post (admin only)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params
    const postId = parseInt(id)
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }

    const success = deleteNewsPost(postId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'News post deleted successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete news post' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Failed to delete news post:', error)
    return NextResponse.json(
      { error: 'Failed to delete news post' },
      { status: 500 }
    )
  }
}