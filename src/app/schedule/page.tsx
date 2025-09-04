'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Calendar, Clock } from 'lucide-react'

export default function SchedulePage() {
  const { language } = useLanguage()
  const t = translations[language]

  const schedule = {
    [t.schedule.monday]: ['19:10 - 20:10', '20:20 - 21:20'],
    [t.schedule.tuesday]: ['09:00 - 10:00'],
    [t.schedule.wednesday]: ['19:10 - 20:10', '20:20 - 21:20'],
    [t.schedule.thursday]: ['09:00 - 10:00'],
    [t.schedule.friday]: ['19:10 - 20:10', '20:20 - 21:20'],
    [t.schedule.saturday]: ['09:00 - 10:00'],
    [t.schedule.sunday]: ['10:00 - 11:00', '19:00 - 20:00'],
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Calendar className="w-16 h-16 text-sun-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-earth-800 mb-4">
          {t.schedule.title}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg overflow-hidden card-shadow">
          <div className="bg-sun-500 text-white p-4">
            <h2 className="text-2xl font-semibold text-center">{t.schedule.weeklySchedule}</h2>
          </div>
          
          <div className="divide-y divide-earth-200">
            {Object.entries(schedule).map(([day, times]) => (
              <div key={day} className="p-6 hover:bg-sun-50 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-earth-800">{day}</h3>
                  <div className="flex gap-4">
                    {times.map((time, index) => (
                      <div key={index} className="flex items-center gap-2 bg-sun-100 px-4 py-2 rounded-full">
                        <Clock className="w-4 h-4 text-sun-600" />
                        <span className="text-sun-700 font-medium">{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-earth-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-earth-800 mb-2">{t.schedule.importantNotes}</h3>
          <ul className="list-disc list-inside text-earth-700 space-y-2">
            <li>{t.schedule.note1}</li>
            <li>{t.schedule.note2}</li>
            <li>{t.schedule.note3}</li>
            <li>{t.schedule.note4}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}