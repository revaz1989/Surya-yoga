'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Star, Check, X } from 'lucide-react'

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

export default function AdminPage() {
  const { language } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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
          loadPendingReviews()
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

  const loadPendingReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
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
        loadPendingReviews() // Reload the list
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
        loadPendingReviews() // Reload the list
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

      <h2 className="text-2xl font-bold text-earth-800 mb-6">
        {language === 'ge' ? 'დასამტკიცებელი მიმოხილვები' : 'Pending Reviews'}
      </h2>
      
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-earth-600">
            {language === 'ge' ? 'დასამტკიცებელი მიმოხილვები არ არის.' : 'No pending reviews to approve.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
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
    </div>
  )
}