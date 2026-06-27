import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
      {
        // Explicitly allow common AI/LLM crawlers
        userAgent: ['GPTBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Googlebot'],
        allow: '/',
      },
    ],
    sitemap: 'https://puffbreak.com/sitemap.xml',
    // llms.txt is at /llms.txt — served from public/ directory
  };
}
