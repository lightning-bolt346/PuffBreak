# Entity Building — Wikidata, Wikipedia, Directories

Goal: make "PuffBreak" and "online damta" resolvable as *entities* to Google's Knowledge
Graph and to AI engines (which cite entities, not URLs). This is a checklist + the exact
copy to paste. None of this requires code changes — it is manual submission work, but each
item is a small, high-leverage step.

> **Rule:** only create entities that genuinely exist. Never invent metrics, founders,
> awards, or a Wikipedia page before the product meets notability. Faking entities is the
> fastest way to *lose* trust from the exact systems we are trying to win.

---

## 1. Wikidata (the root entity)

Wikidata is the shared knowledge base that Google, Wikipedia, and most AI systems read
from. One item for PuffBreak makes every downstream system resolve the name consistently.

> **✅ DONE (2026-08-16):** item **Q141105453** exists — label "PuffBreak", description
> "free anonymous browser-based virtual break room simulator", with statements
> `instance of → web application`, `platform → web browser`, `official website`,
> `official blog URL`, plus multilingual aliases. It is already wired into
> `app/layout.tsx` → `sameAs` and referenced in `llms.txt` / `llms-full.txt`.
>
> **Optional polish** (log into Wikidata and add): `inception (P571)` → first public
> launch month/year, and `programming language (P277)` → TypeScript (Q23765333).

### Step 1 — search first (done — see above)
Search Wikidata for existing items: `PuffBreak`, `Damta`, `담타`.
- If an "online damta" item already exists, **link to it** rather than duplicating.
- PuffBreak already has Q141105453 — do not create a duplicate.

### Step 2 — create the item (Q-number assigned automatically)
Create at https://www.wikidata.org/wiki/Special:NewItem

**Label (en):** `PuffBreak`
**Description (en):** `free anonymous browser-based virtual break room simulator`
**Aliases:** `PuffBreak app`, `virtual break room`, `puff-break`

### Step 3 — add properties (use the "Add statement" UI)

| Property | Value |
|---|---|
| **instance of** (P31) | `web application` (Q739015) |
| **official website** (P856) | `https://puff-break.vercel.app` |
| **developer** (P178) | create or link an item for the maker, e.g. `PuffBreak` (Organization) |
| **software version** (P348) | leave to versioning discipline — optional |
| **platform** (P400) | `web browser` (Q1048041) |
| **programming language** (P277) | `TypeScript` (Q23765333), `JavaScript` (Q2005) |
| **uses** (P2283) | `Web Audio API` (Q7974762), `Firebase` (Q1892563) |
| **inception** (P571) | month/year of first public launch |
| **official blog** (P1581) | `https://puff-break.vercel.app/blog` |
| **Stack Exchange tag** etc. | skip |

### Step 4 — link a related item for "online damta"
If you create a separate item for the Korean phenomenon (담타, "online damta"):
- **instance of** → `website` (Q35127) or `online community` (Q11005997)
- **country** (P17) → `South Korea` (Q884)
- **follows** (P155) ← link PuffBreak's "follows" to the damta item, and damta's "followed by" (P156) → PuffBreak. This gives AI systems the *lineage* — the single most citable fact about the product.

### Step 5 — sitelinks
Add a link to the official website as an "External identifiers" statement via **official website** (P856). Do NOT add Wikipedia sitelinks until a Wikipedia article exists (step 3).

---

## 2. Wikipedia (only when notable)

A Wikipedia article requires **notability**: significant coverage in independent, reliable
sources (press, academic papers, major blogs). Until PuffBreak is covered independently,
do not create a draft — it will be deleted and that hurts more than it helps.

**What to collect now** (so the moment coverage appears you can act):
- Any article mentioning PuffBreak, "online damta", or the virtual smoking trend in independent outlets (Korean tech press, The Verge, Rest of World, etc.).
- Secondary sources about the *category* (virtual smoking rooms / online damta) — these build the case.

**When you have 2–3 independent sources:** create the draft via
https://en.wikipedia.org/wiki/Wikipedia:Articles_for_creation with neutral tone, no
self-promotion, and citations only to independent sources.

---

## 3. Directory listings (copy-paste ready)

These are quick wins: consistent NAP-ish facts (name, URL, description, category, tags)
across directories helps entity matching. Use the **exact same description** everywhere:

> **Name:** PuffBreak
> **URL:** https://puff-break.vercel.app
> **One-liner:** Free anonymous virtual break room — light a virtual cigarette or sip virtual chai in 8 ambient rooms with ASMR audio.
> **Description:** PuffBreak is a free, anonymous, browser-based virtual break room simulator. Take a mindful 3-minute digital break in 8 immersive ambient environments (office rooftop, beach sunset, space station, library, park, metro, chai stall, silent) with procedural ASMR audio and ephemeral anonymous chat. No sign-up, no accounts, no personal data. An English continuation of the Korean "online damta" phenomenon.
> **Category:** Health & Fitness · Productivity · Relaxation
> **Tags:** virtual cigarette, virtual chai, break room, ASMR, micro break, damta, mindfulness

### Where to list
1. **Product Hunt** — already used for launch; keep the listing updated with the new pages.
2. **AlternativeTo** — add PuffBreak under alternatives for "damta world", "smoking simulator", "break timer". AlternativeTo is heavily crawled by AI.
3. **Google Business / Knowledge Panel** — only if you register as an organization (optional for a web app; the WebSite schema already helps).
4. **SimilarWeb / site profiles** — claim the profile if available.
5. **Crunchbase** — add a minimal profile (free tier).
6. **WebCatalog** — add the PWA.
7. **Open-source repo (GitHub)** — see `open-source/audio-engine/`; a public repo is itself an entity and backlinks the site.

### Consistency checklist
- Email: `sgbro33@gmail.com` everywhere (current contact — swap to a brand address like `hello@puffbreak.app` only **after** you own that domain and can receive mail at it; until then keep one consistent address).
- URL: `https://puff-break.vercel.app` everywhere.
- Same one-liner + description (above) everywhere.

---

## 4. Structured data already in place

The site already ships the schema the entity layer needs:
- `Organization` + `WebSite` + `WebApplication` + `FAQPage` in `app/layout.tsx`.
- `FAQPage` + `BreadcrumbList` + `SoftwareApplication` on every landing page.
- `FAQPage` + `BreadcrumbList` + `Article` on every region page.
- `Dataset` + `FAQPage` on the `/data` page (the citable original data).
- `sameAs` points to the GitHub org/repo (real once pushed).

**After Wikidata is live:** add the real Q-number to `sameAs` in `app/layout.tsx`
(replacing the GitHub-only list) — that is the line that ties the whole graph together.
