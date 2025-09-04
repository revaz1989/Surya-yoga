import { NextResponse } from 'next/server'
import { getAllNewsPosts, toggleNewsPostPublication, getUserById } from '@/lib/database'
import { getSessionFromRequest } from '@/lib/auth'

// GET - Fetch all news posts for admin
export async function GET(request: Request) {
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

    const posts = getAllNewsPosts()
    
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

// PATCH - Toggle publication status
export async function PATCH(request: Request) {
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

    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const success = toggleNewsPostPublication(postId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Post publication status updated'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to update post status' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Failed to toggle post publication:', error)
    return NextResponse.json(
      { error: 'Failed to toggle post publication' },
      { status: 500 }
    )
  }
}