// Programmatic concept landing pages — the "intent layer" of PuffBreak's GEO/SEO.
// Each entry is a distinct, hand-written page (unique hook, intro, sections, FAQs)
// so the generated pages never read as templated slop. The layout provides the
// shared chrome; the data provides the substance.
//
// All pages are server-rendered with FAQPage + SoftwareApplication schema so AI
// engines (ChatGPT, Perplexity, Grok, Gemini, Bing Copilot) and Google can extract
// clean Q&A and facts.

import type { RoomId } from '@/lib/rooms';

export interface LandingLink {
  /** 'concept' → /slug · 'blog' → /blog/slug · 'region' → /regions/slug */
  kind: 'concept' | 'blog' | 'region';
  slug: string;
  label: string;
}

export interface LandingSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface LandingPage {
  slug: string;
  title: string;
  description: string;
  /** The one-line hook at the top of the page. */
  hook: string;
  /** Short intro paragraphs (unique per page). */
  intro: string[];
  sections: LandingSection[];
  /** Recommended room to deep-link into (via /?room=<id>). */
  roomId: RoomId;
  keywords: string[];
  faqs: { q: string; a: string }[];
  related: LandingLink[];
}

export const LANDING_PAGES: LandingPage[] = [
  // ─────────────────────────── VIRTUAL CIGARETTE ────────────────────────────
  {
    slug: 'virtual-cigarette',
    title: 'Virtual Cigarette — Free Online Smoking Simulator, No Download',
    description:
      'Try a hyper-realistic virtual cigarette in your browser — ignition animation, smoke physics, ASMR crackle. Free, anonymous, no download, no sign-up.',
    hook: 'A cigarette that burns, crackles and smokes — and costs you nothing but three minutes.',
    intro: [
      'A virtual cigarette is exactly what it sounds like: a realistic on-screen cigarette you can light, drag on, ash and watch burn down — with no tobacco, no tar, and no second-hand smoke. It captures the ritual of smoking (the lighting, the pause, the exhale) and leaves behind the chemistry.',
      'People use virtual cigarettes for three very different reasons: to quit (replacing the ritual during a craving), to relax (the breathing rhythm is genuinely calming), and to feel something during a boring meeting. PuffBreak\'s version is built from a custom particle-physics engine, so the smoke behaves like real smoke — right down to the ember glow.',
    ],
    sections: [
      {
        heading: 'What makes a virtual cigarette feel real?',
        body: 'Reality is in the details, not the pixels. PuffBreak animates a three-phase ignition (matchbox opens, match strikes, flame catches), a cherry that glows when you drag, an ash column that grows and can be tapped off, and smoke that curls with real physics. When you release the filter, the smoke ring drifts — because the physics engine computes it, not a pre-rendered loop.',
        bullets: ['Three cigarette gauges: Slim, Standard, Wide', 'Zippo-style lighter or full matchstick animation', 'ASMR paper-crackle audio tuned to real combustion frequencies', 'Shake your phone to tap the ash'],
      },
      {
        heading: 'Why do people replace real cigarettes with virtual ones?',
        body: 'Nicotine cravings peak for about three minutes — which is why PuffBreak sessions are built to last exactly that long. By performing the ritual without the nicotine, many people find the craving passes while the habit stays satisfied. It is not a medical device; it is a ritual substitute, and thousands of breaks later it clearly works as one.',
      },
      {
        heading: 'Is it safe?',
        body: 'Completely. There is no nicotine, no combustion and no smoke — the "smoke" is rendered particles on your screen. Nothing is inhaled, nothing is lit, and nothing leaves your device. It is about as dangerous as a screensaver.',
      },
    ],
    roomId: 'office',
    keywords: ['virtual cigarette', 'online cigarette simulator', 'digital cigarette', 'fake smoking', 'virtual smoking online free', 'cigarette simulator no download'],
    faqs: [
      {
        q: 'Is there a free virtual cigarette online?',
        a: 'Yes — PuffBreak\'s virtual cigarette is completely free, runs in your browser, and needs no download or sign-up. Just open the site and tap the tip to light it.',
      },
      {
        q: 'Does a virtual cigarette contain nicotine?',
        a: 'No. It is a simulation — a rendered cigarette with realistic smoke physics. There is no nicotine, no tar and no health risk.',
      },
      {
        q: 'Can a virtual cigarette help with quitting?',
        a: 'Many people use it as a ritual substitute during cravings. The 3-minute session matches the peak craving window. It is not a medical device, but it is a proven ritual swap for many.',
      },
      {
        q: 'Does it work on mobile?',
        a: 'Yes — fully responsive, installable as a PWA, and it supports shake-to-ash on phones.',
      },
    ],
    related: [
      { kind: 'concept', slug: 'smoke-break-simulator', label: 'Smoke break simulator' },
      { kind: 'concept', slug: 'quit-smoking-tool', label: 'Craving management' },
      { kind: 'blog', slug: 'virtual-cigarette-online-free-no-download', label: 'Guide: virtual cigarettes' },
      { kind: 'region', slug: 'damta', label: 'The online damta' },
    ],
  },

  // ─────────────────────────── VIRTUAL CHAI ─────────────────────────────────
  {
    slug: 'virtual-chai',
    title: 'Virtual Chai — Online Chai Break, Steam, Sip & ASMR',
    description:
      'Sip a virtual cup of chai with rising steam and ASMR audio — the tapri ritual, digitized. Free, anonymous, no sign-up.',
    hook: 'A cup of chai that steams, sips and resets your brain — without a single tea leaf.',
    intro: [
      'The chai break is not about the tea. It is about the pause — the steam, the warmth, the five minutes where the world slows down. A virtual chai keeps every part of that ritual except the cup: you hold to sip, the liquid level drops, the steam rises, and a warm ASMR ambience holds the moment.',
      'For anyone who grew up with the tapri or the tea round, the virtual chai is a small act of memory: the same ritual, available anywhere — a desk in Bengaluru, a flat in London, a train in Mumbai. For everyone else, it is simply the most calming three minutes the browser has to offer.',
    ],
    sections: [
      {
        heading: 'How does a virtual chai work?',
        body: 'Hold to sip — the ceramic cup fills with steam, the liquid level falls in real time, and the drinking sound plays. Release and the steam settles. The Chai Stall room adds the full scene: a warm bazaar ambience, distant chatter, and a floating community of strangers taking their own chai break beside you.',
        bullets: ['Hold-to-sip mechanic with live liquid physics', 'Procedural steam particles on canvas', 'Bazaar/chatter ambience in the Chai Stall room', 'Perfect pairing with the anonymous chat'],
      },
      {
        heading: 'The chai break is a real productivity tool',
        body: 'India runs on chai breaks, and science agrees with the instinct: a brief, warm, social pause restores attention better than pushing through. The virtual chai turns that insight into a three-minute ritual anyone can take — no chai-wala required.',
      },
      {
        heading: 'Chai, or tea, or coffee — you choose the word',
        body: 'PuffBreak localizes to 20+ languages. Open it with ?lang=hi and the greeting, the chai hint and the daily affirmation arrive in Hindi; ?lang=bn for Bengali, ?lang=tr for Turkish çay. Same ritual, your culture\'s word.',
      },
    ],
    roomId: 'chai',
    keywords: ['virtual chai', 'online chai break', 'virtual tea break', 'chai simulator', 'virtual chai online free', 'chai break app'],
    faqs: [
      {
        q: 'Is there a free virtual chai online?',
        a: 'Yes — PuffBreak\'s virtual chai is free, runs in the browser and needs no sign-up. Hold to sip, watch the steam, and take a three-minute chai break.',
      },
      {
        q: 'Is virtual chai a real drink?',
        a: 'No — it is a simulation. But the ritual (the pause, the warmth, the steam) is real, and that is what the chai break is actually for.',
      },
      {
        q: 'Which room is best for a chai break?',
        a: 'The Chai Stall room — it is purpose-built with steam, bazaar ambience and the community chat. The Library Corner is a close second for a quieter cup.',
      },
      {
        q: 'Does it work in Hindi?',
        a: 'Yes. Open PuffBreak with ?lang=hi and the app\'s greetings and affirmations appear in Hindi.',
      },
    ],
    related: [
      { kind: 'concept', slug: 'chai-break', label: 'The chai break' },
      { kind: 'region', slug: 'chai-tapri', label: 'The chai tapri' },
      { kind: 'blog', slug: 'chai-break-culture-explained', label: 'Chai break culture' },
    ],
  },

  // ─────────────────────────── BREAK ROOM ───────────────────────────────────
  {
    slug: 'break-room',
    title: 'Virtual Break Room — Free Online Break Room with ASMR Ambience',
    description:
      'Step into a free online break room with 8 immersive environments, ASMR audio and anonymous company. A 3-minute reset, no sign-up.',
    hook: 'The break room the office never built — rooftop, beach, space station and more.',
    intro: [
      'The physical break room is where work actually happens: the conversations, the gossip, the decision that the meeting room never reached. But most of us lost it — remote workers to their kitchen tables, office workers to glass-walled, smoke-free floors. The virtual break room puts it back.',
      'PuffBreak is a free online break room with eight environments, each with its own procedural ASMR soundscape: a late-night office rooftop, a beach at golden hour, a space station, a rain-soaked library, a park bench, a metro platform, a chai stall and a perfectly silent room. You take your three minutes; strangers take theirs beside you in anonymous chat.',
    ],
    sections: [
      {
        heading: 'Why does a virtual break room work?',
        body: 'A break is not a break if your brain is still at the desk. The virtual break room creates a hard boundary — a different room, different sounds, different company — so your attention genuinely resets. That is the difference between staring at a screen for 3 minutes and actually resting for 3 minutes.',
        bullets: ['8 immersive environments with unique audio', 'Procedural ASMR — pink noise, waves, rain, drones', 'Anonymous live chat, messages vanish after 22s', 'Zen Mode hides everything but the moment'],
      },
      {
        heading: 'The social part matters',
        body: 'The old break room worked because other people were in it. PuffBreak keeps that: each room shows who else is taking a break right now, and the floating chat is where strangers trade a line or two before going back to work. You are not alone in the break; you are just anonymous in it.',
      },
      {
        heading: 'For remote, office and hybrid workers',
        body: 'Remote workers get the social reset they lost; office workers get the break room their building took away; hybrid workers get the same room everywhere. It takes three minutes and it is free — try the rooftop at night.',
      },
    ],
    roomId: 'office',
    keywords: ['virtual break room', 'online break room', 'digital break room', 'break room online free', 'virtual smoking room', 'online break room for work'],
    faqs: [
      {
        q: 'What is a virtual break room?',
        a: 'It is an online space where you take a short, intentional break — with ambient audio, an immersive environment and (optionally) anonymous company. PuffBreak is a free one with 8 rooms.',
      },
      {
        q: 'Is the online break room free?',
        a: 'Yes — 100% free, no ads, no subscriptions, no sign-up. Open the site and you are already in the break room.',
      },
      {
        q: 'Is it anonymous?',
        a: 'Completely. There are no accounts. Chat nicknames are random per session and messages disappear after 22 seconds. No data is tied to you.',
      },
      {
        q: 'Which break room should I start with?',
        a: 'Office Rooftop at night is the classic. Beach Sunset is the most relaxing, Space Station the most unusual, Silent Room the most honest.',
      },
    ],
    related: [
      { kind: 'concept', slug: 'asmr-break-room', label: 'ASMR break room' },
      { kind: 'concept', slug: 'anonymous-break-room', label: 'Anonymous break room' },
      { kind: 'blog', slug: 'digital-break-room-vs-damta-world', label: 'Digital break room vs. damta' },
    ],
  },

  // ─────────────────────────── VIRTUAL SMOKE BREAK ──────────────────────────
  {
    slug: 'virtual-smoke-break',
    title: 'Virtual Smoke Break — Take a 3-Minute Digital Smoke Break Online',
    description:
      'Take a free virtual smoke break — light a digital cigarette in an immersive room, breathe, and reset in 3 minutes. Anonymous, no sign-up.',
    hook: 'The smoke break, minus the smoke. Same ritual, same reset, no health cost.',
    intro: [
      'The smoke break has always been about the break more than the smoke: stepping outside, breathing, and returning with a clear head. A virtual smoke break gives you exactly that structure — a lit cigarette, a rhythm of inhale and exhale, three minutes of deliberate pause — without the nicotine or the cold.',
      'It is a genuinely different thing from "taking a break at your desk". The ritual gives the brain a shape: light, breathe, finish, return. That shape is what makes a smoke break feel like a reset, and it is precisely what PuffBreak digitizes.',
    ],
    sections: [
      {
        heading: 'The anatomy of a good smoke break',
        body: 'The best smoke breaks are short, bounded and sensory: you see the cigarette burn, you feel the rhythm, you know when it ends. PuffBreak keeps all three — a 3-minute burn, tactile interactions (light, drag, ash), and a clear finish that signals your brain the break is over.',
        bullets: ['3-minute timed session (peak craving window)', 'Realistic ignition, drag and ash physics', 'ASMR crackle and ambient room audio', 'Optional anonymous chat for the social bit'],
      },
      {
        heading: 'When to take a virtual smoke break',
        body: 'Before a hard meeting, after finishing a task, at the 2pm slump, or when a craving hits. The ritual works because it is deliberate — a bounded three minutes that separates "before" from "after".',
      },
      {
        heading: 'The quitting-smoking angle',
        body: 'If you are cutting down or quitting, the virtual smoke break is the classic swap: keep the ritual, remove the nicotine. The craving passes inside the session, and the habit gets satisfied without the cigarette.',
      },
    ],
    roomId: 'office',
    keywords: ['virtual smoke break', 'online smoke break', 'digital smoke break', 'smoke break online free', 'virtual smoking break', '3 minute break'],
    faqs: [
      {
        q: 'How do I take a virtual smoke break?',
        a: 'Open PuffBreak, pick a room, tap the tip of the virtual cigarette to light it, and take your three minutes. It is free and needs no account.',
      },
      {
        q: 'Is a virtual smoke break good for quitting?',
        a: 'Many people use it as a ritual substitute — the craving passes during the 3-minute session while the habit is satisfied. It is not a medical tool, but it is a proven swap for many.',
      },
      {
        q: 'Is it really anonymous?',
        a: 'Yes. No accounts, random chat names, no data collected. The break is between you and your screen.',
      },
    ],
    related: [
      { kind: 'concept', slug: 'virtual-cigarette', label: 'The virtual cigarette' },
      { kind: 'concept', slug: 'quit-smoking-tool', label: 'Craving management' },
      { kind: 'blog', slug: 'how-long-does-nicotine-craving-last', label: 'How long cravings last' },
    ],
  },

  // ─────────────────────────── SMOKE BREAK SIMULATOR ────────────────────────
  {
    slug: 'smoke-break-simulator',
    title: 'Smoke Break Simulator — Realistic Virtual Smoking, Free in Browser',
    description:
      'A realistic smoke break simulator with physics-driven smoke, ASMR crackle and 8 ambient rooms. Free, no download, works on any device.',
    hook: 'The most realistic cigarette simulator you will ever put down.',
    intro: [
      'A smoke break simulator tries to capture the full sensory loop of smoking — the lighting ritual, the drag, the ember, the ash, the smoke — as a digital experience. Most web versions are GIFs with a button. PuffBreak is a physics simulation: the smoke is computed, the ember responds to your drag, the ash grows and falls with wind.',
      'The result is a simulator that holds up to scrutiny because the details hold up: the matchbox opens before the match strikes, the crackle pitch shifts as the paper burns closer to the filter, the ash falls when the wind in your chosen room decides it should.',
    ],
    sections: [
      {
        heading: 'What is simulated, precisely',
        body: 'Ignition (lighter or matchstick, multi-phase), drag physics (cherry glow, burn speed), smoke emission (particle-based, wind-aware), ash growth and tapping, and a 3-minute burn clock that reacts to how hard you puff. Every system is live — nothing is scripted.',
        bullets: ['Canvas particle physics for smoke and steam', 'Wind per room affects smoke and ash', 'Audio synthesis for crackle, no audio files', 'Puffing speeds the burn, idling slows it'],
      },
      {
        heading: 'Simulation with a purpose',
        body: 'A simulator earns its keep when it changes behavior. People use PuffBreak to rehearse quitting, to satisfy a craving without nicotine, or to decompress — and the realism is what makes the swap stick. It is why the crackle has to be right.',
      },
      {
        heading: 'Where it runs',
        body: 'Any modern browser, desktop or mobile, as a PWA. No install, no download, no sign-up. If it has a screen, it has a smoking shelter.',
      },
    ],
    roomId: 'beach',
    keywords: ['smoke break simulator', 'smoking simulator', 'cigarette simulator', 'virtual smoking simulator', 'fake smoke app', 'smoke simulator online'],
    faqs: [
      {
        q: 'What is a smoke break simulator?',
        a: 'It is a digital simulation of the smoking ritual — lighting, dragging, ash, smoke — designed to be used as a short break. PuffBreak is a free, physics-based one in your browser.',
      },
      {
        q: 'Is the simulator realistic?',
        a: 'Unusually so — smoke is computed with particle physics, the ember responds to your drag, and the crackle audio is synthesized, not recorded. It is as close as a browser gets.',
      },
      {
        q: 'Do I need to download anything?',
        a: 'No. It runs in the browser and can be installed as a PWA if you want an app icon.',
      },
    ],
    related: [
      { kind: 'concept', slug: 'virtual-cigarette', label: 'Virtual cigarette' },
      { kind: 'concept', slug: 'asmr-break-room', label: 'ASMR break room' },
      { kind: 'blog', slug: 'virtual-smoking-vs-reality', label: 'Virtual smoking vs. reality' },
    ],
  },

  // ─────────────────────────── ONLINE DAMTA ─────────────────────────────────
  {
    slug: 'online-damta',
    title: 'Online Damta — English Alternative to the Korean Virtual Smoking Room',
    description:
      'Damta (담타) went viral in Korea. PuffBreak is the English-language online damta — anonymous virtual smoke breaks with 8 rooms and a global community.',
    hook: 'The Korean smoking room went viral. Here is the English room.',
    intro: [
      'In 2023, a Korean website called 담타 (damta) took the internet by surprise: an anonymous page where a small cigarette burned down while strangers "smoked" it together, typed a few lines, and left. It went viral because it turned the smoke break into a shared, anonymous, zero-risk ritual.',
      'PuffBreak is the English-language continuation of that idea — the same anonymous browser ritual, rebuilt with 8 immersive rooms, real ASMR audio, virtual chai, and a global community that never sleeps. If you loved the idea of damta but wanted it in English, this is that room.',
    ],
    sections: [
      {
        heading: 'What made damta special',
        body: 'Three things: anonymity (no accounts, no profiles, no pressure), ritual (the burning cigarette gave the break a shape and an end), and company (strangers taking the same three minutes, side by side in a chat that forgets you). PuffBreak keeps all three and adds sound and scenery.',
        bullets: ['Anonymous — no accounts, random names', 'Bounded ritual — 3-minute burn', 'Shared room — live presence + ephemeral chat'],
      },
      {
        heading: 'What PuffBreak adds',
        body: 'Where damta was a single room, PuffBreak is eight — rooftop, beach, space, library, park, metro, chai stall, silent. Where damta was silent, PuffBreak synthesizes ambience for each room. And where damta was Korean-only, PuffBreak localizes to 20+ languages, with the ?lang=ko variant as a nod to the original.',
      },
      {
        heading: 'Same ritual, bigger room',
        body: 'The core loop is identical to the original: open, light, breathe, finish, leave. You can be in and out in three minutes with nobody the wiser — or stay and talk. The room holds both.',
      },
    ],
    roomId: 'office',
    keywords: ['online damta', 'damta english', 'damta world alternative', '담타', '온라인 담타', 'virtual smoking room english', 'damta world english version'],
    faqs: [
      {
        q: 'What is damta?',
        a: 'Damta (담타) is a viral Korean online smoking room — an anonymous website where strangers take virtual cigarette breaks together. It became a cultural phenomenon in 2023.',
      },
      {
        q: 'Is there an English version of damta?',
        a: 'Yes — PuffBreak is the English-language alternative. Same anonymous ritual, rebuilt with 8 ambient rooms, ASMR audio, virtual chai and a global community.',
      },
      {
        q: 'Does PuffBreak support Korean?',
        a: 'Yes — open it with ?lang=ko and the app\'s greetings and affirmations appear in Korean, as a nod to the original damta.',
      },
      {
        q: 'Is it really anonymous?',
        a: 'Yes. No accounts, no sign-up, no data collected. Chat names are random and messages disappear.',
      },
    ],
    related: [
      { kind: 'region', slug: 'damta', label: 'The story of damta' },
      { kind: 'blog', slug: 'damta-world-english-alternative', label: 'Damta world: English alternative' },
      { kind: 'blog', slug: 'digital-break-room-vs-damta-world', label: 'Digital break room vs. damta' },
    ],
  },

  // ─────────────────────────── CHAI BREAK ───────────────────────────────────
  {
    slug: 'chai-break',
    title: 'Chai Break — The 3-Minute Ritual That Reboots Your Brain',
    description:
      'The chai break is a productivity ritual, not a luxury. Take a free virtual chai break with steam, sound and company — in your browser.',
    hook: 'The most productive three minutes in Indian working life, now available everywhere.',
    intro: [
      'The chai break is not procrastination; it is maintenance. India\'s most productive workplaces run on it — the pause that lets the mind settle, the conversation that surfaces what the meeting missed, the warmth that resets the nervous system. It is a ritual with a job to do.',
      'PuffBreak turns that ritual into a product: a virtual cup of chai that steams and sips, an ambient room around it, and a floating chat of strangers doing the same thing at the same time. Three minutes, and the brain is back online.',
    ],
    sections: [
      {
        heading: 'Why the chai break is good for work',
        body: 'Attention is a depleting resource, and the best recovery is a brief, warm, low-demand pause. A chai break delivers exactly that: a warm sensory cue, a few minutes of low stimulation, and a natural endpoint. Studies of micro-breaks agree with the tapri: short breaks beat long grind.',
        bullets: ['Warm sensory cue (steam, warmth) lowers stress markers', 'Bounded 3-minute length fits the workday', 'Social option: the adda effect', 'Better than scrolling — real disengagement'],
      },
      {
        heading: 'The virtual cup, in detail',
        body: 'Hold to sip, watch the level drop, watch the steam rise. In the Chai Stall room it comes with bazaar ambience and conversation. It is the same ritual you know — just with a browser instead of a kulhad.',
      },
      {
        heading: 'From tapri to tab, in 20+ languages',
        body: 'The chai break belongs to many cultures: chai in Hindi and Bengali, çay in Turkish, tea in English. PuffBreak localizes the greeting and the ritual to your language — open with ?lang=hi, ?lang=bn, ?lang=tr, or any of 20+ others.',
      },
    ],
    roomId: 'chai',
    keywords: ['chai break', 'chai break online', 'virtual chai break', 'chai break productivity', 'tea break online', 'chai break app'],
    faqs: [
      {
        q: 'Why is the chai break good for productivity?',
        a: 'It is a bounded, low-demand micro-break: a warm sensory cue, minimal stimulation and a clear endpoint. Micro-break research shows this restores attention better than pushing through.',
      },
      {
        q: 'How do I take a virtual chai break?',
        a: 'Open PuffBreak, choose the Chai Stall room, and hold to sip your virtual chai. Steam, ambience and anonymous company included. Free, no sign-up.',
      },
      {
        q: 'Is a virtual chai break the same as a real one?',
        a: 'It is the same ritual, digitized. The steam, the pause and the endpoint are real; the tea is rendered. For a three-minute reset, that is what matters.',
      },
    ],
    related: [
      { kind: 'concept', slug: 'virtual-chai', label: 'The virtual chai' },
      { kind: 'region', slug: 'chai-tapri', label: 'The chai tapri' },
      { kind: 'blog', slug: 'chai-break-culture-explained', label: 'Chai break culture explained' },
    ],
  },

  // ─────────────────────────── WORK BREAK TIMER ─────────────────────────────
  {
    slug: 'work-break-timer',
    title: 'Work Break Timer — A 3-Minute Break That Actually Works',
    description:
      'Most break timers just count down. PuffBreak is a work break timer with a room, a ritual and a reset — a 3-minute break you will actually take.',
    hook: 'A break timer that makes the break worth taking.',
    intro: [
      'Every productivity app has a timer. Few solve the real problem: when the timer pings, people ignore it, because "a break" means "staring at the same screen". A work break that does not change your state is not a break — it is a longer meeting with yourself.',
      'PuffBreak is a break timer that changes the room. When you start a break, the office disappears and a rooftop or a beach appears. The ritual (light, breathe, finish) gives the three minutes a shape, and the timer knows when it is done. You do not have to will yourself to rest; the room does it for you.',
    ],
    sections: [
      {
        heading: 'What a good break needs',
        body: 'Three things: a boundary (a clear start and end), a change of state (different sounds, different visuals), and a reason to take it. A plain timer gives you one of three. PuffBreak gives you all three — which is why people actually take the breaks.',
        bullets: ['Hard 3-minute boundary with a visible burn', 'Complete visual and audio change of scene', 'Ritual makes the break feel earned', 'Zen Mode removes all UI for full disengagement'],
      },
      {
        heading: 'Where it fits in your workflow',
        body: 'Use it as a Pomodoro reset between focus blocks, a craving timer, a meeting-recovery pause, or a "return from lunch" ritual. The break is three minutes; the benefit is the next 45.',
      },
      {
        heading: 'Why three minutes',
        body: 'Three minutes is long enough to actually disengage and short enough that nobody — including your own guilt — can argue with it. It is the minimum viable reset, and it is exactly the length of a nicotine craving, which is why it is also the natural craving timer.',
      },
    ],
    roomId: 'park',
    keywords: ['work break timer', 'break timer online', '3 minute break timer', 'break reminder app', 'micro break timer', 'pomodoro break'],
    faqs: [
      {
        q: 'How is this different from a regular break timer?',
        a: 'A regular timer counts down; PuffBreak changes your state. It gives you a room, a ritual and a bounded 3-minute reset — so you actually take the break and actually come back refreshed.',
      },
      {
        q: 'Is the break timer free?',
        a: 'Yes — completely free, no sign-up, runs in your browser.',
      },
      {
        q: 'Can I use it with Pomodoro?',
        a: 'Yes. Use it as the short break between focus blocks. Three minutes, a room, a reset — exactly what the Pomodoro method prescribes.',
      },
    ],
    related: [
      { kind: 'concept', slug: 'pomodoro-alternative', label: 'Pomodoro alternative' },
      { kind: 'concept', slug: 'micro-break', label: 'The science of micro-breaks' },
      { kind: 'blog', slug: 'the-science-of-micro-breaks', label: 'Micro-break science' },
    ],
  },

  // ─────────────────────────── MICRO BREAK ──────────────────────────────────
  {
    slug: 'micro-break',
    title: 'Micro Break — The 3-Minute Reset, Backed by Research',
    description:
      'Micro breaks restore attention, mood and performance — if they actually disengage you. Take a free 3-minute micro break with a room and a ritual.',
    hook: 'Three minutes is enough to reset a brain. The trick is making the three minutes count.',
    intro: [
      'Micro-break research is consistent: short, frequent breaks reduce fatigue, restore attention and improve performance. But there is a catch buried in the data — the break has to actually disengage you. A "break" spent scrolling your feed is not a micro break; it is more of the same stimulation.',
      'PuffBreak is a micro break you cannot fake. The office disappears, a different room appears, and a 3-minute ritual runs its course. By the time the cigarette burns down, your attention is genuinely back.',
    ],
    sections: [
      {
        heading: 'What the research actually says',
        body: 'Studies on micro breaks (2–5 minutes) find consistent benefits for attention, energy and mood — with the effect strongest when the break involves a change of scene and a low-demand activity. Staring at the same screen fails; stepping into a different sensory environment works.',
        bullets: ['Reduces mental fatigue across the workday', 'Restores performance on sustained-attention tasks', 'Change of scene is the active ingredient', 'Ritual gives the brain a clear start and end'],
      },
      {
        heading: 'The anti-scroll break',
        body: 'The failure mode of most "breaks" is the phone. A micro break should be low-stimulation — which is why PuffBreak\'s rooms are ambient rather than loud. No feed, no notifications, no news: three minutes of deliberate nothing.',
      },
      {
        heading: 'Build it into the day',
        body: 'The evidence favors frequent short breaks over fewer long ones. Two or three 3-minute PuffBreak sessions a day outperforms one 15-minute break for most desk work — and they fit between meetings instead of requiring one to end.',
      },
    ],
    roomId: 'library',
    keywords: ['micro break', '3 minute break', 'microbreak science', 'short breaks productivity', 'mini break app', 'micro break at work'],
    faqs: [
      {
        q: 'What is a micro break?',
        a: 'A short break of 2–5 minutes designed to restore attention and reduce fatigue. Research shows they work — provided the break actually disengages you from the task and the screen.',
      },
      {
        q: 'How long should a micro break be?',
        a: 'Two to five minutes. PuffBreak uses three — long enough to reset, short enough to fit anywhere and to match a nicotine craving\'s peak.',
      },
      {
        q: 'Why is PuffBreak better than scrolling?',
        a: 'Scrolling keeps your brain stimulated. PuffBreak is deliberately low-stimulation — an ambient room, a ritual, a clear end. That is the difference between a pause and a reset.',
      },
    ],
    related: [
      { kind: 'concept', slug: 'work-break-timer', label: 'Work break timer' },
      { kind: 'blog', slug: 'the-science-of-micro-breaks', label: 'The science of micro breaks' },
      { kind: 'blog', slug: 'art-of-the-five-minute-break', label: 'The art of the 5-minute break' },
    ],
  },

  // ─────────────────────────── ASMR BREAK ROOM ──────────────────────────────
  {
    slug: 'asmr-break-room',
    title: 'ASMR Break Room — Procedural Ambient Audio for Deep Reset',
    description:
      'A free ASMR break room with procedural ambient audio — waves, rain, drones, crackle — synthesized live in your browser. No audio files, no sign-up.',
    hook: 'The break room with a soundscape that is actually alive.',
    intro: [
      'ASMR is the internet\'s favorite calm, and a break room is its natural home: a place where the sound of waves or rain does the resetting while you do the breathing. PuffBreak\'s ASMR is procedural — synthesized live from pink noise, oscillators and filters rather than played from a file — so it never loops, never repeats, and never sounds like a recording.',
      'Each of the 8 rooms has its own synthesized soundscape: ocean waves on the beach, rain on the library window, a sci-fi drone in space, café chatter at the chai stall, the AC hum on the office rooftop. The sound reacts to your session, blending crackle and ambience as the break progresses.',
    ],
    sections: [
      {
        heading: 'What "procedural" means for your ears',
        body: 'A recorded loop repeats and your brain notices. Procedural audio is generated in real time — the waves are always slightly different, the rain has no seam. It is the difference between a photo of a beach and being on the beach.',
        bullets: ['Pink noise + filtered oscillators, zero audio files', 'Per-room synthesis recipes (waves, rain, drone, chatter)', 'Layers blend with your session state', 'Cigarette crackle and steam audio mixed in live'],
      },
      {
        heading: 'The science of ambient sound',
        body: 'Low-variability natural soundscapes lower arousal and support attention recovery better than silence or music. Rain, waves and drone share a broadband, low-frequency profile that the brain reads as "safe and undemanding" — the ideal backdrop for a reset.',
      },
      {
        heading: 'Choose your sound',
        body: 'Need calm? Beach Sunset (waves). Need focus? Library Corner (rain). Need escape? Space Station (drone). Need nothing? Silent Room (pure quiet). Your room, your reset.',
      },
    ],
    roomId: 'beach',
    keywords: ['asmr break room', 'asmr smoke break', 'ambient break room', 'rain sounds for breaks', 'ocean waves asmr', 'relaxing ambient sounds online'],
    faqs: [
      {
        q: 'What is an ASMR break room?',
        a: 'A virtual space with calming, ambient sound designed for short breaks. PuffBreak synthesizes its audio live — waves, rain, drones — so nothing ever loops.',
      },
      {
        q: 'Does PuffBreak use audio files?',
        a: 'No. The ambience is procedural — generated in your browser with the Web Audio API. That is why it never repeats and starts instantly with zero download.',
      },
      {
        q: 'Can I use it for sleep or focus?',
        a: 'Yes. The Beach and Library rooms are favorites for focus; the Space drone for deep calm. Session length is up to you (the break itself is 3 minutes).',
      },
    ],
    related: [
      { kind: 'concept', slug: 'break-room', label: 'The virtual break room' },
      { kind: 'blog', slug: 'asmr-virtual-smoking-stress-relief', label: 'ASMR + virtual smoking' },
      { kind: 'concept', slug: 'smoke-break-simulator', label: 'Smoke break simulator' },
    ],
  },

  // ─────────────────────────── ANONYMOUS BREAK ROOM ─────────────────────────
  {
    slug: 'anonymous-break-room',
    title: 'Anonymous Break Room — No Accounts, No Pressure, Just a Break',
    description:
      'An anonymous online break room: no sign-up, no profile, no data. Take a 3-minute break with strangers who will never know your name.',
    hook: 'The break room where nobody has to be anyone.',
    intro: [
      'The best part of the old smoke break was who you were in it: nobody. No title, no reputation, no small talk about your weekend. Just people, a pause, and the quiet solidarity of the moment. The anonymous break room is that feeling, digitized.',
      'PuffBreak has no accounts, no profiles and no sign-up. Your chat name is random, your presence is anonymous, and your messages vanish after 22 seconds. It is the social break for people who do not want the social part to cost anything.',
    ],
    sections: [
      {
        heading: 'Why anonymity makes the break better',
        body: 'Anonymity removes performance. Without a reputation to protect, you can actually relax — which is the entire point of a break. The room shows you are not alone, the chat lets you connect or stay quiet, and none of it follows you out the door.',
        bullets: ['Zero sign-up, zero accounts', 'Random anonymous chat names per session', 'Messages self-delete after 22 seconds', 'Presence counts so you know you are not alone'],
      },
      {
        heading: 'Privacy, by design',
        body: 'No personal data is collected. Preferences live in your browser\'s localStorage; the chat is ephemeral; the analytics are aggregate. What you do in the break room stays in the break room — literally.',
      },
      {
        heading: 'For people who hate social apps',
        body: 'If "community" usually means "another profile to maintain", PuffBreak is the antidote. Show up, take your three minutes, leave. The room remembers you without knowing you.',
      },
    ],
    roomId: 'metro',
    keywords: ['anonymous break room', 'anonymous chat break', 'no sign up break', 'anonymous smoking room', 'private break room online', 'no account break app'],
    faqs: [
      {
        q: 'Is the break room really anonymous?',
        a: 'Yes. No accounts, no sign-up, no personal data. Chat names are random per session and messages disappear after 22 seconds.',
      },
      {
        q: 'Do I have to talk to people?',
        a: 'No. The chat is optional. You can take your entire break in silence — the presence counter just tells you others are there too.',
      },
      {
        q: 'What data does PuffBreak collect?',
        a: 'None that identifies you. Preferences are in your browser\'s localStorage and never leave the device; analytics are aggregate and anonymous.',
      },
    ],
    related: [
      { kind: 'concept', slug: 'break-room', label: 'The virtual break room' },
      { kind: 'blog', slug: 'etiquette-in-digital-break-rooms', label: 'Digital break room etiquette' },
      { kind: 'region', slug: 'damta', label: 'The damta phenomenon' },
    ],
  },

  // ─────────────────────────── QUIT SMOKING TOOL ────────────────────────────
  {
    slug: 'quit-smoking-tool',
    title: 'Quit Smoking Tool — a Ritual Substitute That Covers the Craving',
    description:
      'A free, browser-based quit smoking aid: perform the smoking ritual without the nicotine for the 3 minutes a craving lasts. Anonymous, no sign-up.',
    hook: 'You cannot stop a craving by arguing with it. You can cover it with a ritual.',
    intro: [
      'Quitting smoking is not one decision; it is a thousand small ones, most of them made in the three minutes a craving lasts. In that window, the body wants the ritual as much as the nicotine — the hand, the breath, the pause. PuffBreak is built for exactly that window: a ritual substitute that lasts as long as the craving and satisfies the habit without the drug.',
      'It is not a medical device and not a substitute for professional help. It is a swap — the same move countless people have used: when the craving hits, perform the ritual, let the three minutes pass, and notice that the craving passed with it.',
    ],
    sections: [
      {
        heading: 'The 3-minute craving window',
        body: 'Nicotine cravings typically peak within minutes and pass within about three. PuffBreak sessions are timed to that exact window — long enough to cover the peak, short enough to fit the moment. When the craving arrives, the ritual is already running.',
        bullets: ['Sessions match the peak craving duration', 'Full smoking ritual: light, drag, ash, finish', 'No nicotine — the swap is the point', 'Streak tracking to keep the momentum visible'],
      },
      {
        heading: 'How to use it as a quitting aid',
        body: 'When the craving hits, open PuffBreak, take a 3-minute session, and let it run its course. Many people combine it with a craving log or a quit plan. The virtual break satisfies the habit-loop; the time passing satisfies the craving.',
      },
      {
        heading: 'The honest caveat',
        body: 'This is a behavioral tool, not a treatment. If you are quitting, pair it with whatever works for you — gum, patches, a quit coach, a support group. PuffBreak is the ritual piece, and it is free.',
      },
    ],
    roomId: 'office',
    keywords: ['quit smoking tool', 'quit smoking aid online', 'nicotine craving relief', 'smoking cessation app', 'quit smoking ritual', 'craving substitute'],
    faqs: [
      {
        q: 'Can a virtual cigarette help you quit?',
        a: 'It can help with the ritual half of the habit. A craving lasts about three minutes; PuffBreak covers that window with the smoking ritual minus the nicotine. It is a behavioral aid, not a medical device.',
      },
      {
        q: 'Is it a replacement for nicotine replacement therapy?',
        a: 'No — it is a complement, not a replacement. Use it alongside whatever cessation support works for you.',
      },
      {
        q: 'Is it free?',
        a: 'Yes, completely free and anonymous, with no sign-up. It will always be free — the ritual piece of quitting should cost nothing.',
      },
    ],
    related: [
      { kind: 'blog', slug: 'puffbreak-for-quitting-smoking-2026', label: 'Quitting smoking with PuffBreak' },
      { kind: 'blog', slug: 'manage-nicotine-cravings-at-work', label: 'Managing cravings at work' },
      { kind: 'blog', slug: 'how-long-does-nicotine-craving-last', label: 'How long cravings last' },
    ],
  },

  // ─────────────────────────── POMODORO ALTERNATIVE ─────────────────────────
  {
    slug: 'pomodoro-alternative',
    title: 'Pomodoro Alternative — a Break That Actually Resets Your Brain',
    description:
      'The Pomodoro timer handles the focus; the break is where it fails. PuffBreak is the pomodoro alternative — a 3-minute break that really resets you.',
    hook: 'Pomodoro works — until the break. This is the break it was missing.',
    intro: [
      'The Pomodoro Technique is brilliant at one thing: making you focus for 25 minutes. It is quietly bad at the other half — the break — because a timer cannot make a break good. Most Pomodoro breaks become five more minutes of the same screen, which means the reset never happens.',
      'PuffBreak is the missing half: a pomodoro alternative for the break. When your timer pings, open a room, take a 3-minute ritual, and genuinely disengage. The focus technique you already use stays; the break finally catches up with it.',
    ],
    sections: [
      {
        heading: 'Where Pomodoro breaks fail',
        body: 'The technique prescribes a "mental detachment" break, but gives no mechanism for it. The result is the same screen, the same context, the same attention — a break in name only. A real reset needs a change of scene, and that is the one thing a timer cannot provide.',
        bullets: ['25/5 rhythm works; the 5 usually doesn\'t', 'Change of scene is the missing mechanism', 'A bounded ritual makes the break land', 'Return to the next block actually refreshed'],
      },
      {
        heading: 'The 3-minute reset between blocks',
        body: 'After each focus block, take one 3-minute PuffBreak session. It is short enough to fit the Pomodoro rhythm and deep enough to restore attention — then the next 25 minutes start from a real baseline.',
      },
      {
        heading: 'Why ritual beats timer',
        body: 'A timer says "break now"; a ritual makes the break real. The burn, the finish, the room change — these give the pause a beginning, a middle and an end. That is why a 3-minute PuffBreak resets more than a 10-minute scroll.',
      },
    ],
    roomId: 'library',
    keywords: ['pomodoro alternative', 'pomodoro break app', 'focus break timer', '25 5 technique break', 'deep work break', 'study break online'],
    faqs: [
      {
        q: 'Why is this a better pomodoro break?',
        a: 'Pomodoro gives you the focus timer but not the reset. PuffBreak is a 3-minute break that changes your scene and your state — the mechanism a good break actually needs.',
      },
      {
        q: 'Does it work with any timer?',
        a: 'Yes. Use it with any Pomodoro app or just a clock — when the focus block ends, open a room and take your three minutes.',
      },
      {
        q: 'Is it good for studying too?',
        a: 'Yes — the Library Corner (rain + quiet) is designed for exactly that. Study, break, study: the rhythm stays, the reset improves.',
      },
    ],
    related: [
      { kind: 'concept', slug: 'work-break-timer', label: 'Work break timer' },
      { kind: 'blog', slug: 'pomodoro-vs-smoke-break-productivity', label: 'Pomodoro vs. smoke break' },
      { kind: 'blog', slug: 'the-science-of-micro-breaks', label: 'Micro-break science' },
    ],
  },

  // ─────────────────────────── REMOTE WORK BREAK ────────────────────────────
  {
    slug: 'remote-work-break',
    title: 'Remote Work Break — Reclaim the Break Room You Lost',
    description:
      'Remote work took your break room. PuffBreak gives it back — a free online break room with ambience and company for the home office.',
    hook: 'You did not lose your job to remote work. You lost your break room.',
    intro: [
      'Remote work gave us back our commute and took away something quieter: the physical break. The kitchen counter is not a break room, the sofa is not a change of scene, and "I\'ll just make coffee" is not a reset. Home workers have the boundary problem — work never ends, and breaks never begin.',
      'PuffBreak is the break room for the home office. A different room, different sounds, a bounded 3-minute ritual — and the faint social warmth of knowing other remote workers are taking the same break at the same time, in the same room.',
    ],
    sections: [
      {
        heading: 'The remote work break problem',
        body: 'Without an office to leave, remote workers either skip breaks or take "breaks" that look exactly like work (same screen, same chair, same context). Both lead to the same burnout curve. The fix is a hard boundary with a change of scene — which is what PuffBreak provides on demand.',
        bullets: ['Hard boundary: office out, room in', 'Change of scene beats change of chair', 'Presence counters: you are not alone in this', '3-minute length fits between back-to-backs'],
      },
      {
        heading: 'The end-of-day ritual',
        body: 'One of the quiet casualties of remote work is the "drive home" — the mental off-ramp that separated work from life. A PuffBreak session at the end of the day is a manual off-ramp: three minutes, a different room, a clear finish. Work ends when the cigarette does.',
      },
      {
        heading: 'Built for the home office',
        body: 'Stealth Mode renames the tab to something innocuous for video calls, Zen Mode removes all UI for full immersion, and the PWA installs like an app. It fits the remote setup as if it was designed for it — because it was.',
      },
    ],
    roomId: 'park',
    keywords: ['remote work break', 'work from home break', 'home office break room', 'virtual break wfh', 'remote worker wellness', 'online break for remote work'],
    faqs: [
      {
        q: 'Why do remote workers need a virtual break room?',
        a: 'Remote work removed the physical break room, and home breaks tend to blur with work. A virtual break room creates a hard boundary and a change of scene — the two things a real break needs.',
      },
      {
        q: 'Is there a discreet mode for video calls?',
        a: 'Yes — Stealth Mode renames the browser tab to something innocuous so a quick break does not show up in a screen share.',
      },
      {
        q: 'Can I use it as an end-of-work ritual?',
        a: 'Absolutely — many remote workers use a 3-minute session as their "drive home": a deliberate off-ramp that marks the end of the workday.',
      },
    ],
    related: [
      { kind: 'blog', slug: 'work-from-home-burnout-reset', label: 'WFH burnout reset' },
      { kind: 'concept', slug: 'break-room', label: 'The virtual break room' },
      { kind: 'concept', slug: 'work-break-timer', label: 'Work break timer' },
    ],
  },
];

export const getLandingPageBySlug = (slug: string): LandingPage | undefined =>
  LANDING_PAGES.find((p) => p.slug === slug);
