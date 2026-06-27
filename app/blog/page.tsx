import React from 'react';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog';

export const metadata = {
  title: 'PuffBreak Blog | Mindful Virtual Breaks & Quitting Tips',
  description: 'Read the latest articles on mindful digital breaks, smoking cessation tips, and how PuffBreak compares to platforms like Damta World.',
  openGraph: {
    title: 'PuffBreak Blog | Mindful Virtual Breaks',
    description: 'Read the latest articles on mindful digital breaks and smoking cessation.',
    type: 'website',
  },
};

export default function BlogIndex() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'PuffBreak Blog',
    'url': 'https://puffbreak.com/blog',
    'description': 'Articles on mindful breaks and smoking cessation.',
    'blogPost': BLOG_POSTS.map(post => ({
      '@type': 'BlogPosting',
      'headline': post.title,
      'url': `https://puffbreak.com/blog/${post.slug}`,
      'datePublished': post.date,
      'author': {
        '@type': 'Organization',
        'name': post.author
      }
    }))
  };

  const featuredPost = BLOG_POSTS[0];
  const remainingPosts = BLOG_POSTS.slice(1);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200 font-display p-6 sm:p-12 relative overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto mt-16 relative z-10">
        <header className="mb-20 text-center sm:text-left">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm mb-8 inline-flex items-center gap-2 uppercase tracking-widest font-mono-display transition-colors">
            <span className="text-lg leading-none">&larr;</span> Back to Break Room
          </Link>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-md">
            PuffBreak <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-700">Journal</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed sm:mx-0 mx-auto">
            Thoughts on digital mindfulness, overcoming cravings, and the future of virtual break rooms.
          </p>
        </header>

        {/* Featured Post */}
        <div className="mb-20">
          <h2 className="text-sm font-mono-display uppercase tracking-widest text-gray-500 mb-6">Featured Article</h2>
          <Link href={`/blog/${featuredPost.slug}`} className="block group">
            <article className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-12 transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:-translate-y-1">
              <div className="flex gap-2 mb-6">
                {featuredPost.tags.map(tag => (
                  <span key={tag} className="text-xs tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-emerald-400 font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-4xl sm:text-5xl font-bold mb-4 text-white group-hover:text-emerald-300 transition-colors leading-tight">
                {featuredPost.title}
              </h3>
              <div className="text-sm text-gray-400 font-mono-display mb-6 flex items-center gap-3">
                <span className="text-gray-300">{featuredPost.author}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <p className="text-lg text-gray-400 leading-relaxed max-w-3xl mb-8">
                {featuredPost.excerpt}
              </p>
              <div className="inline-flex items-center text-sm font-semibold text-emerald-400 group-hover:text-emerald-300">
                Read Article 
                <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">&rarr;</span>
              </div>
            </article>
          </Link>
        </div>

        {/* Grid Posts */}
        <h2 className="text-sm font-mono-display uppercase tracking-widest text-gray-500 mb-6">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {remainingPosts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className="block group h-full">
              <article className="h-full flex flex-col glass p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-lg transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] tracking-wider uppercase bg-white/5 border border-white/10 px-3 py-1 rounded-full text-gray-300">
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
                  <div className="text-[11px] text-gray-500 font-mono-display mb-4">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="inline-flex items-center text-sm font-semibold text-gray-300 group-hover:text-emerald-400 transition-colors">
                    Read Article 
                    <span className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">&rarr;</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
