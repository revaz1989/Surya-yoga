import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { deleteNewsComment, getUserById } from '@/lib/database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await params
    const commentId = parseInt(id)
    if (isNaN(commentId)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 })
    }

    const user = getUserById(session.userId)
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const deleted = deleteNewsComment(commentId)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}