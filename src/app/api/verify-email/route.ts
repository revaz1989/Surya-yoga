import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/gmail'
import { verifyUser, getUserByEmail } from '@/lib/database'

// Helper function to get the correct base URL
function getBaseUrl(): string {
  // Use NEXT_PUBLIC_BASE_URL if set (this should be https://suryayoga.ge in production)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  // Fallback to production URL if NODE_ENV is production but NEXT_PUBLIC_BASE_URL is not set
  if (process.env.NODE_ENV === 'production') {
    return 'https://suryayoga.ge'
  }
  
  // Default fallback for local development
  return 'http://localhost:3000'
}

export async function GET(request: NextRequest) {
  try {
    console.log('Email verification route called')
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    console.log('Token received:', token)

    if (!token) {
      console.log('No token provided')
      return NextResponse.redirect(new URL('/register?error=missing_token', getBaseUrl()))
    }

    // Verify the token
    console.log('Verifying token...')
    const result = verifyToken(token)
    console.log('Token verification result:', result)

    if (!result) {
      console.log('Token verification failed')
      return NextResponse.redirect(new URL('/register?error=invalid_token', getBaseUrl()))
    }

    // Check if user exists in database
    const user = getUserByEmail(result.email)
    if (!user) {
      console.log('User not found in database')
      return NextResponse.redirect(new URL('/register?error=user_not_found', getBaseUrl()))
    }

    // Update user status in database to verified
    const verificationResult = verifyUser(result.email)
    if (!verificationResult) {
      console.log('Failed to update user verification status')
      return NextResponse.redirect(new URL('/register?error=verification_failed', getBaseUrl()))
    }
    
    console.log(`Email verified successfully for: ${result.email}`)

    // Redirect to success page
    return NextResponse.redirect(new URL('/register?success=verified', getBaseUrl()))

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/register?error=verification_failed', getBaseUrl()))
  }
}