'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

interface GoogleSignInProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function GoogleSignIn({ onSuccess, onError }: GoogleSignInProps) {
  const { language } = useLanguage()
  const { refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = () => {
    setLoading(true)
    
    // Generate state parameter for security
    const state = Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem('google_auth_state', state)
    
    const clientId = '1090892280289-scenu325aboqeur3vhdo5aj3rp9grnlo.apps.googleusercontent.com'
    const redirectUri = `${window.location.origin}/api/auth/google/callback`
    const scope = 'openid email profile'
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=select_account`
    
    // Open Google OAuth in a popup window
    const popup = window.open(
      googleAuthUrl,
      'google_auth',
      'width=500,height=600,scrollbars=yes,resizable=yes,status=1'
    )
    
    if (!popup) {
      setLoading(false)
      onError?.(language === 'ge' 
        ? 'Pop-up ვინდოუ დაბლოკილია'
        : 'Pop-up blocked'
      )
      return
    }
    
    // Check popup status with error handling
    const checkClosed = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkClosed)
          setLoading(false)
        }
      } catch (error) {
        // COOP policy blocks access to popup.closed
        // We'll rely on the message handler or timeout instead
        console.log('Cannot check popup status due to COOP policy')
      }
    }, 1000)
    
    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return
      }
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        clearInterval(checkClosed)
        window.removeEventListener('message', handleMessage, false)
        try {
          popup.close()
        } catch (error) {
          // Ignore popup close errors
        }
        // Refresh user data in auth context
        refreshUser()
        onSuccess?.()
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
        setLoading(false)
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        clearInterval(checkClosed)
        window.removeEventListener('message', handleMessage, false)
        try {
          popup.close()
        } catch (error) {
          // Ignore popup close errors
        }
        setLoading(false)
        onError?.(event.data.error || (language === 'ge' 
          ? 'Google-ით შესვლის შეცდომა'
          : 'Google Sign-In failed'
        ))
      }
    }
    
    window.addEventListener('message', handleMessage, false)
    
    // Cleanup function with timeout
    const cleanupTimeout = setTimeout(() => {
      clearInterval(checkClosed)
      window.removeEventListener('message', handleMessage, false)
      try {
        if (popup && !popup.closed) {
          popup.close()
        }
      } catch (error) {
        // Ignore popup access errors
      }
      setLoading(false)
      onError?.(language === 'ge' 
        ? 'ვადა ამოიწურა' 
        : 'Authentication timeout'
      )
    }, 300000) // 5 minute timeout
    
    // Store cleanup references for potential early cleanup
    const cleanup = () => {
      clearTimeout(cleanupTimeout)
      clearInterval(checkClosed)
      window.removeEventListener('message', handleMessage, false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full py-3 px-4 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span>
        {loading 
          ? (language === 'ge' ? 'იტვირთება...' : 'Loading...') 
          : (language === 'ge' ? 'Google-ით შესვლა' : 'Sign in with Google')
        }
      </span>
    </button>
  )
}

// Global type declaration for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
        }
      }
    }
  }
}