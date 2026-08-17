import { RADIO_STATIONS } from '@/lib/radio';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

export function GET() {
  const stations = RADIO_STATIONS.filter((station) => !station.source || station.source === 'stream');
  const outlines = stations.map((station) =>
    `    <outline type="audio" text="${escapeXml(station.name)}" title="${escapeXml(station.name)}" description="${escapeXml(station.tagline)}" xmlUrl="${escapeXml(station.url)}" htmlUrl="${SITE_URL}/?station=${escapeXml(station.id)}&amp;radio=1" />`,
  ).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>PuffBreak Frequencies</title>
    <dateModified>Mon, 17 Aug 2026 00:00:00 GMT</dateModified>
    <ownerName>PuffBreak</ownerName>
  </head>
  <body>
${outlines}
  </body>
</opml>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/x-opml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
