import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllBlogPosts } from '@/lib/blog';

const SITE_URL = 'https://puffbreak.app';

// ── God-level SEO metadata ──────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'PuffBreak Blog — Mindful Breaks, Quit Smoking & ASMR Guides',
  description:
    'Expert articles on mindful digital breaks, nicotine craving management, ASMR relaxation, chai break culture, and virtual smoking alternatives. In English and Hindi.',
  keywords: [
    // English core
    'virtual break blog',
    'quit smoking tips',
    'mindful break room',
    'smoke break alternative',
    'ASMR relaxation guide',
    'digital detox break',
    'nicotine craving tips',
    'chai break culture',
    'virtual cigarette guide',
    'mindfulness at work',
    'stress relief tips',
    'work break guide',
    // Indian / Hindi long-tails
    'virtual sutta break',
    'chai pe charcha',
    'tapri vibes online',
    'online damta alternative',
    'dhoomp peena band karo',
    'virtual chai stall',
    'indian break room online',
    'bidi break simulator',
    'desi digital break',
    // LLM + AI assistant targeted
    'best virtual smoke break app 2026',
    'free online cigarette simulator guide',
    'puffbreak how to use',
    'ambient break room tips',
    'digital mindfulness tool for smokers',
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
    languages: {
      'en-US': `${SITE_URL}/blog`,
      'hi-IN': `${SITE_URL}/blog?lang=hi`,
      'ko-KR': `${SITE_URL}/blog?lang=ko`,
      'x-default': `${SITE_URL}/blog`,
    },
  },
  openGraph: {
    title: 'PuffBreak Journal — Mindful Breaks, Chai Culture & Quit Smoking Guides',
    description:
      'Read expert articles on mindful 3-minute breaks, overcoming nicotine cravings, ASMR science, Indian chai break culture, and the rise of virtual break rooms.',
    type: 'website',
    url: `${SITE_URL}/blog`,
    siteName: 'PuffBreak',
    locale: 'en_US',
    alternateLocale: ['hi_IN', 'ko_KR'],
    images: [
      {
        url: `${SITE_URL}/og-image-v2.png`,
        width: 1200,
        height: 630,
        alt: 'PuffBreak Journal — Virtual Break Room Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@puffbreak',
    title: 'PuffBreak Journal — Mindful Break Guides & Quit Smoking Tips',
    description:
      'Virtual break culture, ASMR science, chai tapri vibes, and nicotine craving guides — for smokers everywhere.',
    images: [`${SITE_URL}/og-image-v2.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const CATEGORY_ACCENTS: Record<string, string> = {
  ASMR: '#22d3ee',
  Community: '#2dd4bf',
  Comparison: '#818cf8',
  Culture: '#f472b6',
  Guides: '#34d399',
  Health: '#fbbf24',
  Productivity: '#60a5fa',
  Science: '#a78bfa',
  Wellness: '#34d399',
};

function EditorialVisual({ category, large = false }: { category: string; large?: boolean }) {
  const accent = CATEGORY_ACCENTS[category] ?? '#34d399';

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden border-b border-white/[0.06] ${large ? '-mx-8 -mt-8 mb-8 h-36 sm:-mx-12 sm:-mt-12 sm:h-44' : '-mx-8 -mt-8 mb-7 h-24'}`}
      style={{
        background: `radial-gradient(circle at 82% 28%, ${accent}38 0%, transparent 31%), radial-gradient(circle at 68% 130%, ${accent}18 0%, transparent 42%), linear-gradient(135deg, #111318 0%, #090a0d 72%)`,
      }}
    >
      <div className="absolute -right-8 -top-16 h-48 w-48 rounded-full border border-white/10" />
      <div className="absolute right-9 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full border border-white/[0.08]" />
      <div className="absolute inset-y-0 left-7 flex items-center">
        <span className="font-mono-display text-[10px] font-bold uppercase tracking-[0.26em]" style={{ color: accent }}>
          {category || 'Journal'}
        </span>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function BlogIndex() {
  const posts = getAllBlogPosts();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'PuffBreak Journal',
    url: `${SITE_URL}/blog`,
    description:
      'Articles on mindful digital breaks, smoking cessation, ASMR relaxation, Indian chai break culture, and virtual break communities.',
    publisher: {
      '@type': 'Organization',
      name: 'PuffBreak',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    inLanguage: ['en', 'hi', 'ko'],
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.date,
      description: post.excerpt,
      image: `${SITE_URL}/blog/${post.slug}/opengraph-image`,
      author: {
        '@type': 'Organization',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'PuffBreak',
        url: SITE_URL,
      },
    })),
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
    ],
  };

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-gray-200 font-display p-6 sm:p-12 relative overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto mt-8 relative z-10">

        {/* ── Breadcrumb Nav ── */}
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex items-center gap-2 text-sm text-gray-500 font-mono-display">
            <li>
              <Link href="/" className="hover:text-emerald-400 transition-colors">
                🏠 Home
              </Link>
            </li>
            <li aria-hidden="true" className="opacity-40 text-xs">›</li>
            <li className="text-emerald-400 font-medium" aria-current="page">Blog</li>
          </ol>
        </nav>

        {/* ── Header ── */}
        <header className="mb-20 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-6">
            📖 {posts.length} Articles Published
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-md">
            PuffBreak{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">
              Journal
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed sm:mx-0 mx-auto">
            Mindful breaks, chai tapri vibes, quitting smoking guides, and the science of the
            perfect 3-minute reset. For smokers and dreamers worldwide 🌍
          </p>
        </header>

        {/* ── Featured Post ── */}
        <div className="mb-20">
          <h2 className="text-sm font-mono-display uppercase tracking-widest text-gray-500 mb-6">
            Featured Article
          </h2>
          <Link href={`/blog/${featuredPost.slug}`} className="block group">
            <article className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-12 transition-all duration-500 hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.12)] hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <EditorialVisual category={featuredPost.category} large />
              <div className="flex gap-2 mb-6 flex-wrap">
                {featuredPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-emerald-400 font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-4xl sm:text-5xl font-bold mb-4 text-white group-hover:text-emerald-300 transition-colors leading-tight">
                {featuredPost.title}
              </h3>
              <div className="text-sm text-gray-400 font-mono-display mb-6 flex items-center gap-3 flex-wrap">
                <span className="text-gray-300">{featuredPost.author}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <time dateTime={featuredPost.date}>
                  {new Date(featuredPost.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </div>
              <p className="text-lg text-gray-400 leading-relaxed max-w-3xl mb-8">
                {featuredPost.excerpt}
              </p>
              <div className="inline-flex items-center text-sm font-semibold text-emerald-400 group-hover:text-emerald-300 gap-2">
                Read Article
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </article>
          </Link>
        </div>

        {/* ── Article Grid ── */}
        <h2 className="text-sm font-mono-display uppercase tracking-widest text-gray-500 mb-6">
          Latest Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {remainingPosts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className="block group h-full">
              <article className="h-full flex flex-col p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-lg transition-all duration-300 hover:bg-white/[0.06] hover:border-emerald-500/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/5">
                <EditorialVisual category={post.category} />
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-wider uppercase bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-6 flex-grow text-sm">
                  {post.excerpt}
                </p>
                <div className="mt-auto">
                  <time
                    dateTime={post.date}
                    className="text-[11px] text-gray-500 font-mono-display block mb-4"
                  >
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <div className="inline-flex items-center text-sm font-semibold text-gray-300 group-hover:text-emerald-400 transition-colors gap-1">
                    Read Article
                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">→</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* ── Footer CTA ── */}
        <div className="mt-24 pt-12 border-t border-white/[0.06] text-center">
          <p className="text-gray-500 mb-6 text-sm tracking-widest uppercase font-mono-display">
            Ready for a mindful break?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
          >
            🚬 Enter the Break Room
          </Link>
        </div>

      </div>
    </div>
  );
}
