import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  readTime: string;
  category: string;
}

const contentDir = path.join(process.cwd(), 'content', 'blog');

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  
  const files = fs.readdirSync(contentDir);
  const posts = files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const fullPath = path.join(contentDir, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      
      return {
        slug: file.replace(/\.md$/, ''),
        title: data.title,
        excerpt: data.excerpt,
        content: content,
        author: data.author,
        date: data.date,
        tags: data.tags || [],
        readTime: data.readTime,
        category: data.category,
      } as BlogPost;
    });

  // Sort posts by date in descending order
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllBlogPosts();
  return posts.find((post) => post.slug === slug);
}
