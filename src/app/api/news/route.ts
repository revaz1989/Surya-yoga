import { NextResponse } from 'next/server'
import { getPublishedNewsPosts, getAllNewsPosts, createNewsPost, getUserById, getNewsPostsWithCommentCounts } from '@/lib/database'
import { getSessionFromRequest } from '@/lib/auth'

// GET - Fetch published news posts for public users
export async function GET() {
  try {
    const posts = getNewsPostsWithCommentCounts()
    
    return NextResponse.json({
      success: true,
      posts
    })
  } catch (error) {
    console.error('Failed to fetch news posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news posts' },
      { status: 500 }
    )
  }
}

// POST - Create new news post (admin only)
export async function POST(request: Request) {
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

    const postId = createNewsPost(
      title_en,
      title_ge,
      content_en,
      content_ge,
      excerpt_en || '',
      excerpt_ge || '',
      featured_image || null,
      media_files || null,
      session.userId,
      is_published || false
    )

    return NextResponse.json({
      success: true,
      postId,
      message: 'News post created successfully'
    })

  } catch (error) {
    console.error('Failed to create news post:', error)
    return NextResponse.json(
      { error: 'Failed to create news post' },
      { status: 500 }
    )
  }
}