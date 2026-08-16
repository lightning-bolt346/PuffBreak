import type { Metadata } from 'next';
import Link from 'next/link';
import { REGIONS } from '@/lib/regions';
import { getRoomById } from '@/lib/rooms';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Break Culture Around the World — Damta, Raucherpause, Chai Tapri & More',
  description:
    'The world takes its breaks differently: the Korean damta, the German Raucherpause, the Indian chai tapri, the Russian perekur. Explore each culture\'s break ritual — and take a virtual one.',
  alternates: { canonical: `${SITE_URL}/regions` },
  openGraph: {
    title: 'Break Culture Around the World | PuffBreak',
    description:
      'From the Korean damta to the Indian chai tapri — how the world takes its three-minute reset, and how to take yours.',
    url: `${SITE_URL}/regions`,
    siteName: 'PuffBreak',
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

export default function RegionsPage() {
  return (
    <div className="w-full bg-[#0a0a0f] text-gray-200 font-display relative overflow-x-hidden">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[70%] blur-[140px] rounded-full pointer-events-none bg-emerald-400/10" />

      <article className="max-w-5xl mx-auto px-6 sm:px-12 pt-16 pb-24 relative z-10">
        <nav aria-label="Breadcrumb" className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-6 group bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-emerald-400/30"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span className="font-mono uppercase tracking-widest text-xs font-semibold">Back to Break Room</span>
          </Link>
        </nav>

        <header className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-gray-500 mb-6">Break culture · worldwide</p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.05]">
            How the World Takes a Break
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed mb-6 max-w-3xl mx-auto font-light">
            Every culture has its own three-minute ritual — the damta, the Raucherpause, the chai tapri, the perekur.
            These are their stories, and a way to take the break anywhere.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-white text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-emerald-400 hover:text-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95"
          >
            Take your break <span>→</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {REGIONS.map((region) => {
            const room = getRoomById(region.roomId);
            return (
              <Link
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="group p-6 rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-emerald-400/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{region.flag}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-600 group-hover:text-emerald-400 transition-colors">
                    {room?.name ?? 'Break culture'}
                  </span>
                </div>
                <h2 className="text-white font-bold text-lg mb-1 group-hover:text-emerald-300 transition-colors">
                  {region.term}
                </h2>
                <p className="text-xs text-gray-500 mb-3">{region.region}</p>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{region.hero}</p>
              </Link>
            );
          })}
        </div>
      </article>
    </div>
  );
}
