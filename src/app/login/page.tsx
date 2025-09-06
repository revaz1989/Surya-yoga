'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import GoogleSignIn from '@/components/GoogleSignIn'

export default function LoginPage() {
  const { language } = useLanguage()
  const t = translations[language]
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.email) {
      newErrors.email = language === 'ge' ? 'ელ.ფოსტა აუცილებელია' : 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = language === 'ge' ? 'არასწორი ელ.ფოსტის ფორმატი' : 'Invalid email address'
    }
    
    if (!formData.password) {
      newErrors.password = language === 'ge' ? 'პაროლი აუცილებელია' : 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      console.log('Attempting login')
      const response = await fetch(window.location.origin + '/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          language,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        // Redirect to home page after successful login
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
      } else {
        setMessage(result.error || (language === 'ge' 
          ? 'შესვლის შეცდომა'
          : 'Login failed'))
      }
    } catch (error) {
      console.error('Login error:', error)
      setMessage(language === 'ge' 
        ? 'შესვლის შეცდომა. გთხოვთ სცადოთ ხელახლა.'
        : 'Login error. Please try again.'
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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center text-earth-800 mb-4">
          {language === 'ge' ? 'შესვლა' : 'Login'}
        </h1>
        <p className="text-center text-earth-600 mb-8">
          {language === 'ge' 
            ? 'შედით თქვენს ანგარიშში' 
            : 'Sign in to your account'
          }
        </p>

        <div className="bg-white rounded-lg p-8 card-shadow">
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('coming soon') || message.includes('მალე დაემატება')
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <GoogleSignIn 
            onSuccess={() => setMessage(language === 'ge' ? 'წარმატებით შეხვედით!' : 'Successfully signed in!')}
            onError={(error) => setMessage(error)}
          />
          
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-earth-200 w-full"></div>
            <span className="bg-white px-4 text-earth-500 text-sm">
              {language === 'ge' ? 'ან' : 'or'}
            </span>
            <div className="border-t border-earth-200 w-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-earth-700 mb-2">
                {language === 'ge' ? 'ელ.ფოსტა' : 'Email'}
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
                {language === 'ge' ? 'პაროლი' : 'Password'}
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

            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-sun-600" />
                <span className="ml-2 text-earth-600">
                  {language === 'ge' ? 'დამიმახსოვრე' : 'Remember me'}
                </span>
              </label>
              <Link href="/forgot-password" className="text-sun-500 hover:text-sun-600 text-sm">
                {language === 'ge' ? 'პაროლი დაგავიწყდა?' : 'Forgot password?'}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sun-500 text-white rounded-full font-semibold hover:bg-sun-600 transition-colors disabled:bg-earth-400 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#f97316', color: 'white', padding: '12px 24px' }}
            >
              {loading 
                ? (language === 'ge' ? 'იტვირთება...' : 'Loading...') 
                : (language === 'ge' ? 'შესვლა' : 'Login')
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-earth-600">
              {language === 'ge' ? 'არ გაქვთ ანგარიში?' : "Don't have an account?"}{' '}
              <Link href="/register" className="text-sun-500 hover:text-sun-600 font-semibold">
                {language === 'ge' ? 'რეგისტრაცია' : 'Sign up'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}