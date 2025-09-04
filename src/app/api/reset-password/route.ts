import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/gmail'
import { getUserByEmail, updateUserPassword } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, password, language } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { 
          error: language === 'ge' 
            ? 'ტოკენი და პაროლი აუცილებელია' 
            : 'Token and password are required' 
        },
        { status: 400 }
      )
    }

    // Verify the reset token
    const tokenData = verifyToken(token)
    
    if (!tokenData) {
      return NextResponse.json(
        { 
          error: language === 'ge' 
            ? 'არასწორი ან ვადაგასული ლინკი' 
            : 'Invalid or expired reset link' 
        },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = getUserByEmail(tokenData.email)
    
    if (!user) {
      return NextResponse.json(
        { 
          error: language === 'ge' 
            ? 'მომხმარებელი ვერ მოიძებნა' 
            : 'User not found' 
        },
        { status: 404 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Update the user's password
    const success = updateUserPassword(tokenData.email, hashedPassword)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: language === 'ge' 
          ? 'პაროლი წარმატებით შეიცვალა'
          : 'Password successfully reset'
      })
    } else {
      return NextResponse.json(
        { 
          error: language === 'ge' 
            ? 'პაროლის შეცვლა ვერ მოხერხდა' 
            : 'Failed to reset password' 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}