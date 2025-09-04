import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/database'
import { generateVerificationToken, sendPasswordResetEmail } from '@/lib/gmail'

export async function POST(request: Request) {
  try {
    const { email, language } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: language === 'ge' ? 'ელ.ფოსტა აუცილებელია' : 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = getUserByEmail(email)
    
    // Always return success even if user doesn't exist (security best practice)
    // This prevents email enumeration attacks
    if (user) {
      // Generate password reset token
      const resetToken = generateVerificationToken(email)
      
      // Send password reset email
      const emailSent = await sendPasswordResetEmail(email, resetToken, language || 'en')
      
      if (!emailSent) {
        console.error('Failed to send password reset email to:', email)
      }
    }

    // Always return success message
    return NextResponse.json({
      success: true,
      message: language === 'ge' 
        ? 'თუ ეს ელ.ფოსტა რეგისტრირებულია ჩვენს სისტემაში, მალე მიიღებთ პაროლის აღდგენის ინსტრუქციას'
        : 'If this email is registered in our system, you will receive password reset instructions shortly'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}