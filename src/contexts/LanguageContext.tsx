'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Set Georgian as default language
  const [language, setLanguageState] = useState<Language>('ge')

  // Load language from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('surya-yoga-language') as Language
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ge')) {
        setLanguageState(savedLanguage)
      }
    } catch (error) {
      // Handle cases where localStorage is not available
      console.log('localStorage not available, using default language')
    }
  }, [])

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('surya-yoga-language', lang)
    } catch (error) {
      console.log('Failed to save language to localStorage')
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}