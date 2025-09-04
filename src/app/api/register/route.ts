import { NextRequest, NextResponse } from 'next/server'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/gmail'
import { createUser, getUserByEmail } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('Registration API called')
    const body = await request.json()
    console.log('Request body:', body)
    
    const { username, email, password, language } = body

    // Basic validation
    if (!username || !email || !password) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Basic validation passed')

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Invalid email format')
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    console.log('Email validation passed')

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
    if (!passwordRegex.test(password)) {
      console.log('Password validation failed')
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' },
        { status: 400 }
      )
    }

    console.log('Password validation passed')

    // Check if user already exists
    const existingUser = getUserByEmail(email)
    if (existingUser) {
      console.log('User already exists')
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'ამ ელ.ფოსტით მომხმარებელი უკვე რეგისტრირებულია' 
          : 'A user with this email already exists' 
        },
        { status: 400 }
      )
    }

    // Create user in database (unverified initially)
    console.log('Creating user in database')
    try {
      const userId = await createUser(username, email, password)
      console.log('User created with ID:', userId)
    } catch (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'მონაცემთა ბაზის შეცდომა. გთხოვთ სცადოთ ხელახლა.' 
          : 'Database error. Please try again.' 
        },
        { status: 500 }
      )
    }

    // Generate verification token
    console.log('Generating verification token')
    const verificationToken = generateVerificationToken(email)
    console.log('Token generated successfully')

    // Send verification email
    console.log('Attempting to send verification email')
    const emailSent = await sendVerificationEmail(email, verificationToken, language || 'en')
    console.log('Email sent result:', emailSent)

    if (!emailSent) {
      return NextResponse.json(
        { error: language === 'ge' 
          ? 'ელ.ფოსტის გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.' 
          : 'Failed to send verification email. Please try again.' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: language === 'ge' 
        ? 'რეგისტრაცია წარმატებულია! გთხოვთ შეამოწმოთ თქვენი ელ.ფოსტა ანგარიშის დასადასტურებლად.'
        : 'Registration successful! Please check your email to verify your account.',
      success: true
    })

  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}