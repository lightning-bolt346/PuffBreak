// Single source of truth for PuffBreak's ambient rooms.
// Used by the break room app (components/PuffBreakApp.tsx), the SEO room
// landing pages (app/rooms/[slug]/page.tsx) and sitemap generation.

export type RoomId = 'office' | 'beach' | 'space' | 'library' | 'park' | 'metro' | 'chai' | 'silent';
export type WeatherType = 'rain' | 'dust' | 'leaves' | 'stars';

export interface Room {
  id: RoomId;
  name: string;
  icon: string;
  bg: string;
  accent: string;
  wind: number;
  weather?: WeatherType;
  overlay: string;
  glowColor: string;
  audioScale: string;
  ytIds: string[];
  ytVol?: number;
  // ── SEO / landing-page fields ─────────────────────────────────────────
  slug: string;
  seoTitle: string;
  seoDescription: string;
  longDescription: string;
  keywords: string[];
  /** What the user can do/hear in this room (short list for the landing page). */
  features: string[];
}

export const ROOMS: Room[] = [
  {
    id: 'office',
    name: 'Office Rooftop',
    icon: '🌃',
    bg: '#0a0a12',
    accent: '#d4a373',
    wind: 0.5,
    weather: 'stars',
    overlay: 'rgba(10,15,30,0.4)',
    glowColor: 'rgba(249,115,22,0.18)',
    audioScale: 'office',
    ytIds: ['D7ZZp8XuUTE', 'PvexeYbDYqg'],
    slug: 'office-rooftop',
    seoTitle: 'Virtual Office Rooftop — City Lights & Night Ambience',
    seoDescription: 'Take a virtual smoke break on a late-night office rooftop overlooking a sleeping metropolis. Starry sky, city glow, and soft ventilation hum — free and anonymous.',
    longDescription:
      'The classic late-night corporate break, recreated. From a rooftop high above the city, you watch the grid of a sleeping metropolis breathe beneath a sky full of stars. A faint ventilation hum and the distant rustle of the city ground you — while your virtual cigarette, match or chai cup takes centre stage. It is the perfect reset between long meetings, late shifts, or a creative block.',
    keywords: ['virtual office rooftop', 'late night smoke break', 'city night ambience', 'rooftop asmr', 'office break'],
    features: ['Starry night weather system', 'Distant city ambience', 'AC ventilation hum', 'Cigarette + lighter/match'],
  },
  {
    id: 'beach',
    name: 'Beach Sunset',
    icon: '🏖️',
    bg: '#1a0b05',
    accent: '#f4a261',
    wind: 1.5,
    weather: 'dust',
    overlay: 'rgba(255,100,50,0.1)',
    glowColor: 'rgba(244,162,97,0.2)',
    audioScale: 'nature',
    ytIds: ['d_7c3jDJCCA'],
    slug: 'beach-sunset',
    seoTitle: 'Beach Sunset Ambience — Waves, Golden Hour & Virtual Smoke Break',
    seoDescription: 'Unwind to rolling ocean waves under a warm, dust-flecked golden horizon. A free 3-minute beach sunset ASMR break with a virtual cigarette or chai.',
    longDescription:
      'Golden hour, ocean waves, and a sky dusted with warm light. The Beach Sunset room is a full sensory escape — procedural ASMR waves roll in and out while the wind carries dust motes through the air. Light your virtual cigarette, breathe in time with the tide, and let the endless horizon reset your attention.',
    keywords: ['beach sunset ambience', 'ocean waves asmr', 'virtual smoke break beach', 'golden hour relaxation', 'beach sounds for sleep'],
    features: ['Procedural ocean wave ASMR', 'Golden-hour dust particles', 'Breeze + wind physics', 'Cigarette or chai'],
  },
  {
    id: 'space',
    name: 'Space Station',
    icon: '🌑',
    bg: '#000010',
    accent: '#a8dadc',
    wind: 0,
    weather: 'stars',
    overlay: 'rgba(0,0,0,0)',
    glowColor: 'rgba(168,218,220,0.15)',
    audioScale: 'cyber',
    ytIds: ['cAZpMtl9ZeE'],
    slug: 'space-station',
    seoTitle: 'Space Station Ambience — Cosmic Calm & Deep Space ASMR',
    seoDescription: 'Float in absolute isolation aboard a cosmic cabin overlooking Earth. Sci-fi drone ambience and stars — the ultimate zero-gravity 3-minute break.',
    longDescription:
      'Absolute isolation, zero gravity, and a window looking down on Earth. The Space Station room replaces the noise of the office with a slow, deep sci-fi drone — engineered to lower your heart rate. Watch the stars drift, light up, and remember how small the inbox really is.',
    keywords: ['space station ambience', 'deep space asmr', 'sci-fi relaxation', 'cosmic break room', 'space sounds'],
    features: ['Sci-fi drone synthesizer', 'Slow star drift particles', 'Zero-gravity calm', 'Cigarette or chai'],
  },
  {
    id: 'library',
    name: 'Library Corner',
    icon: '📚',
    bg: '#1e1a18',
    accent: '#dda15e',
    wind: 0.1,
    weather: 'dust',
    overlay: 'rgba(40,30,20,0.3)',
    glowColor: 'rgba(221,161,94,0.15)',
    audioScale: 'office',
    ytIds: ['4vIQON2fDWM'],
    slug: 'library-corner',
    seoTitle: 'Library Ambience — Rain Sounds, Page Flips & Cozy Study Break',
    seoDescription: 'Cozy up to quiet rustles, page flips and a warm hearth in a rain-soaked library. The perfect ASMR study break — free and anonymous.',
    longDescription:
      'A quiet corner, a warm hearth, and rain tapping the windows. The Library Corner room pairs gentle page-flip rustles with soft rainfall and the crackle of a fire — a studied calm designed for focused work and the breaks in between. Take your chai, sit down, and let the quiet do its work.',
    keywords: ['library rain sounds', 'study ambience asmr', 'cozy reading room', 'rain for studying', 'fireplace library'],
    features: ['Gentle rain + page rustles', 'Warm hearth fire ambience', 'Soft dust motes', 'Cigarette or chai'],
  },
  {
    id: 'park',
    name: 'Park Bench',
    icon: '🌳',
    bg: '#0b120c',
    accent: '#a3b18a',
    wind: 0.8,
    weather: 'leaves',
    overlay: 'rgba(20,50,20,0.15)',
    glowColor: 'rgba(163,177,138,0.15)',
    audioScale: 'nature',
    ytIds: ['4-zPHg5Jj6w'],
    ytVol: 5.0,
    slug: 'park-bench',
    seoTitle: 'Park Bench Ambience — Birds, Leaves & City Breeze',
    seoDescription: 'Sit under drifting leaves with rustling trees and faint city chatter. A free 3-minute park bench ASMR break for a mental reset.',
    longDescription:
      'A wooden bench, a leafy canopy, and the faint chatter of a city keeping its distance. The Park Bench room surrounds you with rustling leaves and a soft breeze while life drifts by at arm\u2019s length. Watch the leaves fall, take a slow drag or a warm sip, and remember that the world can wait three minutes.',
    keywords: ['park bench ambience', 'leaves rustling asmr', 'outdoor relaxation', 'city park sounds', 'breezy break'],
    features: ['Falling leaves particles', 'Rustling trees + wind', 'Distant city chatter', 'Cigarette or chai'],
  },
  {
    id: 'metro',
    name: 'Metro Platform',
    icon: '🚇',
    bg: '#101416',
    accent: '#9ca3af',
    wind: 2.0,
    weather: 'dust',
    overlay: 'rgba(10,30,40,0.2)',
    glowColor: 'rgba(100,116,139,0.15)',
    audioScale: 'cyber',
    ytIds: ['GRZ6rrpMoHs'],
    slug: 'metro-platform',
    seoTitle: 'Metro Platform Ambience — Late-Night Transit & Industrial Hum',
    seoDescription: 'Tap into the industrial hum and passing trains of a late-night transit terminal. A moody 3-minute metro ASMR break.',
    longDescription:
      'Late-night transit, fluorescent light, and the low industrial hum of a platform that never sleeps. The Metro Platform room channels the quiet restlessness of a city in motion — trains pass in the distance as you stand under the glow. It is strangely calming: the city moves, and you do not have to.',
    keywords: ['metro platform ambience', 'train station asmr', 'late night transit', 'industrial ambience', 'subway sounds'],
    features: ['Industrial platform hum', 'Passing train ambience', 'Dust + light haze', 'Cigarette or chai'],
  },
  {
    id: 'chai',
    name: 'Chai Stall',
    icon: '🇮🇳',
    bg: '#1a120b',
    accent: '#e07a5f',
    wind: 0.3,
    weather: 'rain',
    overlay: 'rgba(50,30,10,0.3)',
    glowColor: 'rgba(224,122,95,0.2)',
    audioScale: 'chai',
    ytIds: ['uiMXGIG_DQo'],
    slug: 'chai-stall',
    seoTitle: 'Virtual Chai Stall (Tapri) — Rain, Chatter & Indian Tea Break',
    seoDescription: 'Experience the comfort of a roadside Indian chai stall — bubbling chai, fresh rain and café chatter. A warm virtual tea break, free and anonymous.',
    longDescription:
      'A roadside tapri in the rain. The Chai Stall room recreates the warmth of an Indian tea stall — bubbling chai, fresh rain on the tin roof, and the low murmur of café chatter. Here, your interactive element is a ceramic cup of chai: hold to sip, watch the steam rise, double-tap to clink. It is the most comforting three minutes on the internet.',
    keywords: ['virtual chai break', 'tapri ambience', 'indian tea stall', 'chai asmr rain', 'virtual tea break'],
    features: ['Interactive chai cup (hold to sip)', 'Fresh rain + café chatter', 'Rising steam particles', 'Chai-only ritual (no smoke)'],
  },
  {
    id: 'silent',
    name: 'Silent Room',
    icon: '🤫',
    bg: '#050505',
    accent: '#6b705c',
    wind: 0.2,
    overlay: 'rgba(0,0,0,0.5)',
    glowColor: 'rgba(107,112,92,0.1)',
    audioScale: 'silent',
    ytIds: [],
    slug: 'silent-room',
    seoTitle: 'Silent Room — Zero Distraction Mindful Break',
    seoDescription: 'No visuals, no audio, no chat. Just you and your breath in a blank, silent space. The purest 3-minute mindful break.',
    longDescription:
      'The hardest room on the internet: nothing. No ambience, no weather, no chat — just a blank, silent space and the quiet rhythm of your own breath. The Silent Room is for people who want the purest possible pause. Light up in the dark, or just sit with yourself for three minutes. Sometimes that is the bravest thing you can do.',
    keywords: ['silent room meditation', 'zero distraction break', 'mindful silence', 'dark room relaxation', 'pure quiet break'],
    features: ['Zero audio by design', 'Zero visual noise', 'No chat — pure solitude', 'Cigarette only'],
  },
];

export const getRoomBySlug = (slug: string): Room | undefined =>
  ROOMS.find((r) => r.slug === slug);

export const getRoomById = (id: string): Room | undefined =>
  ROOMS.find((r) => r.id === id);
