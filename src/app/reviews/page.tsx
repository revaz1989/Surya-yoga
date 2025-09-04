'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Star, User, PenTool } from 'lucide-react'
import Link from 'next/link'

interface Review {
  id: number
  user_id: number
  rating: number
  title: string
  content: string
  language: string
  is_approved: number
  created_at: string
  updated_at: string
  username?: string
}

interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export default function ReviewsPage() {
  const { language } = useLanguage()
  const t = translations[language]
  
  const [user, setUser] = useState<User | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    content: '',
  })

  // Check authentication status
  useEffect(() => {
    checkAuth()
  }, [])

  // Load reviews
  useEffect(() => {
    loadReviews()
  }, [language])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?language=${language}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
  }

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      interactive ? (
        <button
          key={i}
          type="button"
          onClick={() => onStarClick && onStarClick(i + 1)}
          className="cursor-pointer hover:scale-110 transition-transform focus:outline-none"
        >
          <Star
            className={`w-5 h-5 transition-colors duration-200 ${
              i < rating 
                ? 'text-transparent' 
                : 'text-earth-300 hover:text-sun-300'
            }`}
            fill={i < rating 
              ? 'url(#sunGradient)' 
              : 'none'
            }
            style={i < rating ? {
              filter: 'drop-shadow(0 0 3px rgba(251, 146, 60, 0.5))'
            } : {}}
          />
        </button>
      ) : (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < rating ? 'text-transparent' : 'text-earth-300'
          }`}
          fill={i < rating 
            ? 'url(#sunGradient)' 
            : 'none'
          }
          style={i < rating ? {
            filter: 'drop-shadow(0 0 2px rgba(251, 146, 60, 0.3))'
          } : {}}
        />
      )
    ))
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || reviewForm.rating === 0 || !reviewForm.title.trim() || !reviewForm.content.trim()) {
      setMessage(language === 'ge' 
        ? 'გთხოვთ შეავსოთ ყველა ველი და აირჩიოთ რეიტინგი' 
        : 'Please fill all fields and select a rating'
      )
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: reviewForm.rating,
          title: reviewForm.title.trim(),
          content: reviewForm.content.trim(),
          language,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        setReviewForm({ rating: 0, title: '', content: '' })
        // Reviews will need admin approval, so we don't reload immediately
      } else {
        setMessage(result.error || (language === 'ge' 
          ? 'რეცენზიის გაგზავნა ვერ მოხერხდა'
          : 'Failed to submit review'))
      }
    } catch (error) {
      console.error('Submit review error:', error)
      setMessage(language === 'ge' 
        ? 'რეცენზიის გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.'
        : 'Failed to submit review. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(language === 'ge' ? 'ka-GE' : 'en-US')
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sun-500"></div>
          <p className="mt-2 text-earth-600">
            {language === 'ge' ? 'იტვირთება...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }


  return (
    <div className="container mx-auto px-4 py-12">
      {/* SVG gradient definition for sun-like stars */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="20%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="70%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>
      </svg>
      
      <h1 className="text-4xl font-bold text-center text-earth-800 mb-12">
        {t.reviews.title}
      </h1>

      <div className="max-w-4xl mx-auto">
        
        {/* Auth prompt or review form */}
        {!user ? (
          <div className="bg-sun-50 border border-sun-200 rounded-lg p-6 mb-8">
            <div className="text-center">
              <PenTool className="w-8 h-8 text-sun-600 mx-auto mb-3" />
              <p className="text-earth-700 mb-4">
                {language === 'ge' 
                  ? 'რეცენზიის დასაწერად გთხოვთ შეხვიდეთ თქვენს ანგარიშში' 
                  : 'Please log in to write a review'
                }
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link 
                  href="/login"
                  className="w-full sm:w-auto px-6 py-2 bg-sun-500 text-white rounded-full font-semibold hover:bg-sun-600 transition-colors shadow-md text-center"
                  style={{ backgroundColor: '#f97316', color: 'white' }}
                >
                  {language === 'ge' ? 'შესვლა' : 'Login'}
                </Link>
                <Link 
                  href="/register"
                  className="w-full sm:w-auto px-6 py-2 border border-sun-500 text-sun-600 rounded-full font-semibold hover:bg-sun-50 transition-colors text-center"
                  style={{ borderColor: '#f97316', color: '#ea580c' }}
                >
                  {language === 'ge' ? 'რეგისტრაცია' : 'Register'}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 card-shadow mb-8">
            <h3 className="text-xl font-semibold text-earth-800 mb-4">
              {language === 'ge' ? 'დაწერეთ რეცენზია' : 'Write a Review'}
            </h3>
            
            {message && (
              <div className={`p-4 rounded-lg mb-4 ${
                message.includes('successfully') || message.includes('წარმატებით')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-earth-700 mb-2">
                  {language === 'ge' ? 'რეიტინგი' : 'Rating'}
                </label>
                <div className="flex gap-1">
                  {renderStars(reviewForm.rating, true, (star) => 
                    setReviewForm({ ...reviewForm, rating: star })
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-earth-700 mb-2">
                  {language === 'ge' ? 'სათაური' : 'Title'}
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sun-500"
                  placeholder={language === 'ge' ? 'რეცენზიის სათაური' : 'Review title'}
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-earth-700 mb-2">
                  {language === 'ge' ? 'თქვენი რეცენზია' : 'Your Review'}
                </label>
                <textarea
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  className="w-full px-4 py-2 border border-earth-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sun-500"
                  rows={4}
                  placeholder={language === 'ge' ? 'გაუზიარეთ თქვენი გამოცდილება...' : 'Share your experience...'}
                  maxLength={1000}
                />
                <p className="text-sm text-earth-500 mt-1">
                  {reviewForm.content.length}/1000
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-sun-500 text-white rounded-full font-semibold hover:bg-sun-600 transition-colors disabled:bg-earth-400 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#f97316', minHeight: '40px' }}
              >
                {isSubmitting 
                  ? (language === 'ge' ? 'იგზავნება...' : 'Submitting...') 
                  : (language === 'ge' ? 'რეცენზიის გაგზავნა' : 'Submit Review')
                }
              </button>
            </form>
          </div>
        )}

        {/* Reviews display */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-earth-800">
            {language === 'ge' ? 'მომხმარებელთა რეცენზიები' : 'Customer Reviews'}
          </h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-earth-600">
                {language === 'ge' 
                  ? 'ჯერ არ არის რეცენზიები. იყავით პირველი!' 
                  : 'No reviews yet. Be the first to write one!'
                }
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg p-6 card-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-sun-100 rounded-full p-3">
                    <User className="w-6 h-6 text-sun-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-earth-800">{review.username || 'Anonymous'}</h3>
                      <span className="text-sm text-earth-500">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <h4 className="font-medium text-earth-800 mb-2">{review.title}</h4>
                    <p className="text-earth-700">{review.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}