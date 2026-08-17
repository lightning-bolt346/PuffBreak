'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Coffee, EyeOff, Eye, Minimize2, MoreHorizontal, RotateCcw, Share2,
  MessageSquare, FileText, Linkedin, Star, RotateCcw as RestoreIcon,
  Shield, MapPin, X, Send, Smile, Volume2, VolumeX, Wifi, WifiOff,
  Users, Copy, BookOpen, Image, CheckCircle, AlertCircle, QrCode, Sliders, ChevronDown,
  Play, Pause, Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { BlogPost } from '@/lib/blog';
import { FAQ_ITEMS } from '@/lib/faq';
import { getLocalizedGreeting, getCultureProfile, getDailyVibe } from '@/lib/i18n';
import { CUP_STYLES, getWarmDrink } from '@/lib/cups';
import { ROOMS, type Room, type RoomId, type WeatherType } from '@/lib/rooms';
import { DEFAULT_RADIO_ID, RADIO_STATIONS, getRadioStation } from '@/lib/radio';
import { track } from '@/lib/analytics';
import { submitSurvey, hasAnsweredSurvey, SURVEY_OPTIONS, type SurveyFelt } from '@/lib/survey';
import { useSessionId } from '@/hooks/useSessionId';
import AmbientEngine, { type AmbientEngineHandle } from '@/components/engine/AmbientEngine';
import RadioLibrary from '@/components/radio/RadioLibrary';
import { db } from '@/lib/firebase';
import { ref, runTransaction, onChildAdded, push, onDisconnect, remove, off, query, limitToLast, onValue } from 'firebase/database';
import { useRoomCounts } from '@/hooks/useRoomCounts';

// ─── Types ───────────────────────────────────────────────────────────────────
// Room types & ROOMS now live in lib/rooms.ts (shared with the /rooms SEO pages).

type CigWidth = 'slim' | 'standard' | 'wide';
type RadioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'blocked' | 'error';

// DOM-based smoke ring
interface SmokeRing {
  id: number;
  // pixel coords relative to viewport at spawn time:
  x: number;   // center x
  y: number;   // center y (bottom of filter)
  diameter: number; // initial diameter = filter element width
  density: number; // 0-1 how long it was held
}

interface Particle {
  id: number;
  type: 'smoke' | 'donut' | 'ash' | 'steam' | 'weather' | 'exhale' | 'puffRing';
  wType?: WeatherType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  phase: number;
  rotation?: number;
  rotV?: number;
  // Smoke-specific
  turbX?: number;
  turbY?: number;
  turbPhase?: number;
  colorShift?: number; // 0=warm 1=cool
}

interface ChatMessage {
  id: string;
  text: string;
  nickname: string;
  color: string;
  side: 'left' | 'center' | 'right';
  xPos: number; // 0-100% fixed x position
  createdAt: number;
  reactions: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

// 100 × 100 × 90 = 900,000 unique nickname combinations
const ADJECTIVES = [
  'Sleepy','Grumpy','Tiny','Cloudy','Happy','Brave','Shy','Clever','Clumsy','Cozy',
  'Wild','Misty','Bold','Calm','Crisp','Dark','Dusty','Eager','Fancy','Fluffy',
  'Ghostly','Golden','Gruff','Hollow','Icy','Jazzy','Jumpy','Keen','Lazy','Lofty',
  'Lucky','Mellow','Mighty','Moody','Murky','Mystic','Neon','Noble','Plush','Quirky',
  'Rogue','Rusty','Sage','Sandy','Sharp','Silent','Silky','Smoky','Snowy','Stormy',
  'Swift','Tawny','Tender','Tidy','Toasty','Turbo','Velvet','Vivid','Arctic','Amber',
  'Ashen','Blazing','Breezy','Brisk','Cinder','Cobalt','Copper','Coral','Cosmic','Crystal',
  'Dappled','Dreamy','Dusky','Feral','Frosted','Gloomy','Glowing','Granite','Hazy','Infernal',
  'Lunar','Marble','Mossy','Nocturnal','Obsidian','Pale','Phantom','Primal','Radiant','Scarlet',
  'Serene','Solar','Stealthy','Timber','Toxic','Zen','Blunt','Drifting','Ether','Flint',
];
const ANIMALS = [
  'Panda','Koala','Tiger','Penguin','Bear','Fox','Owl','Bunny','Cat','Duck',
  'Otter','Lynx','Wolf','Elk','Crow','Crane','Coyote','Raven','Hawk','Dingo',
  'Finch','Goat','Hare','Jaguar','Lemur','Llama','Magpie','Mink','Moose','Narwhal',
  'Newt','Parrot','Puma','Quail','Rhino','Seal','Sloth','Swan','Walrus','Wren',
  'Axolotl','Bison','Capybara','Ferret','Gecko','Iguana','Loris','Oryx','Stoat','Viper',
  'Ibis','Tapir','Quokka','Pangolin','Manatee','Ocelot','Platypus','Meerkat','Wolverine','Wombat',
  'Caracal','Okapi','Gopher','Cheetah','Armadillo','Porcupine','Tamarin','Pika','Chinchilla','Kinkajou',
  'Fossa','Saiga','Jabiru','Kakapo','Kestrel','Cassowary','Roadrunner','Muffin','Dhole','Ermine',
  'Numbat','Binturong','Galago','Tarsier','Marmoset','Capuchin','Macaque','Jackal','Serval','Caracara',
  'Albatross','Toucan','Flamingo','Pelican','Puffin','Hornbill','Cockatoo','Mandrill','Addax','Marmot',
];
const COLORS = ['#f87171','#fb923c','#fbbf24','#a3e635','#34d399','#22d3ee','#818cf8','#c084fc','#f472b6'];

/**
 * Generates a unique nickname: Adjective + Animal + 2-digit number (10-99)
 * Pool: 100 × 100 × 90 = 900,000 combinations
 * Saved to localStorage so the same user always gets the same name.
 */
const generateNickname = (): string => {
  const adj    = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num    = 10 + Math.floor(Math.random() * 90); // 10-99, avoids leading zero
  return `${adj}${animal}${num}`;
};

const getRandomColor = (): string => COLORS[Math.floor(Math.random() * COLORS.length)];

// Store recent X positions to avoid overlap
const recentXPositions: number[] = [];

// Random x position for chat bubbles — avoids center zone where cigarette is and prevents overlapping
const getRandomChatX = (): number => {
  const zones = [
    [4, 24],   // left zone: 4–24%
    [72, 90],  // right zone: 72–90%
    [28, 42],  // mid-left: 28–42%
    [56, 70],  // mid-right: 56–70%
  ];
  
  let bestX = 0;
  let maxDist = -1;
  
  // Generate multiple candidates and pick the one furthest from recent messages
  for (let i = 0; i < 10; i++) {
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const candidate = zone[0] + Math.random() * (zone[1] - zone[0]);
    
    if (recentXPositions.length === 0) {
      bestX = candidate;
      break;
    }
    
    let minDist = 100;
    for (const rx of recentXPositions) {
      const dist = Math.abs(rx - candidate);
      if (dist < minDist) minDist = dist;
    }
    
    if (minDist > maxDist) {
      maxDist = minDist;
      bestX = candidate;
    }
  }
  
  recentXPositions.push(bestX);
  // Keep memory of the last 4 messages to ensure good spatial distribution
  if (recentXPositions.length > 4) recentXPositions.shift();
  
  return bestX;
};

const BANNED_WORDS = ['fuck','shit','bitch','asshole','dick','pussy','chutiya','madarchod','bhenchod','gandu','slur'];
const filterText = (text: string): string => {
  for (const word of BANNED_WORDS) {
    if (new RegExp(word, 'gi').test(text)) return '🚫 Message filtered';
  }
  return text;
};

// Compact number formatting for social-proof stats (e.g. 1,240 → "1.2k")
const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

// Read `?lang=` from the URL so the hreflang-localized variants actually
// localize the UI (greeting, vibe, chai hint) instead of only changing metadata.
const getUrlLang = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return new URLSearchParams(window.location.search).get('lang') ?? undefined;
};

// Daily affirmations are localized via lib/i18n.ts (getDailyVibe) — every user
// sees a personalized, deterministic affirmation in their own language.

const TOTAL_TIME = 180; // seconds (default "Classic" break)

// ─── Break types ─────────────────────────────────────────────────────────────
// Three session lengths so users can pick the ritual that fits their moment.
// Non-intrusive: the selected length only changes the burn timer, nothing else.
type BreakType = 'micro' | 'classic' | 'deep';
const BREAK_TYPES: { id: BreakType; label: string; icon: string; seconds: number; hint: string }[] = [
  { id: 'micro', label: 'Micro', icon: '⚡', seconds: 60, hint: '1 min' },
  { id: 'classic', label: 'Classic', icon: '🌬️', seconds: 180, hint: '3 min' },
  { id: 'deep', label: 'Deep', icon: '🌊', seconds: 300, hint: '5 min' },
];

// ─── Streak tiers (fun, earned, never nagging) ───────────────────────────────
const STREAK_TIERS = [
  { min: 30, name: 'Legend', emoji: '👑' },
  { min: 14, name: 'Inferno', emoji: '🌋' },
  { min: 7, name: 'Flame', emoji: '🔥' },
  { min: 3, name: 'Ember', emoji: '🕯️' },
  { min: 1, name: 'Spark', emoji: '✨' },
] as const;
const getStreakTier = (streak: number) =>
  STREAK_TIERS.find((t) => streak >= t.min) ?? STREAK_TIERS[STREAK_TIERS.length - 1];

// ─── Rooms ───────────────────────────────────────────────────────────────────
// ROOMS now lives in lib/rooms.ts (shared with the /rooms SEO landing pages).

// ─── Mock messages per room (initial seed) ───────────────────────────────────

const MOCK_MESSAGES: Record<string, { text: string; nickname: string; color: string }[]> = {
  office:  [{ text: 'Ugh, Monday energy...', nickname: 'SleepyPanda', color: '#f87171' }, { text: 'Same. Third meeting today 😭', nickname: 'ClooudyOtter', color: '#818cf8' }],
  beach:   [{ text: 'Wish I was actually here', nickname: 'WildFox', color: '#fb923c' }, { text: 'Golden hour vibes 🌅', nickname: 'HappyBear', color: '#fbbf24' }],
  space:   [{ text: 'One small break, one giant relief', nickname: 'BravePenguin', color: '#a8dadc' }],
  library: [{ text: 'Shhh... but hi 👋', nickname: 'ShyCat', color: '#dda15e' }],
  park:    [{ text: 'The pigeons are judging me', nickname: 'CleverOwl', color: '#a3e635' }],
  metro:   [{ text: 'Next stop: sanity', nickname: 'MistyDuck', color: '#9ca3af' }],
  chai:    [{ text: 'Cutting chai, anyone? ☕', nickname: 'CozyBunny', color: '#e07a5f' }, { text: '🙋‍♂️ Extra ginger please!', nickname: 'GrumpyTiger', color: '#fbbf24' }],
  silent:  [],
};

// ─── Audio Scale Definitions ─────────────────────────────────────────────────

const AUDIO_SCALES: Record<string, number[]> = {
  office:  [130.81, 155.56, 196.00, 233.08, 261.63],
  nature:  [130.81, 146.83, 164.81, 196.00, 220.00],
  cyber:   [65.41,  98.00, 130.81, 196.00, 261.63],
  chai:    [138.59, 155.56, 185.00, 207.65, 277.18],
  silent:  [],
};

// ─── MenuButton helper ────────────────────────────────────────────────────────

