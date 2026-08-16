import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchSurveyStats } from '@/lib/stats';
import { SITE_URL, SURVEY_API_URL } from '@/lib/site';
import LiveSurveyData from '@/components/data/LiveSurveyData';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'The Data — Real Break Results from Real People',
  description:
    'Original, self-reported data from real PuffBreak breaks: what percentage of breaks reduce cravings, measured live and anonymously. No inflation, no editing — just the numbers.',
  alternates: { canonical: `${SITE_URL}/data` },
  openGraph: {
    title: 'PuffBreak Data — Real Break Results',
    description:
      'Live, anonymous, self-reported data: how often a 3-minute virtual break reduces a craving. Published as collected.',
    url: `${SITE_URL}/data`,
    siteName: 'PuffBreak',
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  {
    q: 'What is this data?',
    a: 'It is the real, aggregated result of a single optional question PuffBreak asks after a completed break: "Did this break reduce your craving?" It is published exactly as collected — never edited, never inflated.',
  },
  {
    q: 'How is it collected?',
    a: 'After every completed break, the app shows one optional one-tap question with four answers. One response per browser session. No accounts, no identity, no tracking — the answer cannot be linked to a person.',
  },
  {
    q: 'Can the data be gamed?',
    a: 'Not meaningfully. Each browser session can answer once, so the numbers are one-per-real-user-by-default. The counts are incremented atomically in the database so concurrent breaks cannot double-count.',
  },
  {
    q: 'Is this medical research?',
    a: 'No. This is self-reported, non-clinical data from a relaxation tool — a signal, not a study. We publish it transparently with the method, which is exactly why it is useful: it is real, and it is honest about what it is.',
  },
  {
    q: 'How often is the page updated?',
    a: 'The page revalidates automatically every few minutes, and in your browser it refreshes in the background every minute. The numbers grow as real breaks happen.',
  },
];

export default async function DataPage() {
  const stats = await fetchSurveyStats();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'PuffBreak Data',
        url: `${SITE_URL}/data`,
        description: metadata.description,
      },
      {
        '@type': 'Dataset',
        name: 'PuffBreak Craving Survey',
        description:
          'Aggregated, anonymous, self-reported responses to "did this break reduce your craving?" collected after completed breaks in the PuffBreak app.',
        url: SURVEY_API_URL,
        license: 'https://creativecommons.org/publicdomain/zero/1.0/',
        isAccessibleForFree: true,
        temporalCoverage: '2026-',
        distribution: {
          '@type': 'DataDownload',
          contentUrl: SURVEY_API_URL,
          encodingFormat: 'application/json',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="w-full bg-[#0a0a0f] text-gray-200 font-display relative overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[70%] blur-[140px] rounded-full pointer-events-none bg-emerald-400/10" />

      <article className="max-w-4xl mx-auto px-6 sm:px-12 pt-16 pb-24 relative z-10">
        <nav aria-label="Breadcrumb" className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-6 group bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-emerald-400/30"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span className="font-mono uppercase tracking-widest text-xs font-semibold">Back to Break Room</span>
          </Link>
        </nav>

        <header className="mb-14 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-emerald-300/80 mb-6">Original data · no spin</p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.05]">The Data</h1>
          <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto font-light">
            After every completed break, we ask one question. This page is the honest, live answer — published exactly
            as collected, for anyone to cite.
          </p>
        </header>

        {/* Live numbers */}
        <LiveSurveyData initial={stats} />

        {/* Methodology / transparency — the reason this data is citable */}
        <section className="mt-14" aria-label="Methodology">
          <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">How we count — honestly</h2>
          <div className="prose prose-invert prose-emerald max-w-none prose-lg prose-p:text-gray-300 prose-p:leading-relaxed space-y-4">
            <p>
              When a break finishes, the app asks a single optional question: <em>“did this break reduce your craving?”</em>{' '}
              One tap, four answers, done. Each browser session can answer once, so the numbers are one-per-real-user by
              default. There are no accounts, no identities, and no way to tie an answer to a person.
            </p>
            <p>
              We publish the aggregate as-is. We do not edit it, we do not inflate it, and we do not hide the
              “didn’t help” answers — they are in the breakdown above. That is the entire point: data you can trust
              because the method is boring and transparent.
            </p>
            <p className="text-sm text-gray-500">
              This is self-reported, non-clinical data from a relaxation tool — a real signal, not a medical study.
              Machines and people can read it at <a className="text-emerald-300 hover:text-emerald-200 underline" href={SURVEY_API_URL}>/api/survey</a>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-14 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Help the data grow</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Every break adds a real data point. Take your three minutes, answer the one question, and watch the number
            move.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-white text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-emerald-400 hover:text-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95"
          >
            Take a break <span>→</span>
          </Link>
        </section>

        {/* FAQ */}
        <section className="mt-16" aria-label="Frequently asked questions">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">About the data</h2>
          <div className="space-y-6">
            {FAQS.map((f) => (
              <div key={f.q} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-white font-semibold text-base mb-2">{f.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
