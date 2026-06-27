'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Coffee, EyeOff, Eye, MoreHorizontal, RotateCcw, Share2,
  MessageSquare, FileText, Linkedin, Star, RotateCcw as RestoreIcon,
  Shield, MapPin, Flag, X, Send, Smile, Volume2, VolumeX, Wifi, WifiOff,
  Users, Copy, BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BLOG_POSTS, BlogPost } from '@/lib/blog';

// ─── Types ───────────────────────────────────────────────────────────────────

type RoomId = 'office' | 'beach' | 'space' | 'library' | 'park' | 'metro' | 'chai' | 'silent';
type WeatherType = 'rain' | 'dust' | 'leaves' | 'stars';
type CigWidth = 'slim' | 'standard' | 'wide';

interface Room {
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

const ADJECTIVES = ['Sleepy','Grumpy','Tiny','Cloudy','Happy','Brave','Shy','Clever','Clumsy','Cozy','Wild','Misty'];
const ANIMALS    = ['Panda','Koala','Tiger','Muffin','Penguin','Bear','Fox','Owl','Bunny','Cat','Duck','Otter'];
const COLORS     = ['#f87171','#fb923c','#fbbf24','#a3e635','#34d399','#22d3ee','#818cf8','#c084fc','#f472b6'];

const generateNickname = (): string =>
  `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]}${ANIMALS[Math.floor(Math.random() * ANIMALS.length)]}`;

const getRandomColor = (): string => COLORS[Math.floor(Math.random() * COLORS.length)];

// Random x position for chat bubbles — avoids center zone where cigarette is
const getRandomChatX = (): number => {
  const zones = [
    () => 4 + Math.random() * 20,   // left zone: 4–24%
    () => 72 + Math.random() * 18,  // right zone: 72–90%
    () => 28 + Math.random() * 14,  // mid-left: 28–42%
    () => 56 + Math.random() * 14,  // mid-right: 56–70%
  ];
  return zones[Math.floor(Math.random() * zones.length)]();
};

const BANNED_WORDS = ['fuck','shit','bitch','asshole','dick','pussy','chutiya','madarchod','bhenchod','gandu','slur'];
const filterText = (text: string): string => {
  for (const word of BANNED_WORDS) {
    if (new RegExp(word, 'gi').test(text)) return '🚫 Message filtered';
  }
  return text;
};

const TOTAL_TIME = 180; // seconds

// ─── Rooms ───────────────────────────────────────────────────────────────────

const ROOMS: Room[] = [
  { id: 'office',  name: 'Office Rooftop', icon: '🌃', bg: '#0a0a12', accent: '#d4a373', wind: 0.5,  weather: 'stars', overlay: 'rgba(10,15,30,0.4)',   glowColor: 'rgba(249,115,22,0.18)',  audioScale: 'office'  },
  { id: 'beach',   name: 'Beach Sunset',   icon: '🏖️', bg: '#1a0b05', accent: '#f4a261', wind: 1.5,  weather: 'dust',  overlay: 'rgba(255,100,50,0.1)', glowColor: 'rgba(244,162,97,0.2)',   audioScale: 'nature'  },
  { id: 'space',   name: 'Space Station',  icon: '🌑', bg: '#000010', accent: '#a8dadc', wind: 0,    weather: 'stars', overlay: 'rgba(0,0,0,0)',         glowColor: 'rgba(168,218,220,0.15)', audioScale: 'cyber'   },
  { id: 'library', name: 'Library Corner', icon: '📚', bg: '#1e1a18', accent: '#dda15e', wind: 0.1,  weather: 'dust',  overlay: 'rgba(40,30,20,0.3)',    glowColor: 'rgba(221,161,94,0.15)',  audioScale: 'office'  },
  { id: 'park',    name: 'Park Bench',     icon: '🌳', bg: '#0b120c', accent: '#a3b18a', wind: 0.8,  weather: 'leaves',overlay: 'rgba(20,50,20,0.15)',   glowColor: 'rgba(163,177,138,0.15)', audioScale: 'nature'  },
  { id: 'metro',   name: 'Metro Platform', icon: '🚇', bg: '#101416', accent: '#9ca3af', wind: 2.0,  weather: 'dust',  overlay: 'rgba(10,30,40,0.2)',    glowColor: 'rgba(100,116,139,0.15)', audioScale: 'cyber'   },
  { id: 'chai',    name: 'Chai Stall',     icon: '🇮🇳', bg: '#1a120b', accent: '#e07a5f', wind: 0.3,  weather: 'rain',  overlay: 'rgba(50,30,10,0.3)',    glowColor: 'rgba(224,122,95,0.2)',   audioScale: 'chai'    },
  { id: 'silent',  name: 'Silent Room',    icon: '🤫', bg: '#050505', accent: '#6b705c', wind: 0.2,  overlay: 'rgba(0,0,0,0.5)',         glowColor: 'rgba(107,112,92,0.1)',   audioScale: 'silent'  },
];

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
  const warm = p.colorShift ?? 0;
  // Near ember: warm beige-gray. Rising: cool blue-white. Fully dispersed: transparent.
  const r = Math.round(195 + warm * 25);
  const g = Math.round(190 + warm * 10);
  const b = Math.round(195 + (1 - warm) * 20);

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
    grad.addColorStop(0,    `rgba(${r},${g},${b},${subA})`);
    grad.addColorStop(0.35, `rgba(${r},${g},${b},${subA * 0.7})`);
    grad.addColorStop(0.75, `rgba(${r},${g},${b},${subA * 0.2})`);
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
  const [isLit, setIsLit]               = useState(false);
  const [progress, setProgress]         = useState(0);
  const [lastTapProgress, setLastTapProgress] = useState(0);
  const [isFinished, setIsFinished]     = useState(false);
  const [glow, setGlow]                 = useState(0);
  const [isCharging, setIsCharging]     = useState(false);

  // UI modes
  const [isStealth, setIsStealth]       = useState(false);
  const [isZenMode, setIsZenMode]       = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [cigWidth, setCigWidth]         = useState<CigWidth>('standard');
  const [igniterType, setIgniterType]   = useState<'lighter' | 'match'>('lighter');

  // Room
  const [currentRoom, setCurrentRoom]   = useState<Room>(ROOMS[0]);
  const [prevBg, setPrevBg]             = useState(ROOMS[0].bg);

  // ASMR
  const [asmrOn, setAsmrOn]             = useState(false);
  const [musicOn, setMusicOn]           = useState(true);
  const [asmrVolume, setAsmrVolume]     = useState(0.5);

  // UI panels
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [updateNotesOpen, setUpdateNotesOpen] = useState(false);
  const [aboutOpen, setAboutOpen]       = useState(false);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [showNotice, setShowNotice]     = useState(true);
  const [streak, setStreak]             = useState(0);

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

  // Filter hold state
  const [filterHoldIntensity, setFilterHoldIntensity] = useState(0); // 0-1
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
  const filterRef          = useRef<HTMLDivElement>(null);

  // Pointer tracking — with proper reset on leave
  const pointerXRef   = useRef(-1000);
  const pointerYRef   = useRef(-1000);
  const ptrDownRef    = useRef(false);
  const lastPtrXRef   = useRef(-1000);
  const lastPtrYRef   = useRef(-1000);

