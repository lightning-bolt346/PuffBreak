import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { REGIONS, getRegionBySlug } from '@/lib/regions';
import { getRoomById } from '@/lib/rooms';
import { SITE_URL } from '@/lib/site';

export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return REGIONS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) return { title: 'Not Found' };

  const url = `${SITE_URL}/regions/${region.slug}`;
  return {
    title: region.title,
    description: region.description,
    keywords: region.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: region.title,
      description: region.description,
      url,
      siteName: 'PuffBreak',
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image-v2.png`, width: 1200, height: 630, alt: region.term }],
    },
    twitter: { card: 'summary_large_image', title: region.title, description: region.description },
    robots: { index: true, follow: true },
  };
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();

  const room = getRoomById(region.roomId);
  const url = `${SITE_URL}/regions/${region.slug}`;
  const enterUrl = `/?room=${region.roomId}${region.lang !== 'en' ? `&lang=${region.lang}` : ''}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Break Culture', item: `${SITE_URL}/regions` },
          { '@type': 'ListItem', position: 3, name: region.term, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: region.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'Article',
        headline: region.title,
        description: region.description,
        url,
        inLanguage: 'en',
        about: region.term,
        author: { '@type': 'Organization', name: 'PuffBreak', url: SITE_URL },
        publisher: { '@type': 'Organization', name: 'PuffBreak', url: SITE_URL },
      },
    ],
  };

  return (
    <div className="w-full bg-[#0a0a0f] text-gray-200 font-display relative overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[70%] blur-[140px] rounded-full pointer-events-none"
        style={{ backgroundColor: `${room?.accent ?? '#34d399'}14` }}
      />

      <article className="max-w-4xl mx-auto px-6 sm:px-12 pt-16 pb-24 relative z-10">
        {/* Breadcrumb */}
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
            <li><Link href="/regions" className="hover:text-emerald-400 transition-colors">Break Culture</Link></li>
            <li aria-hidden="true" className="opacity-40 text-xs">›</li>
            <li className="text-emerald-400 font-medium" aria-current="page">{region.term}</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <span className="text-5xl">{region.flag}</span>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-gray-500">{region.region}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.05]">{region.term}</h1>
          <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed mb-10 max-w-3xl mx-auto font-light">
            {region.description}
          </p>
          <p className="text-lg text-emerald-300/90 italic mb-10 max-w-2xl mx-auto font-light">“{region.hero}”</p>

          <Link
            href={enterUrl}
            className="inline-flex items-center gap-3 bg-white text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-emerald-400 hover:text-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(52,211,153,0.4)] hover:scale-105 active:scale-95"
          >
            Take your {region.drinkWord} break <span>→</span>
          </Link>
          <p className="text-xs text-gray-600 mt-4">
            Free · Anonymous · No sign-up{region.lang !== 'en' ? ' · Opens in your language' : ''}
          </p>
        </header>

        {/* The essay */}
        <div className="prose prose-invert prose-emerald max-w-none prose-lg
                        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:text-gray-300 prose-p:leading-relaxed space-y-6">
          <h2>The Ritual</h2>
          {region.story.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Ritual + Why virtual */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          <section className="p-6 rounded-3xl border border-white/10 bg-white/[0.03]">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">How it works</p>
            <h2 className="text-lg font-bold text-white mb-3">The ritual</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{region.ritual}</p>
          </section>
          <section className="p-6 rounded-3xl border border-white/10 bg-white/[0.03]">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">Why it translates</p>
            <h2 className="text-lg font-bold text-white mb-3">The virtual version</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{region.whyVirtual}</p>
          </section>
        </div>

        {/* Recommended room */}
        {room && (
          <section className="mt-10" aria-label="Recommended room">
            <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div
                className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center text-3xl shrink-0"
                style={{ backgroundColor: room.bg, boxShadow: `0 0 40px ${room.glowColor}` }}
              >
                {room.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">The room that fits</p>
                <h2 className="text-xl font-bold text-white mb-1">{room.name}</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{room.seoDescription}</p>
              </div>
              <Link
                href={`/rooms/${room.slug}`}
                className="shrink-0 text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
              >
                Explore this room →
              </Link>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mt-16" aria-label="Frequently asked questions">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">FAQ</h2>
          <div className="space-y-6">
            {region.faqs.map((f) => (
              <div key={f.q} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-white font-semibold text-base mb-2">{f.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other cultures */}
        <section className="mt-20" aria-label="Other break cultures">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">More break cultures</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {REGIONS.filter((r) => r.slug !== region.slug).map((r) => (
              <Link
                key={r.slug}
                href={`/regions/${r.slug}`}
                className="group p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all text-center"
              >
                <div className="text-2xl mb-2">{r.flag}</div>
                <div className="text-xs font-medium text-gray-300 group-hover:text-emerald-400 transition-colors">
                  {r.term}
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5">{r.region}</div>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
