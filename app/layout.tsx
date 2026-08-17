import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from '@next/third-parties/google';

const SITE_URL = 'https://puffbreak.app';
const SITE_NAME = 'PuffBreak';
const OG_IMAGE = `${SITE_URL}/og-image-v2.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PuffBreak — 3-Minute Digital Break Room with Radio, Chai & ASMR',
    template: '%s | PuffBreak',
  },
  description:
    'Your three-minute digital break room for live music, chai, ASMR ambience, anonymous company, or a virtual smoke ritual. Free, smooth, and no sign-up.',
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
    'free internet radio',
    'global music radio',
    'mood radio',
    'lofi radio online',
    'bhajan radio online',
    'world music radio',
    'ambient sound mixer',
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
    title: 'PuffBreak — Your 3-Minute Digital Break Room',
    description:
      'Step away for three minutes with live global radio, chai, ASMR ambience, anonymous company, or a virtual smoke ritual. Free and no sign-up.',
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
      'A 3-minute virtual cigarette or chai break with 8 immersive rooms, curated global music radio, a sound mixer, and anonymous company. Free, no sign-up.',
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
    // puffbreak.app — Google Search Console URL-prefix verification token.
    // NOTE: domain-property verification also needs the TXT record
    // google-site-verification=2X6Ba5HEpnBAZ0LLSvyF-2mmRA1C3W-NvHZY-ZIffWU
    // added at the DNS provider (Vercel DNS or registrar) — a DNS TXT record
    // cannot be deployed from this repo.
    google: '2X6Ba5HEpnBAZ0LLSvyF-2mmRA1C3W-NvHZY-ZIffWU',
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
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },
  // Verification tags — add actual codes when you verify in Search Console / Bing
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
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: ['Puff Break', 'Puff-Break'],
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE_URL}/#logo`,
    url: `${SITE_URL}/icon-512.png`,
    contentUrl: `${SITE_URL}/icon-512.png`,
    width: 512,
    height: 512,
    caption: SITE_NAME,
  },
  image: { '@id': `${SITE_URL}/#primaryimage` },
  description:
    'PuffBreak is a free digital break room for intentional three-minute pauses with live global radio, virtual chai, ASMR ambience, anonymous company, and an optional virtual smoke ritual.',
  sameAs: [
    'https://x.com/PuffBreak',
    'https://www.wikidata.org/wiki/Q141105453',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@puffbreak.app',
    contactType: 'customer support',
    availableLanguage: ['English', 'Hindi', 'Korean', 'Japanese', 'Spanish', 'Arabic', 'French', 'German', 'Portuguese'],
  },
};

const jsonLdWebApp = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${SITE_URL}/#webapp`,
  name: SITE_NAME,
  alternateName: ['Puff Break', 'Puff-Break'],
  url: SITE_URL,
  applicationCategory: 'LifestyleApplication',
  applicationSubCategory: 'Digital break room and music radio',
  operatingSystem: 'Web, iOS, Android (PWA)',
  browserRequirements: 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.',
  description:
    'A three-minute digital break room with curated global radio, virtual chai, ASMR ambience, anonymous company, and an optional virtual smoke ritual. Free and no account needed.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Virtual cigarette with realistic smoke physics',
    'Virtual chai tea break with steam particles',
    '8 immersive ambient rooms',
    'Human-curated global music radio by mood, genre, region, language and artist',
    'Independent volume mixer for radio, room ambience and cigarette crackle',
    'Procedural room ambience built with the Web Audio API',
    'Saved radio favourites and live playback status',
    'Anonymous live chat — no accounts',
    'Daily break streak tracking (localStorage only)',
    'Zen Mode and Stealth Mode',
    'PWA installable on mobile',
    'No accounts or personal profiles; preferences stored locally',
  ],
  screenshot: OG_IMAGE,
  image: {
    '@type': 'ImageObject',
    '@id': `${SITE_URL}/#primaryimage`,
    url: OG_IMAGE,
    contentUrl: OG_IMAGE,
    width: 1200,
    height: 630,
    caption: 'PuffBreak — Your 3-Minute Digital Break Room',
  },
  author: { '@id': `${SITE_URL}/#organization` },
  publisher: { '@id': `${SITE_URL}/#organization` },
  isPartOf: { '@id': `${SITE_URL}/#website` },
  inLanguage: ['en', 'hi', 'ko', 'ja', 'es', 'ar', 'fr', 'de', 'pt'],
  isAccessibleForFree: true,
  isFamilyFriendly: false,
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: ['Puff Break', 'Puff-Break'],
  url: SITE_URL,
  description: 'A free three-minute digital break room with curated global radio, chai, ASMR ambience, anonymous company, and an optional virtual smoke ritual.',
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
  mainEntity: { '@id': `${SITE_URL}/#webapp` },
};

// ─────────────────────────────────────────────────────────────────────────────

import GlobalAppWrapper from '@/components/GlobalAppWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApp) }} />
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
