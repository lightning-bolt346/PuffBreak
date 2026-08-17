import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Headphones, Radio, Signal } from 'lucide-react';
import { RADIO_GUIDES, getRadioGuide } from '@/lib/radio-pages';
import { RADIO_STATIONS } from '@/lib/radio';
import { SITE_URL } from '@/lib/site';

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return RADIO_GUIDES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const guide = getRadioGuide((await params).slug);
  if (!guide) return {};
  const url = `${SITE_URL}/radio/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      type: 'website',
      images: [{ url: `${SITE_URL}/radio-og.png`, width: 1200, height: 630, alt: 'PuffBreak Frequencies' }],
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description, images: [`${SITE_URL}/radio-og.png`] },
    robots: { index: true, follow: true },
  };
}

export default async function RadioGuidePage({ params }: PageProps) {
  const guide = getRadioGuide((await params).slug);
  if (!guide) notFound();
  const stations = guide.stationIds
    .map((id) => RADIO_STATIONS.find((station) => station.id === id))
    .filter((station): station is NonNullable<typeof station> => Boolean(station));
  const url = `${SITE_URL}/radio/${guide.slug}`;
  const directStations = stations.filter((station) => !station.source || station.source === 'stream');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: guide.title,
        description: guide.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        mainEntity: { '@id': `${url}#stations` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PuffBreak', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Radio', item: `${SITE_URL}/radio` },
          { '@type': 'ListItem', position: 3, name: guide.title, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: guide.faqs.map(({ q, a }) => ({
          '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#stations`,
        name: `${guide.title} listening shelf`,
        numberOfItems: stations.length,
        itemListElement: stations.map((station, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: station.name,
          description: station.tagline,
          url: `${SITE_URL}/?station=${station.id}&radio=1`,
        })),
      },
      ...directStations.map((station) => ({
        '@type': 'RadioBroadcastService',
        '@id': `${url}#${station.id}`,
        name: station.name,
        description: station.tagline,
        url: station.url,
        areaServed: station.country,
        genre: station.genres,
        inLanguage: station.languages,
        provider: { '@type': 'Organization', name: station.name },
      })),
    ],
  };

  return (
    <main className="min-h-screen bg-[#08090c] text-white selection:bg-emerald-300/20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(52,211,153,0.11),transparent_35%),radial-gradient(circle_at_88%_20%,rgba(139,92,246,0.08),transparent_32%)]" />

      <nav className="relative mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/radio" className="inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white"><ArrowLeft className="h-4 w-4" /> Frequencies</Link>
        <Link href="/" className="text-xs font-bold uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-white">PuffBreak</Link>
      </nav>

      <article className="relative mx-auto max-w-5xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <header className="max-w-3xl">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300/65">{guide.eyebrow}</div>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">{guide.hook}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/48 sm:text-lg">{guide.description}</p>
        </header>

        <section className="mt-14 grid gap-5 border-t border-white/[0.07] pt-10 text-sm leading-7 text-white/48 sm:grid-cols-2">
          {guide.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <section className="mt-16" aria-labelledby="station-shelf">
          <div className="flex items-end justify-between gap-6">
            <div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/60">The shelf</div><h2 id="station-shelf" className="mt-2 text-3xl font-semibold tracking-[-0.035em]">{stations.length} frequencies, each with a reason.</h2></div>
            <Signal className="hidden h-5 w-5 text-white/25 sm:block" />
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {stations.map((station, index) => {
              const isCatalogue = station.source === 'youtube-playlist';
              const href = `/?station=${station.id}&radio=1`;
              return (
                <article key={station.id} className="group rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.045]">
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-white/[0.08] bg-white/[0.045] text-[10px] font-black text-white/75">{station.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><span className="text-[10px] tabular-nums text-white/22">{String(index + 1).padStart(2, '0')}</span><h3 className="truncate text-base font-semibold">{station.name}</h3></div>
                      <p className="mt-1 text-xs leading-5 text-white/38">{station.tagline}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-1.5">{station.genres.slice(0, 3).map((genre) => <span key={genre} className="rounded-full bg-white/[0.045] px-2.5 py-1 text-[10px] text-white/35">{genre}</span>)}</div>
                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <span className="text-[10px] text-white/28">{station.country} · {isCatalogue ? 'In-app artist radio' : 'Live stream'}</span>
                    <Link href={href} className="relative inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200/75 transition-colors hover:text-emerald-200">Tune in <Headphones className="h-3 w-3" /></Link>
                  </div>
                  {!isCatalogue && <details className="mt-3 text-[10px] text-white/25"><summary className="cursor-pointer transition-colors hover:text-white/50">Direct stream URL</summary><code className="mt-2 block break-all rounded-lg bg-black/25 p-2 text-white/35">{station.url}</code></details>}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-16 grid gap-8 border-t border-white/[0.07] pt-12 sm:grid-cols-2">
          {guide.sections.map((section) => <div key={section.heading}><Radio className="h-4 w-4 text-emerald-300/65" /><h2 className="mt-5 text-xl font-semibold">{section.heading}</h2><p className="mt-3 text-sm leading-7 text-white/42">{section.body}</p></div>)}
        </section>

        <section className="mt-16 border-t border-white/[0.07] pt-12" aria-labelledby="radio-faq">
          <h2 id="radio-faq" className="text-2xl font-semibold tracking-[-0.03em]">Good questions, straight answers.</h2>
          <div className="mt-7 divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {guide.faqs.map(({ q, a }) => <details key={q} className="group py-5"><summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-white/80">{q}</summary><p className="mt-3 max-w-3xl text-sm leading-7 text-white/42">{a}</p></details>)}
          </div>
        </section>

        <footer className="mt-14 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">Continue listening</span>
          {guide.related.map((slug) => {
            const related = getRadioGuide(slug);
            return related ? <Link key={slug} href={`/radio/${slug}`} className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-white/45 transition-colors hover:border-white/20 hover:text-white">{related.eyebrow}</Link> : null;
          })}
        </footer>
      </article>
    </main>
  );
}
