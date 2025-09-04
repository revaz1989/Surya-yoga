'use client'

import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { instructors } from '@/lib/instructors'

export default function InstructorsPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const instructorsList = instructors[language]

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center text-earth-800 mb-4">
        {t.instructors.title}
      </h1>
      <p className="text-xl text-center text-earth-600 mb-12">
        {t.instructors.description}
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {instructorsList.map((instructor) => (
          <div key={instructor.id} className="bg-white rounded-lg overflow-hidden card-shadow">
            <div className="relative h-80">
              <Image
                src={instructor.image}
                alt={instructor.name}
                fill
                className="object-contain bg-gradient-to-br from-sun-50 to-earth-50"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-earth-800 mb-3">
                {instructor.name}
              </h2>
              <p className="text-earth-600 mb-4">
                {instructor.description}
              </p>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-earth-700 mb-2">{t.instructors.qualifications}</h3>
                <ul className="list-disc list-inside text-earth-600 space-y-1">
                  {instructor.qualifications.map((qual, index) => (
                    <li key={index} className="text-sm">{qual}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}