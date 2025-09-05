import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createReview, getApprovedReviews } from '@/lib/database'

// GET /api/reviews - Get all approved reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || undefined

    const reviews = getApprovedReviews(language)
    
    return NextResponse.json({
      reviews,
      success: true
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Submit a new review (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult // Authentication failed
    }
    
    const { session } = authResult
    const body = await request.json()
    
    const { rating, title = '', content, language = 'en' } = body

    // Validation
    if (!rating || !content) {
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'რეიტინგი და შინაარსი აუცილებელია' 
          : 'Rating and content are required' 
        },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'რეიტინგი უნდა იყოს 1-დან 5-მდე' 
          : 'Rating must be between 1 and 5' 
        },
        { status: 400 }
      )
    }

    // Title is optional, only validate if provided
    if (title && title.length > 0 && (title.length < 3 || title.length > 100)) {
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'სათაური უნდა იყოს 3-100 სიმბოლო' 
          : 'Title must be 3-100 characters' 
        },
        { status: 400 }
      )
    }

    if (content.length < 10 || content.length > 1000) {
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'შინაარსი უნდა იყოს 10-1000 სიმბოლო' 
          : 'Content must be 10-1000 characters' 
        },
        { status: 400 }
      )
    }

    // Create review (requires approval by default)
    // Use empty string for title if not provided
    const reviewId = createReview(session.userId, rating, title || '', content, language)
    
    console.log(`Review created with ID ${reviewId} by user ${session.userId}`)

    return NextResponse.json({
      message: language === 'ge' 
        ? 'რეცენზია წარმატებით გაგზავნა! იგი გამოჩნდება მოდერაციის შემდეგ.' 
        : 'Review submitted successfully! It will appear after moderation.',
      success: true,
      reviewId
    })

  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}