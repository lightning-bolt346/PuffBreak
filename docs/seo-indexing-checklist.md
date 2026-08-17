# SEO / Google Indexing — Action Checklist

> Status (verified 2026-08-17): the site is technically healthy — robots.txt correct,
> sitemap.xml includes every page, no `noindex` anywhere, canonicals + titles correct,
> GSC verification meta tag is live (`vrbomKYzEEs6XZErAY-s0kDR1hYHzBbmS0iHK3WVxTg`),
> H1 + FAQ schema present. **The pages are indexable — the missing piece is Google
> authority, not on-page SEO.**

## Why "only puffbreak" ranks right now (normal)

1. **Brand-new site on a `.vercel.app` subdomain** — Google gives free Vercel preview
   domains a lower authority cap and ranks them slowly for non-branded terms.
2. **Trust/sandbox period** — new domains take ~3–6 months to rank for non-branded
   keywords, even with perfect content.
3. **The keywords ARE on your pages** (landing pages, rooms, regions, blog) — this is
   not a content problem. Google just hasn't decided to rank them yet.
4. Ranking for your exact brand ("puffbreak") is the **expected first stage** — it
   proves Google has indexed the site and connected it to the brand.

---

## DO NOW — this week (highest ROI)

### 1. Google Search Console — request indexing for every money page
You're already verified (meta tag confirmed live). Open GSC → **URL Inspection** →
paste each URL → **Request Indexing** (do ~10/day, Google throttles):

- `/`
- `/virtual-cigarette` · `/virtual-chai` · `/break-room`
- `/virtual-smoke-break` · `/smoke-break-simulator` · `/online-damta` · `/chai-break`
- `/work-break-timer` · `/micro-break` · `/asmr-break-room` · `/anonymous-break-room`
- `/quit-smoking-tool` · `/pomodoro-alternative` · `/remote-work-break`
- `/regions` + all 10 `/regions/*`
- all 8 `/rooms/*`
- `/data`
- top 5–10 `/blog/*` posts

Then **Sitemaps** → submit `https://puffbreak.app/sitemap.xml` (it's live).
Finally check **Pages** report for "Crawled – currently not indexed" / "Discovered –
currently not indexed" and re-request any listed.

### 2. Bing Webmaster Tools (drives Copilot search — huge for GEO)
- Add the site at https://www.bing.com/webmasters → submit the sitemap.
- Turn on **IndexNow** (Bing/Yandex/Naver index URLs in ~minutes): publish a
  `{your-key}.txt` file at the site root, then ping
  `https://api.indexnow.org/indexnow?url=<your-url>&key=<your-key>` for each key URL.
  (This is the single fastest way to get URLs crawled.)

### 3. Google Business Profile (if you haven't)
- Claim it for the brand. It adds a knowledge-panel-adjacent signal.

---

## MEDIUM-TERM — the biggest ranking lever you control

### 4. Buy a real domain (this caps everything else) ✅ DONE
- **DONE:** `puffbreak.app` is owned and is now the canonical `SITE_URL` (migrated in
  code, live once DNS + Vercel domain config are set).
- ✅ Add it in Vercel → **set the old `.vercel.app` URL to redirect (301) to the new
  domain** so you keep the "puffbreak" ranking you already have (steps below).
- ✅ Brand/entity now consistent: brand = "puffbreak", domain = `puffbreak.app`.

### 5. Off-platform trust signals (Google needs these to rank non-branded terms)
- Product Hunt launch · Hacker News "Show HN" · Reddit (r/SideProject, r/webdev,
  r/quitsmoking, r/productivity) · Indie Hackers · X/LinkedIn #buildinpublic.
- Directory listings (AlternativeTo etc.) — real backlinks.
- The Wikidata item (Q141105453) already reinforces the entity.

---

## HONEST TIMELINE

- **Indexed + brand keyword ranking:** already happening ✅
- **Non-branded ranking on `.vercel.app`:** expect **3–6+ months**, and it will be
  capped by the domain.
- **Non-branded ranking on a custom domain:** dramatically better once the domain is
  ~2–3 months old with backlinks + GSC indexing history.

The content, structure and technical SEO are done and correct. What's left is
**indexing requests (do now), a real domain (biggest lever), and off-platform
authority (accelerator).** None of these need more code.
