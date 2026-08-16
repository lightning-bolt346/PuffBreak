import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/blog';

export async function GET() {
  const posts = getAllBlogPosts();
  // Include full content so the in-app blog modal (PuffBreak Guide / article reader)
  // can render the rich .pb-article HTML without an extra round-trip.
  return NextResponse.json(posts.map(post => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    date: post.date,
    readTime: post.readTime,
    category: post.category,
    tags: post.tags,
    author: post.author,
  })));
}
