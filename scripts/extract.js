const fs = require('fs');
const path = require('path');
require('ts-node').register({ compilerOptions: { module: 'commonjs' } });

// Require the blog posts
const { BLOG_POSTS } = require('../lib/blog.ts');

const contentDir = path.join(__dirname, '..', 'content', 'blog');
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

BLOG_POSTS.forEach(post => {
  const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
excerpt: "${post.excerpt.replace(/"/g, '\\"')}"
author: "${post.author}"
date: "${post.date}"
category: "${post.category}"
readTime: "${post.readTime}"
tags:
${post.tags.map(tag => `  - ${tag}`).join('\n')}
---
`;
  const content = frontmatter + '\n' + post.content;
  fs.writeFileSync(path.join(contentDir, `${post.slug}.md`), content);
});

console.log(`Successfully extracted ${BLOG_POSTS.length} posts to content/blog/`);
