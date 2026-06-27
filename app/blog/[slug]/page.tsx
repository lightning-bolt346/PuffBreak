import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogPostBySlug, BLOG_POSTS } from '@/lib/blog';

// Generate static routes for all blog posts at build time
export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return { title: 'Post Not Found | PuffBreak' };
  }

  return {
    title: `${post.title} | PuffBreak Blog`,
    description: post.excerpt,
    keywords: [...post.tags, 'virtual break', 'mindful app'],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.title,
    'description': post.excerpt,
    'datePublished': post.date,
    'author': {
      '@type': 'Organization',
      'name': post.author
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] text-gray-200 font-display p-6 sm:p-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="max-w-3xl mx-auto mt-16 pb-20">
        <header className="mb-12">
          <Link href="/blog" className="text-emerald-400 hover:text-emerald-300 text-sm mb-8 inline-block uppercase tracking-widest font-mono-display">
            &larr; Back to Blog
          </Link>
          
          <div className="flex gap-2 mb-6">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs tracking-wider uppercase bg-white/10 px-3 py-1 rounded-full text-emerald-300">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center text-gray-400 font-mono-display text-sm border-t border-white/10 pt-6">
            <span>By <strong className="text-white">{post.author}</strong></span>
            <span className="mx-3 opacity-50">·</span>
            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
