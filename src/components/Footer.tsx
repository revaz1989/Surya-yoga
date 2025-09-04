'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { language } = useLanguage()

  return (
    <footer className="bg-earth-800 text-white py-6 md:py-8 mt-12 md:mt-20">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm md:text-base font-bold text-black" style={{ color: '#000000', opacity: 1 }}>
          © 2024 Surya Yoga. {language === 'ge' ? 'ყველა უფლება დაცულია.' : 'All rights reserved.'}
        </p>
        <p className="mt-2 text-sm md:text-base text-black font-semibold" style={{ color: '#000000', opacity: 1 }}>
          {language === 'ge' 
            ? 'საქართველო, თბილისი, ფორე მოსულიშვილის ქ. 28'
            : 'Georgia, Tbilisi, Fore Mosulishvili St. 28'
          }
        </p>
        <p className="text-sm md:text-base text-black font-semibold" style={{ color: '#000000', opacity: 1 }}>
          +995 558 60 66 00 | SuryaYogaGeorgia@gmail.com
        </p>
      </div>
    </footer>
  )
}