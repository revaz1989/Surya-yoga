'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Upload, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'

function RegisterContent() {
  const { language } = useLanguage()
  const t = translations[language]
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.username) {
      newErrors.username = 'Username is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special character'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Handle URL parameters for verification results
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    
    if (success === 'verified') {
      setMessage(language === 'ge' 
        ? '✅ ელ.ფოსტა წარმატებით დადასტურდა! ახლა შეგიძლიათ შეხვიდეთ თქვენს ანგარიშში.'
        : '✅ Email verified successfully! You can now log in to your account.'
      )
    } else if (error === 'invalid_token') {
      setMessage(language === 'ge' 
        ? '❌ არასწორი ან ვადაგასული ვერიფიკაციის ლინკი. გთხოვთ სცადოთ ხელახლა რეგისტრაცია.'
        : '❌ Invalid or expired verification link. Please try registering again.'
      )
    } else if (error === 'missing_token') {
      setMessage(language === 'ge' 
        ? '❌ ვერიფიკაციის ტოკენი ვერ მოიძებნა. გთხოვთ გამოიყენოთ სწორი ლინკი ელ.ფოსტიდან.'
        : '❌ Verification token not found. Please use the correct link from your email.'
      )
    } else if (error === 'verification_failed') {
      setMessage(language === 'ge' 
        ? '❌ ელ.ფოსტის ვერიფიკაცია ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.'
        : '❌ Email verification failed. Please try again.'
      )
    }
  }, [searchParams, language])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!')
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    console.log('Form validation passed, making API call')
    setLoading(true)
    setMessage('')

    try {
      console.log('Sending request to /api/register')  
      const apiUrl = window.location.origin + '/api/register'
      console.log('API URL:', apiUrl)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          language,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(language === 'ge' 
          ? 'რეგისტრაცია წარმატებულია! გთხოვთ შეამოწმოთ თქვენი ელ.ფოსტა ანგარიშის დასადასტურებლად.'
          : 'Registration successful! Please check your email to verify your account.'
        )
        setFormData({ username: '', email: '', password: '', confirmPassword: '' })
      } else {
        setMessage(result.error || 'Registration failed')
      }
    } catch (error) {
      setMessage(language === 'ge' 
        ? 'რეგისტრაციის შეცდომა. გთხოვთ სცადოთ ხელახლა.'
        : 'Registration error. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-earth-800 mb-4">
          {t.register.title}
        </h1>
        <p className="text-center text-earth-600 mb-6 md:mb-8">
          {t.register.subtitle}
        </p>

        <div className="bg-white rounded-lg p-4 md:p-8 card-shadow">
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('successful') || message.includes('წარმატებულია') || message.includes('✅')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-earth-700 mb-2">
                {t.register.username}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-earth-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sun-500 ${
                    errors.username ? 'border-red-500' : 'border-earth-300'
                  }`}
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-earth-700 mb-2">
                {t.register.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-earth-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sun-500 ${
                    errors.email ? 'border-red-500' : 'border-earth-300'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-earth-700 mb-2">
                {t.register.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-earth-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                {t.register.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-earth-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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

            <div>
              <label className="block text-earth-700 mb-2">
                {t.register.photo}
              </label>
              <div className="border-2 border-dashed border-earth-300 rounded-lg p-6 text-center hover:border-sun-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-earth-400 mx-auto mb-2" />
                <p className="text-earth-600 text-sm">Click to upload or drag and drop</p>
                <p className="text-earth-500 text-xs mt-1">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>

            <div className="bg-sun-50 rounded-lg p-4">
              <p className="text-sm text-earth-700">
                {t.register.emailAgreement}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sun-500 text-white rounded-full font-semibold hover:bg-sun-600 transition-colors disabled:bg-earth-400 disabled:cursor-not-allowed border-2 border-red-500"
              style={{ backgroundColor: '#f97316', color: 'white', padding: '12px 24px' }}
            >
              {loading 
                ? (language === 'ge' ? 'იტვირთება...' : 'Loading...') 
                : t.register.submit
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-earth-600">
              {t.register.alreadyHaveAccount}{' '}
              <Link href="/login" className="text-sun-500 hover:text-sun-600 font-semibold">
                {t.register.login}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sun-500"></div>
          <p className="mt-2 text-earth-600">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}