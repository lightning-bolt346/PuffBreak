import { Metadata } from 'next';
import Link from 'next/link';
import { ROOMS } from '@/lib/rooms';

const SITE_URL = 'https://puffbreak.app';

export const metadata: Metadata = {
  title: 'Break Rooms — 8 Immersive Ambient Spaces',
  description: 'Explore all 8 PuffBreak break rooms: virtual office rooftop, beach sunset, space station, library, park bench, metro platform, chai stall and silent room. Free, anonymous ambient ASMR breaks.',
  keywords: ['break rooms', 'virtual break room', 'ambient rooms', 'asmr rooms', 'digital break room'],
  alternates: { canonical: `${SITE_URL}/rooms` },
  openGraph: {
    title: 'Break Rooms — 8 Immersive Ambient Spaces | PuffBreak',
    description: 'Pick your escape: rooftop, beach, space, library, park, metro, chai stall or pure silence. Free 3-minute ambient breaks.',
    url: `${SITE_URL}/rooms`,
    siteName: 'PuffBreak',
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image-v2.png`, width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Break Rooms | PuffBreak', description: '8 immersive ambient break rooms, free and anonymous.' },
};

export default function RoomsIndex() {
  return (
    <div className="w-full bg-[#0a0a0f] text-gray-200 font-display relative overflow-x-hidden">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-12 pt-16 pb-24 relative z-10">
        <nav aria-label="Breadcrumb" className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-6 group bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-emerald-400/30"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span className="font-mono uppercase tracking-widest text-xs font-semibold">Back to Break Room</span>
          </Link>
          <ol className="flex items-center gap-2 text-sm text-gray-500 font-mono-display">
            <li><Link href="/" className="hover:text-emerald-400 transition-colors">🏠 Home</Link></li>
            <li aria-hidden="true" className="opacity-40 text-xs">›</li>
            <li className="text-emerald-400 font-medium" aria-current="page">Break Rooms</li>
          </ol>
        </nav>

        <header className="mb-16 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.05]">
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">Escape</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            8 immersive ambient rooms for a mindful 3-minute break. Free, anonymous, and always open.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ROOMS.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.slug}`}
              className="group relative overflow-hidden p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all hover:-translate-y-1"
              style={{ boxShadow: 'none' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at top, ${room.glowColor}, transparent 70%)` }}
              />
              <div className="relative z-10">
                <div className="text-4xl mb-4">{room.icon}</div>
                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {room.name}
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{room.seoDescription}</p>
                <div className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-400 gap-1">
                  Explore <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
