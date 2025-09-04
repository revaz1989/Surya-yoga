'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { pricingPlans, bankDetails } from '@/lib/pricing'
import { Check, CreditCard } from 'lucide-react'

export default function PricingPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const plans = pricingPlans[language]
  const bank = bankDetails[language]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-earth-800 mb-4">
          {t.pricing.title}
        </h1>
        <p className="text-xl text-earth-600">
          {t.pricing.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg p-6 ${
              plan.recommended ? 'ring-2 ring-sun-500 relative' : ''
            } card-shadow hover:scale-105 transition-transform`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-sun-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  RECOMMENDED
                </span>
              </div>
            )}
            
            <h3 className="text-2xl font-semibold text-earth-800 mb-2">
              {plan.name}
            </h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-sun-600">{plan.price}</span>
            </div>
            <p className="text-earth-600 mb-6">{plan.description}</p>
            
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-sun-500 flex-shrink-0 mt-0.5" />
                  <span className="text-earth-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto bg-earth-50 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-8 h-8 text-sun-500" />
          <h2 className="text-2xl font-semibold text-earth-800">
            {t.pricing.payment}
          </h2>
        </div>
        
        <p className="text-earth-700 mb-6">{t.pricing.paymentInfo}</p>
        
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-xl font-semibold text-earth-800 mb-4">
            {t.pricing.bankDetails}
          </h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-sun-500 pl-4">
              <p className="font-semibold text-earth-800">{bank.tbc.bank}</p>
              <p className="text-earth-600 font-mono">{bank.tbc.account}</p>
            </div>
            
            <div className="border-l-4 border-sun-500 pl-4">
              <p className="font-semibold text-earth-800">{bank.bog.bank}</p>
              <p className="text-earth-600 font-mono">{bank.bog.account}</p>
            </div>
            
            <div className="mt-6 p-4 bg-sun-50 rounded-lg">
              <p className="text-earth-700">
                <span className="font-semibold">{t.pricing.recipient}:</span> {bank.recipient}
              </p>
              <p className="text-earth-700 mt-2">
                <span className="font-semibold">{t.pricing.purpose}:</span> {bank.purposeFormat}
              </p>
              <p className="text-earth-600 text-sm mt-2">
                <span className="font-semibold">{t.pricing.purposeExample}:</span> {bank.purposeExample}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}