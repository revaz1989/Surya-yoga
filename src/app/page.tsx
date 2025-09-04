'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { ArrowRight, Sun, Users, Heart, MapPin, Phone, Mail, Facebook } from 'lucide-react'

export default function Home() {
  const { language } = useLanguage()
  const t = translations[language]

  const galleryImages = [
    { src: '/gallery/studio1_upscayl_4x_upscayl-standard-4x.png', alt: 'Studio space' },
    { src: '/gallery/students practice.png', alt: 'Students practicing' },
    { src: '/gallery/studio2_upscayl_4x_upscayl-standard-4x.png', alt: 'Studio view' },
    { src: '/gallery/students practice1_upscayl_4x_upscayl-standard-4x.png', alt: 'Yoga practice' },
    { src: '/gallery/studio3_upscayl_4x_upscayl-standard-4x.png', alt: 'Studio interior' },
    { src: '/gallery/students practice 1_upscayl_4x_upscayl-standard-4x.png', alt: 'Group practice' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
        <div className="absolute inset-0">
          <Image
            src="/gallery/red-light-yoga-class.jpg"
            alt="Yoga practice"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{t.home.title}</h1>
          <p className="text-lg md:text-2xl mb-2">{t.home.tagline}</p>
          <p className="text-base md:text-xl mb-8">{t.home.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/schedule"
              className="px-6 py-3 bg-white text-sun-600 rounded-full font-semibold hover:bg-sun-50 transition-colors"
            >
              {t.home.ctaSchedule} <ArrowRight className="inline w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 bg-sun-600 text-white rounded-full font-semibold hover:bg-sun-700 transition-colors"
            >
              {t.home.ctaPricing}
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Sun className="w-16 h-16 text-sun-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-earth-800 mb-6">{t.home.whoWeAre}</h2>
            <p className="text-lg text-earth-700 leading-relaxed">
              {t.home.description}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-sun-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.home.expertInstructors}</h3>
              <p className="text-earth-600">{t.home.expertInstructorsDesc}</p>
            </div>
            <div className="text-center">
              <Heart className="w-12 h-12 text-sun-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.home.beginnerFriendly}</h3>
              <p className="text-earth-600">{t.home.beginnerFriendlyDesc}</p>
            </div>
            <div className="text-center">
              <Sun className="w-12 h-12 text-sun-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.home.warmCommunity}</h3>
              <p className="text-earth-600">{t.home.warmCommunityDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-earth-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-earth-800 mb-12">{t.home.ourStudio}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative h-64 rounded-lg overflow-hidden card-shadow">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">{t.home.startJourney}</h2>
          <p className="text-xl text-white/90 mb-8">{t.home.joinCommunity}</p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-earth-800 text-white rounded-full font-semibold text-lg hover:bg-earth-900 transition-colors shadow-xl border-2 border-white"
          >
            {t.home.ctaRegister} <ArrowRight className="inline w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-earth-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-earth-800 mb-12">
            {t.contact.title}
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-sun-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-earth-800 mb-1">{t.contact.address}</h3>
                    <p className="text-earth-700">
                      {language === 'ge' 
                        ? 'საქართველო, თბილისი, ფორე მოსულიშვილის ქუჩა 28'
                        : 'Georgia, Tbilisi, Fore Mosulishvili St. 28'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-sun-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-earth-800 mb-1">{t.contact.phone}</h3>
                    <p className="text-earth-700">+995 558 60 66 00</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-sun-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-earth-800 mb-1">{t.contact.email}</h3>
                    <p className="text-earth-700">SuryaYogaGeorgia@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Facebook className="w-6 h-6 text-sun-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-earth-800 mb-1">{t.contact.facebook}</h3>
                    <a 
                      href="https://www.facebook.com/karma.yoga.georgia/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sun-600 hover:text-sun-700 underline"
                    >
                      Surya Yoga Georgia
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Map or Additional Info */}
              <div className="bg-white rounded-lg p-6 card-shadow">
                <h3 className="font-semibold text-earth-800 mb-4">
                  {language === 'ge' ? 'სამუშაო საათები' : 'Working Hours'}
                </h3>
                <div className="space-y-2 text-earth-700">
                  <div className="flex justify-between">
                    <span>{language === 'ge' ? 'ორშ-პარ' : 'Mon-Fri'}:</span>
                    <span>09:00 - 21:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ge' ? 'შაბ-კვი' : 'Sat-Sun'}:</span>
                    <span>09:00 - 20:00</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-earth-200">
                  <p className="text-sm text-earth-600 text-center">
                    {language === 'ge' 
                      ? '🌟 გელოდებით სურია იოგაში!'
                      : '🌟 We look forward to seeing you at Surya Yoga!'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}