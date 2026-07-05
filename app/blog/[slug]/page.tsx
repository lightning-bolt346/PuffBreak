import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogPostBySlug, BLOG_POSTS } from '@/lib/blog';

const SITE_URL = 'https://puff-break.vercel.app';

// Force dynamic generation for blog posts so we don't hit edge case static generation bugs in dev
export const dynamicParams = true;

// ── Types & Generation ──────────────────────────────────────────────────────
interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found | PuffBreak' };
  }

  const OG_IMAGE = `\${SITE_URL}/blog/\${post.slug}/opengraph-image`;

  return {
    title: `\${post.title} — PuffBreak Journal`,
    description: post.excerpt,
    alternates: {
      canonical: `\${SITE_URL}/blog/\${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `\${SITE_URL}/blog/\${post.slug}`,
      siteName: 'PuffBreak',
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@puffbreak',
      title: post.title,
      description: post.excerpt,
      images: [OG_IMAGE],
    },
  };
}

// ── Component ──────────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const OG_IMAGE = `\${SITE_URL}/blog/\${post.slug}/opengraph-image`;
  const url = `\${SITE_URL}/blog/\${post.slug}`;

  // Article schema
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    url,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    image: {
      '@type': 'ImageObject',
      url: OG_IMAGE,
      width: 1200,
      height: 630,
    },
    author: {
      '@type': 'Organization',
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PuffBreak',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `\${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
    inLanguage: 'en',
    isAccessibleForFree: true,
  };

  // BreadcrumbList schema
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `\${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  return (
    <div className="w-full bg-[#0a0a0f] text-gray-200 font-display relative selection:bg-amber-400/20">
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      {/* Cinematic Hero Background */}
      <div className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/0 via-[#0a0a0f]/80 to-[#0a0a0f] z-10" />
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-violet-500/5 to-transparent blur-[100px]" />
      </div>

      <article className="max-w-4xl mx-auto px-6 sm:px-12 pt-24 pb-32 relative z-20">
        
        {/* Top Navigation */}
        <nav aria-label="Breadcrumb" className="mb-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-6 group bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-emerald-400/30"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span className="font-mono uppercase tracking-widest text-xs font-semibold">Back to Journal</span>
          </Link>
        </nav>

        {/* Article Header */}
        <header className="mb-20 text-center sm:text-left">
          <div className="flex gap-2 mb-8 flex-wrap justify-center sm:justify-start">
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-emerald-400">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-white leading-[1.1]">
            {post.title}
          </h1>

          <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed mb-12 font-light max-w-3xl">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-center sm:justify-start text-gray-500 font-mono text-sm gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-500 p-[1px]">
                <div className="w-full h-full bg-[#0a0a0f] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">PB</span>
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-gray-300">By {post.author}</span>
                <span className="text-xs opacity-70">PuffBreak Team</span>
              </div>
            </div>
            
            <span aria-hidden="true" className="opacity-30 text-xl hidden sm:block">|</span>
            
            <time dateTime={post.date} className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
            
            <span aria-hidden="true" className="opacity-30 text-xl hidden sm:block">|</span>
            
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {post.readTime}
            </span>
          </div>
        </header>

        {/* Prose Content */}
        <div className="relative">
          <div className="absolute -inset-x-6 sm:-inset-x-12 -inset-y-12 bg-white/[0.02] border border-white/[0.05] rounded-[3rem] pointer-events-none hidden lg:block" />
          
          <div
            className="prose prose-invert prose-lg sm:prose-xl max-w-none relative z-10
                       prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                       prose-h2:text-3xl sm:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8
                       prose-h3:text-2xl sm:prose-h3:text-3xl prose-h3:mt-12 prose-h3:mb-6
                       prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-8
                       prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:text-emerald-300
                       prose-strong:text-white prose-strong:font-bold
                       prose-blockquote:border-emerald-500/50 prose-blockquote:bg-emerald-500/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-gray-200
                       prose-li:text-gray-300 prose-ul:mb-8 prose-ul:space-y-2
                       marker:text-emerald-500"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Bottom CTA */}
        <div className="mt-32 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 p-10 sm:p-16 text-center group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight relative z-10">
            Ready for a mindful break?
          </h3>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto relative z-10">
            Join thousands of users replacing their smoke breaks with 3 minutes of pure ambient relaxation.
          </p>
          <Link
            href="/"
            className="relative z-10 inline-flex items-center gap-3 bg-white text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-emerald-400 hover:text-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(52,211,153,0.4)] hover:scale-105 active:scale-95"
          >
            Enter the Break Room <span>→</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
