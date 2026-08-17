import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LANDING_PAGES, getLandingPageBySlug, type LandingLink } from '@/lib/landing';
import { getRoomById } from '@/lib/rooms';
import { SITE_URL } from '@/lib/site';

/**
 * Programmatic concept landing pages — `/virtual-cigarette`, `/virtual-chai`,
 * `/break-room` and the long-tail set. Each page is server-rendered with
 * FAQPage + SoftwareApplication + Breadcrumb JSON-LD so Google and AI engines can
 * extract clean facts and Q&A.
 *
 * Note: `dynamicParams = false` keeps this catch-all from swallowing unknown URLs —
 * it only serves the slugs defined in lib/landing.ts (everything else 404s).
 */
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPageBySlug(slug);
  if (!page) return { title: 'Not Found' };

  const url = `${SITE_URL}/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: 'PuffBreak',
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image-v2.png`, width: 1200, height: 630, alt: page.title }],
    },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description },
    robots: { index: true, follow: true },
  };
}

function hrefFor(link: LandingLink): string {
  if (link.kind === 'blog') return `/blog/${link.slug}`;
  if (link.kind === 'region') return `/regions/${link.slug}`;
  return `/${link.slug}`;
}

export default async function ConceptPage({ params }: Props) {
  const { slug } = await params;
  const page = getLandingPageBySlug(slug);
  if (!page) notFound();

  const room = getRoomById(page.roomId);
  const url = `${SITE_URL}/${page.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: page.title, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'SoftwareApplication',
        name: 'PuffBreak',
        url: SITE_URL,
        applicationCategory: 'HealthApplication',
        applicationSubCategory: 'Stress Relief',
        operatingSystem: 'Web, iOS, Android (PWA)',
        description: page.description,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: page.sections.flatMap((s) => s.bullets ?? []),
      },
    ],
  };

  return (
    <div className="w-full bg-[#0a0a0f] text-gray-200 font-display relative overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Ambient glow */}
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
            <li className="text-emerald-400 font-medium" aria-current="page">{page.title}</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-gray-500 mb-6">
            {room ? `${room.icon} 3-minute reset` : 'The break that resets'}
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.05]">{page.title}</h1>
          <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed mb-10 max-w-3xl mx-auto font-light">
            {page.description}
          </p>
          <p className="text-lg text-emerald-300/90 italic mb-10 max-w-2xl mx-auto font-light">“{page.hook}”</p>

          <Link
            href={`/?room=${page.roomId}`}
            className="inline-flex items-center gap-3 bg-white text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-emerald-400 hover:text-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(52,211,153,0.4)] hover:scale-105 active:scale-95"
          >
            Take a 3-minute break <span>→</span>
          </Link>
          <p className="text-xs text-gray-600 mt-4">
            Free · Anonymous · No sign-up{room ? ` · Starts in ${room.name}` : ''}
          </p>
        </header>

        {/* Intro */}
        <div className="prose prose-invert prose-emerald max-w-none prose-lg
                        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:text-gray-300 prose-p:leading-relaxed space-y-6">
          {page.intro.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Sections */}
        {page.sections.map((section, i) => (
          <section key={i} className="mt-14" aria-label={section.heading}>
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">{section.heading}</h2>
            <p className="text-gray-300 leading-relaxed max-w-3xl">{section.body}</p>
            {section.bullets && (
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
                {section.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.03]">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-2" style={{ backgroundColor: room?.accent ?? '#34d399' }} />
                    <span className="text-sm text-gray-300">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Recommended room */}
        {room && (
          <section className="mt-16" aria-label="Recommended room">
            <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div
                className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center text-3xl shrink-0"
                style={{ backgroundColor: room.bg, boxShadow: `0 0 40px ${room.glowColor}` }}
              >
                {room.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">Start here</p>
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
            {page.faqs.map((f) => (
              <div key={f.q} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-white font-semibold text-base mb-2">{f.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="mt-20" aria-label="Related pages">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Keep exploring</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {page.related.map((link) => (
              <Link
                key={`${link.kind}-${link.slug}`}
                href={hrefFor(link)}
                className="group p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all"
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1">
                  {link.kind === 'blog' ? 'Article' : link.kind === 'region' ? 'Culture' : 'Guide'}
                </div>
                <div className="text-sm font-medium text-gray-300 group-hover:text-emerald-400 transition-colors">
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
