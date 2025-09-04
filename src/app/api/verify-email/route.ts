import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/gmail'
import { verifyUser, getUserByEmail } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('Email verification route called')
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    console.log('Token received:', token)

    if (!token) {
      console.log('No token provided')
      return NextResponse.redirect(new URL('/register?error=missing_token', request.url))
    }

    // Verify the token
    console.log('Verifying token...')
    const result = verifyToken(token)
    console.log('Token verification result:', result)

    if (!result) {
      console.log('Token verification failed')
      return NextResponse.redirect(new URL('/register?error=invalid_token', request.url))
    }

    // Check if user exists in database
    const user = getUserByEmail(result.email)
    if (!user) {
      console.log('User not found in database')
      return NextResponse.redirect(new URL('/register?error=user_not_found', request.url))
    }

    // Update user status in database to verified
    const verificationResult = verifyUser(result.email)
    if (!verificationResult) {
      console.log('Failed to update user verification status')
      return NextResponse.redirect(new URL('/register?error=verification_failed', request.url))
    }
    
    console.log(`Email verified successfully for: ${result.email}`)

    // Redirect to success page
    return NextResponse.redirect(new URL('/register?success=verified', request.url))

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/register?error=verification_failed', request.url))
  }
}