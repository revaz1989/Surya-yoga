'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function ResetPasswordForm() {
  const { language } = useLanguage()
  const t = translations[language]
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setMessage(language === 'ge' 
        ? 'არასწორი ან ვადაგასული ლინკი' 
        : 'Invalid or expired reset link')
    }
  }, [token, language])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!password) {
      newErrors.password = language === 'ge' ? 'პაროლი აუცილებელია' : 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = language === 'ge' 
        ? 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო' 
        : 'Password must be at least 6 characters'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = language === 'ge' 
        ? 'გაიმეორეთ პაროლი' 
        : 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = language === 'ge' 
        ? 'პაროლები არ ემთხვევა' 
        : 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setMessage(language === 'ge' 
        ? 'არასწორი ან ვადაგასული ლინკი' 
        : 'Invalid or expired reset link')
      return
    }
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password,
          language 
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setMessage(
          language === 'ge' 
            ? 'პაროლი წარმატებით შეიცვალა!'
            : 'Your password has been successfully reset!'
        )
      } else {
        setMessage(result.error || (language === 'ge' 
          ? 'პაროლის აღდგენა ვერ მოხერხდა. ლინკი შესაძლოა ვადაგასულია.'
          : 'Failed to reset password. The link may have expired.'))
      }
    } catch (err) {
      setMessage(language === 'ge' 
        ? 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ მოგვიანებით.'
        : 'An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field === 'password') {
      setPassword(value)
    } else {
      setConfirmPassword(value)
    }
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      })
    }
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 rounded-lg p-8 card-shadow">
            <p className="text-red-700 mb-6">{message}</p>
            <Link 
              href="/forgot-password"
              className="inline-block px-6 py-3 bg-sun-500 text-white rounded-full font-semibold hover:bg-sun-600 transition-colors"
            >
              {language === 'ge' ? 'ახალი ლინკის მოთხოვნა' : 'Request New Link'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center text-earth-800 mb-4">
          {language === 'ge' ? 'ახალი პაროლის შექმნა' : 'Create New Password'}
        </h1>
        
        <p className="text-center text-earth-600 mb-8">
          {language === 'ge' 
            ? 'შეიყვანეთ თქვენი ახალი პაროლი'
            : 'Enter your new password below'
          }
        </p>

        <div className="bg-white rounded-lg p-8 card-shadow">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-700 mb-6">{message}</p>
              <Link 
                href="/login"
                className="inline-block px-6 py-3 bg-sun-500 text-white rounded-full font-semibold hover:bg-sun-600 transition-colors"
              >
                {language === 'ge' ? 'შესვლა' : 'Go to Login'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && !success && (
                <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                  {message}
                </div>
              )}
              
              <div>
                <label className="block text-earth-700 mb-2">
                  {language === 'ge' ? 'ახალი პაროლი' : 'New Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-earth-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sun-500 ${
                      errors.password ? 'border-red-500' : 'border-earth-300'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-earth-700 mb-2">
                  {language === 'ge' ? 'გაიმეორეთ პაროლი' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-earth-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sun-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-earth-300'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                style={{ backgroundColor: loading ? '#9ca3af' : '#f97316' }}
              >
                {loading 
                  ? (language === 'ge' ? 'იცვლება...' : 'Resetting...') 
                  : (language === 'ge' ? 'პაროლის შეცვლა' : 'Reset Password')
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg p-8 card-shadow">
            <p className="text-earth-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}