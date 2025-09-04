import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getAllReviews, getUserById } from '@/lib/database'
import { getDatabase } from '@/lib/database'

// GET /api/admin/reviews - Get all reviews (pending and approved)
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult // Authentication failed
    }

    const { session } = authResult
    
    // Check if user is admin
    const user = getUserById(session.userId)
    if (!user || !user.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const reviews = getAllReviews()
    
    // Only return pending reviews for admin approval
    const pendingReviews = reviews.filter(review => review.is_approved === 0)
    
    return NextResponse.json({
      reviews: pendingReviews,
      success: true
    })
  } catch (error) {
    console.error('Get admin reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/admin/reviews - Approve or delete reviews
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult // Authentication failed
    }

    const { session } = authResult
    
    // Check if user is admin
    const user = getUserById(session.userId)
    if (!user || !user.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { action, reviewId } = body
    
    if (!action || !reviewId) {
      return NextResponse.json(
        { error: 'Action and reviewId are required' },
        { status: 400 }
      )
    }
    
    const db = getDatabase()
    
    if (action === 'approve') {
      const stmt = db.prepare('UPDATE reviews SET is_approved = 1 WHERE id = ?')
      const result = stmt.run(reviewId)
      
      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        message: 'Review approved successfully',
        success: true
      })
    } else if (action === 'delete') {
      const stmt = db.prepare('DELETE FROM reviews WHERE id = ?')
      const result = stmt.run(reviewId)
      
      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        message: 'Review deleted successfully',
        success: true
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "delete"' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Admin review action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}