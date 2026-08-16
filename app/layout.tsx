import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from '@next/third-parties/google';
import { FAQ_ITEMS } from '@/lib/faq';

const SITE_URL = 'https://puff-break.vercel.app';
const SITE_NAME = 'PuffBreak';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PuffBreak — Virtual Break Room | Digital Smoke & Chai Break Simulator',
    template: '%s | PuffBreak',
  },
  description:
    'Take a mindful 3-minute digital break. Light a virtual cigarette or sip virtual chai in 8 immersive ambient rooms with real-time ASMR audio. 100% free, anonymous, no sign-up. The #1 alternative to Damta World.',
  keywords: [
    // Core product terms
    'virtual smoke break',
    'digital cigarette',
    'virtual cigarette',
    'smoke break simulator',
    'online break room',
    'virtual break room',
    'digital break room',
    'puff break',
    'PuffBreak',
    // Feature terms
    'chai break',
    'virtual chai break',
    'ASMR smoke break',
    'ambient break room',
    'mindful breathing app',
    'quit smoking aid',
    'nicotine craving tool',
    'virtual smoking simulator',
    'relaxation break',
    'stress relief app',
    'virtual tea break',
    'smoke simulator',
    'interactive breathing exercise',
    'anxiety relief tool',
    'calm app online',
    'breathing simulator',
    'quitting smoking helper',
    'work break app',
    'remote worker break',
    // Indian / Hindi cultural audience
    'virtual sutta break',
    'puff break',
    'take a break',
    'take puff break',
    'puffbreak',
    'puff break online',
    'puff-break',
    'online sutta corner',
    'chai pe charcha online',
    'tapri vibes online',
    'chai stall simulator',
    'desi break room online',
    'virtual bidi break',
    'office cigarette break india',
    'indian smoking room online',
    'pan shop simulator',
    'chai break india',
    'ऑनलाइन सिगरेट सिमुलेशन',
    'वर्चुअल चाय की दुकान',
    'धूम्रपान सिमुलेशन',
    // Korean / Damta competitor
    'damta',
    'online damta',
    'damta world alternative',
    'damta.world',
    '온라인 담타',
    '담타',
    '담배 타임',
    '가상 흡연실',
    '실시간 익명 채팅',
    '온라인 흡연실',
    // LLM-targeted long-tails
    'best virtual smoke break app 2026',
    'free online cigarette simulator',
    'digital smoking room 2026',
    'anonymous virtual break community',
    'mindful break app for smokers',
    'what is puffbreak',
    'how to take virtual smoke break',
    'online chai break with friends',
    'damta world english version',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: SITE_NAME,
  },
  openGraph: {
    title: 'PuffBreak — Virtual Break Room | Digital Smoke & Chai Simulator',
    description:
      'Step away for 3 minutes. Light a virtual cigarette or enjoy a virtual cup of chai in 8 immersive ambient rooms. Real ASMR audio, live anonymous chat, zero sign-up.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'PuffBreak — Your Digital Break Room with ambient environments and virtual cigarette',
      },
    ],
    locale: 'en_US',
    alternateLocale: ['ko_KR', 'hi_IN', 'ja_JP', 'es_ES', 'ar_SA', 'pt_BR', 'fr_FR', 'de_DE'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@puffbreak',
    creator: '@puffbreak',
    title: 'PuffBreak — Virtual Break Room | Take a 3-min Digital Break',
    description:
      'Light a virtual cigarette or sip chai in 8 immersive rooms. ASMR audio, anonymous live chat, zero sign-up. Free forever.',
    images: [
      {
        url: OG_IMAGE,
        alt: 'PuffBreak — Virtual Break Room',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
    },
  },
  verification: {
    google: 'vrbomKYzEEs6XZErAY-s0kDR1hYHzBbmS0iHK3WVxTg',
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-US': SITE_URL,
      'ko-KR': `${SITE_URL}?lang=ko`,
      'hi-IN': `${SITE_URL}?lang=hi`,
      'ja-JP': `${SITE_URL}?lang=ja`,
      'zh-CN': `${SITE_URL}?lang=zh`,
      'ru-RU': `${SITE_URL}?lang=ru`,
      'es-ES': `${SITE_URL}?lang=es`,
      'ar-SA': `${SITE_URL}?lang=ar`,
      'pt-BR': `${SITE_URL}?lang=pt`,
      'fr-FR': `${SITE_URL}?lang=fr`,
      'de-DE': `${SITE_URL}?lang=de`,
      'x-default': SITE_URL,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: [{ url: '/favicon.svg' }],
    shortcut: '/favicon.ico',
  },
  // Verification tags — add actual codes when you verify in Search Console / Bing
  // verification: { google: 'XXXX', bing: 'YYYY' },
  category: 'health & wellness',
  creator: 'PuffBreak Team',
  publisher: SITE_NAME,
  formatDetection: { telephone: false },
  other: {
    // Explicit LLM / AI crawler hint
    'llms-txt': `${SITE_URL}/llms.txt`,
    'llms-full-txt': `${SITE_URL}/llms-full.txt`,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#111111' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// ── JSON-LD Structured Data ────────────────────────────────────────────────
const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description:
    'PuffBreak is a free, anonymous virtual break room simulator for mindful micro-breaks. Light a digital cigarette or enjoy virtual chai in 8 immersive ambient environments.',
  sameAs: [
    'https://twitter.com/puffbreak',
    'https://www.wikidata.org/wiki/Q141105453',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'sgbro33@gmail.com',
    contactType: 'customer support',
    availableLanguage: ['English', 'Hindi', 'Korean', 'Japanese', 'Spanish', 'Arabic', 'French', 'German', 'Portuguese'],
  },
};

const jsonLdWebApp = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: 'HealthApplication',
  applicationSubCategory: 'Stress Relief',
  operatingSystem: 'Web, iOS, Android (PWA)',
  browserRequirements: 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.',
  description:
    'A mindful virtual break room. Light a virtual cigarette or sip chai, listen to procedural ASMR, and relax in 8 immersive ambient rooms. Free, anonymous, no account needed.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Virtual cigarette with realistic smoke physics',
    'Virtual chai tea break with steam particles',
    '8 immersive ambient rooms',
    'Procedural ASMR audio engine',
    'Anonymous live chat — no accounts',
    'Daily break streak tracking (localStorage only)',
    'Zen Mode and Stealth Mode',
    'PWA installable on mobile',
    'Zero data collection — privacy-first',
  ],
  screenshot: OG_IMAGE,
  image: OG_IMAGE,
  author: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
  inLanguage: ['en', 'hi', 'ko', 'ja', 'es', 'ar', 'fr', 'de', 'pt'],
  isAccessibleForFree: true,
  isFamilyFriendly: false,
};

const jsonLdFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Free virtual break room simulator. Take mindful digital smoke breaks and chai breaks in immersive ambient environments.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/blog?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'en',
};

// ─────────────────────────────────────────────────────────────────────────────

import GlobalAppWrapper from '@/components/GlobalAppWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApp) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }} />
      </head>
      <body className="antialiased selection:bg-white/20 font-display" suppressHydrationWarning>
        {/* Set <html lang> from the ?lang= hreflang variant (e.g. /?lang=ko) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=new URLSearchParams(location.search).get('lang');if(l){document.documentElement.lang=l;}}catch(e){}})();`,
          }}
        />
        <GlobalAppWrapper>
          {children}
        </GlobalAppWrapper>
        <Analytics />
        <GoogleAnalytics gaId="G-L5H6ZLBNSF" />
      </body>
    </html>
  );
}