  // Audio
  const audioCtxRef           = useRef<AudioContext | null>(null);
  const crackleGainRef        = useRef<GainNode | null>(null);
  const ambientGainRef        = useRef<GainNode | null>(null);
  const ambientMusicGainRef   = useRef<GainNode | null>(null);
  const ambientLowpassRef     = useRef<BiquadFilterNode | null>(null);
  const musicIntervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (lastVisit !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      currentStreak = lastVisit === yesterday ? currentStreak + 1 : 1;
      localStorage.setItem('pb_last_visit', today);
      localStorage.setItem('pb_streak', currentStreak.toString());
    }
    setStreak(currentStreak);

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
    if (storedIgniter) setIgniterType(storedIgniter as 'lighter' | 'match');

    // Seed mock messages
    const now = Date.now();
    const mocks = (MOCK_MESSAGES[ROOMS[0].id] ?? []).map((m, i) => ({
      id: `seed-${i}`, ...m,
      side: (i % 2 === 0 ? 'left' : 'right') as ChatMessage['side'],
      xPos: i % 2 === 0 ? 8 + Math.random() * 14 : 68 + Math.random() * 18,
      createdAt: now - (5 - i) * 4000, reactions: [],
    }));
    setMessages(mocks);
  }, []);

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

  // ── Simulated typing indicator ─────────────────────────────────────────────
  useEffect(() => {
    if (currentRoom.id === 'silent') { setIsTyping(false); return; }
    const id = setInterval(() => {
      if (Math.random() > 0.72) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2200 + Math.random() * 2800);
      }
    }, 6000);
    return () => clearInterval(id);
  }, [currentRoom.id]);

  // ── Simulated incoming messages ────────────────────────────────────────────
  useEffect(() => {
    if (currentRoom.id === 'silent') return;
    const BOT_MSGS: Record<string, string[]> = {
      office:  ['Anyone else on their 4th coffee?', 'Back to back meetings 😮‍💨', 'I miss weekends', 'My boss is watching...', 'Deadlines hitting different today'],
      beach:   ['Salty air vibes 🌊', 'Wish this was real', 'Summer anywhere 🌞', 'Life is good rn'],
      space:   ['Houston we have a deadline', 'Floating... in stress', '🚀', 'Zero gravity, full anxiety'],
      library: ['*whispers* hiii', 'Pages turning...', '📖', 'So peaceful in here'],
      park:    ['The birds are judging me lol', 'Fresh air hits different', '🌿', 'Dog just stared at me for 3 mins'],
      metro:   ['Mind the gap — in my productivity', 'Doors closing in 5...', '🚉', 'This delay tho'],
      chai:    ['Cutting chai >>> everything', 'Adrak wali please ☕', 'Tapri vibes only', 'Extra sugar bhai'],
      silent:  [],
    };
    const msgs = BOT_MSGS[currentRoom.id] ?? [];
    if (!msgs.length) return;
    const id = setInterval(() => {
      if (Math.random() > 0.6) {
        const text = msgs[Math.floor(Math.random() * msgs.length)];
        const nick = generateNickname();
        const color = getRandomColor();
        const msg: ChatMessage = {
          id: `bot-${Date.now()}`, text, nickname: nick, color,
          side: Math.random() > 0.5 ? 'left' : 'right',
          xPos: getRandomChatX(),
          createdAt: Date.now(), reactions: [],
        };
        setMessages(p => [...p.slice(-14), msg]);
      }
    }, 7000 + Math.random() * 5000);
    return () => clearInterval(id);
  }, [currentRoom.id]);

  // ── Room change: update mock seed messages ─────────────────────────────────
  const switchRoom = useCallback((room: Room) => {
    setPrevBg(currentRoom.bg);
    setCurrentRoom(room);
    setRoomModalOpen(false);
    const now = Date.now();
    const mocks = (MOCK_MESSAGES[room.id] ?? []).map((m, i) => ({
      id: `seed-r-${i}`, ...m,
      side: (i % 2 === 0 ? 'left' : 'right') as ChatMessage['side'],
      xPos: i % 2 === 0 ? 8 + Math.random() * 14 : 68 + Math.random() * 18,
      createdAt: now - (3 - i) * 3000, reactions: [],
    }));
    setMessages(mocks);
  }, [currentRoom.bg]);

  // ── Audio init ─────────────────────────────────────────────────────────────
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
      audioCtxRef.current = ctx;
      const bufferSize = ctx.sampleRate * 2;

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

      // Brown noise ambient
      const ambientBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const ad = ambientBuffer.getChannelData(0); let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        ad[i] = (lastOut + 0.02 * white) / 1.02; lastOut = ad[i]; ad[i] *= 3.5;
      }
      const ambientSource = ctx.createBufferSource();
      ambientSource.buffer = ambientBuffer; ambientSource.loop = true;
      ambientGainRef.current = ctx.createGain(); ambientGainRef.current.gain.value = 0;
      ambientSource.connect(ambientGainRef.current); ambientGainRef.current.connect(ctx.destination);
      ambientSource.start();

      // Procedural music bus
      ambientMusicGainRef.current = ctx.createGain(); ambientMusicGainRef.current.gain.value = 0;
      ambientLowpassRef.current = ctx.createBiquadFilter(); ambientLowpassRef.current.type = 'lowpass'; ambientLowpassRef.current.frequency.value = 600;
      ambientMusicGainRef.current.connect(ambientLowpassRef.current); ambientLowpassRef.current.connect(ctx.destination);
    } catch (e) { console.error('Audio init failed', e); }
  }, []);

  const toggleAsmr = useCallback(() => { initAudio(); setAsmrOn(p => !p); }, [initAudio]);
  const toggleMusic = useCallback(() => { initAudio(); setMusicOn(p => !p); }, [initAudio]);

  // ── Procedural note ───────────────────────────────────────────────────────
  const playNote = useCallback(() => {
    if (!audioCtxRef.current || !ambientMusicGainRef.current) return;
    const ctx = audioCtxRef.current;
    const scale = AUDIO_SCALES[currentRoom.audioScale] ?? AUDIO_SCALES.office;
    if (!scale.length) return;
    const freq = scale[Math.floor(Math.random() * scale.length)] * (Math.random() > 0.5 ? 2 : 1);
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = currentRoom.audioScale === 'cyber' ? 'sawtooth' : 'sine';
    osc.frequency.value = freq;
    osc.connect(gain); gain.connect(ambientMusicGainRef.current);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 2);
    gain.gain.linearRampToValueAtTime(0, now + 6);
    osc.start(now); osc.stop(now + 6);
  }, [currentRoom.audioScale]);

  // ── ASMR & Music controller ────────────────────────────────────────────────
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const isChai = currentRoom.id === 'chai';
    const activeAsmr = isLit && !isFinished && asmrOn;
    const activeMusic = isLit && !isFinished && musicOn;

    if (activeAsmr || activeMusic) {
      if (ctx.state === 'suspended') ctx.resume();
    }

    if (activeAsmr) {
      ambientGainRef.current?.gain.setTargetAtTime(isChai ? 0.15 * asmrVolume : 0.1 * asmrVolume, ctx.currentTime, 0.5);
      crackleGainRef.current?.gain.setTargetAtTime(isChai ? 0 : (isPuffing ? 0.3 : 0.08) * asmrVolume, ctx.currentTime, 0.5);
    } else {
      ambientGainRef.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      crackleGainRef.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    }

    if (activeMusic) {
      ambientMusicGainRef.current?.gain.setTargetAtTime(asmrVolume, ctx.currentTime, 0.5);
      if (!musicIntervalRef.current) {
        playNote();
        musicIntervalRef.current = setInterval(playNote, 3000);
      }
    } else {
      ambientMusicGainRef.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      if (musicIntervalRef.current) { clearInterval(musicIntervalRef.current); musicIntervalRef.current = null; }
    }
    
    return () => { if (musicIntervalRef.current) { clearInterval(musicIntervalRef.current); musicIntervalRef.current = null; } };
  }, [isLit, isFinished, asmrOn, musicOn, currentRoom.id, asmrVolume, isPuffing, playNote]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setIsLit(false); setProgress(0); setLastTapProgress(0); setIsFinished(false);
    setGlow(0); setIsCharging(false); setIsPuffing(false);
    setFilterHoldIntensity(0);
    particlesRef.current = [];
  }, []);

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
      crackleGainRef.current?.gain.setTargetAtTime(0.2, audioCtxRef.current.currentTime, 0.05);
      crackleGainRef.current?.gain.setTargetAtTime(0.08, audioCtxRef.current.currentTime + 0.1, 0.2);
    }
  }, [progress, lastTapProgress, isFinished, isLit, isStealth, currentRoom.id, vibrate, asmrOn]);

  // ── Puffing ref sync ──────────────────────────────────────────────────────
  const isPuffingRef = useRef(false);
  useEffect(() => { isPuffingRef.current = isPuffing; }, [isPuffing]);

  // ── Burn loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLit || isFinished) return;
    let frame: number;
    let lastTime = Date.now();
    let vt = progress * TOTAL_TIME * 1000;
    const update = () => {
      const now = Date.now(); const delta = now - lastTime; lastTime = now;
      const isChai = currentRoom.id === 'chai';
      if (isChai && !chaiHoldingRef.current) {
        frame = requestAnimationFrame(update); return;
      }
      // Puffing (holding filter while lit) burns faster
      const speed = (!isChai && isPuffingRef.current) ? 3.5 : 1;
      vt += delta * speed;
      const np = Math.min(vt / (TOTAL_TIME * 1000), 1);
      setProgress(np);
      if (np >= 1) { setIsFinished(true); setLastTapProgress(1); vibrate([300, 100, 300]); }
      else frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLit, isFinished, currentRoom.id]);

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
          // Grow faster when young, slower when old
          p.size += lr > 0.6 ? 0.55 : 0.25;
          p.vx *= 0.988; p.vy *= 0.992;
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
          p.size += 1.8;
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
          ctx.filter = 'blur(4px)'; // Heavy blur for "no perfect edge"
          ctx.beginPath();
          ctx.ellipse(0, 0, ellR * 1.4, ellR * 1.4 * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (p.type === 'donut') {
          if (ptrDownRef.current) {
            const dx = pointerXRef.current - p.x; const dy = pointerYRef.current - p.y;
            if (Math.hypot(dx, dy) < p.size + 40) { p.vx = (pointerXRef.current - lastPtrXRef.current) * 0.8; p.vy = (pointerYRef.current - lastPtrYRef.current) * 0.8; p.x = pointerXRef.current; p.y = pointerYRef.current; }
          }
          p.x += p.vx; p.vx *= 0.95; p.y += p.vy; p.size += 1.5;
          p.x += Math.sin(p.phase + (1 - lr) * 2) * 0.2;
          ctx.strokeStyle = `rgba(220,220,220,${lr * 0.45})`; ctx.lineWidth = Math.max(1, p.size * 0.12);
          ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * 0.4, 0, 0, Math.PI * 2); ctx.stroke();

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
    const id = setInterval(() => {
      const targetType = isChai ? 'steam' : 'smoke';
      const pCount = particlesRef.current.filter(p => p.type === targetType).length;
      const maxP = isChai ? 30 : (isPuffingRef.current ? 40 : 15);
      const emits = isPuffingRef.current && !isChai ? 2 : 1;
      if (pCount < maxP && emberRef.current) {
        const rect = emberRef.current.getBoundingClientRect();
        const filterRect = filterRef.current?.getBoundingClientRect();
        const baseWind = currentRoom.wind; const windV = Math.sin(Date.now() / 5000) * 0.5;
        for (let i = 0; i < emits; i++) {
          // Warm color near tip, cools as it rises
          const colorShift = 0.55 + Math.random() * 0.35;
          particlesRef.current.push({
            id: Math.random(), type: targetType,
            x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 5,
            y: rect.top - 2,
            vx: baseWind + windV + (Math.random() - 0.5) * 0.5,
            vy: isChai ? -0.4 - Math.random() * 0.4 : -1.0 - Math.random() * 0.7 - (isPuffingRef.current ? 1.2 : 0),
            life: isChai ? 120 + Math.random() * 60 : 220 + Math.random() * 100,
            maxLife: isChai ? 180 : 320,
            size: isChai ? 8 + Math.random() * 8 : 6 + Math.random() * 6,
            phase: Math.random() * Math.PI * 2,
            turbPhase: Math.random() * Math.PI * 2,
            colorShift,
          });
          // Exhale from filter — smoke coming out of mouth while holding
          if (isPuffingRef.current && filterRect && !isChai) {
            particlesRef.current.push({
              id: Math.random(), type: 'exhale',
              x: filterRect.left + filterRect.width / 2 + (Math.random() - 0.5) * 10,
              y: filterRect.bottom + 2,
              vx: (Math.random() - 0.5) * 1.2,
              vy: 1.2 + Math.random() * 2.0,
              life: 150 + Math.random() * 70, maxLife: 220,
              size: 5 + Math.random() * 7,
              phase: Math.random() * Math.PI * 2,
              turbPhase: Math.random() * Math.PI * 2,
              colorShift: 0.18,
            });
          }
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
      setIsCharging(true);
      let currentGlow = 0;
      lightIntervalRef.current = setInterval(() => { currentGlow += 0.05; setGlow(Math.min(currentGlow, 1)); }, 40);
      lightTimerRef.current = setTimeout(() => {
        if (lightIntervalRef.current) clearInterval(lightIntervalRef.current);
        setIsLit(true); setIsCharging(false);
        vibrate([150, 50, 150]);
      }, 800);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isStealth) return;
    chaiHoldingRef.current = false;
    setIsPuffing(false);
    const duration = Date.now() - pointerDownTimeRef.current;
    if (!isLit && !isFinished) {
      if (lightTimerRef.current) clearTimeout(lightTimerRef.current);
      if (lightIntervalRef.current) clearInterval(lightIntervalRef.current);
      setGlow(0); setIsCharging(false);
    }
    if (duration < 250) {
      const now = Date.now();
      if (now - lastTapRef.current < 400) {
        if (currentRoom.id === 'chai') {
          if (isFinished) { reset(); vibrate([80, 40, 80]); }
          else clinkChai();
        } else tapAsh();
      }
      lastTapRef.current = now;
    }
  };

  // ── Spawn smoke ring ──────────────────────────────────────────────────────
  const spawnSmokeRing = useCallback(() => {
    if (!filterRef.current) return;
    vibrate(50);
    const rect = filterRef.current.getBoundingClientRect();
    particlesRef.current.push({ id: Math.random(), type: 'donut', x: rect.left + rect.width / 2, y: rect.top, vx: 0, vy: -2 - Math.random() * 0.5, life: 200, maxLife: 200, size: 12, phase: Math.random() * Math.PI * 2 });
  }, [vibrate]);

  // ── Filter hold mechanic ──────────────────────────────────────────────────
  const handleFilterPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isLit && !isFinished && !isStealth && currentRoom.id !== 'chai' && !isZenMode) {
      handlePointerDown(e);
      return;
    }
    if (isLit && !isFinished && currentRoom.id !== 'chai') {
      setIsPuffing(true);
      isFilterHeldRef.current = true;
      filterHoldStartRef.current = Date.now();
      
      filterHoldTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - filterHoldStartRef.current) / 3000;
        setFilterHoldIntensity(Math.min(elapsed, 1));
      }, 50);

      // Spawn rings continuously while holding (long press)
      spawnIntervalRef.current = setInterval(() => {
         spawnExhalePuff(filterHoldIntensity || 0.4);
      }, 1200);

      return;
    }
    if (!isFinished || isStealth || currentRoom.id === 'chai') return;
    filterTimerRef.current = setTimeout(() => { spawnSmokeRing(); spawnIntervalRef.current = setInterval(spawnSmokeRing, 800); }, 500);
  };

  const handleFilterPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isFilterHeldRef.current && isLit && !isFinished) {
      if (filterHoldIntensity > 0.05) {
        spawnExhalePuff(filterHoldIntensity);
      }
    }
    isFilterHeldRef.current = false;
    setIsPuffing(false);
    chaiHoldingRef.current = false;
    setFilterHoldIntensity(0);
    if (filterHoldTimerRef.current) { clearInterval(filterHoldTimerRef.current); filterHoldTimerRef.current = null; }
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    if (spawnIntervalRef.current) { clearInterval(spawnIntervalRef.current); spawnIntervalRef.current = null; }
  };

  // ── Chat ──────────────────────────────────────────────────────────────────
  const chatEndRef = useRef<HTMLDivElement>(null);
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    const now = Date.now();
    if (now - lastMsgTime < 3000) return;
    const text = filterText(chatText);
    setMessages(p => [...p.slice(-14), {
      id: `user-${now}`, text, nickname, color: nameColor,
      side: Math.random() > 0.5 ? 'left' : 'right',
      xPos: getRandomChatX(),
      createdAt: now, reactions: [],
    }]);
    setChatText(''); setChatOpen(false); setLastMsgTime(now);
  };

  const handleReaction = (msgId: string, emoji: string) => {
    vibrate(30);
    setMessages(p => p.map(m => m.id === msgId ? { ...m, reactions: [...m.reactions, emoji] } : m));
    setEmojiPicker(null);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const timeLeft = Math.max(0, TOTAL_TIME - progress * TOTAL_TIME);
  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${Math.floor(s % 60).toString().padStart(2, '0')}s`;
  const cigWidthClass = { slim: 'w-8 sm:w-10', standard: 'w-12 sm:w-16', wide: 'w-16 sm:w-24' }[cigWidth];

  // Filter color based on hold intensity
  const filterGlowStyle = isPuffing && isLit && !isFinished ? {
    boxShadow: `0 0 ${8 + filterHoldIntensity * 32}px ${2 + filterHoldIntensity * 12}px rgba(${
      Math.round(249 - filterHoldIntensity * 60)},${
      Math.round(115 - filterHoldIntensity * 80)},22,${0.4 + filterHoldIntensity * 0.5})`,
    filter: `brightness(${1 + filterHoldIntensity * 0.6})`,
    transition: 'box-shadow 0.15s ease, filter 0.15s ease',
  } : {};

  const filterBgStyle = isPuffing && isLit && !isFinished ? {
    background: `linear-gradient(to bottom, 
      hsl(${46 - filterHoldIntensity * 46}deg, ${75 + filterHoldIntensity * 25}%, ${60 - filterHoldIntensity * 25}%) 0%, 
      hsl(${36 - filterHoldIntensity * 36}deg, ${65 + filterHoldIntensity * 35}%, ${52 - filterHoldIntensity * 28}%) 100%)`,
  } : {};

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-screen min-h-dvh overflow-hidden select-none font-display ${highContrast ? 'grayscale contrast-125' : ''}`}
      style={{ backgroundColor: currentRoom.bg, transition: 'background-color 1.2s ease' }}
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'bg-layer' && currentRoom.id !== 'silent' && !chatOpen) {
          setChatOpen(true);
        }
        setEmojiPicker(null);
      }}
    >
      {/* JSON-LD Structured Data for Search Engine Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              'name': 'PuffBreak',
              'alternateName': ['Online Damta', '온라인 담타', 'Damta World', '담타'],
              'url': 'https://puffbreak.com',
              'description': 'A mindful, interactive 3-minute digital break room experience. Take a mental pause by lighting a virtual cigarette or sipping a cup of hot chai with ambient audio, realistic particle physics, and a live anonymous community.',
              'applicationCategory': 'RelaxationApplication, HealthApplication',
              'operatingSystem': 'All',
              'browserRequirements': 'Requires JavaScript and HTML5 Canvas',
              'offers': {
                '@type': 'Offer',
                'price': '0.00',
                'priceCurrency': 'USD'
              },
              'featureList': [
                'Interactive Virtual Cigarette & Match/Lighter Ignition',
                'Virtual Hot Chai Tea Holding & Sipping Mechanic',
                'Dynamic Particle Physics for Smoke, Steam, and Weather',
                'Immersive Ambient ASMR Audio Synths',
                'Real-time Anonymous Live Chat Feed',
                'Multiple Aesthetic Teleport Rooms (Office, Beach, Space, Library, Park, Metro, Silent)',
                'Stealth and Zen Modes for Office Productivity Friendly Breaks'
              ]
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              'name': 'PuffBreak',
              'url': 'https://puffbreak.com',
              'potentialAction': {
                '@type': 'SearchAction',
                'target': 'https://puffbreak.com/?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              'mainEntity': [
                {
                  '@type': 'Question',
                  'name': 'What is PuffBreak?',
                  'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'PuffBreak is a mindful, interactive 3-minute digital break room experience. It is designed to provide a quick relaxation break, featuring virtual smoke breaks and tea sipping, ambient sounds, and an anonymous community, with no sign-up or accounts required.'
                  }
                },
                {
                  '@type': 'Question',
                  'name': 'Can PuffBreak help me quit smoking?',
                  'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Yes! Many users utilize PuffBreak as a digital smoking cessation aid, a virtual cigarette substitute, or a habit replacement tool. It offers the same 3-minute psychological pause and breathing rhythm as a real cigarette break, helping you manage cravings without the health risks.'
                  }
                },
                {
                  '@type': 'Question',
                  'name': 'Is PuffBreak completely free and anonymous?',
                  'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Yes, PuffBreak is 100% free and requires no registration or user accounts. Nicknames are randomly generated, and privacy is a core brand pillar.'
                  }
                },
                {
                  '@type': 'Question',
                  'name': 'What is the Chai Room in PuffBreak?',
                  'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'The Chai Room simulates a traditional tea stall experience, allowing you to sip hot tea by holding the screen, listen to ambient tea stall audio, and relax with dynamic steam rising from your cup.'
                  }
                }
              ]
            }
          ])
        }}
      />

      {/* Visually Hidden, Screen Reader and SEO Crawler Friendly Semantics */}
      <div className="sr-only">
        <h1>PuffBreak — Your Digital Break Room | Mindful Virtual Smoke & Tea Breaks</h1>
        <h2>A mindful 3-minute digital break ritual</h2>
        <p>
          Take a short, relaxing mental pause with PuffBreak. Light a virtual cigarette or sip a hot cup of chai tea in immersive ambient environments. Listen to relaxing ASMR audio, watch realistic smoke or steam rise, and exchange whispers anonymously with other breakers.
        </p>
        <h2>Ideal for Smoking Cessation & Stress Relief</h2>
        <p>
          Use PuffBreak as an interactive habit-replacement tool to quit smoking, manage nicotine withdrawal cravings, do breathing exercises, or simply step away from your desk. Teleport between the Office Rooftop, Beach Sunset, Space Station, Library Corner, Park Bench, Metro Platform, Chai Stall, or Silent Room. No registration required.
        </p>

        {/* Korean Competitor Targeting (damta.world / 온라인 담타) */}
        <h2>온라인 담타 (Online Damta) 글로벌 영어 버전 - PuffBreak</h2>
        <p>
          PuffBreak은 글로벌 이용자를 위한 온라인 담타(Online Damta) 및 가상 흡연실 시뮬레이션 서비스입니다.
          가상 담배를 피우거나 따뜻한 차이 티(Chai)를 마시며 전세계 각지의 사람들과 실시간 익명 채팅으로 소근소근 대화를 나눠보세요.
          금연 보조제, 스트레스 해소, 심호흡 훈련 및 일상의 소소한 리프레시를 위해 최적화되었습니다.
          회사 옥상, 노을진 해변, 우주 정거장, 조용한 도서관, 공원 벤치, 지하철 플랫폼, 차이 가판대 등 다양한 테마의 방에서 휴식을 취하세요.
          로그인이나 회원가입 없이 완전 익명으로 즉시 무료 사용이 가능합니다.
        </p>
        <h3>주요 기능 (Key Features)</h3>
        <ul>
          <li>🚬 현실적인 가상 담배 시뮬레이션 및 연기 도넛 필터 효과 (Virtual Smoke Break)</li>
          <li>☕ 따뜻한 차이티 마시기 시뮬레이터 (Chai Cup ASMR)</li>
          <li>💬 글로벌 실시간 익명 귓속말 채팅 커뮤니티 (Live Chat Room)</li>
          <li>🌌 감성적인 그래픽 테마 룸 이동 (Teleport Rooms)</li>
          <li>🤫 업무 중에 유용한 스텔스 모드 및 젠 모드 지원 (Stealth / Zen Mode)</li>
        </ul>
      </div>

      {/* BG Click Layer */}
      <div id="bg-layer" className="absolute inset-0 z-10 cursor-pointer" />

      {/* Grain Texture */}
      <svg className="pointer-events-none absolute inset-0 z-50 h-full w-full opacity-[0.022]">
        <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" /></filter>
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
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />

      {/* ── Floating Chat Messages ── */}
      {currentRoom.id !== 'silent' && !isZenMode && (
        <div
          className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
          style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 82%, transparent 100%)' }}
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 0, scale: 0.88 }}
                animate={{
                  opacity: [0, 1, 1, 1, 0],
                  y: [0, -15, -45, -80, -130],
                  scale: [0.88, 1, 1, 0.98, 0.94],
                }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 16, ease: 'linear', times: [0, 0.05, 0.3, 0.7, 1] }}
                className="absolute pointer-events-auto flex flex-col"
                style={{ left: `${msg.xPos}%`, bottom: '16%', maxWidth: 'min(180px, 28vw)' }}
              >
                {/* Nickname badge */}
                <div
                  className="text-[9px] font-semibold mb-1 tracking-wider uppercase px-1"
                  style={{ color: msg.color, textShadow: `0 0 8px ${msg.color}40` }}
                >
                  {msg.nickname}
                </div>
                {/* Message bubble */}
                <div
                  className="glass-chat px-3 py-2 rounded-2xl text-xs text-gray-200 shadow-xl cursor-pointer break-words relative leading-relaxed"
                  style={{
                    boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${msg.color}15`,
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
                        className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 glass-dark p-1.5 rounded-2xl flex space-x-1 shadow-2xl z-50 pointer-events-auto"
                        onClick={e => e.stopPropagation()}
                      >
                        {['❤️', '👍', '🔥', '😂', '👀', '✨'].map(em => (
                          <button key={em} onClick={() => handleReaction(msg.id, em)} className="hover:scale-125 active:scale-110 transition-transform px-0.5 text-sm">{em}</button>
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
            ))}
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

            <div className="flex space-x-1 items-center">
              {/* Timer — moved to the right */}
              <div className="font-mono-display text-sm tracking-widest pointer-events-none mr-2" aria-live="polite">
                {isLit && !isFinished ? (
                  <motion.span key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-200">
                    {formatTime(timeLeft)}
                  </motion.span>
                ) : (
                  <span className="opacity-30">— : ——</span>
                )}
              </div>

              {isOffline && (
                <WifiOff className="w-4 h-4 text-orange-400 mr-1" aria-label="Offline" />
              )}
              <button onClick={reset} className="p-2.5 hover:bg-white/10 active:bg-white/15 rounded-full transition-colors" aria-label="Reset">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button onClick={() => setIsZenMode(true)} className="p-2.5 hover:bg-white/10 active:bg-white/15 rounded-full transition-colors" aria-label="Zen Mode">
                <Coffee className="w-5 h-5" />
              </button>
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

      {/* ── UI Hint ── */}
      {!isLit && !isFinished && !isStealth && !isZenMode && (
        <div className="absolute top-28 text-xs tracking-widest uppercase animate-pulse opacity-50 z-10 pointer-events-none font-mono-display" style={{ color: currentRoom.accent }}>
          {currentRoom.id === 'chai' ? 'Hold to sip · Double-tap to clink' : 'Hold to light · Double-tap ash'}
        </div>
      )}
      {isLit && !isFinished && !isStealth && currentRoom.id !== 'chai' && !isZenMode && (
        <div className="absolute top-28 text-[10px] tracking-wider opacity-40 z-10 pointer-events-none text-gray-400">
          Hold filter to smoke · Double-tap to tap ash
        </div>
      )}
      {isLit && !isFinished && !isStealth && currentRoom.id === 'chai' && !isZenMode && (
        <div className="absolute top-28 text-[10px] tracking-wider opacity-40 z-10 pointer-events-none text-gray-400">
          Keep holding to sip · Release to pause · Double-tap to clink
        </div>
      )}
      {isFinished && !isStealth && currentRoom.id !== 'chai' && !isZenMode && (
        <div className="absolute top-28 text-xs tracking-widest text-amber-400 animate-pulse opacity-80 z-10 pointer-events-none font-mono-display uppercase">
          Hold the filter to blow a ring
        </div>
      )}
      {isFinished && !isStealth && currentRoom.id === 'chai' && !isZenMode && (
        <div className="absolute top-28 text-xs tracking-widest opacity-70 z-10 pointer-events-none text-gray-300 animate-pulse font-mono-display uppercase">
          Double-tap to wash the cup · Reset
        </div>
      )}

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
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: 96, height: 112 }}>
            <div className="relative w-full h-full bg-[#d4a373] rounded-b-3xl border-t-[6px] border-[#bc6c25] shadow-2xl overflow-hidden">
              <div className="absolute bottom-0 w-full bg-[#8b5a2b]" style={{ height: `${(1 - progress) * 100}%` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/20 pointer-events-none" />
              {isFinished && <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-60">☕</div>}
            </div>
            <div className="absolute right-0 top-1/3 translate-x-[70%]" style={{ width: 18, height: 28, border: '3px solid #bc6c25', borderLeft: 'none', borderRadius: '0 8px 8px 0' }} />
          </div>
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
          className={`relative ${cigWidthClass} h-[60vh] sm:h-[65vh] flex flex-col cursor-pointer mt-10 z-20 touch-none`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Igniter — positioned at the tip of the cigarette */}
          {isCharging && (
            <div className="absolute z-30 pointer-events-none" style={{ top: 0, left: '50%', width: 0, height: 0 }}>
              {igniterType === 'lighter' ? (
                /* Lighter */
                <div style={{ position: 'absolute', top: 0, left: 0, transform: 'scale(1.4)', transformOrigin: '0 0' }}>
                  <div className="lighter-anim-container" style={{ position: 'absolute', top: 0, left: 0 }}>
                    {/* Body */}
                    <div style={{
                      position: 'absolute', top: 22, left: -20,
                      width: 40, height: 56,
                      background: 'linear-gradient(135deg, #c8c8c8 0%, #a0a0a0 50%, #888 100%)',
                      borderRadius: 8,
                      border: '1px solid rgba(160,160,160,0.6)',
                      boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.5), 2px 4px 10px rgba(0,0,0,0.6)',
                    }}>
                      {/* Logo groove */}
                      <div style={{ position: 'absolute', top: 8, left: 6, right: 6, height: 12, borderRadius: 2, background: 'rgba(0,0,0,0.15)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }} />
                      {/* Bottom band */}
                      <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, height: 8, borderRadius: '0 0 8px 8px', background: 'rgba(0,0,0,0.12)' }} />
                    </div>
                    {/* Spark wheel */}
                    <div className="spark-wheel-anim" style={{ position: 'absolute', top: 16, left: -18, width: 12, height: 10, background: 'linear-gradient(to bottom, #555, #333)', borderRadius: 3, border: '1px solid #222', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
                    {/* Flame guard */}
                    <div style={{ position: 'absolute', top: 12, left: -13, width: 20, height: 10, background: 'linear-gradient(to bottom, #999, #777)', borderRadius: '3px 3px 0 0', border: '1px solid #666' }}>
                      <div style={{ position: 'absolute', top: 3, left: '50%', transform: 'translateX(-50%)', width: 2, height: 4, borderRadius: 4, background: '#555' }} />
                    </div>
                    {/* Flame exactly at 0,0 */}
                    <div className="lighter-flame-anim" style={{ position: 'absolute', bottom: 0, left: -9, width: 18, transformOrigin: 'bottom center' }}>
                      <div className="flame-layer-1" style={{ position: 'absolute', bottom: 0, left: 0, width: 18, height: 42, background: 'linear-gradient(to top, #f97316, #fbbf24, rgba(251,191,36,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(1.5px)', opacity: 0.95 }} />
                      <div className="flame-layer-2" style={{ position: 'absolute', bottom: 2, left: 3, width: 12, height: 26, background: 'linear-gradient(to top, #ffffff, #fde68a, rgba(253,230,138,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(0.8px)' }} />
                      <div className="flame-layer-3" style={{ position: 'absolute', bottom: 4, left: 6, width: 6, height: 16, background: 'linear-gradient(to top, #ffffff, #ffffff, rgba(255,255,255,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(0.4px)' }} />
                    </div>
                  </div>
                </div>
              ) : (
                /* Match */
                <div style={{ position: 'absolute', top: 0, left: 0 }}>
                  <div className="match-anim-container" style={{ position: 'absolute', top: 0, left: 0 }}>
                    {/* Match stick pointing down-right from 0,0 */}
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
                        {/* Sulfur head */}
                        <div style={{
                          position: 'absolute', top: -3, left: -3, width: 11, height: 10,
                          borderRadius: '55% 55% 40% 40%',
                          background: 'radial-gradient(circle at 40% 35%, #cc3030, #8b0000)',
                          boxShadow: '0 0 3px rgba(180,0,0,0.6)',
                        }} />
                      </div>
                    </div>
                    {/* Flame pointing straight up from 0,0 */}
                    <div className="match-flame-anim" style={{
                      position: 'absolute', bottom: 0, left: -10, width: 20, height: 34, transformOrigin: 'bottom center',
                    }}>
                      <div className="flame-layer-1" style={{ position: 'absolute', bottom: 0, left: 0, width: 20, height: 34, background: 'linear-gradient(to top, #f97316, #fbbf24, rgba(253,230,138,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(2px)', opacity: 0.95 }} />
                      <div className="flame-layer-2" style={{ position: 'absolute', bottom: 2, left: 4, width: 12, height: 22, background: 'linear-gradient(to top, white, #fde68a, rgba(253,230,138,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(1px)' }} />
                      <div className="flame-layer-3" style={{ position: 'absolute', bottom: 4, left: 7, width: 6, height: 14, background: 'linear-gradient(to top, white, white, rgba(255,255,255,0))', borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%', filter: 'blur(0.5px)' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Cigarette body */}
          <div className="relative w-full h-[75%] flex flex-col">
            {/* Burned gap */}
            <div style={{ height: `${lastTapProgress * 100}%` }} className="w-full" />

            {/* Current ash */}
            <div
              style={{
                height: `${(progress - lastTapProgress) * 100}%`,
                clipPath: (progress - lastTapProgress) * 100 > 1
                  ? 'polygon(3% 1px, 12% 4px, 21% 0px, 32% 5px, 45% 1px, 58% 6px, 71% 2px, 84% 5px, 96% 1px, 100% 4px, 100% 100%, 0% 100%)'
                  : 'none',
              }}
              className="w-full relative overflow-hidden rounded-t-sm"
            >
              <div className="absolute inset-0 bg-[#404040]" />
              <div className="absolute inset-0 opacity-80" style={{ filter: 'url(#noise)', mixBlendMode: 'overlay' }} />
              <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.4)_100%)]" />
              <div className="absolute top-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM1NTUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] opacity-50" />
            </div>

            {/* Ember tip */}
            <div ref={emberRef} className="w-full relative z-10">
              {(progress > 0 || glow > 0) && progress < 1 && (
                <>
                  {/* Core glow bar */}
                  <div
                    className={`absolute inset-x-0 bottom-0 ${isPuffing ? 'anim-ember-burn' : ''}`}
                    style={{
                      height: progress > 0 ? '5px' : `${Math.max(glow * 4, 1)}px`,
                      background: `linear-gradient(to right, #dc2626, #f97316, #dc2626)`,
                      boxShadow: `0 0 ${progress > 0 ? 20 + filterHoldIntensity * 24 : glow * 14}px ${3 + filterHoldIntensity * 6}px ${isPuffing ? '#dc2626' : '#ef4444'}`,
                      opacity: progress > 0 ? 1 : glow,
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
            <div style={{ height: `${(1 - progress) * 100}%` }} className="w-full bg-[#f5f5f5] relative overflow-hidden">
              {progress === 0 && <div className="absolute top-0 inset-x-0 h-[3px] bg-[#3e2723]" />}
              <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(0deg,transparent,transparent_6px,#000_6px,#000_7px)]" />
              <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,#000_1px,#000_2px)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
            </div>
          </div>

          {/* Filter */}
          <div
            ref={filterRef}
            className="w-full h-[25%] relative rounded-b-md overflow-hidden cursor-pointer transition-all duration-100"
            style={{
              background: `linear-gradient(to bottom, #e9c46a, #d4a373)`,
              ...filterBgStyle,
              ...filterGlowStyle,
            }}
            onPointerDown={handleFilterPointerDown}
            onPointerUp={handleFilterPointerUp}
            onPointerLeave={handleFilterPointerUp}
          >
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#8b5a2b_1px,transparent_1px)] [background-size:4px_4px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────
          BOTTOM PANEL — always visible
          ─────────────────────────────────────────────────────────────────── */}
      {!isZenMode && (
        <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-auto">

          {/* Stats row */}
          <div className="text-center text-[10px] sm:text-xs text-gray-500 opacity-60 pointer-events-none mb-2 px-4 flex items-center justify-center gap-2 truncate">
            <span>{currentRoom.icon}</span>
            <span>{currentRoom.name}</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 anim-pulse-dot" />
              <span>3 online</span>
            </span>
            <span className="opacity-40">·</span>
            <span>670 breaks today</span>
          </div>

          {/* Controls row */}
          <div className="flex overflow-x-auto no-scrollbar justify-start sm:justify-center items-center gap-2 px-4 pb-3 max-w-full">
            {/* Teleport */}
            <button
              onClick={() => setRoomModalOpen(true)}
              aria-label="Teleport"
              className="glass-dark hover:bg-white/10 active:bg-white/15 transition-all px-3.5 py-2.5 rounded-xl text-xs text-gray-300 flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 opacity-60" />
              <span className="hidden sm:inline">Teleport</span>
              <span className="text-[9px] opacity-50">▼</span>
            </button>

            {/* ASMR */}
            <button
              onClick={toggleAsmr}
              aria-label="Toggle ASMR"
              className={`transition-all px-3.5 py-2.5 rounded-xl text-xs border shadow-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 ${asmrOn ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-blue-500/10' : 'glass-dark text-gray-300 hover:bg-white/10'}`}
            >
              {asmrOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-60" />}
              <span>ASMR</span>
            </button>
            
            {/* Music */}
            <button
              onClick={toggleMusic}
              aria-label="Toggle Music"
              className={`transition-all px-3.5 py-2.5 rounded-xl text-xs border shadow-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 ${musicOn ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10' : 'glass-dark text-gray-300 hover:bg-white/10'}`}
            >
              <span className="text-[14px]">♫</span>
              <span>Music</span>
            </button>

            {/* Chat button with online indicator */}
            <button
              onClick={() => setChatOpen(o => !o)}
              aria-label="Open Chat"
              className={`glass-dark hover:bg-white/10 active:bg-white/15 transition-all px-3.5 py-2.5 rounded-xl text-xs text-gray-300 flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 relative ${chatOpen ? 'bg-white/10 border-white/15' : ''}`}
            >
              <MessageSquare className="w-3.5 h-3.5 opacity-60" />
              <span>Chat</span>
              {currentRoom.id !== 'silent' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black/40 anim-pulse-dot" />
              )}
            </button>

            {/* Report */}
            <button aria-label="Report" className="glass-dark hover:bg-white/10 active:bg-white/15 transition-all p-2.5 rounded-xl text-gray-400 shadow-lg hover:scale-105 active:scale-95">
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── Chat Input ── */}
          <AnimatePresence>
            {chatOpen && currentRoom.id !== 'silent' && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: 20 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: 20 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="chat-input-overlay">
                  {/* Room context strip */}
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{currentRoom.icon}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{currentRoom.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>3 online</span>
                    </div>
                  </div>
                  {/* Input form */}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2.5 px-3 pb-safe-bottom pt-1 safe-bottom" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
                    <Smile className="w-5 h-5 text-gray-500 shrink-0 cursor-pointer hover:text-gray-300 transition-colors" />
                    <div className="flex-1 relative">
                      <input
                        autoFocus
                        type="text"
                        value={chatText}
                        onChange={e => setChatText(e.target.value)}
                        placeholder="Whisper something..."
                        className="w-full bg-white/[0.06] border border-white/10 rounded-full px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/25 transition-all focus:bg-white/[0.08]"
                        maxLength={60}
                      />
                      {chatText.length > 0 && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-600">
                          {60 - chatText.length}
                        </span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={!chatText.trim()}
                      className="p-2.5 bg-blue-500 text-white rounded-full disabled:opacity-30 hover:bg-blue-400 active:bg-blue-600 transition-all shadow-lg shrink-0 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setChatOpen(false)} className="p-2 text-gray-500 hover:text-gray-200 transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notice Banner */}
          <AnimatePresence>
            {showNotice && !chatOpen && (
              <motion.div
                initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
                className="bg-[#0d0d0d]/90 backdrop-blur-md border-t border-gray-800/60 text-orange-500/80 py-2 px-4 flex justify-between items-center"
              >
                <span className="text-[10px] truncate pr-3 font-medium tracking-wide">
                  [Notice] Swearing, illegal promotions, hate speech are strictly prohibited.
                </span>
                <button onClick={() => setShowNotice(false)} className="text-gray-500 hover:text-white transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
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
                  Taking a break as{' '}
                  <strong style={{ color: nameColor }} className="font-semibold">{nickname}</strong>
                </div>
                {streak > 0 && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                    <span>🔥</span>
                    <span>{streak} day streak</span>
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
                <div className="px-5 py-3 border-b border-white/5 mb-1 space-y-2">
                  <label className="text-[11px] text-gray-500 uppercase tracking-widest font-mono-display block">ASMR Volume</label>
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                    <input type="range" min="0" max="1" step="0.05" value={asmrVolume} onChange={e => setAsmrVolume(parseFloat(e.target.value))} className="flex-1 accent-blue-400 cursor-pointer" />
                    <Volume2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  </div>
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
                  <MenuButton icon={<Share2 className="w-4 h-4" />} text="Share PuffBreak" onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'PuffBreak', url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }} />
                  <MenuButton icon={<MessageSquare className="w-4 h-4" />} text="Send Feedback" onClick={() => {
                    setDrawerOpen(false);
                    setFeedbackModalOpen(true);
                  }} />
                  <MenuButton icon={<Flag className="w-4 h-4" />} text="Report Issue" onClick={() => {
                    setDrawerOpen(false);
                    setReportModalOpen(true);
                  }} />
                  <MenuButton icon={<FileText className="w-4 h-4" />} text="Update Notes" onClick={() => {
                    setDrawerOpen(false);
                    setUpdateNotesOpen(true);
                  }} />
                  <MenuButton icon={<Linkedin className="w-4 h-4" />} text="About the Creator" onClick={() => {
                    window.open('https://www.linkedin.com/in/devsg/', '_blank');
                  }} />
                  <MenuButton icon={<Star className="w-4 h-4" />} text="Support / Donate" textColor="text-amber-400" onClick={() => {
                    setDrawerOpen(false);
                    setSupportModalOpen(true);
                  }} />
                  <MenuButton icon={<RestoreIcon className="w-4 h-4" />} text="Restore Nickname" onClick={() => { const n = localStorage.getItem('pb_nickname'); const c = localStorage.getItem('pb_color'); if (n && c) { setNickname(n); setNameColor(c); } }} />
                  <MenuButton icon={<BookOpen className="w-4 h-4" />} text="Read Blogs" onClick={() => {
                    setDrawerOpen(false);
                    setBlogModalOpen(true);
                  }} />
                  <MenuButton icon={<Shield className="w-4 h-4" />} text="Privacy Policy" onClick={() => {
                    setDrawerOpen(false);
                    setPrivacyModalOpen(true);
                  }} />
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
              className="absolute inset-0 bg-black/65 z-50 backdrop-blur-sm pointer-events-auto"
              onClick={() => { setBlogModalOpen(false); setActiveBlogPost(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: '4%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="absolute top-[5%] left-[5%] right-[5%] bottom-[5%] bg-[#0a0a0f]/95 backdrop-blur-3xl border border-white/10 rounded-3xl z-50 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
                <h2 className="text-emerald-400 font-bold tracking-tight text-lg">
                  {activeBlogPost ? (
                    <button onClick={() => setActiveBlogPost(null)} className="hover:text-emerald-300 flex items-center gap-2">
                      &larr; Back to Articles
                    </button>
                  ) : 'PuffBreak Journal'}
                </h2>
                <button onClick={() => { setBlogModalOpen(false); setActiveBlogPost(null); }} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 sm:p-10">
                {activeBlogPost ? (
                  <div className="max-w-2xl mx-auto pb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white leading-tight">{activeBlogPost.title}</h1>
                    <div className="text-sm text-emerald-400 mb-8 font-mono-display tracking-widest uppercase">
                      {activeBlogPost.author} &bull; {new Date(activeBlogPost.date).toLocaleDateString()}
                    </div>
                    <div className="prose prose-invert prose-emerald max-w-none text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: activeBlogPost.content }} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pb-10">
                    {BLOG_POSTS.map(post => (
                      <button key={post.slug} onClick={() => setActiveBlogPost(post)} className="text-left group flex flex-col h-full p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-lg hover:bg-white/[0.06] hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] tracking-wider uppercase bg-white/5 border border-white/10 px-3 py-1 rounded-full text-emerald-400">{tag}</span>
                          ))}
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors leading-snug">{post.title}</h3>
                        <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">{post.excerpt}</p>
                        <div className="text-sm text-emerald-500 font-semibold flex items-center mt-auto">
                          Read Article <span className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">&rarr;</span>
                        </div>
                      </button>
                    ))}
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
                  
                  <h3 className="text-white font-bold text-xl mb-4">No Tracking</h3>
                  <p className="mb-6">We use no third-party trackers, no cookies, and no analytics software. Your digital break room is completely isolated and secure.</p>
                  
                  <h3 className="text-white font-bold text-xl mb-4">Chat History</h3>
                  <p className="mb-6">When you send a message in a public room, it is broadcast to other active users in that room. It is never logged or stored on a server database. When the message vanishes from the screen, it is gone forever.</p>
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
                {ROOMS.map(r => (
                  <motion.button
                    key={r.id}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => switchRoom(r)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all ${currentRoom.id === r.id ? 'border-blue-500/40 text-blue-300' : 'border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'}`}
                    style={{
                      background: currentRoom.id === r.id
                        ? `${r.bg}dd`
                        : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <span className="text-2xl mb-1.5">{r.icon}</span>
                    <span className="text-[11px] font-medium tracking-wide text-center leading-tight">{r.name}</span>
                    {currentRoom.id === r.id && (
                      <span className="text-[9px] mt-1 text-blue-400/80 uppercase tracking-widest font-mono-display">Active</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* ── Feedback Modal ── */}
      <AnimatePresence>
        {feedbackModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 z-50 backdrop-blur-md pointer-events-auto"
              onClick={() => setFeedbackModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: '2%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.22 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 p-6 rounded-2xl z-50 w-[92%] max-w-md shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-emerald-400 font-semibold text-lg flex items-center gap-2 tracking-wide uppercase font-mono-display">
                  <MessageSquare className="w-5 h-5" />
                  <span>Send Feedback</span>
                </h3>
                <button onClick={() => setFeedbackModalOpen(false)} className="p-1.5 text-gray-500 hover:text-gray-200 transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                We'd love to hear your thoughts, feature requests, or general feedback about PuffBreak.
              </p>
              <div className="space-y-4">
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none" 
                  rows={4} 
                  placeholder="Tell us what you think..."
                ></textarea>
                <button onClick={() => setFeedbackModalOpen(false)} className="w-full flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 py-3 rounded-lg transition-colors font-medium">
                  <Send className="w-4 h-4" /> Submit Feedback
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Report Modal ── */}
      <AnimatePresence>
        {reportModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 z-50 backdrop-blur-md pointer-events-auto"
              onClick={() => setReportModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: '2%' }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.22 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-red-500/20 p-6 rounded-2xl z-50 w-[92%] max-w-md shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-red-400 font-semibold text-lg flex items-center gap-2 tracking-wide uppercase font-mono-display">
                  <Flag className="w-5 h-5" />
                  <span>Report Issue</span>
                </h3>
                <button onClick={() => setReportModalOpen(false)} className="p-1.5 text-gray-500 hover:text-gray-200 transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Found a bug or experiencing an issue? Let us know the details so we can fix it.
              </p>
              <div className="space-y-4">
                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-gray-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 appearance-none">
                  <option className="bg-gray-900">UI / Visual Bug</option>
                  <option className="bg-gray-900">Audio Issue</option>
                  <option className="bg-gray-900">Performance / Lag</option>
                  <option className="bg-gray-900">Other</option>
                </select>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none" 
                  rows={3} 
                  placeholder="Describe the issue..."
                ></textarea>
                <button onClick={() => setReportModalOpen(false)} className="w-full flex items-center justify-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 py-3 rounded-lg transition-colors font-medium">
                  Submit Report
                </button>
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
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest font-mono-display mb-3">Global (PayPal / Card)</h4>
                    <a href="mailto:hello@damta.world?subject=Donation" target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 py-2.5 rounded-lg transition-colors font-medium text-sm">
                      Donate via PayPal
                    </a>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest font-mono-display mb-3">Crypto</h4>
                    <div className="flex items-center justify-between bg-black/40 border border-white/5 p-2.5 rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-orange-400 font-medium text-sm">BTC</span>
                        <span className="text-gray-400 text-xs truncate">1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</span>
                      </div>
                      <button onClick={() => navigator.clipboard.writeText('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')} className="text-gray-400 hover:text-white p-1 ml-2 shrink-0">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest font-mono-display mb-3">Indian (UPI)</h4>
                    <div className="flex items-center justify-between bg-black/40 border border-white/5 p-2.5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-medium text-sm">UPI ID</span>
                        <span className="text-gray-400 text-xs">puffbreak@upi</span>
                      </div>
                      <button onClick={() => navigator.clipboard.writeText('puffbreak@upi')} className="text-gray-400 hover:text-white p-1 ml-2 shrink-0">
                        <Copy className="w-4 h-4" />
                      </button>
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
                  <h4 className="text-white font-medium">v1.2.0 - Immersion Update</h4>
                  <ul className="list-disc list-inside text-gray-400 space-y-1 ml-1 text-xs">
                    <li>Added realistic Match and Lighter ignition</li>
                    <li>Ultra-realistic smoke physics and holding logic</li>
                    <li>Premium UI upgrades and animations</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-medium">v1.1.0 - ASMR & Chai</h4>
                  <ul className="list-disc list-inside text-gray-400 space-y-1 ml-1 text-xs">
                    <li>Added Chai room with unique ASMR</li>
                    <li>Added live Chat features</li>
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
    </div>
  );
}
