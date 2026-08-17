import { getAllBlogPosts } from '@/lib/blog';
import { LANDING_PAGES } from '@/lib/landing';
import { RADIO_GUIDES } from '@/lib/radio-pages';
import { RADIO_STATIONS } from '@/lib/radio';
import { REGIONS } from '@/lib/regions';
import { ROOMS } from '@/lib/rooms';

// Source of truth for the private owner inventory page.
// Keep this file in sync whenever routes, content, radios, artists, tracks,
// features, or major product behavior changes.

export type ProjectInventoryItem = {
  label: string;
  href: string;
  note?: string;
};

export type ProjectInventoryFeatureGroup = {
  name: string;
  bullets: string[];
};

export type ProjectInventoryArtistCatalogue = {
  id: string;
  name: string;
  href: string;
  country: string;
  genres: string[];
  source: 'stream' | 'youtube-playlist' | 'unknown';
  playlistId?: string;
  streamUrl?: string;
  trackCount: number;
  tracks: Array<{ id: string; href: string }>;
};

const STATIC_PAGES: ProjectInventoryItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Blog Index', href: '/blog' },
  { label: 'Data', href: '/data', note: 'Live survey aggregates page' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Radio Index', href: '/radio' },
  { label: 'Regions Index', href: '/regions' },
  { label: 'Rooms Index', href: '/rooms' },
  { label: 'Support', href: '/support' },
  { label: 'Test Lab', href: '/test', note: 'Internal radio audition/testing surface' },
];

const MACHINE_ENDPOINTS: ProjectInventoryItem[] = [
  { label: 'Survey API', href: '/api/survey' },
  { label: 'Blogs API', href: '/api/blogs' },
  { label: 'Feedback API', href: '/api/feedback' },
  { label: 'Radio JSON', href: '/radio.json' },
  { label: 'Radio OPML', href: '/radio.opml' },
  { label: 'Sitemap', href: '/sitemap.xml' },
];

const FEATURE_GROUPS: ProjectInventoryFeatureGroup[] = [
  {
    name: 'Break-room core',
    bullets: [
      'Virtual cigarette ritual with lighting, drag, ash, ember and smoke behavior.',
      'Virtual chai ritual with sip, steam and chai-stall ambience.',
      'Eight ambient rooms with distinct audio scales, visual atmosphere and SEO room pages.',
      'Anonymous browser-based break room with no account requirement.',
    ],
  },
  {
    name: 'Audio and immersion',
    bullets: [
      'Independent radio, ambience and crackle volume controls.',
      'Persistent in-app artist radio behavior for catalogue-backed stations.',
      'Exhale cue runs independently from cigarette crackle.',
      'Embedded playback avoids kicking users out to YouTube pages for artist catalogues.',
    ],
  },
  {
    name: 'Radio and discovery',
    bullets: [
      'Global direct-stream radio library across moods, regions and languages.',
      'Artist radio shelf combining dependable 24/7 streams and checked embedded catalogues.',
      'Curated SEO radio-guide pages for genre, vibe, geography and artist-intent discovery.',
      'Machine-readable `radio.json` and `radio.opml` endpoints.',
    ],
  },
  {
    name: 'SEO, GEO and content',
    bullets: [
      'Concept landing pages for search intent.',
      'Region/culture entity pages for international break rituals.',
      'Blog system for evergreen explainers and discovery content.',
      'Structured FAQ-rich pages across home, concept, room, region and radio surfaces.',
      'Host-level redirect strategy for market-entry domains so they reinforce one canonical site instead of creating duplicate public copies.',
    ],
  },
];

export function getProjectInventory() {
  const blogs = getAllBlogPosts().map((post) => ({
    label: post.title,
    href: `/blog/${post.slug}`,
    note: `${post.date} · ${post.category} · ${post.readTime}`,
  }));

  const conceptPages = LANDING_PAGES.map((page) => ({
    label: page.title,
    href: `/${page.slug}`,
    note: `${page.roomId} room · ${page.keywords.length} keywords`,
  }));

  const roomPages = ROOMS.map((room) => ({
    label: room.name,
    href: `/rooms/${room.slug}`,
    note: `${room.id} · ${room.features.length} feature bullets`,
  }));

  const regionPages = REGIONS.map((region) => ({
    label: region.name,
    href: `/regions/${region.slug}`,
    note: `${region.region} · ${region.lang} · ${region.term}`,
  }));

  const radioGuides = RADIO_GUIDES.map((guide) => ({
    label: guide.title,
    href: `/radio/${guide.slug}`,
    note: `${guide.stationIds.length} stations · ${guide.faqs.length} FAQs`,
  }));

  const directStations = RADIO_STATIONS
    .filter((station) => station.region !== 'Artist Radio')
    .map((station) => ({
      label: station.name,
      href: station.url,
      note: `${station.region} · ${station.country} · ${station.genres.join(', ')}`,
    }));

  const artistCatalogues: ProjectInventoryArtistCatalogue[] = RADIO_STATIONS
    .filter((station) => station.region === 'Artist Radio')
    .map((station) => {
      const source: ProjectInventoryArtistCatalogue['source'] =
        station.source === 'stream' || station.source === 'youtube-playlist'
          ? station.source
          : 'unknown';

      return {
        id: station.id,
        name: station.name,
        href: `/?station=${station.id}&radio=1`,
        country: station.country,
        genres: station.genres,
        source,
        playlistId: station.playlistId,
        streamUrl: station.source === 'stream' ? station.url : undefined,
        trackCount: station.videoIds?.length ?? 0,
        tracks: (station.videoIds ?? []).map((videoId) => ({
          id: videoId,
          href: `https://www.youtube.com/watch?v=${videoId}`,
        })),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    updatedForDate: '2026-08-17',
    counts: {
      staticPages: STATIC_PAGES.length,
      machineEndpoints: MACHINE_ENDPOINTS.length,
      conceptPages: conceptPages.length,
      roomPages: roomPages.length,
      regionPages: regionPages.length,
      radioGuides: radioGuides.length,
      blogs: blogs.length,
      directStations: directStations.length,
      artistCatalogues: artistCatalogues.length,
      artistTracksStored: artistCatalogues.reduce((sum, catalogue) => sum + catalogue.trackCount, 0),
    },
    features: FEATURE_GROUPS,
    staticPages: STATIC_PAGES,
    machineEndpoints: MACHINE_ENDPOINTS,
    conceptPages,
    roomPages,
    regionPages,
    radioGuides,
    blogs,
    directStations,
    artistCatalogues,
  };
}
