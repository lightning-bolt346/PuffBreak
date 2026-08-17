import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe2, Headphones, Radio, SlidersHorizontal, Sparkles } from 'lucide-react';
import { RADIO_STATIONS } from '@/lib/radio';
import { RADIO_GUIDES } from '@/lib/radio-pages';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Free Global and Artist Radio for Your Break',
  description: 'Browse PuffBreak’s human-curated live stations and in-app artist radio by mood, genre, region, language, or artist. Free with no account.',
  alternates: { canonical: `${SITE_URL}/radio` },
  openGraph: {
    title: 'PuffBreak Radio — Find Your Frequency',
    description: 'Human-curated live music for a better three-minute break: global stations, artist frequencies, mood discovery, and an independent sound mixer.',
    url: `${SITE_URL}/radio`,
    type: 'website',
    images: [{
      url: `${SITE_URL}/radio-og.png`,
      width: 1200,
      height: 630,
      alt: 'PuffBreak Frequencies — human-picked global radio for a three-minute reset',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PuffBreak Radio — Find Your Frequency',
    description: 'Human-picked global radio for a better three-minute reset.',
    images: [`${SITE_URL}/radio-og.png`],
  },
};

const publicStations = RADIO_STATIONS.filter((station) => !station.artist);
const artistStations = RADIO_STATIONS.filter((station) => station.artist);
const genres = Array.from(new Set(publicStations.flatMap((station) => station.genres)));
const regions = Array.from(new Set(publicStations.map((station) => station.region)));

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/radio#webpage`,
  name: 'PuffBreak Global Music Radio',
  url: `${SITE_URL}/radio`,
  description: 'A human-curated live music radio library inside PuffBreak, searchable by mood, genre, region, language, and artist.',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/radio-og.png`,
    width: 1200,
    height: 630,
  },
  mainEntity: {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#webapp`,
    name: 'PuffBreak',
    applicationCategory: 'MusicApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      `${publicStations.length} human-curated live stations`,
      `${artistStations.length} artist frequencies`,
      'Discovery by mood, genre, region, language, and artist',
      'Independent radio, room ambience, and crackle volume controls',
      'Saved favourites without an account',
    ],
  },
};

export default function RadioPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#08090c] text-white selection:bg-emerald-300/20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(52,211,153,0.12),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(56,189,248,0.08),transparent_30%)]" />
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white"><ArrowLeft className="h-4 w-4" /> Break room</Link>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">PuffBreak Frequencies</span>
      </nav>

      <section className="relative mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/70"><Radio className="h-3 w-3" /> Live stations + in-app artist radio</div>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] min-[420px]:text-5xl sm:text-7xl">Find the sound your break needs.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/48 sm:text-lg">No infinite feed and no pile of near-identical playlists. Choose a dependable live station or shuffle a checked artist catalogue—without leaving PuffBreak.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/" className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-bold text-[#07110d] transition-transform hover:scale-[1.02]">Open the radio library</Link>
            <Link href="/about" className="rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-white/60 hover:bg-white/[0.07] hover:text-white">Why PuffBreak exists</Link>
          </div>
        </div>

        <div className="mt-16 grid gap-3 sm:grid-cols-3">
          {[
            [Sparkles, 'Mood first', 'Need calm, focus, energy, discovery, or something familiar? Start with the feeling.'],
            [Globe2, 'Genuinely global', `${regions.length} regions, with music from India, Pakistan, Japan, Korea, Africa, Latin America, Europe, Oceania, and beyond.`],
            [SlidersHorizontal, 'Your own balance', 'Radio, room ambience, and cigarette crackle have independent levels. Silence remains one tap away.'],
          ].map(([Icon, title, body]) => {
            const FeatureIcon = Icon as typeof Sparkles;
            return <article key={String(title)} className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-6"><FeatureIcon className="h-4 w-4 text-emerald-300/70" /><h2 className="mt-6 text-lg font-semibold">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-white/38">{String(body)}</p></article>;
          })}
        </div>

        <section className="mt-20 border-t border-white/[0.07] pt-12">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/60">The collection</div><h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Broad enough to explore. Small enough to trust.</h2></div>
            <div className="flex gap-6 text-sm text-white/35"><span><b className="text-white">{publicStations.length}</b> stations</span><span><b className="text-white">{artistStations.length}</b> artist frequencies</span><span><b className="text-white">{genres.length}</b> genres</span></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {['Lo-Fi', 'Bhajan', 'Hip-Hop', 'R&B', 'J-Pop', 'K-Pop', 'Bollywood', 'Jazz', 'Classical', 'Afrobeats', 'Amapiano', 'Latin Urban', 'City Pop', 'Indie'].map((genre) => <span key={genre} className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/45">{genre}</span>)}
          </div>
        </section>

        <section className="mt-20 border-t border-white/[0.07] pt-12">
          <div className="max-w-2xl"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/60">Editorial frequencies</div><h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Start with a feeling, not a directory.</h2><p className="mt-3 text-sm leading-6 text-white/38">Small listening guides with tested streams, honest context and zero keyword-stuffed filler.</p></div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RADIO_GUIDES.map((guide, index) => (
              <Link key={guide.slug} href={`/radio/${guide.slug}`} className="group rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-5 transition-colors hover:border-white/[0.15] hover:bg-white/[0.05]">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.17em] text-white/25"><span>{guide.eyebrow}</span><span>{String(index + 1).padStart(2, '0')}</span></div>
                <h3 className="mt-8 text-lg font-semibold tracking-[-0.025em] text-white/85 transition-colors group-hover:text-white">{guide.hook}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/35">{guide.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-8 border-t border-white/[0.07] pt-12 sm:grid-cols-[1fr_1.35fr]">
          <div><Headphones className="h-5 w-5 text-amber-300/70" /><h2 className="mt-5 text-2xl font-semibold">What “verified” means here</h2></div>
          <div className="space-y-4 text-sm leading-7 text-white/42"><p>Before a station enters the production library, PuffBreak checks that it returns real audio, permits browser playback, and works through the same Web Audio route used by the Mixer. Stations can still change or go offline because their operators control the streams.</p><p>When a frequency disappears, users can request a region, language, station, or artist from inside the library. Every request is reviewed by a person before it is added.</p></div>
        </section>
      </section>
    </main>
  );
}
