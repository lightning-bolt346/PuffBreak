import { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog';
import { ROOMS } from '@/lib/rooms';
import { REGIONS } from '@/lib/regions';
import { LANDING_PAGES } from '@/lib/landing';
import { RADIO_GUIDES } from '@/lib/radio-pages';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogs: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const rooms: MetadataRoute.Sitemap = ROOMS.map((room) => ({
    url: `${SITE_URL}/rooms/${room.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const regions: MetadataRoute.Sitemap = REGIONS.map((region) => ({
    url: `${SITE_URL}/regions/${region.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const concepts: MetadataRoute.Sitemap = LANDING_PAGES.map((page) => ({
    url: `${SITE_URL}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const radioGuides: MetadataRoute.Sitemap = RADIO_GUIDES.map((guide) => ({
    url: `${SITE_URL}/radio/${guide.slug}`,
    lastModified: new Date('2026-08-17'),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/rooms`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...rooms,
    {
      url: `${SITE_URL}/regions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...regions,
    ...concepts,
    {
      url: `${SITE_URL}/data`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/radio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...radioGuides,
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogs,
  ];
}
