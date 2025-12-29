export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export const FUNDING_ROUNDS = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D',
  'Series E+',
  'IPO',
  'Acquisition',
] as const;

export const SECTORS = [
  'FinTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'SaaS',
  'AgriTech',
  'CleanTech',
  'DeepTech',
  'AI/ML',
  'Consumer Tech',
  'Logistics',
  'Real Estate',
  'Gaming',
  'Media & Entertainment',
  'Enterprise',
] as const;

export const INVESTOR_TYPES = [
  'Angel Investor',
  'Venture Capital',
  'Private Equity',
  'Corporate Venture',
  'Family Office',
  'Accelerator',
  'Incubator',
  'Government Fund',
] as const;

export const SAMPLE_QUERIES = {
  en: [
    "What are the top funded startups in 2024?",
    "Show me FinTech investors in Bangalore",
    "What government schemes support early-stage startups?",
    "Compare Series A funding trends across sectors",
    "Which VCs are actively investing in HealthTech?",
  ],
  hi: [
    "2024 में सबसे ज्यादा फंडेड स्टार्टअप कौन से हैं?",
    "बैंगलोर में फिनटेक निवेशक दिखाएं",
    "कौन सी सरकारी योजनाएं शुरुआती स्टार्टअप का समर्थन करती हैं?",
  ],
  ta: [
    "2024 இல் அதிக நிதியுதவி பெற்ற ஸ்டார்ட்அப்கள் எவை?",
    "பெங்களூரில் ஃபின்டெக் முதலீட்டாளர்களைக் காட்டு",
  ],
} as const;

export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
};

export const formatUSD = (amount: number): string => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount}`;
};
