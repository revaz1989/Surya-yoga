'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Globe, User, LogOut, Menu, X } from 'lucide-react'

interface UserType {
  id: number
  username: string
  email: string
  created_at: string
  is_admin?: number
}

export default function Navigation() {
  const { language, setLanguage } = useLanguage()
  const t = translations[language]
  const [user, setUser] = useState<UserType | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { href: '/', label: t.nav.home },
    { href: '/instructors', label: t.nav.instructors },
    { href: '/schedule', label: t.nav.schedule },
    { href: '/pricing', label: t.nav.pricing },
    { href: '/news', label: language === 'ge' ? 'სიახლეები' : 'News' },
    { href: '/reviews', label: t.nav.reviews },
  ]

  // Check authentication status
  useEffect(() => {
    checkAuth()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      setShowUserMenu(false)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/gallery/Logo.jpg" alt="Surya Yoga" className="h-10 w-10 rounded-full" />
            <span className="font-bold text-xl text-sun-600">{t.nav.logo}</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-earth-700 hover:text-sun-500 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
            
            {/* Admin Link - only show for admin users */}
            {user && user.is_admin === 1 && (
              <Link
                href="/admin"
                className="text-white bg-orange-600 hover:bg-orange-700 transition-colors font-medium px-3 py-1 rounded-full shadow-lg border-2 border-orange-700"
              >
                {language === 'ge' ? 'ადმინი' : 'Admin'}
              </Link>
            )}
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-1 rounded-full border border-sun-500 hover:bg-sun-50 transition-colors"
                >
                  <User className="w-4 h-4 text-sun-600" />
                  <span className="text-sun-700 font-medium">{user.username}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-earth-200 py-2">
                    <div className="px-4 py-2 text-sm text-earth-600 border-b border-earth-100 break-words">
                      {user.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left text-earth-700 hover:bg-earth-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{language === 'ge' ? 'გამოსვლა' : 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  className="text-earth-700 hover:text-sun-500 transition-colors font-medium border border-sun-500 px-3 py-1 rounded-full hover:bg-sun-50"
                >
                  {language === 'ge' ? 'შესვლა' : 'Login'}
                </Link>
                <Link
                  href="/register"
                  className="text-white bg-earth-700 hover:bg-earth-800 transition-colors font-medium px-3 py-1 rounded-full shadow-lg border-2 border-earth-800"
                  style={{ backgroundColor: '#44403c', color: 'white' }}
                >
                  {language === 'ge' ? 'რეგისტრაცია' : 'Register'}
                </Link>
              </div>
            )}
            
            <button
              onClick={() => setLanguage(language === 'en' ? 'ge' : 'en')}
              className="flex items-center space-x-2 px-3 py-1 rounded-full bg-sun-100 hover:bg-sun-200 transition-colors"
            >
              <Globe className="w-4 h-4 text-sun-600" />
              <span className="text-sun-700 font-medium">
                {language === 'en' ? 'EN' : 'GE'}
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ge' : 'en')}
              className="flex items-center space-x-1 px-2 py-1 rounded-full bg-sun-100 hover:bg-sun-200 transition-colors"
            >
              <Globe className="w-4 h-4 text-sun-600" />
              <span className="text-sun-700 font-medium text-sm">
                {language === 'en' ? 'EN' : 'GE'}
              </span>
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-md text-earth-700 hover:text-sun-500 hover:bg-sun-50 transition-colors"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-earth-200 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-earth-700 hover:text-sun-500 transition-colors font-medium px-4 py-2 rounded-md hover:bg-sun-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Admin Link for mobile - only show for admin users */}
              {user && user.is_admin === 1 && (
                <Link
                  href="/admin"
                  className="text-white bg-orange-600 hover:bg-orange-700 transition-colors font-medium px-4 py-2 rounded-md mx-4"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {language === 'ge' ? 'ადმინი' : 'Admin'}
                </Link>
              )}
              
              {user ? (
                <div className="px-4 py-2 border-t border-earth-200 pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-4 h-4 text-sun-600" />
                    <span className="text-sun-700 font-medium">{user.username}</span>
                  </div>
                  <div className="text-sm text-earth-600 mb-3 break-words">
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowMobileMenu(false)
                    }}
                    className="flex items-center space-x-2 text-earth-700 hover:text-sun-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{language === 'ge' ? 'გამოსვლა' : 'Logout'}</span>
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 border-t border-earth-200 pt-4 space-y-2">
                  <Link
                    href="/login"
                    className="block w-full text-center px-4 py-2 border border-sun-500 text-sun-600 rounded-full font-semibold hover:bg-sun-50 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {language === 'ge' ? 'შესვლა' : 'Login'}
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center px-4 py-2 text-white rounded-full font-semibold hover:bg-earth-800 transition-colors"
                    style={{ backgroundColor: '#44403c', color: 'white' }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {language === 'ge' ? 'რეგისტრაცია' : 'Register'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}