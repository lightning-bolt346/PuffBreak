import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBlogPostBySlug, BLOG_POSTS } from '@/lib/blog';

const SITE_URL = 'https://puff-break.vercel.app';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

// Generate static routes for all blog posts at build time
export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

// Generate dynamic metadata for SEO — full god-level implementation
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [
      ...post.tags,
      'virtual break',
      'mindful app',
      'PuffBreak blog',
      'digital break room',
      'smoke break tips',
    ],
    authors: [{ name: post.author, url: SITE_URL }],
    creator: post.author,
    publisher: 'PuffBreak',
    category: post.category,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: 'PuffBreak',
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      modifiedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${post.title} — PuffBreak Blog`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@puffbreak',
      creator: '@puffbreak',
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: OG_IMAGE,
          alt: `${post.title} — PuffBreak Blog`,
        },
      ],
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
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const url = `${SITE_URL}/blog/${post.slug}`;

  // Article schema — the most powerful for featured snippets + LLM citation
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
        url: `${SITE_URL}/favicon.svg`,
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

  // BreadcrumbList schema — helps Google show breadcrumbs in SERPs
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
        item: `${SITE_URL}/blog`,
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
    <div className="h-screen overflow-y-auto w-full bg-[#0a0a12] text-gray-200 font-display p-6 sm:p-12">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <article className="max-w-3xl mx-auto mt-8 pb-20">
        {/* Top Navigation */}
        <nav aria-label="Breadcrumb" className="mb-10">
          {/* Visible back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-4 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span className="font-mono-display uppercase tracking-widest text-xs">All Articles</span>
          </Link>
          {/* Semantic breadcrumb trail */}
          <ol className="flex items-center gap-1.5 text-xs text-gray-600 font-mono-display">
            <li><Link href="/" className="hover:text-gray-400 transition-colors">Home</Link></li>
            <li aria-hidden="true" className="opacity-40">›</li>
            <li><Link href="/blog" className="hover:text-gray-400 transition-colors">Blog</Link></li>
            <li aria-hidden="true" className="opacity-40">›</li>
            <li className="text-gray-500 truncate max-w-[200px]" aria-current="page">{post.category}</li>
          </ol>
        </nav>

        <header className="mb-12">
          <div className="flex gap-2 mb-6 flex-wrap">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs tracking-wider uppercase bg-white/10 px-3 py-1 rounded-full text-emerald-300">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed mb-8">{post.excerpt}</p>

          <div className="flex items-center text-gray-400 font-mono-display text-sm border-t border-white/10 pt-6 gap-4 flex-wrap">
            <span>By <strong className="text-white">{post.author}</strong></span>
            <span aria-hidden="true" className="opacity-50">·</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
            <span aria-hidden="true" className="opacity-50">·</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        {/* Prose Content */}
        <div
          className="prose prose-invert prose-emerald max-w-none 
                     prose-h2:text-3xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:mt-10
                     prose-h3:text-2xl prose-h3:font-medium prose-h3:mb-4 prose-h3:mt-8
                     prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                     prose-li:text-gray-300 prose-li:mb-2 prose-ul:mb-6
                     prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 mb-6">Ready to take a mindful break?</p>
          <Link
            href="/"
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
          >
            Enter the Break Room
          </Link>
        </div>
      </article>
    </div>
  );
}
