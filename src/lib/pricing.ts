export const pricingPlans = {
  en: [
    {
      id: 'three-times',
      name: 'Three Times a Week',
      price: '100 GEL',
      description: '12 practices per month',
      features: ['3 classes per week', 'Group practice', 'Flexible schedule'],
    },
    {
      id: 'two-times',
      name: 'Twice a Week',
      price: '80 GEL',
      description: '8 practices per month',
      features: ['2 classes per week', 'Group practice', 'Flexible schedule'],
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: '130 GEL',
      description: 'Unlimited monthly practices',
      features: ['Unlimited classes', 'Priority booking', 'Attend practice anytime'],
      recommended: true,
    },
    {
      id: 'single',
      name: 'Single Group Practice',
      price: '15 GEL',
      description: 'One-time group practice',
      features: ['Single class', 'Join any available group'],
    },
    {
      id: 'individual',
      name: 'Individual Practice',
      price: '50 GEL',
      description: 'Personal training session',
      features: ['One-on-one instruction', 'Personalized program', 'Flexible timing'],
    },
  ],
  ge: [
    {
      id: 'three-times',
      name: 'კვირაში სამჯერ',
      price: '100 ლარი',
      description: 'თვეში 12 პრაქტიკა',
      features: ['კვირაში 3 მეცადინეობა', 'ჯგუფური პრაქტიკა', 'მოქნილი განრიგი'],
    },
    {
      id: 'two-times',
      name: 'კვირაში ორჯერ',
      price: '80 ლარი',
      description: 'თვეში 8 პრაქტიკა',
      features: ['კვირაში 2 მეცადინეობა', 'ჯგუფური პრაქტიკა', 'მოქნილი განრიგი'],
    },
    {
      id: 'unlimited',
      name: 'ულიმიტო',
      price: '130 ლარი',
      description: 'ულიმიტო თვიური პრაქტიკა',
      features: ['ულიმიტო მეცადინეობები', 'პრიორიტეტული დაჯავშნა', 'დაესწარით პრაქტიკას ნებისმიერ დროს'],
      recommended: true,
    },
    {
      id: 'single',
      name: 'ერთჯერადი პრაქტიკა ჯგუფთან',
      price: '15 ლარი',
      description: 'ერთჯერადი ჯგუფური პრაქტიკა',
      features: ['ერთი მეცადინეობა', 'შეუერთდით ნებისმიერ ჯგუფს'],
    },
    {
      id: 'individual',
      name: 'ინდივიდუალური პრაქტიკა',
      price: '50 ლარი',
      description: 'პერსონალური ტრენინგი',
      features: ['ინდივიდუალური ინსტრუქტაჟი', 'პერსონალიზებული პროგრამა', 'მოქნილი დრო'],
    },
  ],
}

export const bankDetails = {
  en: {
    tbc: {
      bank: 'TBC Bank',
      account: 'GE14TB7978445061100017',
    },
    bog: {
      bank: 'Bank of Georgia',
      account: 'GE38BG0000000570073394',
    },
    recipient: 'Eter Gelishvili',
    purposeFormat: '[Your Name/Surname] and [Number of Monthly Classes]',
    purposeExample: 'Nino Chelidze, 12 practices',
  },
  ge: {
    tbc: {
      bank: 'თიბისი ბანკი',
      account: 'GE14TB7978445061100017',
    },
    bog: {
      bank: 'საქართველოს ბანკი',
      account: 'GE38BG0000000570073394',
    },
    recipient: 'ეთერ გელიშვილი',
    purposeFormat: '[თქვენი სახელი/გვარი] და [თვიური მეცადინეობების რაოდენობა]',
    purposeExample: 'ნინო ჭელიძე, 12 პრაქტიკა',
  },
}