function MenuButton({ icon, text, textColor = 'text-gray-300', onClick }: {
  icon: React.ReactNode; text: string; textColor?: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-5 py-3.5 hover:bg-white/5 active:bg-white/10 transition-colors text-left ${textColor}`}
    >
      <span className="opacity-60 shrink-0">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
}

// ─── Smoke Renderer ───────────────────────────────────────────────────────────

// Draws one realistic wispy smoke puff — soft, no hard edges, slightly translucent
function drawSmokeParticle(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  alpha: number,
) {
  const lr = p.life / p.maxLife;
  // Fade in quickly, then slowly fade out
  const fadeFactor = lr < 0.15 ? lr / 0.15 : lr > 0.7 ? (lr - 0.7) / 0.3 * 0.6 + 0.4 : 1.0;
  // Neutral, natural grayish-white smoke, no color shifting
  const r = 210;
  const g = 210;
  const b = 215;

  // 3 overlapping soft blobs per particle to break up circular shapes
  const subCount = 3;
  for (let s = 0; s < subCount; s++) {
    const angle = p.phase + s * (Math.PI * 2 / subCount);
    const drift = p.size * 0.28;
    const ox = Math.cos(angle) * drift;
    const oy = Math.sin(angle) * drift * 0.6;
    const subR = p.size * (0.55 + s * 0.18);
    // Each sub-blob fades independently
    const subA = alpha * fadeFactor * (0.18 - s * 0.04);
    if (subA <= 0) continue;

    const grad = ctx.createRadialGradient(p.x + ox, p.y + oy, 0, p.x + ox, p.y + oy, subR);
    // Increased alpha to make smoke 2x more visible
    grad.addColorStop(0,    `rgba(${r},${g},${b},${subA * 0.30})`);
    grad.addColorStop(0.35, `rgba(${r},${g},${b},${subA * 0.16})`);
    grad.addColorStop(0.75, `rgba(${r},${g},${b},${subA * 0.04})`);
    grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(p.x + ox, p.y + oy, subR, subR * 0.78, angle * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PuffBreak() {
  // Core burn state
  const [blogPosts, setBlogPosts]       = useState<BlogPost[]>([]);
  const [isLit, setIsLit]               = useState(false);
  const [progress, setProgress]         = useState(0);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const [lastTapProgress, setLastTapProgress] = useState(0);
  const [isFinished, setIsFinished]     = useState(false);
  const [glow, setGlow]                 = useState(0);
  const [isCharging, setIsCharging]     = useState(false);
  const [lightingPhase, setLightingPhase] = useState<'idle' | 'approach' | 'approachBox' | 'openBox' | 'extractMatch' | 'open' | 'strike' | 'lit' | 'closing' | 'retreat'>('idle');

  // UI modes
  const [isStealth, setIsStealth]       = useState(false);
  const [isZenMode, setIsZenMode]       = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [cigWidth, setCigWidth]         = useState<CigWidth>('standard');
  const [igniterType, setIgniterType]   = useState<'lighter' | 'match'>('lighter');
  const [breakType, setBreakType]       = useState<BreakType>('classic');
  const breakSeconds                    = BREAK_TYPES.find((t) => t.id === breakType)?.seconds ?? TOTAL_TIME;

  // Room (deep-linked via ?room=<id> in a mount effect below — see switchRoom)
  const [currentRoom, setCurrentRoom]   = useState<Room>(ROOMS[0]);
  const [prevBg, setPrevBg]             = useState(ROOMS[0].bg);

  // ASMR
  // Playback is intentionally not restored across visits: browsers block
  // autoplay, and a glowing control that is actually silent breaks trust.
  const [asmrOn, setAsmrOn]             = useState(false);
  const [musicOn, setMusicOn]           = useState(false);
  const [ytPlaying, setYtPlaying]       = useState(false);
  const [radioPlaybackState, setRadioPlaybackState] = useState<RadioPlaybackState>('idle');
  
  // Independent Volume Mixer (first-time defaults: cig=60, radio=100, ambiance=30)
  const [crackleVolume, setCrackleVolume] = useState(0.6);
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [musicVolume, setMusicVolume]     = useState(1.0);
  const [audioMixerOpen, setAudioMixerOpen] = useState(false);
  const [radioLibraryOpen, setRadioLibraryOpen] = useState(false);
  const [radioStationId, setRadioStationId] = useState(DEFAULT_RADIO_ID);
  const [radioToast, setRadioToast]         = useState<string | null>(null);
  const [radioCompanionMinimized, setRadioCompanionMinimized] = useState(false);
  const [mobileRadioHidden, setMobileRadioHidden] = useState(false);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [youtubeRadioMounted, setYoutubeRadioMounted] = useState(false);
  
  // Refs to remember volumes before mute
  const prevCrackleVolumeRef = useRef(0.6);
  const prevAmbientVolumeRef = useRef(0.3);
  const prevMusicVolumeRef   = useRef(1.0);

  // UI panels
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [drawerMixerOpen, setDrawerMixerOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [updateNotesOpen, setUpdateNotesOpen] = useState(false);
  const [aboutOpen, setAboutOpen]       = useState(false);
  const [openQr, setOpenQr]             = useState<'btc' | 'upi' | null>(null);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackImages, setFeedbackImages] = useState<File[]>([]);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [showNotice, setShowNotice]     = useState(true);
  const [streak, setStreak]             = useState(0);
  // Resolve the locale once, client-side only (after hydration) so the SSR HTML
  // matches the browser. Resolving in a useState initializer caused a hydration
  // mismatch when `?lang=` / navigator.language differed between server and client.
  const [locale, setLocale]             = useState('en');
  useEffect(() => {
    const lang = getUrlLang() ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
    setLocale(lang);
  }, []);

  const culture                         = getCultureProfile(locale);
  const warmDrink                       = getWarmDrink(locale);
  const vibeOfDay                       = getDailyVibe(locale);
  const localizedGreeting               = getLocalizedGreeting(locale);

  const [sugarAdded, setSugarAdded]     = useState(false);
  const [sugarRipple, setSugarRipple]   = useState(false);
  const [streakToast, setStreakToast]   = useState<string | null>(null);

  // ── Localized warm-drink room (name / icon / vessel / sugar) ─────────────
  const cup = CUP_STYLES[warmDrink.cupStyle] ?? CUP_STYLES.mug;
  const displayRoomName = (room: Room) => (room.id === 'chai' ? warmDrink.name : room.name);
  const displayRoomIcon = (room: Room) => (room.id === 'chai' ? warmDrink.icon : room.icon);
  const showSugar = warmDrink.hasSugar;

  // ── Craving Check — the in-app survey (see lib/survey.ts) ────────────────
  // One optional tap after a completed break → aggregated anonymously into the
  // /data page (original data, the honest GEO lever). Never blocking, never nagging.
  const sessionId = useSessionId();
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyThanks, setSurveyThanks] = useState(false);
  const [surveyChosen, setSurveyChosen] = useState<SurveyFelt | null>(null);
  const surveyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSurvey = useCallback(() => {
    if (hasAnsweredSurvey()) return;
    setSurveyOpen(true);
    setSurveyThanks(false);
  }, []);

  const handleSurveyAnswer = useCallback((felt: SurveyFelt) => {
    setSurveyChosen(felt);
    submitSurvey(felt, currentRoom.id, sessionId);
    setSurveyThanks(true);
    if (surveyTimerRef.current) clearTimeout(surveyTimerRef.current);
    surveyTimerRef.current = setTimeout(() => {
      setSurveyOpen(false);
      setSurveyThanks(false);
      setSurveyChosen(null);
    }, 4200);
  }, [currentRoom.id, sessionId]);

  const dismissSurvey = useCallback(() => {
    if (surveyTimerRef.current) clearTimeout(surveyTimerRef.current);
    setSurveyOpen(false);
    setSurveyThanks(false);
  }, []);

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [smokeRings, setSmokeRings]     = useState<SmokeRing[]>([]);

  // Chat
  const [nickname, setNickname]         = useState('');
  const [nameColor, setNameColor]       = useState('');
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [chatText, setChatText]         = useState('');
  const [lastMsgTime, setLastMsgTime]   = useState(0);
  const [emojiPicker, setEmojiPicker]   = useState<string | null>(null);
  const [isTyping, setIsTyping]         = useState(false);
  const [isOffline, setIsOffline]       = useState(false);
  const [chatOpen, setChatOpen]         = useState(false);
  const [totalBreaksToday, setTotalBreaksToday] = useState(0);
  const [totalBreaksAll, setTotalBreaksAll] = useState(0);
  // Fetch blog posts on mount
  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => setBlogPosts(data))
      .catch(err => console.error("Failed to load blog posts", err));
  }, []);

  // Keyboard controls & visibility tracking — for keyboard-aware chat bar on mobile
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // NOTE (room model): While the platform is small, every user in a room location
  // shares ONE lobby and ONE chat (no sub-room partitioning). This keeps room counts
  // truthful (bottom = this location, top = all locations) and nobody feels alone.
  // To re-enable sub-rooms later, restore the "<6 users per sub-room" matchmaker that
  // used lobbies/{roomId}/{subRoomId}/users and rooms/{subRoomId}/messages.

  // YouTube Ambient
  const ytPlayersRef = useRef<Record<string, YouTubePlayer>>({});

  // Filter hold state
  const [filterHoldIntensity, setFilterHoldIntensity] = useState(0); // 0-1
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [guideLauncherVisible, setGuideLauncherVisible] = useState(true);
  const mainScreenRef = useRef<HTMLDivElement>(null);
  const filterHoldStartRef  = useRef<number>(0);
  const filterHoldTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFilterHeldRef     = useRef(false);

  // Chai hold-to-sip
  const [isPuffing, setIsPuffing]       = useState(false);
  const chaiHoldingRef                  = useRef(false);

  // Refs
  const lightTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lightIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointerDownTimeRef = useRef(0);
  const lastTapRef         = useRef(0);
  const filterTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const canvasRef          = useRef<HTMLCanvasElement>(null);
  const particlesRef       = useRef<Particle[]>([]);
  const smokeTrailsRef     = useRef<{ x: number; y: number; life: number }[]>([]);
  const emberRef           = useRef<HTMLDivElement>(null);
  const ashTopRef          = useRef<HTMLDivElement>(null);
  const displayLastTapRef  = useRef(0);
  const filterRef          = useRef<HTMLDivElement>(null);
  
  // Audio Buffers
  const lighterBufferRef      = useRef<AudioBuffer | null>(null);
  const matchstickBufferRef   = useRef<AudioBuffer | null>(null);
  const smokeBlowBufferRef    = useRef<AudioBuffer | null>(null);
  const currentSfxSourceRef   = useRef<AudioBufferSourceNode | null>(null);
  const lastBlowSfxAtRef      = useRef(0);
  const blowDuckTimerRef      = useRef<number | null>(null);
  const ignitionIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignitionTokenRef       = useRef(0);
  const ignitionHeldRef        = useRef(false);
  const ignitionStartedRef     = useRef(false);
  const closingTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retreatTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchFlameTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pointer tracking — with proper reset on leave
  const pointerXRef   = useRef(-1000);
  const pointerYRef   = useRef(-1000);
  const ptrDownRef    = useRef(false);
  const lastPtrXRef   = useRef(-1000);
  const lastPtrYRef   = useRef(-1000);

  // Audio
  const audioCtxRef           = useRef<AudioContext | null>(null);
  const radioRef              = useRef<HTMLAudioElement | null>(null);
  const youtubeRadioPlayerRef = useRef<YouTubePlayer | null>(null);
  const youtubeRadioReadyRef  = useRef(false);
  const youtubeNeedsRandomStartRef = useRef(true);
  const youtubeRadioErrorCountRef = useRef(0);
  const radioStationIdRef     = useRef<string>(DEFAULT_RADIO_ID);
  const radioPrevIdRef        = useRef<string | null>(null);
  const musicOnRef            = useRef<boolean>(musicOn);
  const playingYtIdsRef       = useRef<Set<string>>(new Set());

  // Keep a live mirror of musicOn so long-lived listeners (like the radio
  // error handler attached once in initAudio) never read a stale closure.
  useEffect(() => { musicOnRef.current = musicOn; }, [musicOn]);
  const crackleGainRef        = useRef<GainNode | null>(null);
  const ambientGainRef        = useRef<GainNode | null>(null);
  const ambientMusicGainRef   = useRef<GainNode | null>(null);
  const ambientLowpassRef     = useRef<BiquadFilterNode | null>(null);
  
  // Procedural Ambient Engine — powered by components/engine/AmbientEngine.tsx
  const engineRef = useRef<AmbientEngineHandle | null>(null);
  
  const musicIntervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const mixerRef              = useRef<HTMLDivElement>(null);
  const chatInputRef          = useRef<HTMLInputElement>(null);

  // ── Persistence ───────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('puffbreak_prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.igniterType) setIgniterType(prefs.igniterType);
        if (typeof prefs.crackleVolume === 'number') {
          const level = Math.min(1, Math.max(0, prefs.crackleVolume));
          setCrackleVolume(level);
          if (level > 0) prevCrackleVolumeRef.current = level;
        }
        if (typeof prefs.ambientVolume === 'number') {
          const level = Math.min(1, Math.max(0, prefs.ambientVolume));
          setAmbientVolume(level);
          if (level > 0) prevAmbientVolumeRef.current = level;
        }
        if (typeof prefs.musicVolume === 'number') {
          const level = Math.min(1, Math.max(0, prefs.musicVolume));
          setMusicVolume(level);
          if (level > 0) prevMusicVolumeRef.current = level;
        }
        if (typeof prefs.radioStationId === 'string') {
          const storedStation = getRadioStation(prefs.radioStationId);
          setRadioStationId(storedStation.id);
          radioStationIdRef.current = storedStation.id;
        }
      }
    } catch {
      // Invalid local preferences fall back to the product defaults.
    } finally {
      setPreferencesReady(true);
    }
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    try {
      localStorage.setItem('puffbreak_prefs', JSON.stringify({
        igniterType, crackleVolume, ambientVolume, musicVolume, radioStationId
      }));
    } catch {
      // Storage can be unavailable in hardened/private browser contexts.
    }
  }, [preferencesReady, igniterType, crackleVolume, ambientVolume, musicVolume, radioStationId]);

  // ── Vibrate helper ─────────────────────────────────────────────────────────
  const vibrate = useCallback((ms: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
  }, []);

  // ── Identity + streak init ─────────────────────────────────────────────────
  useEffect(() => {
    const lastVisit = localStorage.getItem('pb_last_visit');
    const streakStr = localStorage.getItem('pb_streak');
    let currentStreak = streakStr ? parseInt(streakStr) : 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let incrementedToday = false;
    if (lastVisit !== today) {
      currentStreak = lastVisit === yesterday ? currentStreak + 1 : 1;
      incrementedToday = lastVisit === yesterday;
      localStorage.setItem('pb_last_visit', today);
      localStorage.setItem('pb_streak', currentStreak.toString());
    }
    setStreak(currentStreak);
    if (incrementedToday && currentStreak >= 2) {
      const tier = getStreakTier(currentStreak);
      setStreakToast(`${tier.emoji} ${tier.name} — ${currentStreak}-day streak`);
    }

    const storedName  = localStorage.getItem('pb_nickname');
    const storedColor = localStorage.getItem('pb_color');
    if (storedName && storedColor) {
      setNickname(storedName); setNameColor(storedColor);
    } else {
      const n = generateNickname(); const c = getRandomColor();
      localStorage.setItem('pb_nickname', n); localStorage.setItem('pb_color', c);
      setNickname(n); setNameColor(c);
    }

    const storedIgniter = localStorage.getItem('pb_igniter');
    if (storedIgniter) {
      setIgniterType(storedIgniter as 'lighter' | 'match');
    } else {
      // Default to lighter for new users
      localStorage.setItem('pb_igniter', 'lighter');
      setIgniterType('lighter');
    }

    // ─── Pre-load lighter & match audio eagerly so sound is ready on first use ───
    const preloadAudio = async () => {
      try {
        const TmpCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!TmpCtx) return;
        const tmpCtx = new TmpCtx();
        const [lBuf, mBuf, sbBuf] = await Promise.all([
          fetch('/audio/audiomass-lighter.mp3').then(r => r.arrayBuffer()).then(ab => tmpCtx.decodeAudioData(ab)),
          fetch('/audio/audiomass-matchstick.mp3').then(r => r.arrayBuffer()).then(ab => tmpCtx.decodeAudioData(ab)),
          fetch('/audio/smoke-blow.mp3').then(r => r.arrayBuffer()).then(ab => tmpCtx.decodeAudioData(ab)),
        ]);
        lighterBufferRef.current = lBuf;
        matchstickBufferRef.current = mBuf;
        smokeBlowBufferRef.current = sbBuf;
        // Keep tmpCtx — initAudio() will create its own ctx; buffers are already decoded.
      } catch (e) { /* non-fatal */ }
    };
    preloadAudio();
  }, []);

  // ── Streak celebration toast auto-dismiss ─────────────────────────────────
  useEffect(() => {
    if (!streakToast) return;
    const t = setTimeout(() => setStreakToast(null), 4500);
    return () => clearTimeout(t);
  }, [streakToast]);

  useEffect(() => {
    if (!radioToast) return;
    const t = setTimeout(() => setRadioToast(null), 3600);
    return () => clearTimeout(t);
  }, [radioToast]);


  // ── Click outside to close mixer ──────────────────────────────────────────
  useEffect(() => {
    if (!audioMixerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (mixerRef.current && !mixerRef.current.contains(e.target as Node)) {
        setAudioMixerOpen(false);
      }
    };
    // Slight delay so the click that opened the mixer doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('pointerdown', handleClick), 50);
    return () => { clearTimeout(t); document.removeEventListener('pointerdown', handleClick); };
  }, [audioMixerOpen]);

  // ── Offline detection ──────────────────────────────────────────────────────
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const on  = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── Message expiry (22 s) ──────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setMessages(p => p.filter(m => Date.now() - m.createdAt < 22000)), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Visual Viewport (keyboard) tracking ───────────────────────────────
  // Tracks how much the virtual keyboard is covering the screen on mobile.
  // When the keyboard opens, `keyboardHeight` becomes positive, letting us push
  // the chat bar exactly above it instead of hiding under it.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport!;
    const update = () => {
      const gap = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardHeight(gap > 50 ? gap : 0); // threshold 50px to avoid false positives
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  const isKeyboardOpen = keyboardHeight > 50;

  // ── Auto-focus chat input when opened ─────────────────────────────────
  // Small delay lets the AnimatePresence mount animation start first so the
  // keyboard doesn't kill the open transition on slower Android devices.
  useEffect(() => {
    if (chatOpen) {
      const t = setTimeout(() => chatInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [chatOpen]);

  // ── Sync total breaks (today + all-time) ─────────────────────────────────
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRef = ref(db, `stats/breaks/${todayStr}`);
    const allRef = ref(db, `stats/breaks/total`);

    const unsubToday = onValue(todayRef, (snapshot) => {
      setTotalBreaksToday(snapshot.val() || 0);
    }, () => {
      setTotalBreaksToday(0);
    });

    const unsubAll = onValue(allRef, (snapshot) => {
      setTotalBreaksAll(snapshot.val() || 0);
    }, () => {
      setTotalBreaksAll(0);
    });

    return () => { unsubToday(); unsubAll(); };
  }, []);

  // ── Firebase Real-time Integration ─────────────────────────────────────────
  // Live room presence counts for room picker (from Firebase lobbies)
  const roomCounts = useRoomCounts();

  // Persistent anonymous user ID — stable across page refreshes on same device.
  // Stored in localStorage so onDisconnect + lobby assignment are consistent.
  const [userId] = useState((): string => {
    if (typeof window === 'undefined') return '';
    const stored = localStorage.getItem('pb_user_id');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    try { localStorage.setItem('pb_user_id', newId); } catch { /* private mode */ }
    return newId;
  });
  const currentRoomRef = useRef<string | null>(null);

  // Join the room location's single shared lobby (no sub-room partitioning yet).
  useEffect(() => {
    if (!currentRoom.id || !userId) return;
    let active = true;

    const joinLobby = async () => {
      const lobbyRef = ref(db, `lobbies/${currentRoom.id}`);
      try {
        await runTransaction(lobbyRef, (lobbyData) => {
          const users = (lobbyData?.users || {}) as Record<string, { joinedAt?: number }>;
          const now = Date.now();
          // Evict zombie entries: users who joined > 2 hours ago without cleanup
          for (const [uid, meta] of Object.entries(users)) {
            const joinedAt = meta?.joinedAt;
            if (joinedAt && now - joinedAt > 2 * 60 * 60 * 1000) delete users[uid];
          }
          users[userId] = { joinedAt: now };
          return { users };
        });

        if (active) {
          currentRoomRef.current = currentRoom.id;
          const userPresenceRef = ref(db, `lobbies/${currentRoom.id}/users/${userId}`);
          onDisconnect(userPresenceRef).remove();
          track('room_joined', { room: currentRoom.id, lang: getUrlLang() ?? 'auto' });
        }
      } catch (err) {
        console.error("Lobby join failed", err);
      }
    };
    joinLobby();

    return () => {
      active = false;
      if (currentRoomRef.current) {
        const userPresenceRef = ref(db, `lobbies/${currentRoom.id}/users/${userId}`);
        remove(userPresenceRef);
      }
    };
  }, [currentRoom.id, userId]);

  // Chat message listener — limitToLast(50) prevents loading entire history on join
  useEffect(() => {
    if (!currentRoom.id) return;
    const messagesRef = ref(db, `rooms/${currentRoom.id}/messages`);
    const messagesQuery = query(messagesRef, limitToLast(50));

    const listener = onChildAdded(messagesQuery, (snapshot) => {
      const parsed = snapshot.val();
      if (!parsed) return;
      // Skip messages that have exceeded their TTL (5 min)
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) return;
      if (parsed.type === 'reaction') {
        // Guard against undefined reactions array (shouldn't happen, but belt-and-suspenders)
        setMessages(p => p.map(m => m.id === parsed.messageId
          ? { ...m, reactions: [...(m.reactions ?? []), parsed.emoji] }
          : m
        ));
      } else {
        setMessages(p => p.some(m => m.id === parsed.id) ? p : [...p.slice(-14), {
          ...parsed,
          reactions: Array.isArray(parsed.reactions) ? parsed.reactions : [], // always initialize
          side: parsed.nickname === nickname ? 'left' : 'right',
        }]);
      }
    });

    return () => { off(messagesQuery, 'child_added', listener); };
  }, [currentRoom.id, nickname]);

  // ── Room change: update mock seed messages ─────────────────────────────────
  const switchRoom = useCallback((room: Room) => {
    setPrevBg(currentRoom.bg);
    setCurrentRoom(room);
    playingYtIdsRef.current.clear();
    setYtPlaying(false);
    setRoomModalOpen(false);
    // Messages reset, room-change effect will re-subscribe to the new lobby's chat
    setMessages([]);
    setSugarAdded(false);
    setSugarRipple(false);
  }, [currentRoom.bg]);

  // Deep-link: open a specific room via `/?room=<id>` (e.g. from /rooms SEO pages
  // or share links). Runs client-side on mount so it survives SSR/hydration.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const stationParam = params.get('station');
    const station = RADIO_STATIONS.find((item) => item.id === stationParam);
    if (station) {
      setRadioStationId(station.id);
      radioStationIdRef.current = station.id;
      if (params.get('radio') === '1') setRadioLibraryOpen(true);
    }
    if (!roomParam) return;
    const target = ROOMS.find((r) => r.id === roomParam);
    if (target && target.id !== currentRoom.id) {
      switchRoom(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Audio init ─────────────────────────────────────────────────────────────
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
      audioCtxRef.current = ctx;
      const bufferSize = ctx.sampleRate * 2;

      // Load Lighting SFX
      fetch('/audio/audiomass-lighter.mp3')
        .then(res => res.arrayBuffer())
        .then(ab => ctx.decodeAudioData(ab))
        .then(buf => lighterBufferRef.current = buf)
        .catch(console.error);

      fetch('/audio/audiomass-matchstick.mp3')
        .then(res => res.arrayBuffer())
        .then(ab => ctx.decodeAudioData(ab))
        .then(buf => matchstickBufferRef.current = buf)
        .catch(console.error);

      // Smoke-blow SFX (released puff / ring whoosh)
      fetch('/audio/smoke-blow.mp3')
        .then(res => res.arrayBuffer())
        .then(ab => ctx.decodeAudioData(ab))
        .then(buf => smokeBlowBufferRef.current = buf)
        .catch(console.error);

      // Crackle (high-pass filtered noise)
      const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const cd = crackleBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        cd[i] = Math.random() > 0.995 ? (Math.random() * 2 - 1) * 2 : (Math.random() * 2 - 1) * 0.1;
      }
      const crackleSource = ctx.createBufferSource();
      crackleSource.buffer = crackleBuffer; crackleSource.loop = true;
      crackleGainRef.current = ctx.createGain(); crackleGainRef.current.gain.value = 0;
      const crackleFilter = ctx.createBiquadFilter(); crackleFilter.type = 'highpass'; crackleFilter.frequency.value = 2000;
      crackleSource.connect(crackleFilter); crackleFilter.connect(crackleGainRef.current); crackleGainRef.current.connect(ctx.destination);
      crackleSource.start();

      // Advanced Multi-Layered Procedural Environment Engine
      // The AmbientEngine component (components/engine/AmbientEngine.tsx) manages
      // all procedural synth nodes via engineRef. We only need the output GainNode here.
      if (!ambientGainRef.current) {
        ambientGainRef.current = ctx.createGain();
        ambientGainRef.current.gain.value = 0;
        ambientGainRef.current.connect(ctx.destination);
        // AmbientEngine component picks up audioCtxRef + ambientGainRef via props
        // and builds the internal graph on its next render cycle.
      }

      // Procedural/Radio music bus
      ambientMusicGainRef.current = ctx.createGain(); ambientMusicGainRef.current.gain.value = 0;
      // Keep the reusable music graph, but leave the filter acoustically open.
      // The previous 600 Hz cutoff removed most vocals and detail from radio.
      ambientLowpassRef.current = ctx.createBiquadFilter(); ambientLowpassRef.current.type = 'lowpass'; ambientLowpassRef.current.frequency.value = 18000;
      ambientMusicGainRef.current.connect(ambientLowpassRef.current); ambientLowpassRef.current.connect(ctx.destination);
      
      // Live Radio (station pickable — defaults to FreeCodeCamp, verified CORS streams)
      if (!radioRef.current) {
        const station = getRadioStation(radioStationIdRef.current);
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.preload = 'none';
        // YouTube playlists are controlled by the official iframe player, not
        // decoded as a direct audio stream. Keep the HTMLAudio graph warm on
        // the default station so switching back to a stream stays instant.
        audio.src = station.source === 'youtube-playlist'
          ? getRadioStation(DEFAULT_RADIO_ID).url
          : station.url;
        radioRef.current = audio;
        audio.addEventListener('loadstart', () => {
          if (musicOnRef.current) setRadioPlaybackState('loading');
        });
        audio.addEventListener('waiting', () => {
          if (musicOnRef.current) setRadioPlaybackState('loading');
        });
        audio.addEventListener('stalled', () => {
          if (musicOnRef.current) setRadioPlaybackState('loading');
        });
        audio.addEventListener('playing', () => setRadioPlaybackState('playing'));
        audio.addEventListener('pause', () => {
          if (!musicOnRef.current) setRadioPlaybackState('paused');
        });
        // If a station genuinely fails to load (offline / unreachable), revert to
        // the previous one. Ignore MEDIA_ERR_ABORTED (code 1) — that fires from
        // our own load() during a station switch, not from a real failure.
        audio.addEventListener('error', () => {
          const code = audio.error?.code ?? 0;
          if (code === 1) return;
          setRadioPlaybackState('error');
          const prevId = radioPrevIdRef.current;
          if (prevId && radioStationIdRef.current !== prevId) {
            radioPrevIdRef.current = null; // prevent revert loops
            const prev = getRadioStation(prevId);
            const failed = getRadioStation(radioStationIdRef.current);
            setRadioStationId(prevId);
            radioStationIdRef.current = prevId;
            audio.src = prev.url;
            audio.load();
            if (musicOnRef.current) {
              const startPlayback = () => {
                setRadioPlaybackState('loading');
                const p = audio.play();
                if (p !== undefined) p.catch(() => {
                  setRadioPlaybackState('blocked');
                  musicOnRef.current = false;
                  setMusicOn(false);
                });
              };
              if (audio.readyState >= 2) startPlayback();
              else {
                audio.addEventListener('canplay', startPlayback, { once: true });
                window.setTimeout(() => { if (audio.paused) startPlayback(); }, 500);
              }
            }
            setRadioToast(`📻 ${failed.name} unreachable — back on ${prev.name}`);
          }
        });
        const radioSource = ctx.createMediaElementSource(audio);
        radioSource.connect(ambientMusicGainRef.current);
      }
    } catch (e) { console.error('Audio init failed', e); }
  }, []);

  const toggleAsmr = useCallback(() => {
    initAudio();
    if (asmrOn) {
      setAsmrOn(false);
      Object.values(ytPlayersRef.current).forEach(player => {
        try { player.pauseVideo(); } catch {}
      });
      playingYtIdsRef.current.clear();
      setYtPlaying(false);
      return;
    }

    if (ambientVolume <= 0 && crackleVolume <= 0) {
      setAmbientVolume(prevAmbientVolumeRef.current || 0.3);
      setCrackleVolume(prevCrackleVolumeRef.current || 0.6);
    }
    setAsmrOn(true);
    if (ambientVolume > 0) {
      Object.values(ytPlayersRef.current).forEach(player => {
        try { player.playVideo(); } catch {}
      });
    }
  }, [asmrOn, initAudio, crackleVolume, ambientVolume]);

  const startYoutubeRadio = useCallback((randomize: boolean) => {
    const station = getRadioStation(radioStationIdRef.current);
    const player = youtubeRadioPlayerRef.current;
    if (station.source !== 'youtube-playlist' || (!station.videoIds?.length && !station.playlistId) || !player || !youtubeRadioReadyRef.current) {
      setYoutubeRadioMounted(true);
      setRadioPlaybackState('loading');
      return false;
    }
    try {
      const audibleVolume = musicVolume > 0 ? musicVolume : (prevMusicVolumeRef.current || 1);
      player.setVolume(musicOnRef.current ? Math.round(Math.min(1, Math.max(0, audibleVolume)) * 100) : 0);
      player.setLoop(true);
      if (randomize || youtubeNeedsRandomStartRef.current) {
        player.setShuffle(true);
        const playlist = player.getPlaylist?.() ?? [];
        if (playlist.length > 0) {
          youtubeNeedsRandomStartRef.current = false;
          player.playVideoAt(Math.floor(Math.random() * playlist.length));
        } else {
          // Cueing is asynchronous. The CUED state handler retries once the
          // official player exposes the playlist.
          if (station.videoIds?.length) player.cuePlaylist(station.videoIds, 0, 0);
          else if (station.playlistId) player.cuePlaylist({ listType: 'playlist', list: station.playlistId, index: 0, startSeconds: 0 });
          return false;
        }
      } else {
        player.playVideo();
        // Calling playVideo on a catalogue that is already advancing silently
        // does not always emit a new PLAYING event. Synchronize the UI now.
        if (player.getPlayerState?.() === 1) {
          setRadioPlaybackState(musicOnRef.current ? 'playing' : 'paused');
        }
      }
      // Some browsers do not emit a new PLAYING event when an already-running
      // muted catalogue is made audible again. Reconcile twice after the
      // command so the UI cannot sit on “Connecting…” while audio is live.
      [250, 1000].forEach((delay) => window.setTimeout(() => {
        if (radioStationIdRef.current !== station.id || !musicOnRef.current) return;
        try {
          const state = player.getPlayerState?.();
          if (state === 1) setRadioPlaybackState('playing');
          else if (state === 2 || state === 5) player.playVideo();
        } catch {}
      }, delay));
      return true;
    } catch {
      setRadioPlaybackState('error');
      return false;
    }
  }, [musicVolume]);
  
  const toggleMusic = useCallback(() => {
    initAudio();
    const audio = radioRef.current;
    const station = getRadioStation(radioStationIdRef.current);
    if (musicOnRef.current) {
      musicOnRef.current = false;
      setMusicOn(false);
      if (station.source === 'youtube-playlist') {
        try {
          youtubeRadioPlayerRef.current?.setVolume(0);
          youtubeRadioPlayerRef.current?.playVideo();
        } catch {}
      } else {
        audio?.pause();
      }
      setRadioPlaybackState('paused');
      return;
    }

    if (musicVolume <= 0) setMusicVolume(prevMusicVolumeRef.current || 1);
    musicOnRef.current = true;
    setMusicOn(true);
    setMobileRadioHidden(false);
    setRadioPlaybackState('loading');
    if (audioCtxRef.current?.state === 'suspended') void audioCtxRef.current.resume();
    if (station.source === 'youtube-playlist') {
      setYoutubeRadioMounted(true);
      startYoutubeRadio(youtubeNeedsRandomStartRef.current);
      return;
    }
    const playPromise = audio?.play();
    if (playPromise !== undefined) {
      playPromise.catch((error: DOMException) => {
        if (error.name === 'AbortError') return;
        musicOnRef.current = false;
        setMusicOn(false);
        setRadioPlaybackState(error.name === 'NotAllowedError' ? 'blocked' : 'error');
      });
    }
  }, [initAudio, musicVolume, startYoutubeRadio]);

  const updateAmbientVolume = useCallback((rawLevel: number) => {
    initAudio();
    const level = Math.min(1, Math.max(0, rawLevel));
    setAmbientVolume(level);
    if (level > 0) {
      prevAmbientVolumeRef.current = level;
      if (!asmrOn) {
        setAsmrOn(true);
        Object.values(ytPlayersRef.current).forEach(player => {
          try { player.playVideo(); } catch {}
        });
      }
    } else if (crackleVolume <= 0) {
      setAsmrOn(false);
    }
  }, [asmrOn, crackleVolume, initAudio]);

  const updateCrackleVolume = useCallback((rawLevel: number) => {
    initAudio();
    const level = Math.min(1, Math.max(0, rawLevel));
    setCrackleVolume(level);
    if (level > 0) {
      prevCrackleVolumeRef.current = level;
      if (!asmrOn) setAsmrOn(true);
    } else if (ambientVolume <= 0) {
      setAsmrOn(false);
      Object.values(ytPlayersRef.current).forEach(player => {
        try { player.pauseVideo(); } catch {}
      });
    }
  }, [ambientVolume, asmrOn, initAudio]);

  const updateMusicVolume = useCallback((rawLevel: number) => {
    initAudio();
    const level = Math.min(1, Math.max(0, rawLevel));
    const station = getRadioStation(radioStationIdRef.current);
    setMusicVolume(level);
    if (level > 0) {
      prevMusicVolumeRef.current = level;
      if (station.source === 'youtube-playlist') {
        try { youtubeRadioPlayerRef.current?.setVolume(Math.round(level * 100)); } catch {}
      }
      if (!musicOnRef.current) {
        musicOnRef.current = true;
        setMusicOn(true);
        setMobileRadioHidden(false);
        setRadioPlaybackState('loading');
        if (station.source === 'youtube-playlist') {
          setYoutubeRadioMounted(true);
          startYoutubeRadio(youtubeNeedsRandomStartRef.current);
          return;
        }
        const playPromise = radioRef.current?.play();
        if (playPromise !== undefined) {
          playPromise.catch((error: DOMException) => {
            if (error.name === 'AbortError') return;
            musicOnRef.current = false;
            setMusicOn(false);
            setRadioPlaybackState(error.name === 'NotAllowedError' ? 'blocked' : 'error');
          });
        }
      }
    } else {
      musicOnRef.current = false;
      setMusicOn(false);
      if (station.source === 'youtube-playlist') {
        try {
          youtubeRadioPlayerRef.current?.setVolume(0);
          youtubeRadioPlayerRef.current?.playVideo();
        } catch {}
      } else {
        radioRef.current?.pause();
      }
      setRadioPlaybackState('paused');
    }
  }, [initAudio, startYoutubeRadio]);

  // ── Switch live-radio station ────────────────────────────────────────────
  const switchRadioStation = useCallback((id: string) => {
    const station = getRadioStation(id);
    if (id === radioStationIdRef.current) return; // already tuned in
    radioPrevIdRef.current = radioStationIdRef.current;
    radioStationIdRef.current = id;
    setRadioStationId(id);
    setMobileRadioHidden(false);
    const audio = radioRef.current;
    try { youtubeRadioPlayerRef.current?.pauseVideo(); } catch {}
    youtubeNeedsRandomStartRef.current = station.source === 'youtube-playlist';
    if (station.source === 'youtube-playlist') {
      audio?.pause();
      setYoutubeRadioMounted(true);
      setRadioPlaybackState(musicOnRef.current ? 'loading' : 'paused');
      if (musicOnRef.current) startYoutubeRadio(true);
      setRadioToast(`📻 ${station.name} — shuffled from YouTube Music`);
      return;
    }
    if (audio) {
      setRadioPlaybackState(musicOnRef.current ? 'loading' : 'paused');
      audio.src = station.url;
      audio.load();
      // Resume playback as soon as the new stream can play (if music was on).
      if (musicOnRef.current) {
        const startPlayback = () => {
          setRadioPlaybackState('loading');
          const p = audio.play();
          if (p !== undefined) p.catch((error: DOMException) => {
            if (error.name === 'AbortError') return;
            musicOnRef.current = false;
            setMusicOn(false);
            setRadioPlaybackState(error.name === 'NotAllowedError' ? 'blocked' : 'error');
          });
        };
        if (audio.readyState >= 2) startPlayback();
        else {
          audio.addEventListener('canplay', startPlayback, { once: true });
          window.setTimeout(() => { if (audio.paused) startPlayback(); }, 500);
        }
      }
    } else {
      initAudio();
    }
    setRadioToast(`📻 ${station.name} — ${station.region} · ${station.tagline}`);
  }, [initAudio, startYoutubeRadio]);

  // ── Procedural note ───────────────────────────────────────────────────────
  const playNote = useCallback(() => {
    if (!audioCtxRef.current || !ambientMusicGainRef.current) return;
    const ctx = audioCtxRef.current;
    const scale = AUDIO_SCALES[currentRoom.audioScale] ?? AUDIO_SCALES.office;
    if (!scale.length) return;
    const baseFreq = scale[Math.floor(Math.random() * scale.length)];
    const freq = baseFreq * (Math.random() > 0.5 ? 2 : 1);
    
    // Layered oscillators for a rich, beautiful pad sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator(); // Sub bass

    osc1.type = currentRoom.audioScale === 'cyber' ? 'sawtooth' : 'sine';
    osc2.type = currentRoom.audioScale === 'cyber' ? 'square' : 'triangle';
    osc3.type = 'sine';

    // Detune for chorus effect and depth
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.006; 
    osc3.frequency.value = freq / 2; // One octave down

    const gain = ctx.createGain();
    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(ambientMusicGainRef.current);
    
    const now = ctx.currentTime;
    // Slower, lusher envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 3.5);
    gain.gain.linearRampToValueAtTime(0, now + 9);
    
    osc1.start(now); osc1.stop(now + 9);
    osc2.start(now); osc2.stop(now + 9);
    osc3.start(now); osc3.stop(now + 9);
  }, [currentRoom.audioScale]);

  // ── ASMR & Music controller ────────────────────────────────────────────────
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const isChai = currentRoom.id === 'chai';
    const activeAsmr = asmrOn;
    const activeCrackle = isLit && !isFinished && asmrOn;
    const activeMusic = musicOn;

    if (activeAsmr || activeMusic || activeCrackle) {
      if (ctx.state === 'suspended') ctx.resume();
    }

    if (asmrOn && ambientVolume > 0) {
      currentRoom.ytIds.forEach(id => {
        const player = ytPlayersRef.current[id];
        if (player) {
          try {
            player.playVideo();
            const volumeMultiplier = (currentRoom.ytIds.length > 1 ? 0.6 : 1) * (currentRoom.ytVol || 1);
            player.setVolume(Math.min(100, ambientVolume * 100 * volumeMultiplier));
          } catch (e) {
            // Player might be destroyed or loading
          }
        }
      });
    } else {
      currentRoom.ytIds.forEach(id => {
        const player = ytPlayersRef.current[id];
        if (player) {
          try {
            player.pauseVideo();
          } catch (e) {
            // Player might be destroyed
          }
        }
      });
    }
    
    if (activeCrackle) {
      crackleGainRef.current?.gain.setTargetAtTime(isChai ? 0 : (isPuffing ? 0.45 : 0.08) * crackleVolume, ctx.currentTime, 0.1);
    } else {
      crackleGainRef.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    }

    const selectedRadio = getRadioStation(radioStationIdRef.current);
    if (activeMusic && selectedRadio.source === 'youtube-playlist') {
      // YouTube audio is mixed through the official iframe player. Keep the
      // direct-stream Web Audio bus silent so both sources can never overlap.
      ambientMusicGainRef.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      radioRef.current?.pause();
      try { youtubeRadioPlayerRef.current?.setVolume(Math.round(musicVolume * 100)); } catch {}
      startYoutubeRadio(youtubeNeedsRandomStartRef.current);
    } else if (activeMusic) {
      try { youtubeRadioPlayerRef.current?.pauseVideo(); } catch {}
      ambientMusicGainRef.current?.gain.setTargetAtTime(musicVolume, ctx.currentTime, 0.35);
      if (radioRef.current && radioRef.current.paused) {
        setRadioPlaybackState('loading');
        const playPromise = radioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name === 'AbortError') return;
            musicOnRef.current = false;
            setMusicOn(false);
            setRadioPlaybackState(e.name === 'NotAllowedError' ? 'blocked' : 'error');
          });
        }
      }
    } else {
      ambientMusicGainRef.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      if (selectedRadio.source === 'youtube-playlist') {
        // A catalogue behaves like a broadcast: turning it off mutes the
        // current sequence but does not freeze time. It resumes wherever the
        // silent playback has reached.
        try {
          youtubeRadioPlayerRef.current?.setVolume(0);
          if (youtubeRadioPlayerRef.current?.getPlayerState?.() === 1) youtubeRadioPlayerRef.current.playVideo();
        } catch {}
      } else {
        try { youtubeRadioPlayerRef.current?.pauseVideo(); } catch {}
      }
      if (radioRef.current && !radioRef.current.paused) {
        radioRef.current.pause();
      }
    }
    
    return () => { if (musicIntervalRef.current) { clearInterval(musicIntervalRef.current); musicIntervalRef.current = null; } };
  }, [isLit, isFinished, asmrOn, musicOn, currentRoom.id, currentRoom.ytIds, currentRoom.ytVol, crackleVolume, ambientVolume, musicVolume, isPuffing, playNote, startYoutubeRadio]);

  // ── Global Audio Context Unlock ───────────────────────────────────────────
  useEffect(() => {
    const handleGlobalInteraction = () => {
      initAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      document.removeEventListener('pointerdown', handleGlobalInteraction);
      document.removeEventListener('keydown', handleGlobalInteraction);
    };
    document.addEventListener('pointerdown', handleGlobalInteraction);
    document.addEventListener('keydown', handleGlobalInteraction);
    return () => {
      document.removeEventListener('pointerdown', handleGlobalInteraction);
      document.removeEventListener('keydown', handleGlobalInteraction);
    };
  }, [initAudio]);

  // ── Global Unmount Cleanup ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      ignitionHeldRef.current = false;
      ignitionTokenRef.current += 1;
      if (ignitionIntentTimerRef.current) clearTimeout(ignitionIntentTimerRef.current);
      if (lightTimerRef.current) clearTimeout(lightTimerRef.current);
      if (lightIntervalRef.current) clearInterval(lightIntervalRef.current);
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
      if (retreatTimerRef.current) clearTimeout(retreatTimerRef.current);
      if (matchFlameTimerRef.current) clearTimeout(matchFlameTimerRef.current);
      if (blowDuckTimerRef.current !== null) clearTimeout(blowDuckTimerRef.current);
      if (currentSfxSourceRef.current) {
        try { currentSfxSourceRef.current.stop(); } catch {}
        currentSfxSourceRef.current = null;
      }
      if (radioRef.current) {
        radioRef.current.pause();
        radioRef.current.src = '';
        radioRef.current = null;
      }
    };
  }, []);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setIsLit(false); setProgress(0); setLastTapProgress(0); setIsFinished(false); setElapsedTimeMs(0);
    setGlow(0); setIsCharging(false); setIsPuffing(false); setLightingPhase('idle');
    setFilterHoldIntensity(0);
    displayLastTapRef.current = 0;
    particlesRef.current = [];
    // A new break means the user moved on — hide the (still optional) survey.
    dismissSurvey();
    setSugarAdded(false);
    setSugarRipple(false);
  }, [dismissSurvey]);

  // ── Clink chai ────────────────────────────────────────────────────────────
  const clinkChai = useCallback(() => {
    vibrate([50, 30, 50]);
    if (emberRef.current) {
      const rect = emberRef.current.getBoundingClientRect();
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push({
          id: Math.random(), type: 'weather', wType: 'rain',
          x: rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width,
          y: rect.top, vx: (Math.random() - 0.5) * 4, vy: -3 - Math.random() * 4,
          life: 40, maxLife: 40, size: 2 + Math.random() * 2, phase: 0,
        });
      }
    }
    const ctx = audioCtxRef.current;
    if (ctx) {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2500, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.3);
    }
  }, [vibrate]);

  // ── Tap ash / wash cup ────────────────────────────────────────────────────
  const tapAsh = useCallback(() => {
    if (progress <= lastTapProgress || isFinished || !isLit || isStealth) return;
    if (currentRoom.id === 'chai') return;
    vibrate(50); setLastTapProgress(progress);
    if (emberRef.current) {
      const rect = emberRef.current.getBoundingClientRect();
      for (let i = 0; i < 15; i++) {
        particlesRef.current.push({
          id: Math.random(), type: 'ash',
          x: rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width,
          y: rect.top, vx: (Math.random() - 0.5) * 4, vy: -2 - Math.random() * 3,
          life: 60, maxLife: 60, size: 2 + Math.random() * 2, phase: 0,
          rotation: Math.random() * 360, rotV: (Math.random() - 0.5) * 20,
        });
      }
    }
    if (audioCtxRef.current && asmrOn) {
      const baseCrackle = 0.08 * crackleVolume;
      const spikeCrackle = Math.min(1.0, 0.25 * crackleVolume);
      crackleGainRef.current?.gain.setTargetAtTime(spikeCrackle, audioCtxRef.current.currentTime, 0.05);
      crackleGainRef.current?.gain.setTargetAtTime(baseCrackle, audioCtxRef.current.currentTime + 0.1, 0.2);
    }
  }, [progress, lastTapProgress, isFinished, isLit, isStealth, currentRoom.id, vibrate, asmrOn, crackleVolume]);

  // ── Puffing ref sync ──────────────────────────────────────────────────────
  const isPuffingRef = useRef(false);
  useEffect(() => { isPuffingRef.current = isPuffing; }, [isPuffing]);

  const tapAshRef = useRef(tapAsh);
  useEffect(() => { tapAshRef.current = tapAsh; }, [tapAsh]);

  // ── Burn loop ─────────────────────────────────────────────────────────────
  const lastTapProgressRef = useRef(lastTapProgress);
  lastTapProgressRef.current = lastTapProgress;

  useEffect(() => {
    if (!isLit || isFinished) return;
    let frame: number;
    let lastTime = Date.now();
    let vt = progress * breakSeconds * 1000;
    const update = () => {
      const now = Date.now(); const delta = now - lastTime; lastTime = now;
      const isChai = currentRoom.id === 'chai';
      // Puffing (holding filter while lit) burns faster
      const speed = (!isChai && isPuffingRef.current) ? 1.5 : 1;
      vt += delta * speed;
      const np = Math.min(vt / (breakSeconds * 1000), 1);
      setProgress(np);
      setElapsedTimeMs(prev => prev + delta);
      
      if (displayLastTapRef.current < lastTapProgressRef.current) {
        displayLastTapRef.current += (lastTapProgressRef.current - displayLastTapRef.current) * (delta / 80);
        if (lastTapProgressRef.current - displayLastTapRef.current < 0.001) displayLastTapRef.current = lastTapProgressRef.current;
      }

      // Automatic wind ash drop
      const accumulatedAsh = np - displayLastTapRef.current;
      // High wind (>0.3) makes ash fall easily, low wind requires more ash
      const maxAshCapacity = Math.max(0.08, 0.45 - (currentRoom.wind || 0) * 0.4);
      if (!isChai && accumulatedAsh > maxAshCapacity && Math.random() < 0.02) {
        tapAshRef.current();
      }
      
      if (np >= 1) { 
        setIsFinished(true); 
        setLastTapProgress(1); 
        displayLastTapRef.current = 1; 
        vibrate([300, 100, 300]); 

        // Safely record completed break in Firebase (today + all-time)
        const todayStr = new Date().toISOString().split('T')[0];
        runTransaction(ref(db, `stats/breaks/${todayStr}`), (count) => (count || 0) + 1).catch(() => {});
        runTransaction(ref(db, `stats/breaks/total`), (count) => (count || 0) + 1).catch(() => {});
        track('break_completed', { room: currentRoom.id, is_chai: currentRoom.id === 'chai' ? '1' : '0' });
      }
      else frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLit, isFinished, currentRoom.id, breakSeconds]);

  // ── Craving Check trigger — softly ask after a break completes ────────────
  // Only when the break *finishes*, the user isn't in stealth/zen, and this
  // session hasn't answered yet. Delayed slightly so it never feels abrupt.
  const prevFinishedRef = useRef(false);
  useEffect(() => {
    if (isFinished && !prevFinishedRef.current) {
      prevFinishedRef.current = true;
      if (!isStealth && !isZenMode) {
        const t = setTimeout(openSurvey, 1500);
        return () => clearTimeout(t);
      }
    } else if (!isFinished) {
      prevFinishedRef.current = false;
    }
  }, [isFinished, isStealth, isZenMode, openSurvey]);


  // ── Canvas render loop ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();

    const onMove  = (e: PointerEvent) => { lastPtrXRef.current = pointerXRef.current; lastPtrYRef.current = pointerYRef.current; pointerXRef.current = e.clientX; pointerYRef.current = e.clientY; };
    const onDown  = (e: PointerEvent) => { pointerXRef.current = e.clientX; pointerYRef.current = e.clientY; lastPtrXRef.current = e.clientX; lastPtrYRef.current = e.clientY; ptrDownRef.current = true; };
    const onUp    = () => { ptrDownRef.current = false; pointerXRef.current = -1000; pointerYRef.current = -1000; };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointerleave', onUp);

    let frameId: number;
    let lastRenderTime = Date.now();

    const render = () => {
      const now = Date.now(); const delta = now - lastRenderTime; lastRenderTime = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smoke trails
      smokeTrailsRef.current.forEach(t => {
        t.life -= delta * 0.0001;
        if (t.life > 0) {
          ctx.fillStyle = `rgba(180,180,180,${t.life * 0.06})`;
          ctx.beginPath();
          ctx.ellipse(t.x, t.y, 22 + (1 - t.life) * 45, 16 + (1 - t.life) * 32, t.life * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      smokeTrailsRef.current = smokeTrailsRef.current.filter(t => t.life > 0);

      // Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life--;
        if (p.life <= 0) { particlesRef.current.splice(i, 1); continue; }
        const lr = p.life / p.maxLife;



        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;

        if (p.type === 'smoke') {
          // Turbulence-driven movement — more organic drift
          const t = now / 1000;
          const turbX = Math.sin(t * 0.7 + (p.turbPhase ?? 0)) * 0.5
                      + Math.sin(t * 1.9 + (p.turbPhase ?? 0) * 1.7) * 0.25;
          const turbY = Math.cos(t * 0.5 + (p.turbPhase ?? 0)) * 0.12;
          p.x += p.vx + turbX + Math.sin(p.phase + (1 - lr) * 5) * 0.25;
          p.y += p.vy + turbY;
          // Cap size growth to prevent massive dense blobs
          if (p.size < 35) p.size += lr > 0.6 ? 0.2 : 0.05;
          // Maintain vertical velocity so it doesn't get stuck
          p.vx *= 0.988; 
          p.phase += 0.012;
          drawSmokeParticle(ctx, p, 1.0);

        } else if (p.type === 'exhale') {
          // Exhale puff — falls gently from filter then diffuses
          const t = now / 1000;
          const turbX = Math.sin(t * 1.1 + (p.turbPhase ?? 0)) * 0.6;
          p.x += p.vx + turbX;
          p.y += p.vy;
          p.vy *= 0.96; // decelerate
          p.vx *= 0.97;
          // Exhale grows a bit bigger than normal smoke
          p.size += lr > 0.5 ? 0.7 : 0.3;
          p.phase += 0.018;
          drawSmokeParticle(ctx, p, 0.9);

        } else if (p.type === 'steam') {
          const t = now / 1000;
          p.x += p.vx + Math.sin(t + p.phase) * 0.4;
          p.y += p.vy; p.size += 0.5; p.vx *= 0.99;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(220,220,220,${lr * 0.12})`);
          grad.addColorStop(1, `rgba(220,220,220,0)`);
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();

        } else if (p.type === 'puffRing') {
          // Thick, blurry smoke ring with no perfect edge
          p.size += 0.08;
          p.y += p.vy; p.vy *= 0.98;
          p.x += p.vx;
          
          const ellR = p.size;
          
          ctx.save();
          ctx.translate(p.x, p.y);
          
          const peakAlpha = lr * 0.45; // Darker, thicker smoke
          
          const grad = ctx.createRadialGradient(0, 0, ellR * 0.4, 0, 0, ellR * 1.4);
          grad.addColorStop(0, `rgba(200,205,210,0)`);
          grad.addColorStop(0.5, `rgba(200,205,210,${peakAlpha * 0.6})`);
          grad.addColorStop(0.7, `rgba(200,205,210,${peakAlpha * 0.9})`);
          grad.addColorStop(0.85, `rgba(200,205,210,${peakAlpha * 0.4})`);
          grad.addColorStop(1, `rgba(200,205,210,0)`);
          
          ctx.fillStyle = grad;
          ctx.filter = 'blur(6px)'; // Heavy blur for "no perfect edge"
          ctx.beginPath();
          // Full circle, not flattened
          ctx.ellipse(0, 0, ellR * 1.4, ellR * 1.4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (p.type === 'donut') {
          // Donut rings are now DOM-based (see smokeRings state)
          // Remove canvas donut particles immediately
          p.life = 0;

        } else if (p.type === 'ash') {
          p.x += p.vx; p.vy += 0.2; p.y += p.vy;
          if (p.rotation !== undefined && p.rotV !== undefined) p.rotation += p.rotV;
          ctx.save(); ctx.translate(p.x, p.y);
          if (p.rotation) ctx.rotate(p.rotation * Math.PI / 180);
          ctx.fillStyle = `rgba(136,136,136,${lr})`;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();

        } else if (p.type === 'weather') {
          p.x += p.vx; p.y += p.vy;
          if (p.wType === 'rain') {
            ctx.strokeStyle = `rgba(150,200,255,${lr * 0.45})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx, p.y + p.vy * 2); ctx.stroke();
          } else if (p.wType === 'stars') {
            ctx.fillStyle = `rgba(255,255,255,${Math.abs(Math.sin(p.phase)) * lr})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); p.phase += 0.05;
          } else if (p.wType === 'dust') {
            const dustGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            dustGrad.addColorStop(0, `rgba(200,180,150,${lr * 0.3})`);
            dustGrad.addColorStop(1, `rgba(200,180,150,0)`);
            ctx.fillStyle = dustGrad;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            p.x += Math.sin(p.phase) * 0.5; p.phase += 0.02;
          } else if (p.wType === 'leaves') {
            ctx.save(); ctx.translate(p.x, p.y);
            p.rotation = (p.rotation ?? 0) + (p.rotV ?? 2); ctx.rotate((p.rotation) * Math.PI / 180);
            ctx.fillStyle = `rgba(180,100,50,${lr * 0.6})`;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
            ctx.restore(); p.x += Math.sin(p.phase) * 1.5; p.phase += 0.05;
          }
        }
      }
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => {
      window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointerleave', onUp); cancelAnimationFrame(frameId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Particle emission ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLit || isFinished || isStealth) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isChai = currentRoom.id === 'chai';
    let nextSmokeTime = 0;
    const id = setInterval(() => {
      const targetType = isChai ? 'steam' : 'smoke';
      const pCount = particlesRef.current.filter(p => p.type === targetType).length;
      const maxP = isChai ? 30 : (isPuffingRef.current ? 60 : 40); // Increased ambient max particles from 10 to 40
      
      let emits = 0;
      if (isChai) {
        emits = Math.random() > 0.4 ? 1 : 0;
      } else if (isPuffingRef.current) {
        emits = 2;
      } else {
        // Constant running ambient smoke
        emits = Math.random() > 0.5 ? 1 : 0;
      }

      if (pCount < maxP && emberRef.current) {
        const rect = ashTopRef.current ? ashTopRef.current.getBoundingClientRect() : emberRef.current.getBoundingClientRect();
        const filterRect = filterRef.current?.getBoundingClientRect();
        const baseWind = currentRoom.wind; const windV = Math.sin(Date.now() / 5000) * 0.5;
        for (let i = 0; i < emits; i++) {
          // Warm color near tip, cools as it rises
          const colorShift = 0.55 + Math.random() * 0.35;
          particlesRef.current.push({
            id: Math.random(), type: targetType,
            x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 5,
            y: rect.top - (isChai ? 2 : 12),
            vx: baseWind + windV + (Math.random() - 0.5) * 0.5,
            vy: isChai ? -0.4 - Math.random() * 0.4 : -0.2 - Math.random() * 0.2 - (isPuffingRef.current ? 0.3 : 0),
            life: isChai ? 120 + Math.random() * 60 : 800 + Math.random() * 400,
            maxLife: isChai ? 180 : 1200,
            size: isChai ? 8 + Math.random() * 8 : 40 + Math.random() * 30,
            phase: Math.random() * Math.PI * 2,
            turbPhase: Math.random() * Math.PI * 2,
            colorShift,
          });
        }
      }
      // Weather particles
      if (currentRoom.weather) {
        const wCount = particlesRef.current.filter(p => p.type === 'weather').length;
        if (wCount < 45 && Math.random() > 0.5) {
          const wType = currentRoom.weather!;
          let vx = currentRoom.wind + (Math.random() - 0.5);
          let vy = 1 + Math.random() * 2; let x = Math.random() * window.innerWidth; let y = -20;
          let maxLife = 300; let size = 2;
          if (wType === 'stars') { vx = 0; vy = 0; x = Math.random() * window.innerWidth; y = Math.random() * window.innerHeight; maxLife = 100 + Math.random() * 200; size = Math.random() * 1.5; }
          else if (wType === 'dust') { vy = (Math.random() - 0.5) * 0.5; x = Math.random() * window.innerWidth; y = Math.random() * window.innerHeight; size = Math.random() * 2; }
          else if (wType === 'leaves') { size = 5 + Math.random() * 5; }
          particlesRef.current.push({ id: Math.random(), type: 'weather', wType, x, y, vx, vy, life: maxLife, maxLife, size, phase: Math.random() * Math.PI * 2, rotation: Math.random() * 360, rotV: (Math.random() - 0.5) * 5 });
        }
      }
    }, isChai ? 250 : 140);
    return () => clearInterval(id);
  }, [isLit, isFinished, isStealth, currentRoom.id, currentRoom.wind, currentRoom.weather]);

  // ── Shake detection ───────────────────────────────────────────────────────
  useEffect(() => {
    let lastUpdate = 0;
    const handleMotion = (e: DeviceMotionEvent) => {
      const now = Date.now(); if (now - lastUpdate < 300) return;
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2);
      if (mag > 15) { lastUpdate = now; currentRoom.id === 'chai' ? clinkChai() : tapAsh(); }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [tapAsh, clinkChai, currentRoom.id]);

  // ── Spawn exhale puff ring ───────────────────────────────
  const spawnExhalePuff = useCallback((intensity: number) => {
    if (!filterRef.current) return;
    const rect = filterRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.bottom + 10; // slightly below the filter to look natural
    
    // Puff ring — a proper expanding torus, blurry and no perfect edge
    particlesRef.current.push({
      id: Math.random(), type: 'puffRing',
      x: cx, y: cy,
      vx: (Math.random() - 0.5) * 0.5, vy: 1.5 + intensity * 1.5,
      life: 140 + Math.round(intensity * 80),
      maxLife: 220,
      size: 15 + intensity * 20,
      phase: 0,
      turbPhase: Math.random() * Math.PI * 2,
    });

    vibrate(intensity > 0.5 ? [80, 30, 60] : [40]);
  }, [vibrate]);

  // ── Pointer down on main element ──────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    initAudio();
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    if (isStealth) return;
    pointerDownTimeRef.current = Date.now();

    // Chai hold-to-sip
    if (currentRoom.id === 'chai' && isLit && !isFinished) {
      chaiHoldingRef.current = true;
      setIsPuffing(true);
      return;
    }

    if (!isLit && !isFinished) {
      if (currentRoom.id === 'chai') {
        setIsLit(true);
        vibrate([150]);
        return;
      }
      const ignitionToken = ++ignitionTokenRef.current;
      ignitionHeldRef.current = true;
      ignitionStartedRef.current = false;
      setIsCharging(true);

      // A short pointer contact can be a scroll, a missed tap, or a hover-device
      // transition. Do not begin the visual/audio ritual until the user has
      // intentionally held the cigarette for a beat.
      ignitionIntentTimerRef.current = setTimeout(() => {
        if (!ignitionHeldRef.current || ignitionTokenRef.current !== ignitionToken) return;
        ignitionStartedRef.current = true;
        const useMatch = igniterType === 'match';

      /*
       * LIGHTER AUDIO BREAKDOWN (from waveform analysis):
       *   0.000s → 0.250s  =  Cap open click
       *   0.500s → 1.240s  =  Flint strike + flame ignition
       *   1.900s → 2.407s  =  Cap close clack
       *
       * MATCHSTICK AUDIO BREAKDOWN:
       *   0.000s → 2.250s  =  Scraping/striking
       *   2.251s            =  Ignition point (flame appears)
       *
       * ANIMATION PHASES:
       *   Lighter:  approach(0-150ms) → open(150-350ms) → strike(350ms-1240ms) → lit!
       *   Match:    approach(0-150ms) → strike(150-2251ms) → flame(2251ms) → lit!
       */

      // ── Robust async audio player — works even if buffer isn't ready yet ──
      const tryPlaySfx = async (bufferRef: React.MutableRefObject<AudioBuffer | null>, url: string) => {
        const ctx = audioCtxRef.current;
        if (!ctx || !ignitionHeldRef.current || ignitionTokenRef.current !== ignitionToken) return;
        let buf = bufferRef.current;
        if (!buf) {
          try {
            const ab = await fetch(url).then(r => r.arrayBuffer());
            buf = await ctx.decodeAudioData(ab);
            bufferRef.current = buf;
          } catch { return; }
        }
        // The fetch/decode can finish after a pointer was released. The token
        // prevents that stale async completion from playing a "random" strike.
        if (!ignitionHeldRef.current || ignitionTokenRef.current !== ignitionToken) return;
        const source = ctx.createBufferSource();
        source.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = Math.max(crackleVolume, 0.5) * 2;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
        currentSfxSourceRef.current = source;
      };

      // Phase 1: Approach — igniter slides in
      setLightingPhase('approach');

      if (useMatch) {
        // ── MATCHBOX SEQUENCE ──
        setLightingPhase('approachBox'); // 0ms: Slide in box
        tryPlaySfx(matchstickBufferRef, '/audio/audiomass-matchstick.mp3');
        
        setTimeout(() => { if (ignitionTokenRef.current === ignitionToken) setLightingPhase('openBox'); }, 300); // 300ms: Drawer opens
        
        setTimeout(() => { if (ignitionTokenRef.current === ignitionToken) setLightingPhase('extractMatch'); }, 800); // 800ms: Match lifts out
        
        setTimeout(() => { if (ignitionTokenRef.current === ignitionToken) setLightingPhase('strike'); }, 1500); // 1500ms: Match sweeps against striking strip
        
        // Flame appears at exactly 2.251s when the real ignition sound hits
        matchFlameTimerRef.current = setTimeout(() => {
          setLightingPhase('lit'); // 2251ms: Flame erupts, box disappears, match approaches tip
        }, 2251);
        
        // Glow animation stretches to fill 2251ms
        let currentGlow = 0;
        const ticks = 2251 / 40;
        const glowIncrement = 1 / ticks;
        lightIntervalRef.current = setInterval(() => {
          currentGlow += glowIncrement;
          setGlow(Math.min(currentGlow, 1));
        }, 40);

        // Cigarette lights at 2251ms
        lightTimerRef.current = setTimeout(() => {
          if (lightIntervalRef.current) clearInterval(lightIntervalRef.current);
          setIsLit(true); setIsCharging(false);
          vibrate([150, 50, 150]);
          
          // Spawn thick smoke for realism at the tip
          if (emberRef.current) {
            const rect = emberRef.current.getBoundingClientRect();
            for (let i = 0; i < 15; i++) {
              particlesRef.current.push({
                id: Math.random(), type: 'smoke',
                x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 20,
                y: rect.top,
                vx: (Math.random() - 0.5) * 0.5, vy: -1.5 - Math.random(),
                life: 60 + Math.random() * 40, maxLife: 100, size: 25 + Math.random() * 15, phase: Math.random() * Math.PI * 2
              });
            }
          }
          
          // Let the match flame burn for 1400ms before retreating
          closingTimerRef.current = setTimeout(() => {
            setLightingPhase('retreat');
            retreatTimerRef.current = setTimeout(() => setLightingPhase('idle'), 400);
          }, 1400);
        }, 2251);
      } else {
        // ── LIGHTER SEQUENCE ──
        tryPlaySfx(lighterBufferRef, '/audio/audiomass-lighter.mp3');

        // Phase 2: Cap open at 150ms (synced to the cap click at ~0.25s in audio)
        setTimeout(() => { if (ignitionTokenRef.current === ignitionToken) setLightingPhase('open'); }, 150);

        // Phase 3: Strike + flame at 500ms (synced to flint strike at ~0.5s)
        setTimeout(() => { if (ignitionTokenRef.current === ignitionToken) setLightingPhase('strike'); }, 500);

        // Glow fills 0 → 1 across the 1240ms total
        let currentGlow = 0;
        const ticks = 1240 / 40;
        const glowIncrement = 1 / ticks;
        lightIntervalRef.current = setInterval(() => {
          currentGlow += glowIncrement;
          setGlow(Math.min(currentGlow, 1));
        }, 40);

        // Cigarette lights at 1240ms (flame fully established by this point in audio)
        lightTimerRef.current = setTimeout(() => {
          if (lightIntervalRef.current) clearInterval(lightIntervalRef.current);
          setIsLit(true); setIsCharging(false);
          vibrate([150, 50, 150]);

          // Play the closing clack from the audio at the 1.9s mark
          if (audioCtxRef.current && lighterBufferRef.current) {
            if (currentSfxSourceRef.current) {
              try { currentSfxSourceRef.current.stop(); } catch(e) {}
            }
            const closeSource = audioCtxRef.current.createBufferSource();
            closeSource.buffer = lighterBufferRef.current;
            const gain = audioCtxRef.current.createGain();
            gain.gain.value = crackleVolume * 2;
            closeSource.connect(gain);
            gain.connect(audioCtxRef.current.destination);
            closeSource.start(0, 1.9);
          }

          // Visual: closing phase (cap closes)
          setLightingPhase('closing');
          closingTimerRef.current = setTimeout(() => {
            // Retreat — lighter slides out
            setLightingPhase('retreat');
            retreatTimerRef.current = setTimeout(() => setLightingPhase('idle'), 400);
          }, 500); // Close animation lasts 500ms
        }, 1240);
      }
      }, 180);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isStealth) return;
    ignitionHeldRef.current = false;
    ignitionTokenRef.current += 1;
    if (ignitionIntentTimerRef.current) {
      clearTimeout(ignitionIntentTimerRef.current);
      ignitionIntentTimerRef.current = null;
    }
    chaiHoldingRef.current = false;
    setIsPuffing(false);
    const duration = Date.now() - pointerDownTimeRef.current;
    if (!isLit && !isFinished) {
      // Clear ALL timers
      if (lightTimerRef.current) clearTimeout(lightTimerRef.current);
      if (lightIntervalRef.current) clearInterval(lightIntervalRef.current);
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
      if (retreatTimerRef.current) clearTimeout(retreatTimerRef.current);
      if (matchFlameTimerRef.current) clearTimeout(matchFlameTimerRef.current);
      
      // Cut the lighting sound
      if (currentSfxSourceRef.current) {
        try { currentSfxSourceRef.current.stop(); } catch(e) {}
        currentSfxSourceRef.current = null;
      }

      // If lighter, play closing clack even on abort
      if (ignitionStartedRef.current && duration >= 180 && igniterType === 'lighter' && audioCtxRef.current && lighterBufferRef.current) {
        const closeSource = audioCtxRef.current.createBufferSource();
        closeSource.buffer = lighterBufferRef.current;
        const gain = audioCtxRef.current.createGain();
        gain.gain.value = crackleVolume * 2;
        closeSource.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        closeSource.start(0, 1.9);
      }

      // Visual retreat before fully hiding
      setLightingPhase('retreat');
      setTimeout(() => setLightingPhase('idle'), 300);
      
      setGlow(0); setIsCharging(false);
      ignitionStartedRef.current = false;
    }
    if (duration < 250) {
      const now = Date.now();
      if (now - lastTapRef.current < 400) {
        if (currentRoom.id === 'chai') {
          if (isFinished) { reset(); vibrate([80, 40, 80]); }
          else clinkChai();
        }
        // Ash tapping moved exclusively to the ash element
      }
      lastTapRef.current = now;
    }
  };

  // ── Play smoke-blow SFX (released puff / ring whoosh) ─────────────────────
  const playBlowSfx = useCallback((intensity: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') return;
    // Exhale is an interaction cue, not part of the cigarette-crackle bed.
    // It remains available when ASMR or crackle is muted; only rate-limit it
    // so repeated releases never stack into an irritating burst.
    const wallNow = Date.now();
    if (wallNow - lastBlowSfxAtRef.current < 650) return;
    lastBlowSfxAtRef.current = wallNow;
    const buf = smokeBlowBufferRef.current;
    try {
      const strength = Math.min(1, Math.max(0, intensity));
      const now = ctx.currentTime;

      // Brief, shallow mix duck: enough space for the breath cue, but too short
      // and too gentle to feel like the music is being interrupted.
      const selectedRadio = getRadioStation(radioStationIdRef.current);
      if (musicOnRef.current) {
        if (selectedRadio.source === 'youtube-playlist') {
          const player = youtubeRadioPlayerRef.current;
          try { player?.setVolume(Math.round(musicVolume * 72)); } catch {}
        } else if (ambientMusicGainRef.current) {
          const musicGain = ambientMusicGainRef.current.gain;
          musicGain.cancelScheduledValues(now);
          musicGain.setValueAtTime(musicGain.value, now);
          musicGain.linearRampToValueAtTime(musicVolume * 0.68, now + 0.045);
          musicGain.setTargetAtTime(musicVolume, now + 0.48, 0.14);
        }
      }
      if (asmrOn && ambientVolume > 0) {
        currentRoom.ytIds.forEach((id) => {
          const player = ytPlayersRef.current[id];
          const multiplier = (currentRoom.ytIds.length > 1 ? 0.6 : 1) * (currentRoom.ytVol || 1);
          try { player?.setVolume(Math.min(100, ambientVolume * 100 * multiplier * 0.72)); } catch {}
        });
      }

      if (blowDuckTimerRef.current !== null) window.clearTimeout(blowDuckTimerRef.current);
      blowDuckTimerRef.current = window.setTimeout(() => {
        if (musicOnRef.current && selectedRadio.source === 'youtube-playlist') {
          try { youtubeRadioPlayerRef.current?.setVolume(Math.round(musicVolume * 100)); } catch {}
        }
        if (asmrOn && ambientVolume > 0) {
          currentRoom.ytIds.forEach((id) => {
            const player = ytPlayersRef.current[id];
            const multiplier = (currentRoom.ytIds.length > 1 ? 0.6 : 1) * (currentRoom.ytVol || 1);
            try { player?.setVolume(Math.min(100, ambientVolume * 100 * multiplier)); } catch {}
          });
        }
        blowDuckTimerRef.current = null;
      }, 720);

      if (buf) {
        const source = ctx.createBufferSource();
        source.buffer = buf;
        source.playbackRate.value = 0.96 + Math.random() * 0.07;

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass'; highpass.frequency.value = 95;
        const presence = ctx.createBiquadFilter();
        presence.type = 'peaking'; presence.frequency.value = 1450; presence.Q.value = 0.75; presence.gain.value = 3.2;
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -30; compressor.knee.value = 18; compressor.ratio.value = 3.2;
        compressor.attack.value = 0.006; compressor.release.value = 0.2;
        const gain = ctx.createGain();
        const peak = 0.52 + strength * 0.14;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(peak, now + 0.028);
        gain.gain.setTargetAtTime(0.0001, now + Math.min(0.82, Math.max(0.42, buf.duration * 0.58)), 0.18);
        source.connect(highpass); highpass.connect(presence); presence.connect(compressor); compressor.connect(gain); gain.connect(ctx.destination);
        source.start(0);
      }

      // A very soft procedural air layer adds the missing upper-mid cue that
      // makes an exhale readable over rain or music without making it louder.
      const airDuration = 0.64;
      const airBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * airDuration), ctx.sampleRate);
      const air = airBuffer.getChannelData(0);
      for (let i = 0; i < air.length; i++) {
        const t = i / air.length;
        const envelope = Math.sin(Math.PI * t) ** 1.7;
        air[i] = (Math.random() * 2 - 1) * envelope;
      }
      const airSource = ctx.createBufferSource(); airSource.buffer = airBuffer;
      const airBand = ctx.createBiquadFilter(); airBand.type = 'bandpass'; airBand.frequency.value = 1750; airBand.Q.value = 0.55;
      const airGain = ctx.createGain(); airGain.gain.value = 0.075 + strength * 0.035;
      airSource.connect(airBand); airBand.connect(airGain); airGain.connect(ctx.destination); airSource.start(0);
    } catch (e) { /* non-fatal */ }
  }, [ambientVolume, asmrOn, currentRoom.ytIds, currentRoom.ytVol, musicVolume]);

  // ── Spawn smoke ring (DOM-based) ──────────────────────────────────────────
  const spawnSmokeRing = useCallback((intensity = 0) => {
    if (!filterRef.current) return;
    const rect = filterRef.current.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const ring: SmokeRing = {
      id,
      x: rect.left + rect.width / 2,
      y: rect.bottom, // very bottom edge of the filter
      diameter: rect.width,
      density: Math.min(1, intensity),
    };
    setSmokeRings(prev => [...prev, ring]);
    // auto-remove after animation completes (6s animation + small buffer)
    setTimeout(() => {
      setSmokeRings(prev => prev.filter(r => r.id !== id));
    }, 6100);
  }, []);

  // ── Filter hold mechanic ──────────────────────────────────────────────────
  const handleFilterPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isLit && !isFinished && !isStealth && currentRoom.id !== 'chai' && !isZenMode) {
      handlePointerDown(e);
      return;
    }
    // Only allow smoking if it is lit and NOT finished
    if (isLit && !isFinished && currentRoom.id !== 'chai') {
      // Resume Web Audio on the pointer gesture so the independent exhale cue
      // still works after mobile browsers suspend an idle/backgrounded tab.
      initAudio();
      setIsPuffing(true);
      isFilterHeldRef.current = true;
      filterHoldStartRef.current = Date.now();
      
      filterHoldTimerRef.current = setInterval(() => {
        const holdDuration = Date.now() - filterHoldStartRef.current;
        let intensity = 0;
        if (holdDuration > 300) {
          // Scale smoothly from 0 to 1 over the 300ms -> 8000ms window
          intensity = Math.min((holdDuration - 300) / 7700, 1);
        }
        setFilterHoldIntensity(intensity);
      }, 50);

      return;
    }
    // If finished, do absolutely nothing (no more rings)
  };

  const handleFilterPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // When released while lit and not finished, spawn EXACTLY ONE ring and NO exhale smoke
    if (isFilterHeldRef.current && isLit && !isFinished) {
      const holdDuration = Date.now() - filterHoldStartRef.current;
      if (holdDuration > 300) {
        const intensity = Math.min((holdDuration - 300) / 7700, 1);
        spawnSmokeRing(intensity);
        playBlowSfx(intensity); // whoosh as the ring is pushed out
      }
    }
    isFilterHeldRef.current = false;
    setIsPuffing(false);
    chaiHoldingRef.current = false;
    setFilterHoldIntensity(0);
    if (filterHoldTimerRef.current) { clearInterval(filterHoldTimerRef.current); filterHoldTimerRef.current = null; }
  };

  // ── Chat ──────────────────────────────────────────────────────────────────
  const chatEndRef = useRef<HTMLDivElement>(null);
  const handleSendMessage = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !currentRoom.id) return;
    const now = Date.now();
    if (now - lastMsgTime < 3000) return;
    
    const text = filterText(chatText);
    const messagesRef = ref(db, `rooms/${currentRoom.id}/messages`);
    
    push(messagesRef, {
      type: 'chat',
      id: `user-${now}`,
      text,
      nickname,
      color: nameColor,
      xPos: getRandomChatX(),
      createdAt: now,
      expiresAt: now + 5 * 60 * 1000, // 5-minute TTL — DB never bloats
      reactions: [],                   // Initialize so reaction handlers never throw
    });

    setChatText(''); setChatOpen(false); setLastMsgTime(now);
  };

  const handleReaction = (msgId: string, emoji: string) => {
    vibrate(30);
    // Optimistic local update
    setMessages(p => p.map(m => m.id === msgId ? { ...m, reactions: [...m.reactions, emoji] } : m));
    
    if (!currentRoom.id) return;
    const messagesRef = ref(db, `rooms/${currentRoom.id}/messages`);
    push(messagesRef, {
      type: "reaction",
      id: `react-${Date.now()}`,
      messageId: msgId,
      emoji
    });

    setEmojiPicker(null);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const displayTimeSeconds = Math.floor(elapsedTimeMs / 1000);
  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${Math.floor(s % 60).toString().padStart(2, '0')}s`;
  const cigWidthClass = { slim: 'w-8 sm:w-10', standard: 'w-12 sm:w-16', wide: 'w-16 sm:w-24' }[cigWidth];
  const currentRadio = getRadioStation(radioStationId);
  const radioIsPlaying = musicOn && musicVolume > 0 && radioPlaybackState === 'playing';
  const roomAmbienceIsAudible = asmrOn && ytPlaying && ambientVolume > 0;
  const crackleIsAudible = asmrOn && isLit && !isFinished && currentRoom.id !== 'chai' && crackleVolume > 0;
  const ambienceIsAudible = roomAmbienceIsAudible || crackleIsAudible;
  const radioStatusLabel: Record<RadioPlaybackState, string> = {
    idle: 'Ready to play',
    loading: 'Connecting…',
    playing: 'Live now',
    paused: 'Paused',
    blocked: 'Tap play to allow audio',
    error: 'Stream unavailable',
  };

  // Filter — no red coloring, always stays warm amber/tan
  const filterGlowStyle = isPuffing && isLit && !isFinished ? {
    filter: `brightness(${1 + filterHoldIntensity * 0.25})`,
    transition: 'filter 0.2s ease',
  } : {};

  const filterBgStyle = {}; // Always use the static amber gradient below

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <div
      ref={mainScreenRef}
      className={`relative flex flex-col items-center justify-center h-[100dvh] w-full overflow-hidden select-none font-display ${highContrast ? 'grayscale contrast-125' : ''}`}
      style={{ backgroundColor: currentRoom.bg, transition: 'background-color 1.2s ease' }}
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'bg-layer' && currentRoom.id !== 'silent' && !chatOpen) {
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setChatOpen(true);
          }
        }
        setEmojiPicker(null);
      }}
    >
      {/* Visually Hidden, Screen Reader and SEO Crawler Friendly Semantics */}
      <div className="sr-only">
        <h1>PuffBreak — Your 3-Minute Digital Break Room</h1>
        <h2>Music, chai, ASMR, anonymous company, or a virtual smoke ritual</h2>
        <p>
          Take an intentional three-minute pause with PuffBreak. Tune into human-curated global radio, sip virtual chai, settle into an ASMR room, hang out anonymously, or keep the familiar rhythm of a virtual smoke break.
        </p>
        <h2>Global music radio and an independent sound mixer</h2>
        <p>
          Browse human-curated music radio by mood, genre, region, language, or artist. Balance live radio, room ambience, and cigarette crackle independently, save favourite stations, or use Silent Room when you want no sound.
        </p>
        <h2>Ideal for Smoking Cessation & Stress Relief</h2>
        <p>
          Use PuffBreak as an interactive habit-replacement tool to quit smoking, manage nicotine withdrawal cravings, do breathing exercises, or simply step away from your desk. Teleport between the Office Rooftop, Beach Sunset, Space Station, Library Corner, Park Bench, Metro Platform, Chai Stall, or Silent Room. No registration required.
        </p>
      </div>

      {/* BG Click Layer */}
      <div id="bg-layer" className="absolute inset-0 z-10" />

      {/* Grain Texture */}
      <svg className="pointer-events-none absolute inset-0 z-50 h-full w-full opacity-[0.022]">
        <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" /></filter>
        <filter id="rough-edge">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="ash-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="5" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 6 -2" in="noise" result="coloredNoise" />
          <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="texture" />
          <feBlend mode="multiply" in="texture" in2="SourceGraphic" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Room Color Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
        style={{ backgroundColor: currentRoom.overlay, transition: 'background-color 1.2s ease' }}
      />

      {/* Ambient Glow behind main element */}
      {!isStealth && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            width: 360, height: 360,
            background: `radial-gradient(circle, ${currentRoom.glowColor} 0%, transparent 70%)`,
            borderRadius: '50%', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'breathe 4s ease-in-out infinite',
          }}
        />
      )}

      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[30]" />

      {/* ── DOM Smoke Rings ── fixed overlay so coords match getBoundingClientRect */}
      {smokeRings.map(ring => (
        <div
          key={ring.id}
          className="pointer-events-none"
          style={{
            position: 'fixed',
            left: ring.x,
            top: ring.y,
            width: 0,
            height: 0,
            zIndex: 35,
            transform: 'translate(0,0)',
          }}
        >
          {/* Inner ring shape — dense, soft gradient, responsive to hold duration */}
          <div
            style={{
              position: 'absolute',
              /* Center the ring on this anchor point */
              left: -(ring.diameter / 2),
              top: -(ring.diameter / 2),
              width: ring.diameter,
              height: ring.diameter,
              borderRadius: '50%',
              /* Removed box-shadow entirely to eliminate any sharp edges or linings */
              background: `radial-gradient(circle, transparent 25%, rgba(220, 230, 240, ${0.15 + ring.density * 0.75}) 50%, transparent 80%)`,
              backdropFilter: 'blur(3px)',
              /* linear timing + evenly-spaced keyframes = constant velocity, slowed to 6s */
              animation: 'smokeRingFly 6s linear forwards',
            }}
          />
        </div>
      ))}

      {/* ── Floating Chat Messages ── */}
      {currentRoom.id !== 'silent' && !isZenMode && (
        <div
          className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
          style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 85%, transparent 100%)' }}
        >
          <AnimatePresence>
            {messages.map((msg) => {
              // Each message gets its own random speed so they all feel alive
              const dur = 14 + (msg.id.charCodeAt(msg.id.length - 1) % 10);
              const rise = typeof window !== 'undefined' ? window.innerHeight * 0.75 + (msg.id.charCodeAt(0) % 100) : 600;
              return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 0, scale: 0.88 }}
                animate={{
                  opacity: [0, 1, 1, 1, 1, 0],
                  y: [0, -rise * 0.2, -rise * 0.4, -rise * 0.6, -rise * 0.85, -rise],
                  scale: [0.88, 1, 1, 0.97, 0.93, 0.88],
                }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                transition={{ duration: dur, ease: 'linear', times: [0, 0.05, 0.2, 0.5, 0.85, 1] }}
                className="absolute pointer-events-auto flex flex-col"
                style={{ 
                  left: msg.xPos > 50 ? 'auto' : `${msg.xPos}%`, 
                  right: msg.xPos > 50 ? `${100 - msg.xPos}%` : 'auto', 
                  bottom: '15%', 
                  maxWidth: 'min(200px, 35vw)' 
                }}
              >
                {/* Nickname badge */}
                <div
                  className="text-[9px] font-semibold mb-1 tracking-wider uppercase px-1"
                  style={{ color: msg.color, textShadow: `0 0 8px ${msg.color}40` }}
                >
                  {msg.nickname}
                </div>
                <div
                  className="bg-black/20 backdrop-blur-md border border-white/[0.04] px-3.5 py-2.5 rounded-2xl text-[13px] text-gray-200 shadow-xl cursor-pointer break-words relative leading-relaxed tracking-wide"
                  style={{
                    boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${msg.color}15`,
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const timer = setTimeout(() => { setEmojiPicker(msg.id); vibrate(20); }, 500);
                    (e.currentTarget as HTMLElement).dataset.timer = String(timer);
                  }}
                  onPointerUp={(e) => { clearTimeout(parseInt((e.currentTarget as HTMLElement).dataset.timer ?? '0')); }}
                  onPointerLeave={(e) => { clearTimeout(parseInt((e.currentTarget as HTMLElement).dataset.timer ?? '0')); }}
                  onContextMenu={(e) => { e.preventDefault(); setEmojiPicker(msg.id); vibrate(20); }}
                >
                  {msg.text}
                  {/* Reaction picker */}
                  <AnimatePresence>
                    {emojiPicker === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#1a1a24]/90 backdrop-blur-xl border border-white/[0.1] p-1.5 rounded-full flex space-x-1 shadow-2xl z-50 pointer-events-auto"
                        onClick={e => e.stopPropagation()}
                      >
                        {['❤️', '👍', '🔥', '😂', '👀', '✨'].map(em => (
                          <button key={em} onClick={() => handleReaction(msg.id, em)} className="hover:scale-125 active:scale-110 transition-transform px-1.5 py-0.5 text-base">{em}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Reactions */}
                {msg.reactions.length > 0 && (
                  <div className="flex space-x-0.5 mt-1 px-1">
                    {msg.reactions.slice(-3).map((r, i) => (
                      <motion.span key={i} initial={{ scale: 0, y: 4 }} animate={{ scale: 1, y: 0 }} className="text-xs">{r}</motion.span>
                    ))}
                  </div>
                )}
              </motion.div>
            )})}
          </AnimatePresence>
        </div>
      )}

      {/* ── Typing Indicator ── */}
      <AnimatePresence>
        {isTyping && currentRoom.id !== 'silent' && !isZenMode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute left-4 z-30 glass-dark px-3 py-2 rounded-full text-[11px] text-gray-400 flex items-center space-x-2 pointer-events-none"
            style={{ bottom: chatOpen ? 140 : 100 }}
          >
            <span className="text-gray-500">someone typing</span>
            <span className="flex space-x-0.5">
              {[0, 0.18, 0.36].map((d, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: d }}
                  className="text-gray-400 text-base leading-none"
                >·</motion.span>
              ))}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar ── */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="absolute top-0 left-0 w-full flex justify-between items-center px-3 py-3 text-gray-400 z-40 pointer-events-auto"
          >
            <div className="flex space-x-1 items-center">
              <button onClick={() => setDrawerOpen(true)} className="p-2.5 hover:bg-white/10 active:bg-white/15 rounded-full transition-colors" aria-label="Open Menu">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <button onClick={() => setIsStealth(!isStealth)} className={`p-2.5 rounded-full transition-colors ${isStealth ? 'bg-white/10 text-white' : 'hover:bg-white/10'}`} aria-label="Toggle Stealth">
                {isStealth ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

          {/* ── Right pill: live count + timer + actions ── */}
          <div className="flex items-center gap-3">
            
            {/* Live dot + count */}
            {(() => {
              const totalOnline = Object.values(roomCounts).reduce((a: number, b: number) => a + b, 0) || 1;
              return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.05]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 anim-pulse-dot shrink-0" />
                  <span className="text-[11px] text-emerald-400 font-medium tabular-nums">{totalOnline}</span>
                </div>
              );
            })()}

            {/* Timer */}
            <div className="font-mono-display text-[12px] tracking-wider pointer-events-none" aria-live="polite">
              {isLit || isFinished ? (
                <motion.span key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={isFinished ? 'text-gray-500' : 'text-gray-200 font-medium'}>
                  {formatTime(displayTimeSeconds)}
                </motion.span>
              ) : null}
            </div>

            {isOffline && <WifiOff className="w-4 h-4 text-orange-400" aria-label="Offline" />}

            {/* Icon actions */}
            <div className="flex items-center gap-1">
              <button onClick={reset} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/15 transition-colors text-gray-400 hover:text-white" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={() => setSupportModalOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-400/20 active:bg-amber-400/30 transition-colors text-amber-400/70 hover:text-amber-400" aria-label="Support">
                <Coffee className="w-4 h-4" />
              </button>
              <button onClick={() => setIsZenMode(true)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/15 transition-colors text-gray-400 hover:text-white" aria-label="Zen Mode">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Streak celebration toast ── */}
      <AnimatePresence>
        {streakToast && !isZenMode && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className="bg-orange-500/15 backdrop-blur-xl border border-orange-500/30 text-orange-300 text-xs font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
              {streakToast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Radio station toast ── */}
      <AnimatePresence>
        {radioToast && !isZenMode && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className="bg-emerald-500/15 backdrop-blur-xl border border-emerald-500/30 text-emerald-300 text-xs font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap max-w-[90vw] truncate">
              {radioToast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Craving Check (in-app survey) — one tap, honest data ── */}
      <AnimatePresence>
        {surveyOpen && !isZenMode && !isStealth && (
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 48 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-3 sm:right-6 bottom-48 sm:bottom-32 z-50 pointer-events-auto w-[min(88vw,20rem)]"
          >
            <div className="bg-[#0f0f13]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4">
              {surveyThanks ? (
                <div className="text-center py-1">
                  <div className="text-3xl mb-2">{SURVEY_OPTIONS.find(o => o.felt === surveyChosen)?.emoji ?? '🙏'}</div>
                  <p className="text-sm font-semibold text-white mb-1">Thanks — that&apos;s real data now.</p>
                  <Link href="/data" className="inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200 transition-colors">
                    See what everyone says <span>→</span>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">Did that break help?</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">How&apos;s the craving now?</p>
                    </div>
                    <button onClick={dismissSurvey} aria-label="Dismiss" className="p-1 -mr-1 text-gray-600 hover:text-gray-300 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SURVEY_OPTIONS.map(opt => (
                      <button
                        key={opt.felt}
                        onClick={() => handleSurveyAnswer(opt.felt)}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-emerald-400/30 active:scale-95 transition-all"
                        aria-label={opt.summary}
                        title={opt.summary}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2.5 text-center">
                    1 tap · anonymous · feeds <Link href="/data" className="text-emerald-400/80 hover:text-emerald-300">/data</Link>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zen Mode Exit ── */}
      <AnimatePresence>
        {isZenMode && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsZenMode(false)} aria-label="Exit Zen Mode"
            className="absolute top-6 right-6 z-50 p-3 glass rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Stealth Mode Content ── */}
      {isStealth && (
        <div className="flex flex-col items-center justify-center space-y-3 opacity-40 z-10 pointer-events-none">
          <div className="anim-breathe">
            <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center">
              <Coffee className="w-7 h-7 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 text-xs tracking-[0.3em] uppercase font-mono-display">Break Time</p>
        </div>
      )}

      {/* ── Context copy ── — one layout-owned stack, never independent offsets */}
      <AnimatePresence mode="wait">
        {!isLit && !isFinished && !isStealth && !isZenMode && (
          <motion.div
            key="pre-break-copy"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ delay: 0.25, duration: 0.55, ease: 'easeOut' }}
            className="absolute top-[4.35rem] sm:top-[4.5rem] left-1/2 z-30 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 px-2 text-center pointer-events-none"
          >
            {/* Mobile gets one compact command. The reflective line is omitted
                because narrow viewports cannot give two messages enough calm. */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-black/25 px-3 py-1.5 backdrop-blur-md sm:hidden">
              <span className="h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: currentRoom.accent }} />
              <p className="whitespace-nowrap text-[9px] leading-none tracking-[0.12em] text-white/58 uppercase font-mono-display">
                {currentRoom.id === 'chai' ? 'Hold to sip · release to pause' : 'Hold to light · double-tap ash'}
              </p>
            </div>
            <div className="hidden flex-col items-center gap-2.5 sm:flex">
              <p className="text-[12px] leading-5 text-white/45 font-light tracking-wide text-balance">
                {vibeOfDay}
              </p>
              <p className="text-[10px] leading-4 tracking-[0.16em] uppercase font-mono-display animate-pulse" style={{ color: currentRoom.accent }}>
                {currentRoom.id === 'chai' ? warmDrink.sipHint : 'Hold to light · Double-tap ash'}
              </p>
            </div>
          </motion.div>
        )}
        {isLit && !isFinished && !isStealth && currentRoom.id !== 'chai' && !isZenMode && (
          <motion.div
            key="hint-smoke"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 0.75, y: 0 }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="fixed top-[4.5rem] sm:top-14 left-0 w-full flex justify-center text-[10px] sm:text-[11px] tracking-wider z-30 pointer-events-none text-gray-300 text-center px-4"
          >
            Hold to smoke · Release for ring · Double-tap ash
          </motion.div>
        )}
        {isLit && !isFinished && !isStealth && currentRoom.id === 'chai' && !isZenMode && (
          <motion.div
            key="hint-sip"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 0.55, y: 0 }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="fixed top-[4.5rem] sm:top-14 left-0 w-full flex justify-center text-[10px] sm:text-[11px] tracking-wider z-30 pointer-events-none text-gray-300 text-center px-4"
          >
            Keep holding to sip · Release to pause
          </motion.div>
        )}
        {isFinished && !isStealth && currentRoom.id === 'chai' && !isZenMode && (
          <motion.div
            key="hint-wash"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 0.65, y: 0 }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="fixed top-[4.5rem] sm:top-14 left-0 w-full flex justify-center text-[10px] sm:text-[11px] tracking-widest z-30 pointer-events-none text-gray-300 font-mono-display uppercase text-center px-4"
          >
            Double-tap to wash the cup
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Interactive Element ── */}

      {/* CHAI CUP */}
      {!isStealth && currentRoom.id === 'chai' && (
        <div
          className="relative z-20 cursor-pointer touch-none mt-10"
          style={{ width: 120, height: 160 }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* ── Finished: Prominent Reset Overlay ── */}
          <AnimatePresence>
            {isFinished && !isStealth && !isZenMode && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-auto group"
                aria-label="Reset"
              >
                <div className="w-11 h-11 rounded-2xl bg-white/[0.08] border border-white/[0.15] flex items-center justify-center group-hover:bg-white/[0.15] group-hover:border-white/[0.25] transition-all shadow-lg backdrop-blur-sm">
                  <RotateCcw className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] tracking-widest uppercase text-gray-500 group-hover:text-gray-300 transition-colors font-mono">New Break</span>
              </motion.button>
            )}
          </AnimatePresence>

          {isCharging && (
            <svg className="absolute -inset-3 z-10 pointer-events-none" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(224,122,95,0.2)" strokeWidth="3" />
              <circle cx="60" cy="60" r="56" fill="none" stroke="#e07a5f" strokeWidth="3" className="charge-ring-path charging" style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }} />
            </svg>
          )}
          {isLit && !isFinished && [0, 1, 2].map(i => (
            <div key={i} className="absolute top-0 pointer-events-none"
              style={{ left: `${25 + i * 20}%`, width: 4, height: 18, background: 'rgba(220,220,220,0.25)', borderRadius: 4, animation: `steamRise ${1.5 + i * 0.3}s ease-out ${i * 0.4}s infinite` }}
            />
          ))}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: cup.width, height: cup.height }}>
            <div
              className="relative w-full h-full overflow-hidden"
              style={{ background: cup.body, borderRadius: cup.borderRadius, clipPath: cup.clipPath, border: cup.border, filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.5))' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: 'rgba(0,0,0,0.15)' }} />
              <div className="absolute bottom-0 left-0 w-full" style={{ height: `${(1 - progress) * 100}%`, background: cup.liquid }} />
              {sugarAdded && <div className="absolute inset-0 bg-white/10 pointer-events-none" />}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/20 pointer-events-none" />
              {isFinished && <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-60">{cup.emptyIcon}</div>}
              {sugarRipple && (
                <motion.div
                  initial={{ scale: 0.35, opacity: 0.6 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/30 pointer-events-none"
                />
              )}
            </div>
            {cup.handle && (
              <div className="absolute top-1/3" style={{ right: -14, width: 16, height: 26, border: `3px solid ${cup.handleColor ?? '#b9804f'}`, borderLeft: 'none', borderRadius: '0 8px 8px 0' }} />
            )}
            {cup.saucer && (
              <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -10, width: cup.width + 28, height: 14, borderRadius: '50%', background: cup.saucerColor ?? 'rgba(255,255,255,0.14)', boxShadow: '0 3px 8px rgba(0,0,0,0.4)' }} />
            )}
          </div>
          {showSugar && !sugarAdded && isLit && !isFinished && !isStealth && !isZenMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
              transition={{ opacity: { duration: 0.3 }, scale: { duration: 0.3 }, y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' } }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (sugarAdded) return;
                initAudio();
                setSugarAdded(true);
                setSugarRipple(true);
                vibrate(30);
                const ctx = audioCtxRef.current;
                if (ctx) {
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.type = 'sine';
                  osc.frequency.setValueAtTime(340, ctx.currentTime);
                  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
                  gain.gain.setValueAtTime(0.35, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.3);
                }
                setTimeout(() => setSugarRipple(false), 700);
              }}
              aria-label="Add sugar"
              className="absolute -left-6 bottom-6 z-30 text-[26px] drop-shadow-lg cursor-pointer touch-none"
            >
              🧊
            </motion.button>
          )}
          <div ref={emberRef} className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-4 pointer-events-none" />
          {isPuffing && !isFinished && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-24 h-24 rounded-full border border-amber-400/40" style={{ animation: 'ripple 1s ease-out infinite' }} />
            </div>
          )}
        </div>
      )}

      {/* CIGARETTE */}
      {!isStealth && currentRoom.id !== 'chai' && (
        <div
          data-testid="cigarette-control"
          data-ignition-phase={lightingPhase}
          data-lit={isLit ? 'true' : 'false'}
          className={`relative ${cigWidthClass} h-[50vh] sm:h-[65vh] max-h-[400px] sm:max-h-[560px] flex flex-col cursor-pointer mt-12 sm:mt-20 z-20 touch-none`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* ── Finished: Prominent Reset Overlay ── */}
          <AnimatePresence>
            {isFinished && !isStealth && !isZenMode && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-auto group"
                aria-label="Reset"
              >
                <div className="w-11 h-11 rounded-2xl bg-white/[0.08] border border-white/[0.15] flex items-center justify-center group-hover:bg-white/[0.15] group-hover:border-white/[0.25] transition-all shadow-lg backdrop-blur-sm">
                  <RotateCcw className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] tracking-widest uppercase text-gray-500 group-hover:text-gray-300 transition-colors font-mono">New Break</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Igniter — visible across all phases, not just isCharging */}
          <AnimatePresence>
            {lightingPhase !== 'idle' && (
              <motion.div
                className="absolute z-30 pointer-events-none"
                style={{ top: 0, left: '50%', width: 0, height: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {igniterType === 'lighter' ? (
                  /* ── LIGHTER with multi-phase animation ── */
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 48,
                      left: -21,
                      width: 42,
                      transformOrigin: '21px -48px',
                    }}
                    initial={{ rotate: -35, scale: 0, x: 60, y: -20, opacity: 0 }}
                    animate={
                      lightingPhase === 'approach'
                        ? { rotate: -35, scale: 1.35, x: 0, y: 0, opacity: 1 }
                        : lightingPhase === 'retreat'
                        ? { rotate: -35, scale: 0.8, x: 60, y: -20, opacity: 0 }
                        : { rotate: -25, scale: 1.4, x: 10, y: -5, opacity: 1 } // Positioned to perfectly intersect the tip
                    }
                    transition={
                      lightingPhase === 'approach'
                        ? { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }
                        : lightingPhase === 'retreat'
                        ? { duration: 0.35, ease: 'easeIn' }
                        : { duration: 0.1 }
                    }
                  >
                    <div style={{ position: 'relative' }}>
                      {/* Flame — only visible during strike, lit, closing phases */}
                      {(['strike', 'lit', 'closing'] as const).some(p => lightingPhase === p) && (
                        <div className="lighter-flame-anim" style={{
                          position: 'absolute', top: -48, left: 2, width: 18,
                          transformOrigin: 'bottom center',
                        }}>
                          <div className="flame-layer-1" style={{ position: 'absolute', bottom: 0, left: 0, width: 18, height: 46, background: 'linear-gradient(to top, #f97316, #fbbf24, rgba(251,191,36,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(1.8px)', opacity: 0.95 }} />
                          <div className="flame-layer-2" style={{ position: 'absolute', bottom: 2, left: 3, width: 12, height: 28, background: 'linear-gradient(to top, #ffffff, #fde68a, rgba(253,230,138,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(1px)' }} />
                          <div className="flame-layer-3" style={{ position: 'absolute', bottom: 4, left: 6, width: 6, height: 16, background: 'linear-gradient(to top, #ffffff, #ffffff, rgba(255,255,255,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(0.4px)' }} />
                        </div>
                      )}
                      {/* Flame guard — cap. Rotates open/closed based on phase */}
                      <motion.div
                        style={{
                          position: 'absolute', top: -12, left: -1, width: 22, height: 11,
                          background: 'linear-gradient(to bottom, #aaa, #888)',
                          borderRadius: '4px 4px 0 0', border: '1px solid #777',
                          transformOrigin: 'bottom left',
                        }}
                        animate={
                          lightingPhase === 'approach'
                            ? { rotateX: 0 }
                            : lightingPhase === 'closing' || lightingPhase === 'retreat'
                            ? { rotateX: 0 }
                            : { rotateX: -120 }
                        }
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <div style={{ position: 'absolute', top: 3, left: '50%', transform: 'translateX(-50%)', width: 2, height: 5, borderRadius: 4, background: '#555' }} />
                      </motion.div>
                      {/* Spark wheel */}
                      {(['open', 'strike'] as const).some(p => lightingPhase === p) && (
                        <div className="spark-wheel-anim" style={{ position: 'absolute', top: -15, left: -2, width: 14, height: 11, background: 'linear-gradient(to bottom, #666, #333)', borderRadius: 3, border: '1px solid #222', boxShadow: '0 1px 4px rgba(0,0,0,0.6)' }} />
                      )}
                      {/* Body */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0,
                        width: 42, height: 62,
                        background: 'linear-gradient(145deg, #d8d8d8 0%, #aaaaaa 45%, #888 100%)',
                        borderRadius: 9,
                        boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.65), 2px 4px 14px rgba(0,0,0,0.75)',
                      }}>
                        <div style={{ position: 'absolute', top: 9, left: 6, right: 6, height: 14, borderRadius: 3, background: 'rgba(0,0,0,0.1)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }} />
                        <div style={{ position: 'absolute', bottom: 5, left: 0, right: 0, height: 9, borderRadius: '0 0 9px 9px', background: 'rgba(0,0,0,0.08)' }} />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ── MATCHBOX & MATCHSTICK SEQUENCE ── */
                  <div style={{ position: 'absolute', top: 4, left: 0 }}>
                    {/* Matchbox Assembly */}
                    <AnimatePresence>
                      {['approachBox', 'openBox', 'extractMatch', 'strike'].includes(lightingPhase) && (
                        <motion.div
                          key="matchbox"
                          initial={{ x: 140, y: 10, opacity: 0, rotate: -15 }}
                          animate={
                            lightingPhase === 'strike' ? { x: 75, y: -10, opacity: 1, rotate: -10 } :
                            { x: 80, y: 0, opacity: 1, rotate: -10 }
                          }
                          exit={{ x: 100, y: 40, opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                          style={{ position: 'absolute', top: 0, left: 0 }}
                        >
                          {/* Box Shell */}
                          <div style={{
                            width: 65, height: 45, background: 'linear-gradient(to bottom, #dc2626, #991b1b)',
                            borderRadius: 4, position: 'relative',
                            boxShadow: '2px 4px 10px rgba(0,0,0,0.6)',
                            border: '1px solid #7f1d1d',
                            overflow: 'hidden'
                          }}>
                            {/* Brand label */}
                            <div style={{ position: 'absolute', top: 5, left: 5, right: 5, bottom: 5, border: '1px dashed rgba(255,255,255,0.4)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ color: 'white', fontSize: '9px', fontWeight: 'bold', opacity: 0.8, transform: 'rotate(-5deg)' }}>SAFETY</span>
                            </div>
                            {/* Striking strip */}
                            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, background: '#444', borderLeft: '1px solid #222' }} />
                          </div>
                          
                          {/* Box Drawer (slides out) */}
                          <motion.div
                            initial={{ x: 0 }}
                            animate={{ x: ['openBox', 'extractMatch', 'strike'].includes(lightingPhase) ? -35 : 0 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            style={{
                              position: 'absolute', top: 3, left: 0, width: 60, height: 39,
                              background: '#e5e5e5', borderRadius: 2, zIndex: -1,
                              boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.4)',
                              border: '1px solid #a3a3a3'
                            }}
                          >
                            {/* Fake matches inside */}
                            <div style={{ position: 'absolute', top: 4, left: 10, width: 4, height: 31, background: '#d4b483', borderRadius: 1 }} />
                            <div style={{ position: 'absolute', top: 5, left: 18, width: 4, height: 30, background: '#d4b483', borderRadius: 1 }} />
                            <div style={{ position: 'absolute', top: 3, left: 26, width: 4, height: 32, background: '#d4b483', borderRadius: 1 }} />
                            <div style={{ position: 'absolute', top: 4, left: 34, width: 4, height: 31, background: '#d4b483', borderRadius: 1 }} />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Matchstick */}
                    <motion.div
                      style={{ position: 'absolute', top: 0, left: 0 }}
                      initial={{ x: 120, y: -40, opacity: 0, rotate: 0 }}
                      animate={
                        lightingPhase === 'approachBox' ? { x: 50, y: 15, opacity: 0, rotate: -70 } :
                        lightingPhase === 'openBox' ? { x: 50, y: 15, opacity: 1, rotate: -70, zIndex: 10 } :
                        lightingPhase === 'extractMatch' ? { x: 50, y: -40, opacity: 1, rotate: -70, zIndex: 10 } :
                        lightingPhase === 'strike' ? { x: 90, y: 15, opacity: 1, rotate: -45, zIndex: 10 } :
                        lightingPhase === 'lit' ? { x: 0, y: -10, opacity: 1, rotate: 28, zIndex: 10 } :
                        lightingPhase === 'retreat' ? { x: -60, y: -80, opacity: 0, rotate: 40, zIndex: 10 } :
                        { x: 120, y: -40, opacity: 0 }
                      }
                      transition={
                        lightingPhase === 'strike' ? { duration: 0.7, ease: "easeIn" } :
                        lightingPhase === 'lit' ? { duration: 0.2, ease: "easeOut" } :
                        { duration: 0.3 }
                      }
                    >
                      {/* Match stick pointing down-right */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0,
                        transform: 'rotate(28deg)',
                        transformOrigin: '0 0',
                      }}>
                        <div style={{
                          position: 'absolute', top: 0, left: -2, width: 5, height: 65,
                          background: 'linear-gradient(to right, #c8a96e, #d4b483, #b8954e)',
                          borderRadius: 2,
                          boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.3), -1px 0 2px rgba(0,0,0,0.2)',
                        }}>
                          {/* Sulfur head — changes color when lit */}
                          <div style={{
                            position: 'absolute', top: -3, left: -3, width: 11, height: 10,
                            borderRadius: '55% 55% 40% 40%',
                            background: lightingPhase === 'lit'
                              ? 'radial-gradient(circle at 40% 35%, #222, #000)'
                              : 'radial-gradient(circle at 40% 35%, #cc3030, #8b0000)',
                            boxShadow: lightingPhase === 'lit'
                              ? '0 0 6px rgba(255,150,0,0.6)'
                              : '0 0 3px rgba(180,0,0,0.6)',
                            transition: 'all 0.3s ease',
                          }} />
                        </div>
                      </div>
                      {/* Flame — ONLY appears when lightingPhase is 'lit' (at 2.251s) */}
                      <AnimatePresence>
                        {lightingPhase === 'lit' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.3, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            style={{
                              position: 'absolute', bottom: -10, left: -10, width: 20, height: 34, transformOrigin: 'bottom center',
                            }}
                          >
                            <div className="flame-layer-1" style={{ position: 'absolute', bottom: 0, left: 0, width: 20, height: 34, background: 'linear-gradient(to top, #f97316, #fbbf24, rgba(253,230,138,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(2px)', opacity: 0.95 }} />
                            <div className="flame-layer-2" style={{ position: 'absolute', bottom: 2, left: 4, width: 12, height: 22, background: 'linear-gradient(to top, white, #fde68a, rgba(253,230,138,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(1px)' }} />
                            <div className="flame-layer-3" style={{ position: 'absolute', bottom: 4, left: 7, width: 6, height: 14, background: 'linear-gradient(to top, white, white, rgba(255,255,255,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(0.5px)' }} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>


          {/* Cigarette body */}
          <div className="relative w-full h-[75%] flex flex-col">
            {/* Burned gap - capped at 75% so it only consumes paper, never the filter */}
            <div style={{ height: `${displayLastTapRef.current * 75}%`, willChange: 'height' }} className="w-full" />

            {/* Current ash — smoothly fades and falls when finished */}
            <motion.div
              ref={ashTopRef}
              onPointerDown={(e) => {
                e.stopPropagation();
                const now = Date.now();
                if (now - lastTapRef.current < 400) {
                  tapAshRef.current();
                }
                lastTapRef.current = now;
              }}
              style={{
                height: `${(progress - displayLastTapRef.current) * 75}%`,
                willChange: 'height',
                clipPath: (progress - displayLastTapRef.current) * 100 > 1
                  ? 'polygon(0% 12px, 4% 9px, 8% 8px, 12% 5px, 16% 5px, 20% 3px, 24% 4px, 28% 2px, 32% 2px, 36% 1px, 40% 1px, 44% 0px, 48% 1px, 52% 0px, 56% 1px, 60% 1px, 64% 1px, 68% 2px, 72% 2px, 76% 4px, 80% 3px, 84% 5px, 88% 5px, 92% 8px, 96% 9px, 100% 12px, 100% 100%, 0% 100%)'
                  : 'none',
                filter: 'url(#rough-edge)',
                cursor: 'pointer',
              }}
              className="w-full relative overflow-hidden rounded-t-sm"
              animate={isFinished ? { opacity: 0, y: 24, filter: 'blur(4px)' } : { opacity: 1, y: 0, filter: 'url(#rough-edge)' }}
              transition={isFinished ? { duration: 1.6, ease: [0.4, 0, 1, 1], delay: 0.5 } : { duration: 0 }}
            >
              {/* Complex SVG noise layers for organic patchy ash */}
              <div className="absolute inset-0 bg-[#303030] scale-110" />
              <div className="absolute inset-0 opacity-100 mix-blend-color-dodge scale-110" style={{ filter: 'url(#ash-texture)' }} />
              <div className="absolute inset-0 opacity-50 mix-blend-multiply scale-110" style={{ filter: 'url(#noise)' }} />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-transparent to-transparent opacity-90 scale-110" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(0,0,0,0.8)_100%)] scale-110" />
              <div className="absolute inset-0 opacity-[0.15] scale-110" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px), repeating-linear-gradient(-45deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }} />
            </motion.div>

            {/* Ember tip */}
            <div ref={emberRef} className="w-full relative z-10">
              {(progress > 0 || glow > 0) && progress < 1 && (
                <>
                  {/* Core glow bar */}
                  <div
                    className={`absolute inset-x-0 bottom-0 ${isPuffing ? 'anim-ember-burn' : (isLit ? 'anim-ember-idle' : '')}`}
                    style={{
                      height: '5px',
                      background: `linear-gradient(to right, #dc2626, #f97316, #dc2626)`,
                      boxShadow: `0 0 ${progress > 0 ? 15 + filterHoldIntensity * 3 : glow * 14}px ${3 + filterHoldIntensity * 0.5}px ${isPuffing ? '#dc2626' : '#ef4444'}`,
                      opacity: isLit ? undefined : glow,
                    }}
                  >
                    <div className="absolute inset-0 bg-orange-400/60 blur-[1.5px]" />
                  </div>
                  {/* Outer amber halo */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                    style={{
                      width: `${110 + (1 - progress) * 60 + filterHoldIntensity * 40}px`,
                      height: `${110 + (1 - progress) * 60 + filterHoldIntensity * 40}px`,
                      background: `radial-gradient(circle, rgba(${Math.round(249 - filterHoldIntensity * 60)},${Math.round(115 - filterHoldIntensity * 80)},22,${0.22 + filterHoldIntensity * 0.18}) 0%, rgba(249,115,22,0) 70%)`,
                      opacity: Math.max(0.2, 1 - progress),
                      animation: 'breathe 3s infinite ease-in-out',
                    }}
                  />
                </>
              )}
            </div>

            {/* Paper / unburned section */}
            <div className="flex-1 w-full bg-[#f5f5f5] relative overflow-hidden">
              {progress === 0 && <div className="absolute top-0 inset-x-0 h-[3px] bg-[#3e2723]" />}
              <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(0deg,transparent,transparent_6px,#000_6px,#000_7px)]" />
              <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,#000_1px,#000_2px)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* Filter — always warm amber, never turns red */}
            <div
              ref={filterRef}
              className="w-full h-[25%] relative rounded-b-md overflow-hidden cursor-pointer"
              style={{
                background: `linear-gradient(to bottom, #e9c46a, #d4a373)`,
                ...filterGlowStyle,
              }}
              onPointerDown={handleFilterPointerDown}
              onPointerUp={handleFilterPointerUp}
              onPointerLeave={handleFilterPointerUp}
            >
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#8b5a2b_1px,transparent_1px)] [background-size:4px_4px]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              {/* Subtle highlight when puffing — stays warm */}
              {isPuffing && isLit && !isFinished && (
                <div className="absolute inset-0 bg-amber-300/10 pointer-events-none" style={{ transition: 'opacity 0.2s' }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop/tablet radio companion: useful status, not a second control panel. */}
      <AnimatePresence>
        {!isZenMode && !isStealth && !chatOpen && !drawerOpen && (
          <motion.aside
            layout
            initial={{ opacity: 0, x: -12, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -12, y: 8 }}
            transition={{ layout: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
            className={`group/radio absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[60] hidden overflow-hidden border bg-[#090b0e]/94 backdrop-blur-2xl transition-[border-color,box-shadow,background-color] duration-300 md:block pointer-events-auto ${radioCompanionMinimized ? 'h-12 w-12 rounded-2xl border-white/[0.09] p-0 shadow-[0_14px_42px_rgba(0,0,0,0.5)] hover:border-emerald-300/25 hover:bg-[#0b1512] hover:shadow-[0_16px_50px_rgba(16,185,129,0.14)]' : 'w-[19rem] rounded-[1.15rem] border-white/[0.085] p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.42)] hover:border-emerald-300/20 hover:bg-[#0a0e0d]/95 hover:shadow-[0_20px_60px_rgba(16,185,129,0.12)]'}`}
            aria-label="Current radio"
          >
            {radioCompanionMinimized ? (
              <button
                type="button"
                onClick={() => setRadioCompanionMinimized(false)}
                aria-label="Expand current radio"
                title={`${currentRadio.name} · ${radioStatusLabel[radioPlaybackState]}`}
                className={`relative grid h-full w-full place-items-center text-[9px] font-black transition-colors ${radioIsPlaying ? 'bg-emerald-400/10 text-emerald-200' : 'text-gray-400 hover:bg-white/[0.06]'}`}
              >
                {currentRadio.icon}
                <span className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${radioIsPlaying ? 'bg-emerald-400' : 'bg-white/20'}`} />
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <div className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border text-[10px] font-black ${radioIsPlaying ? 'border-emerald-300/25 bg-emerald-400/12 text-emerald-200' : 'border-white/[0.07] bg-white/[0.035] text-gray-400'}`}>
                    {currentRadio.icon}
                    {radioIsPlaying && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-[#0a0a0e] bg-emerald-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-gray-100">{currentRadio.name}</p>
                    <p className={`mt-0.5 truncate text-[9px] font-medium uppercase tracking-[0.12em] ${radioIsPlaying ? 'text-emerald-400' : radioPlaybackState === 'error' || radioPlaybackState === 'blocked' ? 'text-amber-400' : 'text-gray-600'}`}>
                      {radioStatusLabel[radioPlaybackState]}
                    </p>
                  </div>
                  <button type="button" onClick={() => setRadioCompanionMinimized(true)} aria-label="Minimize current radio" title="Minimize" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-gray-600 transition-all hover:scale-105 hover:bg-white/[0.08] hover:text-gray-200">
                    <Minimize2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleMusic}
                    aria-label={radioIsPlaying ? 'Pause radio' : 'Play radio'}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all hover:scale-105 active:scale-95 ${radioIsPlaying ? 'border-emerald-300/30 bg-emerald-400/18 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.14)]' : 'border-white/10 bg-white/[0.055] text-gray-300 hover:border-emerald-300/20 hover:bg-emerald-300/10 hover:text-emerald-200'}`}
                  >
                    {radioIsPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setRadioLibraryOpen(true)}
                  className="mt-2 flex w-full items-center justify-between rounded-xl border border-white/[0.055] bg-white/[0.025] px-3 py-2 text-[10px] font-semibold text-gray-500 transition-all hover:border-emerald-300/25 hover:bg-emerald-300/[0.065] hover:text-emerald-200 hover:shadow-[inset_0_0_18px_rgba(52,211,153,0.04)]"
                >
                  <span className="flex min-w-0 items-center gap-2"><Radio className="h-3 w-3 shrink-0" /><span className="truncate">{currentRadio.tagline}</span></span>
                  <span className="ml-2 shrink-0 uppercase tracking-wider">Browse</span>
                </button>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────
          BOTTOM PANEL — always visible
          ─────────────────────────────────────────────────────────────────── */}
       {!isZenMode && (
        <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-auto" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}>

          {/* Mobile keeps the same truth in one compact row. */}
          {!chatOpen && !mobileRadioHidden && radioPlaybackState !== 'idle' && (
            <div className="mx-auto mb-1.5 flex w-[min(92vw,24rem)] items-center gap-2 rounded-full border border-white/[0.08] bg-[#0b0b0f]/88 px-2 py-1.5 shadow-xl backdrop-blur-2xl md:hidden">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[8px] font-black ${radioIsPlaying ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/[0.055] text-gray-400'}`}>{currentRadio.icon}</span>
              <button type="button" onClick={() => setRadioLibraryOpen(true)} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[10px] font-semibold text-gray-200">{currentRadio.name}</span>
                <span className={`block truncate text-[8px] uppercase tracking-wider ${radioIsPlaying ? 'text-emerald-400' : 'text-gray-600'}`}>{radioStatusLabel[radioPlaybackState]} · Browse</span>
              </button>
              <button type="button" onClick={toggleMusic} aria-label={radioIsPlaying ? 'Pause radio' : 'Play radio'} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.065] text-gray-200 active:scale-95">
                {radioIsPlaying ? <Pause className="h-3 w-3 fill-current" /> : <Play className="ml-0.5 h-3 w-3 fill-current" />}
              </button>
              <button type="button" onClick={() => setMobileRadioHidden(true)} aria-label="Hide radio card" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-gray-600 transition-colors hover:bg-white/[0.06] hover:text-gray-300">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Single unified stats row: icon · room name · live count · breaks */}
          {!chatOpen && (() => {
            const roomCount = currentRoom.id !== 'silent' ? (roomCounts[currentRoom.id] || 1) : null;
            return (
              <div className="flex justify-center mb-2 pointer-events-none px-4">
                <span className="flex items-center gap-2 text-[11px] text-gray-400/90 font-medium">
                  <span className="text-[14px] leading-none">{displayRoomIcon(currentRoom)}</span>
                  <span>{displayRoomName(currentRoom)}</span>
                  {roomCount !== null && (
                    <>
                      <span className="opacity-30">·</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="inline-block w-1 h-1 rounded-full bg-emerald-400 anim-pulse-dot" />
                        {roomCount}
                      </span>
                      <span className="opacity-30">·</span>
                      <span className="text-gray-500">{totalBreaksToday} breaks today</span>
                    </>
                  )}
                </span>
              </div>
            );
          })()}

          {/* Controls & Chat Container */}
          <AnimatePresence mode="wait">
            {!chatOpen ? (
              <motion.div 
                key="controls"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col w-full"
              >
                {/* ── Unified Controls Dock ── */}
                <div className="flex justify-center w-full px-3 dock-safe-bottom">

                {/* ── DESKTOP: Single pill (sm and above) ── */}
                <div className="hidden sm:flex items-center bg-[#0f0f13]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-1.5 gap-2 sm:max-w-fit h-[52px] px-3 md:px-3 md:rounded-3xl">

                  {/* Teleport */}
                  <button
                    onClick={() => setRoomModalOpen(true)}
                    aria-label="Change Room"
                    className="h-full px-4 flex items-center gap-2 rounded-xl text-[13px] text-blue-100 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-500/40 hover:to-indigo-500/40 active:scale-95 transition-all border border-blue-400/20 group relative overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <MapPin className="w-3.5 h-3.5 opacity-80 shrink-0 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-300 relative z-10" />
                    <span className="font-semibold relative z-10 group-hover:text-blue-200 transition-colors whitespace-nowrap">Change Room</span>
                  </button>

                  <div className="w-px h-5 bg-white/10 shrink-0" />

                  {/* ASMR */}
                  <button
                    onClick={toggleAsmr}
                    className={`h-full px-4 flex items-center gap-2 rounded-xl text-[13px] transition-all ${ambienceIsAudible ? 'bg-amber-500/20 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.08)]' : asmrOn ? 'bg-amber-500/10 text-amber-400/70' : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                  >
                    {ambienceIsAudible ? <Volume2 className="w-3.5 h-3.5 shrink-0" /> : <VolumeX className="w-3.5 h-3.5 opacity-60 shrink-0" />}
                    <span className="font-semibold whitespace-nowrap">Ambience</span>
                  </button>

                  <div className="w-px h-5 bg-white/10 shrink-0" />

                  {/* Radio */}
                  <button
                    onClick={toggleMusic}
                    className={`h-full px-4 flex items-center gap-2 rounded-xl text-[13px] transition-all ${radioIsPlaying ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.08)]' : musicOn ? 'bg-emerald-500/10 text-emerald-400/70' : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                  >
                    <span className="text-[13px] leading-none shrink-0">♫</span>
                    <span className="font-semibold whitespace-nowrap">Live Radio</span>
                  </button>

                  <div className="w-px h-5 bg-white/10 shrink-0" />

                  {/* Mixer */}
                  <button
                    onClick={() => setAudioMixerOpen(!audioMixerOpen)}
                    className={`h-full px-4 flex items-center gap-2 rounded-xl text-[13px] transition-all ${audioMixerOpen ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold whitespace-nowrap">Mixer</span>
                  </button>

                  {currentRoom.id !== 'silent' && (
                    <>
                      <div className="w-px h-5 bg-white/10 shrink-0" />
                      {/* Chat */}
                      <button
                        onClick={() => setChatOpen(o => !o)}
                        className="h-full px-4 flex items-center gap-2 rounded-xl text-[13px] text-gray-300 bg-white/5 hover:bg-white/10 active:bg-white/15 transition-all relative border border-white/5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 opacity-80 shrink-0" />
                        <span className="font-semibold whitespace-nowrap">Chat</span>
                        <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] rounded-full bg-emerald-400 border border-black/40 anim-pulse-dot" />
                      </button>
                    </>
                  )}
                </div>

                {/* ── MOBILE: Two-row pill (below sm) ── */}
                <div className="flex sm:hidden flex-col w-full max-w-[400px] bg-[#0f0f13]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-1 gap-0.5">

                  {/* Row 1: Room · ASMR · Radio */}
                  <div className="flex items-center gap-0.5 h-[40px]">
                    <button
                      onClick={() => setRoomModalOpen(true)}
                      aria-label="Change Room"
                      className="flex-1 h-full px-2 flex justify-center items-center gap-1.5 rounded-xl text-[11px] text-blue-100 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-500/40 hover:to-indigo-500/40 active:scale-95 transition-all border border-blue-400/20 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <MapPin className="w-3 h-3 opacity-80 shrink-0 relative z-10" />
                      <span className="font-semibold relative z-10 truncate">Room</span>
                    </button>

                    <div className="w-px h-4 bg-white/10 shrink-0 mx-0.5" />

                    <button
                      onClick={toggleAsmr}
                      className={`flex-1 h-full px-2 flex justify-center items-center gap-1.5 rounded-xl text-[11px] transition-all ${ambienceIsAudible ? 'bg-amber-500/20 text-amber-300' : asmrOn ? 'bg-amber-500/10 text-amber-400/70' : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                    >
                      {ambienceIsAudible ? <Volume2 className="w-3 h-3 shrink-0" /> : <VolumeX className="w-3 h-3 opacity-60 shrink-0" />}
                      <span className="font-semibold truncate">Ambience</span>
                    </button>

                    <div className="w-px h-4 bg-white/10 shrink-0 mx-0.5" />

                    <button
                      onClick={toggleMusic}
                      className={`flex-1 h-full px-2 flex justify-center items-center gap-1.5 rounded-xl text-[11px] transition-all ${radioIsPlaying ? 'bg-emerald-500/20 text-emerald-300' : musicOn ? 'bg-emerald-500/10 text-emerald-400/70' : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                    >
                      <span className="text-[11px] leading-none shrink-0">♫</span>
                      <span className="font-semibold truncate">Radio</span>
                    </button>
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-white/[0.06] mx-1" />

                  {/* Row 2: Mixer · Chat */}
                  <div className="flex items-center gap-0.5 h-[36px]">
                    <button
                      onClick={() => setAudioMixerOpen(!audioMixerOpen)}
                      className={`flex-1 h-full px-2 flex justify-center items-center gap-1.5 rounded-xl text-[11px] transition-all ${audioMixerOpen ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                    >
                      <Sliders className="w-3 h-3 shrink-0" />
                      <span className="font-semibold truncate">Mixer</span>
                    </button>

                    {currentRoom.id !== 'silent' && (
                      <>
                        <div className="w-px h-4 bg-white/10 shrink-0 mx-0.5" />
                        <button
                          onClick={() => setChatOpen(o => !o)}
                          className="flex-1 h-full px-2 flex justify-center items-center gap-1.5 rounded-xl text-[11px] text-gray-300 bg-white/5 hover:bg-white/10 active:bg-white/15 transition-all relative border border-white/5"
                        >
                          <MessageSquare className="w-3 h-3 opacity-80 shrink-0" />
                          <span className="font-semibold truncate">Chat</span>
                          <span className="absolute top-1 right-1 w-[5px] h-[5px] rounded-full bg-emerald-400 border border-black/40 anim-pulse-dot" />
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </div>
            
            {/* ── Audio Mixer Popover ── */}
            <AnimatePresence>
              {audioMixerOpen && (
                <motion.div
                  ref={mixerRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 w-[19rem] bg-[#09090d]/98 backdrop-blur-3xl border border-white/[0.08] rounded-[1.25rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] p-4 z-50 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 mb-0.5">
                    <span className="text-[11px] font-mono-display uppercase tracking-widest text-gray-500 font-semibold">Audio Mixer</span>
                    <button aria-label="Close Audio Mixer" onClick={() => setAudioMixerOpen(false)} className="text-gray-500 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* ASMR / Ambience Row */}
                  <div className={`flex flex-col gap-2 p-3 rounded-xl border transition-all duration-300 ${roomAmbienceIsAudible ? 'bg-[#181005] border-amber-500/30 shadow-[inset_0_0_20px_rgba(245,158,11,0.03)]' : asmrOn ? 'bg-amber-500/[0.035] border-amber-500/15' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] font-bold tracking-wide ${asmrOn ? 'text-amber-400' : 'text-gray-400'}`}>Room Ambience</span>
                      <button aria-label="Toggle Room Ambience" onClick={toggleAsmr} className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${roomAmbienceIsAudible ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : asmrOn ? 'bg-amber-500/55' : 'bg-white/10'}`}>
                        <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ease-spring ${asmrOn ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1">
                      <VolumeX className={`w-3.5 h-3.5 shrink-0 ${asmrOn ? 'text-amber-500/50' : 'text-gray-600'}`} />
                      <input type="range" min="0" max="1" step="0.05" value={ambientVolume}
                        onChange={e => updateAmbientVolume(parseFloat(e.target.value))}
                        className="premium-slider" style={{ '--slider-color': '#f59e0b', '--slider-progress': `${ambientVolume * 100}%` } as React.CSSProperties} />
                      <span className={`text-[10px] w-7 text-right tabular-nums font-medium ${asmrOn ? 'text-amber-500/70' : 'text-gray-600'}`}>{Math.round(ambientVolume * 100)}%</span>
                    </div>
                  </div>

                  {/* Crackle Row */}
                  <div className={`flex flex-col gap-2 p-3 rounded-xl border transition-all duration-300 ${crackleIsAudible ? 'bg-[#150a05] border-orange-500/30 shadow-[inset_0_0_20px_rgba(249,115,22,0.03)]' : asmrOn && crackleVolume > 0 ? 'bg-orange-500/[0.03] border-orange-500/15' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] font-bold tracking-wide ${asmrOn ? 'text-orange-400' : 'text-gray-400'}`}>Cig Crackle</span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1">
                      <VolumeX className={`w-3.5 h-3.5 shrink-0 ${asmrOn ? 'text-orange-500/50' : 'text-gray-600'}`} />
                      <input type="range" min="0" max="1" step="0.05" value={crackleVolume}
                        onChange={e => updateCrackleVolume(parseFloat(e.target.value))}
                        className="premium-slider" style={{ '--slider-color': '#f97316', '--slider-progress': `${crackleVolume * 100}%` } as React.CSSProperties} />
                      <span className={`text-[10px] w-7 text-right tabular-nums font-medium ${asmrOn ? 'text-orange-500/70' : 'text-gray-600'}`}>{Math.round(crackleVolume * 100)}%</span>
                    </div>
                  </div>

                  {/* Radio Row */}
                  <div className={`flex flex-col gap-2 p-3 rounded-xl border transition-all duration-300 ${radioIsPlaying ? 'bg-[#05150a] border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.03)]' : musicOn ? 'bg-emerald-500/[0.035] border-emerald-500/15' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] font-bold tracking-wide ${musicOn ? 'text-emerald-400' : 'text-gray-400'}`}>Live Radio</span>
                      <button aria-label="Toggle Live Radio" onClick={toggleMusic} className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${radioIsPlaying ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : musicOn ? 'bg-emerald-500/55' : 'bg-white/10'}`}>
                        <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ease-spring ${musicOn ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1">
                      <VolumeX className={`w-3.5 h-3.5 shrink-0 ${musicOn ? 'text-emerald-500/50' : 'text-gray-600'}`} />
                      <input type="range" min="0" max="1" step="0.05" value={musicVolume}
                        onChange={e => updateMusicVolume(parseFloat(e.target.value))}
                        className="premium-slider" style={{ '--slider-color': '#10b981', '--slider-progress': `${musicVolume * 100}%` } as React.CSSProperties} />
                      <span className={`text-[10px] w-7 text-right tabular-nums font-medium ${musicOn ? 'text-emerald-500/70' : 'text-gray-600'}`}>{Math.round(musicVolume * 100)}%</span>
                    </div>

                    {/* One calm now-playing surface; discovery lives in the library. */}
                    <button
                      type="button"
                      onClick={() => { setAudioMixerOpen(false); setRadioLibraryOpen(true); }}
                      className="group mt-0.5 flex w-full items-center gap-2.5 rounded-xl border border-white/[0.065] bg-black/20 p-2.5 text-left transition-all hover:border-emerald-400/20 hover:bg-emerald-400/[0.035]"
                      aria-label="Browse live radio stations"
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border text-[10px] font-black ${radioIsPlaying ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-white/[0.07] bg-white/[0.035] text-gray-500'}`}>
                        {getRadioStation(radioStationId).icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`flex items-center gap-1.5 truncate text-[11px] font-semibold ${radioIsPlaying ? 'text-emerald-200' : 'text-gray-300'}`}>
                          {radioIsPlaying && (
                            <span className="flex h-[10px] shrink-0 items-end gap-[2px] text-emerald-400" aria-hidden="true">
                              <span className="eq-bar" style={{ animationDelay: '0ms' }} />
                              <span className="eq-bar" style={{ animationDelay: '160ms' }} />
                              <span className="eq-bar" style={{ animationDelay: '320ms' }} />
                            </span>
                          )}
                          <span className="truncate">{getRadioStation(radioStationId).name}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[9px] text-gray-600">{getRadioStation(radioStationId).tagline}</span>
                      </span>
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-gray-600 transition-colors group-hover:text-emerald-400">Browse</span>
                      <ChevronDown className="h-3 w-3 shrink-0 -rotate-90 text-gray-700 transition-colors group-hover:text-emerald-400" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

              {/* (Chat button moved into the Unified Controls Dock above) */}
          </motion.div>
          ) : currentRoom.id !== 'silent' ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="w-full px-4 sm:px-4 relative z-50 pointer-events-auto mb-4 sm:mb-6 dock-safe-bottom"
                style={{
                  // On mobile with keyboard open: fixed to float above keyboard
                  // On desktop or keyboard-closed: let the normal doc flow place it
                  position: isKeyboardOpen ? 'fixed' : 'relative',
                  bottom: isKeyboardOpen ? keyboardHeight + 8 : undefined,
                  left: isKeyboardOpen ? 0 : undefined,
                  right: isKeyboardOpen ? 0 : undefined,
                  paddingBottom: isKeyboardOpen ? 0 : undefined,
                  marginBottom: isKeyboardOpen ? 0 : undefined,
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-[#0f0f13]/90 backdrop-blur-3xl border border-white/[0.08] rounded-full max-w-lg mx-auto shadow-2xl p-1.5 flex items-center gap-2">
                  <button 
                    type="button" 
                    aria-label="Add Random Emoji"
                    onClick={() => {
                      const emojis = ['😊', '💨', '☕', '🔥', '✨', '🌿', '✌️', '❤️', '☁️', '🌙'];
                      setChatText(prev => prev + emojis[Math.floor(Math.random() * emojis.length)]);
                    }}
                    className="w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-all shrink-0"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  
                  <form onSubmit={handleSendMessage} className="flex-1 flex items-center relative">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={chatText}
                      onChange={e => setChatText(e.target.value)}
                      placeholder={`Whisper in ${displayRoomName(currentRoom)}...`}
                      className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none pl-3 pr-14 py-2"
                      maxLength={60}
                      enterKeyHint="send"
                    />
                    
                    <div className="absolute right-2 flex items-center gap-2 pointer-events-none">
                      {chatText.length > 0 ? (
                        <span className="text-[10px] text-gray-500 font-mono">
                          {60 - chatText.length}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 anim-pulse-dot" />
                          {roomCounts[currentRoom.id] || 1}
                        </span>
                      )}
                    </div>
                  </form>
                  
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!chatText.trim()}
                    className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 disabled:bg-white/[0.03] disabled:text-gray-600 flex items-center justify-center hover:bg-blue-500/30 hover:text-blue-300 transition-all shrink-0"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setChatOpen(false)} 
                    className="w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.08] hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all shrink-0 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Notice Banner */}
          <AnimatePresence>
            {showNotice && !chatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-max max-w-[90vw] z-40"
              >
                <div className="bg-orange-500/10 backdrop-blur-xl border border-orange-500/20 text-orange-400 py-1.5 px-3 rounded-full flex justify-between items-center shadow-lg gap-2">
                  <span className="text-[10px] font-medium tracking-wide">
                    ⚠️ Keep it clean. No swearing or hate speech.
                  </span>
                  <button onClick={() => setShowNotice(false)} className="text-orange-400/60 hover:text-orange-300 transition-colors shrink-0 p-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Menu Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-50 backdrop-blur-sm pointer-events-auto"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute top-0 left-0 h-full w-72 bg-[#0f0f12]/98 backdrop-blur-xl z-50 shadow-2xl flex flex-col border-r border-white/[0.06] pointer-events-auto"
            >
              {/* Drawer header */}
              <div className="px-6 pt-8 pb-5 border-b border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-200 font-semibold tracking-wide text-sm">PuffBreak</span>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 text-gray-600 hover:text-gray-300 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[11px] text-gray-500">
                  👋 {localizedGreeting},{' '}
                  <strong style={{ color: nameColor }} className="font-semibold">{nickname}</strong>
                </div>
                {streak > 0 && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                    <span>{getStreakTier(streak).emoji}</span>
                    <span>{getStreakTier(streak).name} · {streak} day streak</span>
                  </div>
                )}
                {isOffline && (
                  <div className="flex items-center gap-1.5 text-[11px] text-orange-400/80 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg mt-1">
                    <WifiOff className="w-3 h-3" /> <span>Solo break (offline)</span>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="flex-1 overflow-y-auto py-3">
                <div className="px-5 py-3 border-b border-white/5 mb-1 flex flex-col">
                  <button onClick={() => setDrawerMixerOpen(!drawerMixerOpen)} className="flex items-center justify-between w-full group">
                    <label className="text-[11px] text-gray-500 uppercase tracking-widest font-mono-display cursor-pointer group-hover:text-gray-300 transition-colors">Audio Mixer</label>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${drawerMixerOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {drawerMixerOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="flex flex-col gap-5 overflow-hidden"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[10px] font-medium text-amber-500/80 uppercase tracking-wider"><span>Ambience</span><span className="tabular-nums">{Math.round(ambientVolume * 100)}%</span></div>
                          <div className="flex items-center gap-2">
                            <VolumeX className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <input type="range" min="0" max="1" step="0.05" value={ambientVolume} onChange={e => updateAmbientVolume(parseFloat(e.target.value))} className="premium-slider" style={{ '--slider-color': '#f59e0b', '--slider-progress': `${ambientVolume * 100}%` } as React.CSSProperties} />
                            <Volume2 className="w-3.5 h-3.5 text-amber-500/50 shrink-0" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[10px] font-medium text-orange-500/80 uppercase tracking-wider"><span>Crackle</span><span className="tabular-nums">{Math.round(crackleVolume * 100)}%</span></div>
                          <div className="flex items-center gap-2">
                            <VolumeX className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <input type="range" min="0" max="1" step="0.05" value={crackleVolume} onChange={e => updateCrackleVolume(parseFloat(e.target.value))} className="premium-slider" style={{ '--slider-color': '#f97316', '--slider-progress': `${crackleVolume * 100}%` } as React.CSSProperties} />
                            <Volume2 className="w-3.5 h-3.5 text-orange-500/50 shrink-0" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[10px] font-medium text-emerald-500/80 uppercase tracking-wider"><span>Radio</span><span className="tabular-nums">{Math.round(musicVolume * 100)}%</span></div>
                          <div className="flex items-center gap-2">
                            <VolumeX className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                            <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={e => updateMusicVolume(parseFloat(e.target.value))} className="premium-slider" style={{ '--slider-color': '#10b981', '--slider-progress': `${musicVolume * 100}%` } as React.CSSProperties} />
                            <Volume2 className="w-3.5 h-3.5 text-emerald-500/50 shrink-0" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="px-5 py-3 border-b border-white/5 mb-1 space-y-2">
                  <label className="text-[11px] text-gray-500 uppercase tracking-widest font-mono-display block">Cigarette Style</label>
                  <div className="flex gap-2">
                    {(['slim', 'standard', 'wide'] as CigWidth[]).map(w => (
                      <button
                        key={w} onClick={() => setCigWidth(w)}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-colors capitalize ${cigWidth === w ? 'bg-blue-500/25 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'}`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-3 border-b border-white/5 mb-1 space-y-2">
                  <label className="text-[11px] text-gray-500 uppercase tracking-widest font-mono-display block">Igniter Style</label>
                  <div className="flex gap-2">
                    {(['lighter', 'match'] as const).map(i => (
                      <button
                        key={i} onClick={() => { setIgniterType(i); localStorage.setItem('pb_igniter', i); }}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-colors capitalize ${igniterType === i ? 'bg-blue-500/25 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'}`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-3 border-b border-white/5 mb-1 space-y-2">
                  <label className="text-[11px] text-gray-500 uppercase tracking-widest font-mono-display block">Break Length</label>
                  <div className="flex gap-2">
                    {BREAK_TYPES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setBreakType(t.id)}
                        title={t.label}
                        aria-label={`${t.label} break (${t.hint})`}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-colors ${breakType === t.id ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'}`}
                      >
                        <span className="mr-1">{t.icon}</span>{t.hint}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors text-gray-300"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 opacity-60" />
                    <span className="text-sm">High Contrast</span>
                  </div>
                  <div className={`w-9 h-5 rounded-full transition-colors ${highContrast ? 'bg-blue-500' : 'bg-white/10'} relative`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${highContrast ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </button>

                <div className="mt-2 border-t border-white/5 pt-2">
                  <MenuButton icon={<Share2 className="w-4 h-4" />} text="Share Your Break" onClick={() => {
                    track('share_clicked', { room: currentRoom.id });
                    const caption = 'I just took a mindful 3-minute break on PuffBreak 🌬️ — free, anonymous, no sign-up';
                    const url = 'https://puffbreak.app';
                    if (navigator.share) {
                      navigator.share({ title: 'PuffBreak — Virtual Break Room', text: caption, url }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(`${caption} ${url}`).catch(() => {});
                    }
                  }} />
                  <MenuButton icon={<FileText className="w-4 h-4" />} text="FAQ" onClick={() => {
                    setFaqModalOpen(true);
                    setDrawerOpen(false);
                  }} />
                  <MenuButton icon={<MessageSquare className="w-4 h-4" />} text="Send Feedback" onClick={() => {
                    setFeedbackModalOpen(true);
                  }} />
                  <MenuButton icon={<Users className="w-4 h-4" />} text="About PuffBreak" onClick={() => {
                    window.location.href = '/about';
                  }} />
                  <MenuButton icon={<Linkedin className="w-4 h-4" />} text="About the Creator" onClick={() => {
                    window.open('https://www.linkedin.com/in/devsg/', '_blank');
                  }} />
                  <MenuButton icon={<Star className="w-4 h-4" />} text="Support / Donate" textColor="text-amber-400" onClick={() => {
                    setSupportModalOpen(true);
                  }} />
                  <MenuButton icon={<Star className="w-4 h-4 text-emerald-400" />} text="PuffBreak Guide" textColor="text-emerald-400" onClick={() => {
                    setBlogModalOpen(true);
                    setActiveBlogPost(blogPosts.find(p => p.slug === 'comprehensive-puffbreak-guide') || null);
                  }} />
                  <MenuButton icon={<BookOpen className="w-4 h-4" />} text="Read Blogs" onClick={() => {
                    setBlogModalOpen(true);
                  }} />
                  <MenuButton icon={<Shield className="w-4 h-4" />} text="Privacy Policy" onClick={() => {
                    setPrivacyModalOpen(true);
                  }} />
                  <MenuButton icon={<FileText className="w-4 h-4" />} text="Update Notes" onClick={() => {
                    setUpdateNotesOpen(true);
                  }} />
                  <MenuButton icon={<RestoreIcon className="w-4 h-4" />} text="Restore Nickname" onClick={() => { const n = localStorage.getItem('pb_nickname'); const c = localStorage.getItem('pb_color'); if (n && c) { setNickname(n); setNameColor(c); } }} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Blog Modal ── */}
      <AnimatePresence>
        {blogModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 z-50 pointer-events-auto"
              onClick={() => { setBlogModalOpen(false); setActiveBlogPost(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="absolute top-[3%] left-[3%] right-[3%] bottom-[3%] bg-[#09090e] border border-white/[0.08] rounded-3xl z-50 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
                <div className="flex items-center gap-3">
                  {activeBlogPost ? (
                    <button onClick={() => setActiveBlogPost(null)} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium transition-colors">
                      <span className="text-lg leading-none">←</span> All Articles
                    </button>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-white font-bold text-base block leading-none">PuffBreak Journal</span>
                        <span className="text-gray-500 text-[11px] tracking-widest uppercase">{blogPosts.length} Articles</span>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => { setBlogModalOpen(false); setActiveBlogPost(null); }} className="p-2 text-gray-500 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {activeBlogPost ? (
                  /* ── Article Reader ── */
                  <div className="max-w-2xl mx-auto px-6 py-10 pb-16">
                    {/* Category + meta */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-3 py-1.5 rounded-full">
                        {(activeBlogPost as BlogPost & { category?: string }).category || activeBlogPost.tags[0]}
                      </span>
                      <span className="text-gray-600 text-xs">·</span>
                      <span className="text-gray-500 text-xs">{(activeBlogPost as BlogPost & { readTime?: string }).readTime || '3 min read'}</span>
                    </div>
                    <h1 className="text-3xl sm:text-[2.2rem] font-bold mb-5 text-white leading-[1.2] tracking-tight">{activeBlogPost.title}</h1>
                    <div className="flex items-center gap-3 pb-8 border-b border-white/[0.07] mb-8">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-500/30 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                        {activeBlogPost.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 font-medium leading-none mb-0.5">{activeBlogPost.author}</p>
                        <p className="text-xs text-gray-600">{new Date(activeBlogPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div
                      className="prose prose-invert prose-emerald max-w-none
                                 prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                                 prose-p:text-gray-300 prose-p:leading-relaxed
                                 prose-strong:text-white
                                 prose-li:text-gray-300 prose-li:leading-relaxed
                                 prose-a:text-emerald-400 hover:prose-a:text-emerald-300"
                      dangerouslySetInnerHTML={{ __html: activeBlogPost.content }}
                    />
                  </div>
                ) : (
                  /* ── Article Grid ── */
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto pb-8">
                      {blogPosts.map((post, i) => (
                        <Link
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          className="text-left group flex flex-col h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all duration-300 overflow-hidden hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5"
                        >
                          {/* Card top accent bar */}
                          <div className={`h-0.5 w-full ${i % 3 === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : i % 3 === 1 ? 'bg-gradient-to-r from-blue-500 to-violet-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
                          <div className="p-5 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
                                {(post as BlogPost & { category?: string }).category || post.tags[0]}
                              </span>
                              <span className="text-[10px] text-gray-600">{(post as BlogPost & { readTime?: string }).readTime || '3 min'}</span>
                            </div>
                            <h3 className="text-[0.95rem] font-bold mb-2.5 text-white/90 group-hover:text-emerald-400 transition-colors leading-snug">{post.title}</h3>
                            <p className="text-gray-500 text-[0.8rem] mb-5 line-clamp-2 flex-grow leading-relaxed">{post.excerpt}</p>
                            <div className="text-xs text-emerald-500/80 font-semibold flex items-center gap-1.5 mt-auto">
                              Read Article
                              <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">→</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Privacy Modal ── */}
      <AnimatePresence>
        {privacyModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/65 z-50 backdrop-blur-sm pointer-events-auto"
              onClick={() => setPrivacyModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: '4%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="absolute top-[10%] left-[10%] right-[10%] bottom-[10%] bg-[#0a0a0f]/98 backdrop-blur-3xl border border-white/10 rounded-3xl z-50 shadow-2xl flex flex-col pointer-events-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold tracking-tight text-lg">Privacy Policy</h2>
                <button onClick={() => setPrivacyModalOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <div className="prose prose-invert prose-emerald max-w-2xl mx-auto text-gray-300">
                  <h3 className="text-white font-bold text-xl mb-4">No Data Collection</h3>
                  <p className="mb-6">At PuffBreak, we believe taking a break should be completely private. We do not collect, store, or sell any personal data.</p>
                  
                  <h3 className="text-white font-bold text-xl mb-4">Local Storage</h3>
                  <p className="mb-6">All preferences (like your nickname, color, and streak) are saved entirely locally on your device in your browser's LocalStorage. This data never leaves your device.</p>
                  
                  <h3 className="text-white font-bold text-xl mb-4">Privacy-Respecting Analytics</h3>
                  <p className="mb-6">We use only aggregate, privacy-respecting analytics (Vercel Analytics and Google Analytics) to measure overall traffic. No personal profiles, no cross-site tracking, and no advertising cookies.</p>
                  
                  <h3 className="text-white font-bold text-xl mb-4">Chat History</h3>
                  <p className="mb-6">When you send a message in a public room, it is broadcast to other active users in that room. It is never logged or stored on a server database. When the message vanishes from the screen, it is gone forever.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── FAQ Modal ── */}
      <AnimatePresence>
        {faqModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/65 z-50 backdrop-blur-sm pointer-events-auto"
              onClick={() => setFaqModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: '4%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="absolute top-[10%] left-[10%] right-[10%] bottom-[10%] bg-[#0a0a0f]/98 backdrop-blur-3xl border border-white/10 rounded-3xl z-50 shadow-2xl flex flex-col pointer-events-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold tracking-tight text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" /> Frequently Asked Questions
                </h2>
                <button onClick={() => setFaqModalOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  {FAQ_ITEMS.map((item) => (
                    <div key={item.q} className="border-b border-white/5 pb-6 last:border-0">
                      <h3 className="text-white font-semibold text-base mb-2">{item.q}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Room Modal ── */}
      <AnimatePresence>
        {roomModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/65 z-50 backdrop-blur-sm pointer-events-auto"
              onClick={() => setRoomModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: '2%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.22 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f0f12]/98 backdrop-blur-xl border border-white/[0.07] p-5 rounded-2xl z-50 w-[92%] max-w-sm shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-200 font-semibold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Choose Your Break Room</span>
                </h3>
                <button onClick={() => setRoomModalOpen(false)} className="p-1 text-gray-600 hover:text-gray-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {ROOMS.map(r => {
                  const onlineCount = roomCounts[r.id] ?? 0;
                  return (
                    <motion.button
                      key={r.id}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => switchRoom(r)}
                      className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all ${currentRoom.id === r.id ? 'border-blue-500/40 text-blue-300' : 'border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'}`}
                      style={{
                        background: currentRoom.id === r.id
                          ? `${r.bg}dd`
                          : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      {/* Live user count badge */}
                      {onlineCount > 0 && (
                        <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[9px] text-emerald-400/90 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          {onlineCount}
                        </span>
                      )}
                      <span className="text-2xl mb-1.5">{displayRoomIcon(r)}</span>
                      <span className="text-[11px] font-medium tracking-wide text-center leading-tight">{displayRoomName(r)}</span>
                      {r.id === 'chai' && (
                        <span className="text-[9px] text-gray-500 text-center leading-tight mt-0.5 px-1">{culture.chaiRoomHint}</span>
                      )}
                      {currentRoom.id === r.id && (
                        <span className="text-[9px] mt-1 text-blue-400/80 uppercase tracking-widest font-mono-display">Active</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <RadioLibrary
        open={radioLibraryOpen}
        activeStationId={radioStationId}
        isPlaying={radioIsPlaying}
        roomId={currentRoom.id}
        roomName={displayRoomName(currentRoom)}
        onClose={() => setRadioLibraryOpen(false)}
        onSelect={(stationId) => {
          switchRadioStation(stationId);
          if (!musicOn) toggleMusic();
        }}
        onTogglePlayback={toggleMusic}
      />

      {/* ── Feedback Modal ── */}
      <AnimatePresence>
        {feedbackModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 z-50 backdrop-blur-md pointer-events-auto"
              onClick={() => { if (!feedbackSending) { setFeedbackModalOpen(false); setFeedbackSent(false); setFeedbackError(false); setFeedbackText(''); setFeedbackImages([]); } }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: '2%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.22 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0f]/98 backdrop-blur-2xl border border-white/10 rounded-2xl z-50 w-[92%] max-w-lg shadow-2xl pointer-events-auto overflow-hidden"
            >
              {/* Gradient accent top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span>Share Your Thoughts</span>
                  </h3>
                  <button onClick={() => { setFeedbackModalOpen(false); setFeedbackSent(false); setFeedbackError(false); setFeedbackText(''); setFeedbackImages([]); }} className="p-1.5 text-gray-500 hover:text-gray-200 transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-5 ml-10">Feature ideas, bug reports, or just a vibe check — we read everything.</p>

                {feedbackSent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-white font-semibold text-lg">Feedback Sent!</p>
                    <p className="text-gray-400 text-sm text-center">Thank you for helping make PuffBreak better. We'll take a look.</p>
                    <button onClick={() => { setFeedbackModalOpen(false); setFeedbackSent(false); setFeedbackText(''); setFeedbackImages([]); }} className="mt-2 px-6 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-medium hover:bg-emerald-500/30 transition-colors">
                      Close
                    </button>
                  </motion.div>
                ) : feedbackError ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-white font-semibold">Couldn't send feedback</p>
                    <p className="text-gray-400 text-sm text-center">Something went wrong. Please try again.</p>
                    <button onClick={() => setFeedbackError(false)} className="mt-2 px-6 py-2.5 bg-white/10 text-gray-300 rounded-full text-sm font-medium hover:bg-white/20 transition-colors">Try Again</button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none text-sm leading-relaxed"
                      rows={4}
                      placeholder="Tell us what you think, what's broken, or what you'd love to see next..."
                    />

                    {/* Image Upload */}
                    <div>
                      <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                        <Image className="w-3.5 h-3.5" /> Attach Screenshots (optional)
                      </label>
                      <label className="flex items-center justify-center w-full h-20 border border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all group">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={e => {
                            if (e.target.files) {
                              setFeedbackImages(Array.from(e.target.files).slice(0, 3));
                            }
                          }}
                        />
                        {feedbackImages.length > 0 ? (
                          <div className="flex items-center gap-3 px-3">
                            {feedbackImages.map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                                <Image className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="text-xs text-gray-300 truncate max-w-[80px]">{f.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-600 group-hover:text-gray-400 transition-colors">
                            <Image className="w-5 h-5" />
                            <span className="text-xs">Click to attach images (max 3)</span>
                          </div>
                        )}
                      </label>
                    </div>

                    <button
                      disabled={feedbackSending || feedbackText.trim().length < 3}
                      onClick={async () => {
                        if (feedbackText.trim().length < 3) return;
                        setFeedbackSending(true);
                        try {
                          let response: Response;
                          if (feedbackImages.length > 0) {
                            const form = new FormData();
                            form.append('message', feedbackText);
                            form.append('website', '');
                            feedbackImages.forEach((img) => form.append('files', img));
                            response = await fetch('/api/feedback', { method: 'POST', body: form });
                          } else {
                            response = await fetch('/api/feedback', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ type: 'feedback', message: feedbackText, website: '' }),
                            });
                          }
                          if (!response.ok) throw new Error('Feedback request failed');
                          setFeedbackSent(true);
                          setFeedbackSending(false);
                        } catch {
                          setFeedbackSending(false);
                          setFeedbackError(true);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 py-3 rounded-xl transition-all font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {feedbackSending ? (
                        <><div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Send Feedback</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Support / Donate Modal ── */}
      <AnimatePresence>
        {supportModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 z-50 backdrop-blur-md pointer-events-auto"
              onClick={() => setSupportModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: '2%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.22 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 p-6 rounded-2xl z-50 w-[92%] max-w-md shadow-2xl pointer-events-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent pointer-events-none rounded-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-amber-400 font-semibold text-lg flex items-center gap-2 tracking-wide uppercase font-mono-display">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span>Support PuffBreak</span>
                  </h3>
                  <button onClick={() => setSupportModalOpen(false)} className="p-1.5 text-gray-500 hover:text-gray-200 transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Keeping PuffBreak ad-free and servers running costs money. If you enjoy your breaks here, consider buying me a coffee.
                </p>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest font-mono-display mb-3">Crypto</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-black/40 border border-white/5 p-2.5 rounded-lg">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-orange-400 font-medium text-sm">BTC</span>
                          <span className="text-gray-400 text-xs truncate">bc1q7rdc229skeumz0tfecmqnajhkw9s97ttrl0hgq</span>
                        </div>
                        <div className="flex shrink-0 items-center">
                          <button onClick={() => navigator.clipboard.writeText('bc1q7rdc229skeumz0tfecmqnajhkw9s97ttrl0hgq')} className="text-gray-400 hover:text-white p-1 ml-2 transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => setOpenQr(openQr === 'btc' ? null : 'btc')} className={`p-1 ml-1 transition-colors ${openQr === 'btc' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {openQr === 'btc' && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex justify-center w-full">
                            <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)] mt-4 mb-2 flex items-center justify-center">
                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bitcoin:bc1q7rdc229skeumz0tfecmqnajhkw9s97ttrl0hgq&bgcolor=255-255-255" alt="BTC QR" className="w-[140px] h-[140px] rounded-lg" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest font-mono-display mb-3">Indian (UPI)</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-black/40 border border-white/5 p-2.5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-medium text-sm">UPI ID</span>
                          <span className="text-gray-400 text-xs">sgbro33@okicici</span>
                        </div>
                        <div className="flex shrink-0 items-center">
                          <button onClick={() => navigator.clipboard.writeText('sgbro33@okicici')} className="text-gray-400 hover:text-white p-1 ml-2 transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => setOpenQr(openQr === 'upi' ? null : 'upi')} className={`p-1 ml-1 transition-colors ${openQr === 'upi' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {openQr === 'upi' && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex justify-center w-full">
                            <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)] mt-4 mb-2 flex items-center justify-center">
                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=sgbro33@okicici&pn=PuffBreak&bgcolor=255-255-255" alt="UPI QR" className="w-[140px] h-[140px] rounded-lg" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Update Notes Modal ── */}
      <AnimatePresence>
        {updateNotesOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 z-50 backdrop-blur-md pointer-events-auto"
              onClick={() => setUpdateNotesOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: '2%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.22 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f0f12]/98 backdrop-blur-xl border border-white/[0.07] p-6 rounded-2xl z-50 w-[92%] max-w-sm shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-200 font-semibold text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Update Notes</span>
                </h3>
                <button onClick={() => setUpdateNotesOpen(false)} className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors bg-white/5 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4 text-sm text-gray-300">
                <div className="space-y-1">
                  <h4 className="text-white font-medium flex items-center gap-2">v1.3.0 — Engine Update <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">LATEST</span></h4>
                  <ul className="list-disc list-inside text-gray-400 space-y-1 ml-1 text-xs">
                    <li>Extracted procedural audio into dedicated AmbientEngine component</li>
                    <li>New Office room: AC ventilation hum synthesizer layer</li>
                    <li>Enhanced Space drone: 3-oscillator sub-bass + slow filter LFO</li>
                    <li>Rain LFO: intensity now gusts like real weather</li>
                    <li>Smoother room crossfades (0.7s exponential ramp)</li>
                    <li>12 blog articles — SEO content hub launched</li>
                    <li>llms.txt for AI search engine visibility</li>
                    <li>Blog article count now live in Journal header</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-medium">v1.2.0 — Immersion Update</h4>
                  <ul className="list-disc list-inside text-gray-400 space-y-1 ml-1 text-xs">
                    <li>Realistic Zippo Lighter + Matchbox ignition sequences</li>
                    <li>Hold-to-smoke: 8s charge builds puff intensity</li>
                    <li>DOM-based smoke rings with CSS physics</li>
                    <li>Double-tap ash to knock it off</li>
                    <li>Shake gesture on mobile (devicemotion)</li>
                    <li>Stealth Mode &amp; Zen Mode</li>
                    <li>Premium glass-morphism Audio Mixer popover</li>
                    <li>Cigarette width options: Slim / Standard / Wide</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-medium">v1.1.0 — ASMR &amp; Chai</h4>
                  <ul className="list-disc list-inside text-gray-400 space-y-1 ml-1 text-xs">
                    <li>Chai Stall room with hold-to-sip &amp; double-tap clink</li>
                    <li>Procedural café chatter ASMR synthesis</li>
                    <li>Anonymous live chat with floating messages</li>
                    <li>Daily break streak tracking</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── About Modal ── */}
      <AnimatePresence>
        {aboutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 z-50 backdrop-blur-md pointer-events-auto"
              onClick={() => setAboutOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: '2%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.22 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f0f12]/98 backdrop-blur-xl border border-white/[0.07] p-6 rounded-2xl z-50 w-[92%] max-w-sm shadow-2xl pointer-events-auto flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 tracking-wide">PuffBreak</h3>
              <p className="text-sm text-gray-400 mb-6">
                Designed to provide a relaxing, immersive digital smoke break. Connect with others, listen to ASMR, and unwind.
              </p>
              <button onClick={() => setAboutOpen(false)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors text-sm font-medium">
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Hidden YouTube Ambient Player */}
      <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
        {currentRoom.ytIds.map((id) => (
          <YouTube
            key={currentRoom.id + '-' + id}
            videoId={id}
            opts={{
              height: '10',
              width: '10',
              playerVars: {
                // Always begin paused. Restoring a visual "on" state cannot
                // bypass browser autoplay policy and would make the UI lie.
                autoplay: 0,
                loop: 1,
                playlist: id, // loop requires playlist to be set to the same video ID
                controls: 0,
                disablekb: 1,
                vq: 'tiny', // Request lowest possible quality to save user data
              },
            }}
            onReady={(e) => {
              ytPlayersRef.current[id] = e.target;
              if (asmrOn && ambientVolume > 0) {
                const volumeMultiplier = (currentRoom.ytIds.length > 1 ? 0.6 : 1) * (currentRoom.ytVol || 1);
                e.target.setVolume(Math.min(100, ambientVolume * 100 * volumeMultiplier));
                e.target.playVideo();
              }
            }}
            onStateChange={(e) => {
              // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
              if (e.data === 1) {
                playingYtIdsRef.current.add(id);
                setYtPlaying(playingYtIdsRef.current.size > 0);
              }
              if (e.data === 2 || e.data === 0) {
                playingYtIdsRef.current.delete(id);
                setYtPlaying(playingYtIdsRef.current.size > 0);
              }
              if (e.data === 0 && asmrOn && ambientVolume > 0) {
                e.target.playVideo(); // Force loop just in case
              }
            }}
            onError={() => {
              playingYtIdsRef.current.delete(id);
              setYtPlaying(playingYtIdsRef.current.size > 0);
            }}
          />
        ))}
        {youtubeRadioMounted && currentRadio.source === 'youtube-playlist' && (currentRadio.videoIds?.length || currentRadio.playlistId) && (
          <YouTube
            key={`youtube-radio-${currentRadio.id}`}
            videoId={currentRadio.videoIds?.[0]}
            opts={{
              height: '10',
              width: '10',
              playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                loop: 1,
                vq: 'tiny',
                ...(!currentRadio.videoIds?.length && currentRadio.playlistId ? { listType: 'playlist' as const, list: currentRadio.playlistId } : {}),
              },
            }}
            onReady={(event) => {
              youtubeRadioPlayerRef.current = event.target;
              youtubeRadioReadyRef.current = true;
              event.target.setVolume(musicOnRef.current ? Math.round(musicVolume * 100) : 0);
              if (currentRadio.videoIds?.length) event.target.cuePlaylist(currentRadio.videoIds, 0, 0);
              else if (currentRadio.playlistId) event.target.cuePlaylist({ listType: 'playlist', list: currentRadio.playlistId, index: 0, startSeconds: 0 });
            }}
            onStateChange={(event) => {
              if (radioStationIdRef.current !== currentRadio.id) return;
              // -1 unstarted · 0 ended · 1 playing · 2 paused · 3 buffering · 5 cued
              if (event.data === 1) {
                youtubeRadioErrorCountRef.current = 0;
                setRadioPlaybackState(musicOnRef.current ? 'playing' : 'paused');
              }
              if (event.data === 2 && !musicOnRef.current) setRadioPlaybackState('paused');
              if (event.data === 3) setRadioPlaybackState(musicOnRef.current ? 'loading' : 'paused');
              if (event.data === 5 && musicOnRef.current) {
                startYoutubeRadio(youtubeNeedsRandomStartRef.current);
              }
              if (event.data === 0) event.target.playVideo();
            }}
            onError={(event) => {
              if (radioStationIdRef.current === currentRadio.id) {
                const playlist = event.target.getPlaylist?.() ?? [];
                if (playlist.length > 1 && youtubeRadioErrorCountRef.current < playlist.length - 1) {
                  youtubeRadioErrorCountRef.current += 1;
                  const currentIndex = Math.max(0, event.target.getPlaylistIndex?.() ?? 0);
                  event.target.playVideoAt((currentIndex + 1) % playlist.length);
                  if (musicOnRef.current) setRadioToast('One video is unavailable here — skipping to the next song.');
                  return;
                }
                musicOnRef.current = false;
                setMusicOn(false);
                setRadioPlaybackState('error');
              }
            }}
          />
        )}
      </div>

      {/* Anchored guide launcher. A stable corner is easier to find than a
          draggable control; mobile users may dismiss it for the session. */}
      <AnimatePresence>
        {guideLauncherVisible && !isZenMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed z-50 right-4 sm:bottom-24 sm:right-10 ${radioPlaybackState !== 'idle' && !mobileRadioHidden ? 'bottom-44' : 'bottom-32'}`}
          >
            <button
              type="button"
              onClick={() => setInstructionsOpen(true)}
              aria-label="Open quick guide"
              className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-[#111116]/85 text-gray-400 shadow-xl backdrop-blur-xl transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="font-serif text-lg font-bold italic">i</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideLauncherVisible(false)}
              aria-label="Hide quick guide button"
              className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-white/10 bg-[#16161c] text-gray-500 shadow-md sm:hidden"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Modal */}
      <AnimatePresence>
        {instructionsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setInstructionsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121214] border border-white/10 p-5 sm:p-7 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">60-second guide</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Make the break yours.</h2>
                </div>
                <button type="button" onClick={() => setInstructionsOpen(false)} aria-label="Close quick guide" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.05] text-white/35 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 text-blue-400 font-mono font-bold">1</div>
                  <div>
                    <strong className="text-gray-100 block">Start the ritual</strong>
                    <span className="text-[12px] leading-relaxed text-white/40">Hold the tip to light. In Chai Stall, hold the cup to sip.</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 text-orange-400 font-mono font-bold">2</div>
                  <div>
                    <strong className="text-gray-100 block">Puff, release, ash</strong>
                    <span className="text-[12px] leading-relaxed text-white/40">Hold the filter, release for a smoke ring, double-tap the ash.</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-mono font-bold">3</div>
                  <div>
                    <strong className="text-gray-100 block">Choose the sound</strong>
                    <span className="text-[12px] leading-relaxed text-white/40">Browse radio by mood, or balance ambience, crackle and radio in Mixer.</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 text-purple-400 font-mono font-bold">4</div>
                  <div>
                    <strong className="text-gray-100 block">Clear the screen</strong>
                    <span className="text-[12px] leading-relaxed text-white/40">Stealth hides the ritual. Zen removes every control until you exit.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInstructionsOpen(false)}
                className="mt-6 w-full py-3 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white rounded-xl font-medium transition-all border border-white/5 text-xs"
              >
                Start my break
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AmbientEngine: Procedural Soundscape Synthesizer ── */}
      {/* Headless component — renders null, manages all Web Audio API ambient nodes */}
      <AmbientEngine
        ref={engineRef}
        audioCtx={audioCtxRef.current}
        outputGain={ambientGainRef.current}
        roomId={currentRoom.id}
        volume={ambientVolume}
        enabled={false} /* USER REQUEST: Disabled for now, only YT audio allowed */
      />

    </div>
    </>
  );
}
