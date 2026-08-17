import { ImageResponse } from 'next/og';
import { getRoomBySlug, ROOMS } from '@/lib/rooms';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return ROOMS.map((room) => ({ slug: room.slug }));
}

// next/og may try to download fallback fonts for emoji/non-Latin glyphs while
// rendering. Social cards must remain buildable without a third-party font
// request, so this renderer deliberately uses an ASCII-safe monogram and copy.
const safeOgText = (value: string) => value
  .normalize('NFKD')
  .replace(/[–—]/g, '-')
  .replace(/[’]/g, "'")
  .replace(/[^\x20-\x7E]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export default async function RoomOGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  const name = safeOgText(room?.name ?? 'PuffBreak');
  const monogram = (room?.id ?? 'pb').slice(0, 2).toUpperCase();
  const accent = room?.accent ?? '#10b981';
  const bg = room?.bg ?? '#0a0a0f';
  const desc = safeOgText(room?.seoDescription ?? 'A free, anonymous 3-minute ambient break room.');

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '72px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '500px',
            background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
            borderRadius: '50%',
          }}
        />
        <div style={{
          width: '116px',
          height: '116px',
          borderRadius: '32px',
          border: `2px solid ${accent}66`,
          background: `${accent}18`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '38px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          marginBottom: '36px',
        }}>{monogram}</div>
        <div
          style={{
            color: '#ffffff',
            fontSize: '72px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          {name}
        </div>
        <div
          style={{
            color: '#d1d5db',
            fontSize: '30px',
            fontWeight: 400,
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          {desc}
        </div>
        <div style={{ color: accent, fontSize: '22px', fontWeight: 600, marginTop: '40px' }}>
          puffbreak.app
        </div>
      </div>
    ),
    size
  );
}
