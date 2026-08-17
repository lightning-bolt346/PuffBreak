import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getProjectInventory } from '@/lib/project-inventory';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Owner Inventory',
  description: 'Private owner inventory page for PuffBreak.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-image-preview': 'none',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {typeof count === 'number' ? (
          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-emerald-200">
            {count}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ItemList({ items }: { items: Array<{ label: string; href: string; note?: string }> }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={`${item.href}-${item.label}`}
          className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{item.label}</p>
              {item.note ? <p className="mt-1 text-sm text-gray-400">{item.note}</p> : null}
            </div>
            <code className="break-all text-xs text-emerald-200">{item.href}</code>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function OwnerInventoryPage({ params }: PageProps) {
  const { slug } = await params;
  const expectedSlug = process.env.PUFFBREAK_OWNER_PAGE_SLUG;

  if (!expectedSlug || slug !== expectedSlug) {
    notFound();
  }

  const inventory = getProjectInventory();

  return (
    <main className="min-h-screen bg-[#07111a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-14">
        <header className="mb-8 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Private owner view</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            PuffBreak project inventory
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-300 sm:text-base">
            This page is intentionally hidden from public navigation and indexing. It summarizes
            the current project state from source data: pages, blogs, radios, artist catalogues,
            tracks, endpoints and product surfaces.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {Object.entries(inventory.counts).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  {key.replace(/([A-Z])/g, ' $1')}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-gray-400">
            Inventory baseline date: {inventory.updatedForDate}
          </p>
        </header>

        <div className="grid gap-6">
          <Section title="Core Features">
            <div className="grid gap-4 lg:grid-cols-2">
              {inventory.features.map((group) => (
                <article key={group.name} className="rounded-2xl border border-white/8 bg-black/20 p-5">
                  <h3 className="text-lg font-medium text-white">{group.name}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-300">
                    {group.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Section>

          <Section title="Static Pages" count={inventory.staticPages.length}>
            <ItemList items={inventory.staticPages} />
          </Section>

          <Section title="Machine Endpoints" count={inventory.machineEndpoints.length}>
            <ItemList items={inventory.machineEndpoints} />
          </Section>

          <Section title="Concept / SEO Pages" count={inventory.conceptPages.length}>
            <ItemList items={inventory.conceptPages} />
          </Section>

          <Section title="Room Pages" count={inventory.roomPages.length}>
            <ItemList items={inventory.roomPages} />
          </Section>

          <Section title="Region / GEO Pages" count={inventory.regionPages.length}>
            <ItemList items={inventory.regionPages} />
          </Section>

          <Section title="Radio Guide Pages" count={inventory.radioGuides.length}>
            <ItemList items={inventory.radioGuides} />
          </Section>

          <Section title="Blogs" count={inventory.blogs.length}>
            <ItemList items={inventory.blogs} />
          </Section>

          <Section title="Direct Stream Stations" count={inventory.directStations.length}>
            <ItemList items={inventory.directStations} />
          </Section>

          <Section title="Artist Catalogues" count={inventory.artistCatalogues.length}>
            <div className="space-y-4">
              {inventory.artistCatalogues.map((catalogue) => (
                <article key={catalogue.id} className="rounded-2xl border border-white/8 bg-black/20 p-5">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{catalogue.name}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {catalogue.country} · {catalogue.genres.join(', ')}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                        {catalogue.source}
                      </p>
                    </div>
                    <div className="text-sm text-gray-300">
                      <div>In-app route: <code className="text-emerald-200">{catalogue.href}</code></div>
                      {catalogue.streamUrl ? (
                        <div className="mt-1">Stream: <code className="break-all text-emerald-200">{catalogue.streamUrl}</code></div>
                      ) : null}
                      {catalogue.playlistId ? (
                        <div className="mt-1">Playlist: <code className="text-emerald-200">{catalogue.playlistId}</code></div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/8 bg-[#061018] px-4 py-3 text-sm text-gray-300">
                    Stored track IDs in repo: {catalogue.trackCount}
                    {catalogue.trackCount === 0 && catalogue.playlistId ? (
                      <span className="block mt-1 text-gray-400">
                        This catalogue is playlist-backed in source, so the repo stores the playlist ID rather than an explicit per-track list.
                      </span>
                    ) : null}
                  </div>

                  {catalogue.tracks.length > 0 ? (
                    <details className="mt-4 rounded-2xl border border-white/8 bg-[#061018] p-4">
                      <summary className="cursor-pointer text-sm font-medium text-white">
                        Show stored track list
                      </summary>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {catalogue.tracks.map((track, index) => (
                          <div key={track.id} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Track {index + 1}</p>
                            <p className="mt-1 font-mono text-sm text-emerald-200">{track.id}</p>
                            <p className="mt-1 break-all text-xs text-gray-400">{track.href}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </article>
              ))}
            </div>
          </Section>

          <Section title="Notes">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-5 text-sm leading-6 text-gray-300">
              <p>
                The owner route is intentionally excluded from public navigation, robots-friendly
                discovery surfaces and sitemap generation.
              </p>
              <p className="mt-3">
                Future product, content or catalogue changes should update
                <code className="mx-1 text-emerald-200">lib/project-inventory.ts</code>
                so this page stays accurate.
              </p>
              <p className="mt-3">
                The gate is handled by middleware using a secret slug plus a secret key. Open the
                route once with the key in the query string, then the secure access cookie keeps the
                page available in that browser.
              </p>
              <div className="mt-4">
                <Link href="/" className="text-emerald-200 hover:text-emerald-100">
                  Return to home
                </Link>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
