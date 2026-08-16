import type { Metadata } from 'next';
import { FAQ_ITEMS } from '@/lib/faq';
import { getHomeMeta } from '@/lib/i18n';

const SITE_URL = 'https://puff-break.vercel.app';

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

// Serve localized metadata for the `?lang=` hreflang variants (e.g. /?lang=ko).
// The default `/` (no lang) keeps the rich English metadata from app/layout.tsx.
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { lang } = await searchParams;
  if (!lang) return {};

  const meta = getHomeMeta(lang);
  const url = `${SITE_URL}/?lang=${lang}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: 'PuffBreak',
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
    robots: { index: true, follow: true },
  };
}

export default function HomePage() {
  // The actual PuffBreakApp is rendered in the background globally by GlobalAppWrapper.
  // This page contributes crawlable, accessible content for search engines and screen
  // readers without visually covering the immersive break-room experience.
  return (
    <>
      {/* Transparent dummy container so the root route keeps the full-screen app layout */}
      <div className="w-full h-full min-h-screen opacity-0 pointer-events-none" aria-hidden="true" />

      {/* Screen-reader + crawler accessible FAQ (visually hidden, not cloaked).
          The immersive app already contributes the page's H1/product description. */}
      <section className="sr-only" aria-label="Frequently asked questions">
        <h2>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item) => (
          <article key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </article>
        ))}
      </section>
    </>
  );
}
