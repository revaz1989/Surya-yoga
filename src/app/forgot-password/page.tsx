'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const { language } = useLanguage()
  const t = translations[language]
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    if (!email) {
      setError(language === 'ge' ? 'ელ.ფოსტა აუცილებელია' : 'Email is required')
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(language === 'ge' ? 'არასწორი ელ.ფოსტის ფორმატი' : 'Invalid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, language }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setMessage(
          language === 'ge' 
            ? 'პაროლის აღდგენის ინსტრუქცია გამოგზავნილია თქვენს ელ.ფოსტაზე'
            : 'Password reset instructions have been sent to your email'
        )
      } else {
        setError(result.error || (language === 'ge' 
          ? 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ მოგვიანებით.'
          : 'An error occurred. Please try again later.'))
      }
    } catch (err) {
      setError(language === 'ge' 
        ? 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ მოგვიანებით.'
        : 'An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Link 
          href="/login"
          className="inline-flex items-center text-sun-600 hover:text-sun-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'ge' ? 'უკან დაბრუნება' : 'Back to login'}
        </Link>
        
        <h1 className="text-4xl font-bold text-center text-earth-800 mb-4">
          {language === 'ge' ? 'პაროლის აღდგენა' : 'Reset Password'}
        </h1>
        
        <p className="text-center text-earth-600 mb-8">
          {language === 'ge' 
            ? 'შეიყვანეთ თქვენი ელ.ფოსტა და ჩვენ გამოგიგზავნით ინსტრუქციას პაროლის აღსადგენად'
            : 'Enter your email and we will send you instructions to reset your password'
          }
        </p>

        <div className="bg-white rounded-lg p-8 card-shadow">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-700 mb-6">{message}</p>
              <Link 
                href="/login"
                className="inline-block px-6 py-3 bg-sun-500 text-white rounded-full font-semibold hover:bg-sun-600 transition-colors"
              >
                {language === 'ge' ? 'შესვლის გვერდზე დაბრუნება' : 'Return to Login'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-earth-700 mb-2">
                  {language === 'ge' ? 'ელ.ფოსტა' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-earth-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-earth-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sun-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                style={{ backgroundColor: loading ? '#9ca3af' : '#f97316' }}
              >
                {loading 
                  ? (language === 'ge' ? 'იგზავნება...' : 'Sending...') 
                  : (language === 'ge' ? 'ინსტრუქციის გაგზავნა' : 'Send Instructions')
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}