import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ROOMS, getRoomBySlug } from '@/lib/rooms';

const SITE_URL = 'https://puff-break.vercel.app';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return ROOMS.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) return { title: 'Room Not Found' };

  const url = `${SITE_URL}/rooms/${room.slug}`;
  const ogImage = `${SITE_URL}/rooms/${room.slug}/opengraph-image`;

  return {
    title: room.seoTitle,
    description: room.seoDescription,
    keywords: room.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: room.seoTitle,
      description: room.seoDescription,
      url,
      siteName: 'PuffBreak',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: room.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: room.seoTitle,
      description: room.seoDescription,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RoomPage({ params }: Props) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) notFound();

  const url = `${SITE_URL}/rooms/${room.slug}`;
  const enterUrl = `/?room=${room.id}`;

  // Breadcrumb + FAQ schema (GEO: AI Overviews love extractable Q&A)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Break Rooms', item: `${SITE_URL}/rooms` },
          { '@type': 'ListItem', position: 3, name: room.name, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is the ${room.name} in PuffBreak?`,
            acceptedAnswer: { '@type': 'Answer', text: room.longDescription },
          },
          {
            '@type': 'Question',
            name: `How do I enter the ${room.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Open puff-break.vercel.app/?room=${room.id} or open the app and choose ${room.name} in the room picker.`,
            },
          },
          {
            '@type': 'Question',
            name: `Is the ${room.name} free?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — every PuffBreak room is free, anonymous and requires no sign-up.',
            },
          },
        ],
      },
    ],
  };

  const faqs = [
    { q: `What is the ${room.name} in PuffBreak?`, a: room.longDescription },
    {
      q: `How do I enter the ${room.name}?`,
      a: `Open puff-break.vercel.app/?room=${room.id} or open the app and choose ${room.name} in the room picker.`,
    },
    { q: `Is the ${room.name} free?`, a: 'Yes — every PuffBreak room is free, anonymous and requires no sign-up.' },
  ];

  return (
    <div className="w-full bg-[#0a0a0f] text-gray-200 font-display relative overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Room-tinted glow */}
      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[70%] blur-[140px] rounded-full pointer-events-none"
        style={{ backgroundColor: `${room.accent}14` }}
      />

      <article className="max-w-4xl mx-auto px-6 sm:px-12 pt-16 pb-24 relative z-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-6 group bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-emerald-400/30"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span className="font-mono uppercase tracking-widest text-xs font-semibold">Back to Break Room</span>
          </Link>
          <ol className="flex items-center gap-2 text-sm text-gray-500 font-mono-display">
            <li><Link href="/" className="hover:text-emerald-400 transition-colors">🏠 Home</Link></li>
            <li aria-hidden="true" className="opacity-40 text-xs">›</li>
            <li><Link href="/rooms" className="hover:text-emerald-400 transition-colors">Break Rooms</Link></li>
            <li aria-hidden="true" className="opacity-40 text-xs">›</li>
            <li className="text-emerald-400 font-medium" aria-current="page">{room.name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="text-center mb-16">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl border border-white/10 mb-8 text-4xl"
            style={{ backgroundColor: `${room.bg}`, boxShadow: `0 0 60px ${room.glowColor}` }}
          >
            {room.icon}
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.05]">
            {room.name}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed mb-10 max-w-3xl mx-auto font-light">
            {room.seoDescription}
          </p>

          <Link
            href={enterUrl}
            className="inline-flex items-center gap-3 bg-white text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-emerald-400 hover:text-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(52,211,153,0.4)] hover:scale-105 active:scale-95"
          >
            Enter {room.name} <span>→</span>
          </Link>
          <p className="text-xs text-gray-600 mt-4">Free · Anonymous · No sign-up</p>
        </header>

        {/* Long description */}
        <div className="prose prose-invert prose-emerald max-w-none prose-lg
                        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:text-gray-300 prose-p:leading-relaxed">
          <h2>The Experience</h2>
          <p>{room.longDescription}</p>
        </div>

        {/* Features */}
        <section className="mt-14" aria-label="Room features">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">What you&apos;ll find here</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {room.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 p-5 rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: room.accent }} />
                <span className="text-sm text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ (visible + schema for GEO) */}
        <section className="mt-16" aria-label="Frequently asked questions">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">FAQ</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-white font-semibold text-base mb-2">{f.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other rooms */}
        <section className="mt-20" aria-label="Explore other rooms">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Other Break Rooms</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ROOMS.filter((r) => r.id !== room.id).map((r) => (
              <Link
                key={r.id}
                href={`/rooms/${r.slug}`}
                className="group p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all text-center"
              >
                <div className="text-2xl mb-2">{r.icon}</div>
                <div className="text-xs font-medium text-gray-300 group-hover:text-emerald-400 transition-colors">
                  {r.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
