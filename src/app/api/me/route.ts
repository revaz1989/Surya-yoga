import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getUserById } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get fresh user data from database
    const user = getUserById(session.userId)
    
    if (!user || !user.is_verified) {
      return NextResponse.json(
        { error: 'User not found or not verified' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        is_admin: user.is_admin
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}