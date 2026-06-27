import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL('https://puffbreak.com'),
  title: 'PuffBreak — Your Digital Break Room | Mindful Virtual Smoke & Tea Breaks',
  description: 'Take a mindful 3-minute digital break. Light a virtual cigarette or enjoy a hot cup of chai in immersive ambient settings. Completely anonymous, no sign-up required.',
  keywords: [
    'virtual smoke break',
    'digital cigarette',
    'virtual cigarette',
    'online break room',
    'chai break',
    'mindful breathing app',
    'quit smoking aid',
    'virtual smoking simulator',
    'relaxation break',
    'stress relief game',
    'virtual tea break',
    'smoke simulator',
    'interactive breathing exercise',
    'anxiety relief tool',
    'calm app online',
    'smoke break simulator',
    'puff break',
    'breathing simulator',
    'quitting smoking helper',
    'damta',
    'online damta',
    'damta.world',
    '온라인 담타',
    '담타',
    '담배 타임',
    '가상 흡연실',
    '실시간 익명 채팅',
    '온라인 흡연실'
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PuffBreak',
  },
  openGraph: {
    title: 'PuffBreak — Your Digital Break Room | Mindful Virtual Smoke & Tea Breaks',
    description: 'Step away for 3 minutes. Light a virtual cigarette or enjoy a hot cup of chai in immersive ambient settings. Completely anonymous, no sign-up required.',
    url: 'https://puffbreak.com',
    siteName: 'PuffBreak',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PuffBreak — Your Digital Break Room',
      },
    ],
    locale: 'en_US',
    alternateLocale: ['ko_KR'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PuffBreak — Your Digital Break Room | Mindful Virtual Smoke & Tea Breaks',
    description: 'Take a mindful 3-minute digital break. Light a virtual cigarette or enjoy a hot cup of chai in immersive ambient settings.',
    images: ['/og-image.png'],
    creator: '@puffbreak',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://puffbreak.com',
    languages: {
      'en-US': 'https://puffbreak.com',
      'ko-KR': 'https://puffbreak.com?lang=ko',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: [
      { url: '/favicon.svg' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-white/20 font-display" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
