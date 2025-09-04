import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getUserById } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Authentication failed
    }

    const { session } = authResult;
    
    // Check if user is admin
    const user = getUserById(session.userId);
    if (!user || !user.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const db = getDatabase();
    
    // Get total users count
    const totalUsersStmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalUsersStmt.get() as { count: number };
    
    // Get verified users count
    const verifiedUsersStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_verified = 1');
    const verifiedUsers = verifiedUsersStmt.get() as { count: number };
    
    // Get admin users count
    const adminUsersStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 1');
    const adminUsers = adminUsersStmt.get() as { count: number };
    
    // Get total reviews count
    const totalReviewsStmt = db.prepare('SELECT COUNT(*) as count FROM reviews');
    const totalReviews = totalReviewsStmt.get() as { count: number };
    
    // Get approved reviews count
    const approvedReviewsStmt = db.prepare('SELECT COUNT(*) as count FROM reviews WHERE is_approved = 1');
    const approvedReviews = approvedReviewsStmt.get() as { count: number };
    
    // Get total news posts count
    const totalNewsStmt = db.prepare('SELECT COUNT(*) as count FROM news_posts');
    const totalNews = totalNewsStmt.get() as { count: number };
    
    // Get published news posts count
    const publishedNewsStmt = db.prepare('SELECT COUNT(*) as count FROM news_posts WHERE is_published = 1');
    const publishedNews = publishedNewsStmt.get() as { count: number };
    
    // Get total comments count
    const totalCommentsStmt = db.prepare('SELECT COUNT(*) as count FROM news_comments');
    const totalComments = totalCommentsStmt.get() as { count: number };
    
    // Get users registered in last 30 days
    const recentUsersStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= datetime('now', '-30 days')
    `);
    const recentUsers = recentUsersStmt.get() as { count: number };
    
    // Get users registered by month for the last 6 months
    const usersByMonthStmt = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count
      FROM users
      WHERE created_at >= datetime('now', '-6 months')
      GROUP BY month
      ORDER BY month DESC
    `);
    const usersByMonth = usersByMonthStmt.all() as { month: string; count: number }[];

    return NextResponse.json({
      users: {
        total: totalUsers.count,
        verified: verifiedUsers.count,
        admins: adminUsers.count,
        recentSignups: recentUsers.count,
        byMonth: usersByMonth
      },
      reviews: {
        total: totalReviews.count,
        approved: approvedReviews.count,
        pending: totalReviews.count - approvedReviews.count
      },
      news: {
        total: totalNews.count,
        published: publishedNews.count,
        drafts: totalNews.count - publishedNews.count
      },
      comments: {
        total: totalComments.count
      }
    });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}