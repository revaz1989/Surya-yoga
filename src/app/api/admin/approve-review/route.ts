import { NextRequest, NextResponse } from 'next/server'
import { approveReview, getAllReviews } from '@/lib/database'

// GET /api/admin/approve-review - Get all reviews for admin approval
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd check for admin authentication here
    const reviews = getAllReviews()
    
    return NextResponse.json({
      reviews,
      success: true
    })
  } catch (error) {
    console.error('Get all reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/admin/approve-review - Approve a review
export async function POST(request: NextRequest) {
  try {
    // In a real app, you'd check for admin authentication here
    const body = await request.json()
    const { reviewId } = body

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    const success = approveReview(reviewId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to approve review' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Review approved successfully',
      success: true
    })

  } catch (error) {
    console.error('Approve review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}