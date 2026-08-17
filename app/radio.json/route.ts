import { RADIO_STATIONS } from '@/lib/radio';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  return Response.json({
    name: 'PuffBreak Frequencies',
    description: 'Human-curated global radio for intentional three-minute breaks.',
    homepage: `${SITE_URL}/radio`,
    updated: '2026-08-17',
    licenseNote: 'PuffBreak curates links; each broadcaster owns and operates its stream and programming.',
    stations: RADIO_STATIONS.map((station) => ({
      id: station.id,
      name: station.name,
      description: station.tagline,
      country: station.country,
      region: station.region,
      genres: station.genres,
      languages: station.languages,
      moods: station.moods,
      ...(station.source === 'youtube-playlist' ? {} : { streamUrl: station.url }),
      playback: station.source ?? 'stream',
      puffbreakUrl: `${SITE_URL}/?station=${station.id}&radio=1`,
    })),
  }, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  });
}
