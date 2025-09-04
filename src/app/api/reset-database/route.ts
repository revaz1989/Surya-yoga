import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

// POST /api/reset-database - Reset database and delete all reviews (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminKey } = body
    
    // Simple admin key check (you can change this key)
    if (adminKey !== 'surya-yoga-admin-2024') {
      return NextResponse.json(
        { error: 'Invalid admin key' },
        { status: 401 }
      )
    }
    
    const db = getDatabase()
    
    // Delete all reviews
    const deleteReviews = db.prepare('DELETE FROM reviews')
    const reviewsResult = deleteReviews.run()
    
    // Reset auto-increment counter for reviews
    try {
      db.exec('DELETE FROM sqlite_sequence WHERE name = "reviews"')
    } catch (error) {
      console.log('No sequence to reset')
    }
    
    return NextResponse.json({
      message: `Database reset successfully. Deleted ${reviewsResult.changes} reviews.`,
      success: true,
      deletedReviews: reviewsResult.changes
    })
    
  } catch (error) {
    console.error('Reset database error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}