'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Star, Check, X, Users, FileText, MessageSquare, TrendingUp } from 'lucide-react'

interface Review {
  id: number
  user_id: number
  rating: number
  title: string
  content: string
  language: string
  is_approved: number
  created_at: string
  username?: string
}

interface Metrics {
  users: {
    total: number
    verified: number
    admins: number
    recentSignups: number
    byMonth: { month: string; count: number }[]
  }
  reviews: {
    total: number
    approved: number
    pending: number
  }
  news: {
    total: number
    published: number
    drafts: number
  }
  comments: {
    total: number
  }
}

export default function AdminPage() {
  const { language } = useLanguage()
  const [pendingReviews, setPendingReviews] = useState<Review[]>([])
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const user = data.user
        
        // Check if user is admin
        if (user && user.is_admin) {
          setUser(user)
          loadReviews()
          loadMetrics()
        } else {
          setUser(null) // Not admin
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews')
      if (response.ok) {
        const data = await response.json()
        setPendingReviews(data.pendingReviews)
        setApprovedReviews(data.approvedReviews)
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
  }

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
    }
  }

  const approveReview = async (reviewId: number) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', reviewId }),
      })

      if (response.ok) {
        loadReviews() // Reload the list
      }
    } catch (error) {
      console.error('Failed to approve review:', error)
    }
  }

  const deleteReview = async (reviewId: number) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', reviewId }),
      })

      if (response.ok) {
        loadReviews() // Reload the list
      }
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-sun-400 text-sun-400' : 'text-earth-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        {language === 'ge' ? 'იტვირთება...' : 'Loading...'}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-earth-800 mb-4">
          {language === 'ge' ? 'ადმინისტრაციული წვდომა აკრძალულია' : 'Admin Access Denied'}
        </h1>
        <p className="text-earth-600">
          {language === 'ge' 
            ? 'ამ პანელზე წვდომისთვის საჭიროა ადმინისტრაციული უფლებები.' 
            : 'You need admin privileges to access this panel.'
          }
        </p>
        <p className="text-sm text-earth-500 mt-2">
          {language === 'ge'
            ? 'ადმინისტრაციული წვდომის მოსაპოვებლად მიმართეთ ვებ-გვერდის ადმინისტრატორს.'
            : 'Contact the website administrator to request admin access.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Admin Navigation */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-earth-800 mb-4">
          {language === 'ge' ? 'ადმინისტრაციული პანელი' : 'Admin Panel'}
        </h1>
        <div className="flex gap-4 mb-6">
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg">
            {language === 'ge' ? 'მიმოხილვები' : 'Reviews'}
          </button>
          <a 
            href="/admin/news"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {language === 'ge' ? 'სიახლეები' : 'News'}
          </a>
        </div>
      </div>

      {/* Metrics Section */}
      {metrics && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            {language === 'ge' ? 'სტატისტიკა' : 'Metrics'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users Card */}
            <div className="bg-white rounded-lg p-6 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-orange-500" />
                <span className="text-3xl font-bold text-earth-800">{metrics.users.total}</span>
              </div>
              <h3 className="text-sm font-semibold text-earth-700 mb-1">
                {language === 'ge' ? 'სულ მომხმარებლები' : 'Total Users'}
              </h3>
              <div className="text-xs text-earth-600 space-y-1">
                <div>{language === 'ge' ? 'დადასტურებული:' : 'Verified:'} {metrics.users.verified}</div>
                <div>{language === 'ge' ? 'ადმინისტრატორები:' : 'Admins:'} {metrics.users.admins}</div>
                <div className="pt-1 border-t border-earth-200">
                  <span className="text-green-600">+{metrics.users.recentSignups}</span> {language === 'ge' ? 'ბოლო 30 დღე' : 'last 30 days'}
                </div>
              </div>
            </div>

            {/* Reviews Card */}
            <div className="bg-white rounded-lg p-6 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-sun-400" />
                <span className="text-3xl font-bold text-earth-800">{metrics.reviews.total}</span>
              </div>
              <h3 className="text-sm font-semibold text-earth-700 mb-1">
                {language === 'ge' ? 'სულ მიმოხილვები' : 'Total Reviews'}
              </h3>
              <div className="text-xs text-earth-600 space-y-1">
                <div>{language === 'ge' ? 'დამტკიცებული:' : 'Approved:'} {metrics.reviews.approved}</div>
                <div className="text-orange-600">{language === 'ge' ? 'მოლოდინში:' : 'Pending:'} {metrics.reviews.pending}</div>
              </div>
            </div>

            {/* News Posts Card */}
            <div className="bg-white rounded-lg p-6 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-500" />
                <span className="text-3xl font-bold text-earth-800">{metrics.news.total}</span>
              </div>
              <h3 className="text-sm font-semibold text-earth-700 mb-1">
                {language === 'ge' ? 'სულ სიახლეები' : 'Total News Posts'}
              </h3>
              <div className="text-xs text-earth-600 space-y-1">
                <div>{language === 'ge' ? 'გამოქვეყნებული:' : 'Published:'} {metrics.news.published}</div>
                <div>{language === 'ge' ? 'მონახაზები:' : 'Drafts:'} {metrics.news.drafts}</div>
              </div>
            </div>

            {/* Comments Card */}
            <div className="bg-white rounded-lg p-6 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-8 h-8 text-green-500" />
                <span className="text-3xl font-bold text-earth-800">{metrics.comments.total}</span>
              </div>
              <h3 className="text-sm font-semibold text-earth-700 mb-1">
                {language === 'ge' ? 'სულ კომენტარები' : 'Total Comments'}
              </h3>
              <div className="text-xs text-earth-600">
                {language === 'ge' ? 'სიახლეების კომენტარები' : 'News post comments'}
              </div>
            </div>
          </div>

          {/* User Growth Chart */}
          {metrics.users.byMonth && metrics.users.byMonth.length > 0 && (
            <div className="mt-6 bg-white rounded-lg p-6 card-shadow">
              <h3 className="text-lg font-semibold text-earth-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {language === 'ge' ? 'მომხმარებლების ზრდა (ბოლო 6 თვე)' : 'User Growth (Last 6 Months)'}
              </h3>
              <div className="space-y-2">
                {metrics.users.byMonth.map((month) => (
                  <div key={month.month} className="flex items-center gap-3">
                    <span className="text-sm text-earth-600 w-20">{month.month}</span>
                    <div className="flex-1 bg-earth-100 rounded-full h-6 relative">
                      <div
                        className="bg-gradient-to-r from-sun-300 to-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.min((month.count / Math.max(...metrics.users.byMonth.map(m => m.count))) * 100, 100)}%`,
                          minWidth: month.count > 0 ? '40px' : '0'
                        }}
                      >
                        <span className="text-xs text-white font-semibold">{month.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-earth-800 mb-4">
          {language === 'ge' ? 'მიმოხილვების მართვა' : 'Review Management'}
        </h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'pending'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {language === 'ge' ? 'დასამტკიცებელი' : 'Pending'} ({pendingReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {language === 'ge' ? 'დამტკიცებული' : 'Approved'} ({approvedReviews.length})
          </button>
        </div>

        {/* Pending Reviews Tab */}
        {activeTab === 'pending' && (
          <>
            {pendingReviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-earth-600">
                  {language === 'ge' ? 'დასამტკიცებელი მიმოხილვები არ არის.' : 'No pending reviews to approve.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-6 card-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-earth-600">
                      by {review.username} • {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-earth-800 mb-2">
                    {review.title}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveReview(review.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {language === 'ge' ? 'დამტკიცება' : 'Approve'}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {language === 'ge' ? 'წაშლა' : 'Delete'}
                  </button>
                </div>
              </div>
              <p className="text-earth-700">{review.content}</p>
              <div className="mt-2 text-sm text-earth-500">
                {language === 'ge' ? 'ენა:' : 'Language:'} {review.language === 'ge' ? (language === 'ge' ? 'ქართული' : 'Georgian') : (language === 'ge' ? 'ინგლისური' : 'English')}
              </div>
            </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Approved Reviews Tab */}
        {activeTab === 'approved' && (
          <>
            {approvedReviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-earth-600">
                  {language === 'ge' ? 'დამტკიცებული მიმოხილვები არ არის.' : 'No approved reviews found.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {approvedReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg p-6 card-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-earth-600">
                            by {review.username} • {new Date(review.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {language === 'ge' ? 'დამტკიცებული' : 'Approved'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-earth-800 mb-2">
                          {review.title}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          {language === 'ge' ? 'წაშლა' : 'Delete'}
                        </button>
                      </div>
                    </div>
                    <p className="text-earth-700">{review.content}</p>
                    <div className="mt-2 text-sm text-earth-500">
                      {language === 'ge' ? 'ენა:' : 'Language:'} {review.language === 'ge' ? (language === 'ge' ? 'ქართული' : 'Georgian') : (language === 'ge' ? 'ინგლისური' : 'English')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}