import { ImageResponse } from 'next/og';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function BlogOGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  const title = post?.title ?? 'PuffBreak Journal';
  const excerpt = post?.excerpt ?? 'Mindful breaks, chai culture, and quit-smoking guides.';
  const category = post?.category ?? 'Article';
  const readTime = post?.readTime ?? '3 min read';

  // Category → accent color mapping
  const accentMap: Record<string, string> = {
    Guides: '#10b981',
    ASMR: '#06b6d4',
    Health: '#f59e0b',
    Science: '#8b5cf6',
    Productivity: '#3b82f6',
    Culture: '#ec4899',
    Community: '#14b8a6',
    Wellness: '#10b981',
    Comparison: '#6366f1',
  };
  const accent = accentMap[category] ?? '#10b981';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '-200px',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-200px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, #1a1a2e 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Top bar — brand + category */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                background: '#10b98115',
                border: '1px solid #10b98133',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
              }}
            >
              🚬
            </div>
            <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, letterSpacing: '0.05em' }}>
              PuffBreak Journal
            </span>
          </div>

          <div
            style={{
              background: `${accent}18`,
              border: `1px solid ${accent}44`,
              borderRadius: '999px',
              padding: '6px 20px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ color: accent, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {category}
            </span>
          </div>
        </div>

        {/* Title */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1
            style={{
              color: '#ffffff',
              fontSize: title.length > 60 ? '44px' : '56px',
              fontWeight: 800,
              lineHeight: 1.15,
              margin: '0 0 24px 0',
              letterSpacing: '-0.02em',
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: '#6b7280',
              fontSize: '22px',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: '820px',
              display: '-webkit-box',
              overflow: 'hidden',
            }}
          >
            {excerpt.slice(0, 120)}{excerpt.length > 120 ? '…' : ''}
          </p>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '32px',
            borderTop: '1px solid #ffffff10',
            marginTop: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${accent}44, #1a1a2e)`,
                border: `1px solid ${accent}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accent,
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              PB
            </div>
            <span style={{ color: '#9ca3af', fontSize: '16px' }}>puffbreak.app</span>
          </div>
          <span style={{ color: '#4b5563', fontSize: '15px' }}>{readTime}</span>
        </div>

        {/* Accent bottom line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${accent}, transparent)`,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
