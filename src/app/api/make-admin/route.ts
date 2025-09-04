import { NextRequest, NextResponse } from 'next/server'
import { makeUserAdmin } from '@/lib/database'

// POST /api/make-admin - Make a user admin (temporary route for setup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, adminKey } = body
    
    // Simple admin key check (you can change this key)
    if (adminKey !== 'surya-yoga-admin-2024') {
      return NextResponse.json(
        { error: 'Invalid admin key' },
        { status: 401 }
      )
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    const success = makeUserAdmin(email)
    
    if (!success) {
      return NextResponse.json(
        { error: 'User not found or already admin' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'User successfully made admin',
      success: true
    })
    
  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}