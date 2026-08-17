import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { ROOMS } from '@/lib/rooms';
import { REGIONS } from '@/lib/regions';
import { LANDING_PAGES } from '@/lib/landing';
import { getAllBlogPosts } from '@/lib/blog';
import { fetchSurveyStats } from '@/lib/stats';

/**
 * /test — internal QA dashboard.
 *
 * SECURITY: served ONLY on localhost. Any other host gets a 404. It is also
 * `force-dynamic` (never statically prerendered, so the host check always runs at
 * request time), noindexed, and blocked in robots.txt.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Test Dashboard',
  robots: { index: false, follow: false },
};

interface Check {
  ok: boolean;
  status?: number;
  bytes?: number;
  error?: string;
}

async function check(url: string): Promise<Check> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { ok: false, status: res.status };
    const text = await res.text();
    return { ok: true, status: res.status, bytes: text.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'fetch failed' };
  }
}

function Status({ check }: { check: Check | null }) {
  if (!check) return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-gray-500/10 text-gray-500">—</span>;
  if (check.ok)
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        OK {check.status}{check.bytes != null ? ` · ${check.bytes}B` : ''}
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
      {check.status ? `HTTP ${check.status}` : check.error ?? 'FAIL'}
    </span>
  );
}

const ENV_KEYS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

const QA_ITEMS = [
  { label: 'Homepage `/` loads without console errors', done: false },
  { label: 'Tap tip → lighter ignition animation (cap → strike → flame)', done: false },
  { label: 'Switch igniter to Matchstick in drawer → full matchbox sequence', done: false },
  { label: 'Hold filter → cherry glows, ash grows, crackle plays', done: false },
  { label: 'Release filter → smoke ring spawns', done: false },
  { label: 'Double-tap ash → it falls (and shake-to-ash on a phone)', done: false },
  { label: 'Chai room: hold to sip, steam rises, liquid drops', done: false },
  { label: 'Break Length: Micro (1m) / Classic (3m) / Deep (5m) changes the timer', done: false },
  { label: 'Break completes → vibration + timer stops', done: false },
  { label: 'Craving Check appears ~1.5s after a break completes (one per session)', done: false },
  { label: 'Craving Check is hidden in Zen Mode and Stealth Mode', done: false },
  { label: 'Answer Craving Check → thank-you → link to /data', done: false },
  { label: '`/data` shows the answer you just gave (real number)', done: false },
  { label: 'Room change via drawer → background/audio crossfade + presence count', done: false },
  { label: 'Chat: send, react with emoji, messages expire (~22s)', done: false },
  { label: 'Stealth Mode renames the tab', done: false },
  { label: 'Zen Mode hides all UI; click anywhere to exit', done: false },
  { label: 'Streak toast appears on a returning day', done: false },
  { label: 'PWA: install from browser (Add to Home Screen)', done: false },
  { label: 'Mobile layout (device toolbar): controls, chat, survey all usable', done: false },
  { label: 'FAQ modal + PuffBreak Guide modal open & scroll', done: false },
  { label: 'Support / Donate modal (BTC + UPI QR)', done: false },
];

const DEPLOY_ITEMS = [
  { label: 'Firebase RTDB rules: allow /stats/survey + /stats/breaks (paste database.rules.json → Firebase Console → Realtime Database → Rules)', href: 'https://console.firebase.google.com/project/_/database/_/rules' },
  { label: 'Push `open-source/audio-engine/` → github.com/puffbreak/ambient-synth (optional entity win)', href: undefined as string | undefined },
  { label: 'Push the main repo → github.com/puffbreak/puffbreak (optional)', href: undefined as string | undefined },
  { label: 'Google Search Console: submit /sitemap.xml + request indexing for new pages', href: 'https://search.google.com/search-console' },
  { label: 'Bing Webmaster Tools: submit the sitemap', href: 'https://www.bing.com/webmasters' },
  { label: 'Wikidata item Q141105453 — created & wired into layout.tsx sameAs ✓', href: 'https://www.wikidata.org/wiki/Q141105453' },
  { label: 'Directory listings with the copy in docs/wikidata.md §3', href: undefined as string | undefined },
  { label: 'When you own a domain: swap email + URL everywhere at once (see docs)', href: undefined as string | undefined },
];

export default async function TestPage() {
  const host = (await headers()).get('host') ?? '';
  const isLocal =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('[::1]') ||
    host.endsWith('.localhost');

  // Hard localhost-only gate.
  if (!isLocal) notFound();

  const origin = `http://${host}`;
  const [apiBlogs, apiSurvey, sitemap, robots, llms, llmsFull, manifest, humans] = await Promise.all([
    check(`${origin}/api/blogs`),
    check(`${origin}/api/survey`),
    check(`${origin}/sitemap.xml`),
    check(`${origin}/robots.txt`),
    check(`${origin}/llms.txt`),
    check(`${origin}/llms-full.txt`),
    check(`${origin}/manifest.json`),
    check(`${origin}/humans.txt`),
  ]);

  const survey = await fetchSurveyStats();
  const envStatus = ENV_KEYS.map((k) => ({ key: k, set: Boolean(process.env[k] && !process.env[k]!.includes('dummy')) }));

  const blogPosts = getAllBlogPosts();

  return (
    <div className="w-full bg-[#0a0a0f] text-gray-200 font-display min-h-screen">
      <main className="max-w-5xl mx-auto px-6 py-14">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              localhost only
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              host: {host}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">Test Dashboard</h1>
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Everything to check before you push. This page only serves on <code className="text-emerald-300">localhost</code> — on any
            other host it returns a 404, it is noindexed, and it is blocked in robots.txt.
          </p>
        </header>

        {/* Routes inventory */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-1">1 · Pages to verify</h2>
          <p className="text-sm text-gray-500 mb-4">Open each one and confirm it renders, has its H1/FAQ, and links work.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">Core</h3>
              <ul className="space-y-2">
                {[
                  { path: '/', label: 'Home (break room)' },
                  { path: '/rooms', label: 'Rooms index' },
                  { path: '/data', label: 'Data page' },
                  { path: '/about', label: 'About' },
                  { path: '/privacy', label: 'Privacy' },
                  { path: '/support', label: 'Support' },
                  { path: '/blog', label: 'Blog index' },
                ].map((r) => (
                  <li key={r.path} className="flex items-center justify-between gap-3">
                    <Link href={r.path} className="text-sm text-emerald-300 hover:text-emerald-200 font-mono hover:underline">{r.path}</Link>
                    <span className="text-xs text-gray-500">{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">Landing pages ({LANDING_PAGES.length})</h3>
              <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {LANDING_PAGES.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} className="text-sm text-gray-300 hover:text-emerald-300 font-mono hover:underline">/{p.slug}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">Break culture ({REGIONS.length})</h3>
              <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                <li>
                  <Link href="/regions" className="text-sm text-gray-300 hover:text-emerald-300 font-mono hover:underline">/regions</Link>
                </li>
                {REGIONS.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/regions/${r.slug}`} className="text-sm text-gray-300 hover:text-emerald-300 font-mono hover:underline">
                      /regions/{r.slug} <span className="text-gray-600">{r.flag}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">Rooms ({ROOMS.length})</h3>
              <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {ROOMS.map((r) => (
                  <li key={r.id}>
                    <Link href={`/rooms/${r.slug}`} className="text-sm text-gray-300 hover:text-emerald-300 font-mono hover:underline">/rooms/{r.slug}</Link>
                  </li>
                ))}
              </ul>
              <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mt-4 mb-2">Blog posts ({blogPosts.length})</h3>
              <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {blogPosts.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="text-sm text-gray-300 hover:text-emerald-300 font-mono hover:underline">/blog/{post.slug}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* APIs + files */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-1">2 · APIs &amp; machine-readable files</h2>
          <p className="text-sm text-gray-500 mb-4">Live smoke tests of every endpoint a crawler or AI might hit.</p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <ul className="space-y-3">
              {[
                { path: '/api/blogs', label: 'Blog JSON (full articles)', check: apiBlogs },
                { path: '/api/survey', label: 'Survey aggregate JSON (AI-citable data)', check: apiSurvey },
                { path: '/sitemap.xml', label: 'Sitemap', check: sitemap },
                { path: '/robots.txt', label: 'Robots', check: robots },
                { path: '/llms.txt', label: 'AI summary', check: llms },
                { path: '/llms-full.txt', label: 'AI full reference', check: llmsFull },
                { path: '/manifest.json', label: 'PWA manifest', check: manifest },
                { path: '/humans.txt', label: 'Humans', check: humans },
              ].map((row) => (
                <li key={row.path} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <a href={row.path} target="_blank" rel="noreferrer" className="text-sm text-emerald-300 hover:text-emerald-200 font-mono hover:underline">{row.path}</a>
                    <div className="text-xs text-gray-500 truncate">{row.label}</div>
                  </div>
                  <Status check={row.check} />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mt-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">Open Graph images (per-page)</h3>
            <ul className="space-y-1.5">
              {[
                { path: '/rooms/office-rooftop/opengraph-image', label: 'Room OG' },
                { path: '/blog/virtual-cigarette-online-free-no-download/opengraph-image', label: 'Blog OG' },
              ].map((r) => (
                <li key={r.path} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-300 font-mono truncate">{r.path}</span>
                  <span className="text-xs text-gray-500">{r.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Domains / subdomains */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-1">3 · Domains &amp; subdomains</h2>
          <p className="text-sm text-gray-500 mb-4">There are currently no subdomains — the whole site is one origin.</p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">Now</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="font-mono text-gray-300">puffbreak.app</span>
                  <span className="text-xs text-emerald-400">production origin</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="font-mono text-gray-300">*.vercel.app</span>
                  <span className="text-xs text-gray-500">preview deploys</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3">Done</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✅ <code className="text-emerald-300">puffbreak.app</code> owned &amp; added — <code className="text-gray-300">SITE_URL</code> in <code className="text-gray-300">lib/site.ts</code> already swapped to apex.</li>
                <li>✅ Contact email switched to <code className="text-emerald-300">hello@puffbreak.app</code> everywhere.</li>
                <li>✅ Canonical + llms.txt + sitemap URLs all on <code className="text-emerald-300">puffbreak.app</code>.</li>
                <li>⚠️ Remaining (external): set DNS + 301 redirect from <code className="text-gray-300">*.vercel.app</code> → <code className="text-gray-300">puffbreak.app</code> in Vercel/registrar, re-verify in Search Console.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Backend health */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-1">4 · Backend &amp; env health</h2>
          <p className="text-sm text-gray-500 mb-4">Whether the app is wired to real Firebase (values are masked).</p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <ul className="space-y-2">
              {envStatus.map(({ key, set }) => (
                <li key={key} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-mono text-gray-300">{key}</span>
                  {set ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">SET</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">MISSING / dummy</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{survey.available ? 'LIVE' : '—'}</div>
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">survey db</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{survey.total ?? 0}</div>
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">survey answers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{survey.breaksToday ?? 0}</div>
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">breaks today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{survey.breaksTotal ?? 0}</div>
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">breaks all-time</div>
              </div>
            </div>
          </div>
        </section>

        {/* Manual QA */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-1">5 · Manual QA checklist</h2>
          <p className="text-sm text-gray-500 mb-4">Tick each one by hand — especially the Craving Check (the new data feature).</p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {QA_ITEMS.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5 text-sm text-gray-300 leading-snug">
                  <input type="checkbox" className="mt-0.5 accent-emerald-400" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Deploy */}
        <section>
          <h2 className="text-lg font-bold text-white mb-1">6 · Before/after you push</h2>
          <p className="text-sm text-gray-500 mb-4">Manual, off-platform steps only you can do.</p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <ul className="space-y-2.5">
              {DEPLOY_ITEMS.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5 text-sm text-gray-300 leading-snug">
                  <input type="checkbox" className="mt-0.5 accent-amber-400 shrink-0" />
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="hover:text-emerald-300">{item.label}</a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
