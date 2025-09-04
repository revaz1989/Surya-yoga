import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  try {
    // Test database connection
    const db = getDatabase()
    db.prepare('SELECT 1 as healthy').get()
    
    // Get basic stats
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
    const newsCount = db.prepare('SELECT COUNT(*) as count FROM news_posts WHERE is_published = 1').get() as { count: number }
    
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      stats: {
        users: userCount.count,
        publishedNews: newsCount.count
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}