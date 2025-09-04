import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword } from '@/lib/database'
import { generateSessionToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Login API called')
    const body = await request.json()
    console.log('Login request for:', body.email)
    
    const { email, password, language } = body

    // Basic validation
    if (!email || !password) {
      console.log('Missing credentials')
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'ელ.ფოსტა და პაროლი აუცილებელია' 
          : 'Email and password are required' 
        },
        { status: 400 }
      )
    }

    // Find user in database
    const user = getUserByEmail(email)
    if (!user) {
      console.log('User not found')
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'მომხმარებელი ვერ მოიძებნა' 
          : 'User not found' 
        },
        { status: 400 }
      )
    }

    // Check if user is verified
    if (!user.is_verified) {
      console.log('User not verified')
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'გთხოვთ დაადასტუროთ თქვენი ელ.ფოსტა პირველ რიგში' 
          : 'Please verify your email first' 
        },
        { status: 400 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash)
    if (!passwordValid) {
      console.log('Invalid password')
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'არასწორი პაროლი' 
          : 'Invalid password' 
        },
        { status: 400 }
      )
    }

    // Generate session
    console.log('Generating session for user:', user.id)
    const { token, expiresAt } = generateSessionToken(user.id, user.email, user.username)

    // Create response with auth cookie
    const response = NextResponse.json({
      message: language === 'ge' 
        ? 'წარმატებით შეხვედით!' 
        : 'Login successful!',
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })

    // Set auth cookie
    setAuthCookie(response, token, expiresAt)
    
    console.log('Login successful for user:', user.email)
    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}