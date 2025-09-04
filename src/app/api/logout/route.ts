import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, clearAuthCookie, invalidateSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Logout API called')
    
    // Get current session
    const session = getSessionFromRequest(request)
    
    if (session) {
      // Invalidate session in database
      invalidateSession(session.sessionId)
      console.log('Session invalidated for user:', session.email)
    }

    // Create response and clear auth cookie
    const response = NextResponse.json({
      message: 'Logged out successfully',
      success: true
    })

    clearAuthCookie(response)
    
    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}