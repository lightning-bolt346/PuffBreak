import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Default: all crawlers allowed
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        // Major AI / LLM crawlers — explicitly welcome
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'Claude-Web',
          'anthropic-ai',
          'PerplexityBot',
          'Applebot',
          'Googlebot',
          'Bingbot',
          'DuckDuckBot',
          'ia_archiver',
          'facebookexternalhit',
          'Twitterbot',
          'LinkedInBot',
        ],
        allow: '/',
      },
    ],
    sitemap: 'https://puff-break.vercel.app/sitemap.xml',
    // AI context files:
    // https://puff-break.vercel.app/llms.txt       — summary for LLMs
    // https://puff-break.vercel.app/llms-full.txt  — full reference for LLMs
  };
}
