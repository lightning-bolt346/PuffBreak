'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Coffee, EyeOff, Eye, MoreHorizontal, RotateCcw, Share2, MessageSquare, FileText, Linkedin, Star, RotateCcw as RestoreIcon, Shield, MapPin, Flag, X, Send, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Types ---

const ADJECTIVES = ['Sleepy', 'Grumpy', 'Tiny', 'Cloudy', 'Happy', 'Sad', 'Brave', 'Shy', 'Clever', 'Clumsy', 'Cozy', 'Wild'];
const ANIMALS = ['Panda', 'Koala', 'Tiger', 'Muffin', 'Penguin', 'Bear', 'Fox', 'Owl', 'Bunny', 'Cat', 'Dog', 'Duck'];
const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#818cf8', '#c084fc', '#f472b6'];

const generateNickname = () => `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]}${ANIMALS[Math.floor(Math.random() * ANIMALS.length)]}`;
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const BANNED_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'chutiya', 'madarchod', 'bhenchod', 'gandu', 'slur'];
const filterText = (text: string) => {
  let filtered = text;
  BANNED_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    if (regex.test(filtered)) {
      filtered = "🚫 Message filtered";
    }
  });
  return filtered;
};

type Room = { id: string; name: string; icon: string; bg: string; text: string; wind: number; weather?: 'rain' | 'dust' | 'leaves' | 'stars'; overlay: string; };

const ROOMS: Room[] = [
  { id: 'office', name: 'Office Rooftop', icon: '🌃', bg: '#0a0a0a', text: '#d4a373', wind: 0.5, weather: 'stars', overlay: 'rgba(10, 15, 30, 0.4)' },
  { id: 'beach', name: 'Beach Sunset', icon: '🏖️', bg: '#1a0b05', text: '#f4a261', wind: 1.5, weather: 'dust', overlay: 'rgba(255, 100, 50, 0.1)' },
  { id: 'space', name: 'Space Station', icon: '🌑', bg: '#000010', text: '#a8dadc', wind: 0, weather: 'stars', overlay: 'rgba(0, 0, 0, 0)' },
  { id: 'library', name: 'Library Corner', icon: '📚', bg: '#1e1a18', text: '#dda15e', wind: 0.1, weather: 'dust', overlay: 'rgba(40, 30, 20, 0.3)' },
  { id: 'park', name: 'Park Bench', icon: '🌳', bg: '#0b120c', text: '#a3b18a', wind: 0.8, weather: 'leaves', overlay: 'rgba(20, 50, 20, 0.15)' },
  { id: 'metro', name: 'Metro Platform', icon: '🚇', bg: '#101416', text: '#9ca3af', wind: 2.0, weather: 'dust', overlay: 'rgba(10, 30, 40, 0.2)' },
  { id: 'chai', name: 'Chai Stall', icon: '🇮🇳', bg: '#1a120b', text: '#e07a5f', wind: 0.3, weather: 'rain', overlay: 'rgba(50, 30, 10, 0.3)' },
  { id: 'silent', name: 'Silent Room', icon: '🤫', bg: '#050505', text: '#6b705c', wind: 0.2, overlay: 'rgba(0, 0, 0, 0.5)' },
];

type Particle = {
  id: number;
  type: 'smoke' | 'donut' | 'ash' | 'steam' | 'weather';
  wType?: 'rain' | 'dust' | 'leaves' | 'stars';
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; phase: number;
  rotation?: number; rotV?: number;
};

type ChatMessage = { id: string; text: string; nickname: string; color: string; x: number; createdAt: number; reactions: string[]; };

const MenuButton = ({ icon, text, textColor = "text-gray-300" }: { icon: React.ReactNode, text: string, textColor?: string }) => (
  <button className={`w-full flex items-center space-x-3 px-5 py-3 hover:bg-white/5 transition text-left ${textColor}`}>
    <span className="opacity-70">{icon}</span>
    <span className="text-sm">{text}</span>
  </button>
);

export default function VirtualCigarette() {
  const [isLit, setIsLit] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastTapProgress, setLastTapProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showFlame, setShowFlame] = useState(false);
  const [glow, setGlow] = useState(0);
  const [isStealth, setIsStealth] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  
  const [currentRoom, setCurrentRoom] = useState<Room>(ROOMS[0]);
  const [asmrOn, setAsmrOn] = useState(false);
  const [asmrVolume, setAsmrVolume] = useState(0.5);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [streak, setStreak] = useState(0);

  // Chat State
  const [nickname, setNickname] = useState('');
  const [nameColor, setNameColor] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInputOpen, setChatInputOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isPuffing, setIsPuffing] = useState(false);
  const [cigWidth, setCigWidth] = useState<'slim' | 'standard' | 'wide'>('standard');

  const TOTAL_TIME = 180; // 3 minutes in seconds
  
  const lightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lightIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pointerDownTimeRef = useRef<number>(0);
  const lastTapRef = useRef<number>(0);

  const filterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const smokeTrailsRef = useRef<{x: number, y: number, life: number}[]>([]);
  const emberRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const crackleGainRef = useRef<GainNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  const vibrate = useCallback((ms: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  }, []);

  // Initialize identity, streak and mock chat
  useEffect(() => {
    // Streak logic
    const lastVisit = localStorage.getItem('damta_last_visit');
    const streakStr = localStorage.getItem('damta_streak');
    let currentStreak = streakStr ? parseInt(streakStr) : 0;
    const today = new Date().toDateString();
    
    if (lastVisit !== today) {
       const yesterday = new Date(Date.now() - 86400000).toDateString();
       if (lastVisit === yesterday) {
           currentStreak += 1;
       } else {
           currentStreak = 1;
       }
       localStorage.setItem('damta_last_visit', today);
       localStorage.setItem('damta_streak', currentStreak.toString());
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(currentStreak);

    const storedName = localStorage.getItem('damta_nickname');
    const storedColor = localStorage.getItem('damta_color');
    if (storedName && storedColor) {
      setNickname(storedName);
      setNameColor(storedColor);
    } else {
      const newName = generateNickname();
      const newColor = getRandomColor();
      localStorage.setItem('damta_nickname', newName);
      localStorage.setItem('damta_color', newColor);
      setNickname(newName);
      setNameColor(newColor);
    }

    const now = Date.now();
    setMessages([
      { id: 'm1', text: 'Hello everyone!', nickname: 'HappyPanda', color: '#f87171', x: 20, createdAt: now - 5000, reactions: [] },
      { id: 'm2', text: 'Nice weather today', nickname: 'SleepyKoala', color: '#fb923c', x: 60, createdAt: now - 2000, reactions: ['❤️'] },
      { id: 'm3', text: 'Anyone from NY?', nickname: 'WildTiger', color: '#34d399', x: 40, createdAt: now - 15000, reactions: [] },
    ]);
  }, []);

  // Offline status
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Message cleanup loop
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => prev.filter(m => Date.now() - m.createdAt < 20000)); // Clean up after 20s
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock typing indicator
  useEffect(() => {
    if (currentRoom.id === 'silent') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsTyping(false);
      return;
    }
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000 + Math.random() * 3000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentRoom.id]);

  const ambientOscRef = useRef<OscillatorNode | null>(null);
  const ambientMusicGainRef = useRef<GainNode | null>(null);
  const ambientLowpassRef = useRef<BiquadFilterNode | null>(null);
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    
    const now = Date.now();
    if (now - lastMessageTime < 3000) return; // Rate limit
    
    const text = filterText(chatText);
    const x = Math.random() > 0.5 ? 5 + Math.random() * 20 : 75 + Math.random() * 20;
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      text,
      nickname,
      color: nameColor,
      x,
      createdAt: Date.now(),
      reactions: []
    };
    
    setMessages(prev => [...prev, newMsg]);
    setChatText('');
    setChatInputOpen(false);
    setLastMessageTime(now);
  };

  const handleReaction = (msgId: string, emoji: string = '👍') => {
    vibrate(50);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: [...m.reactions, emoji] } : m));
  };

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        
        // Crackle
        const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const crackleData = crackleBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            if (Math.random() > 0.995) crackleData[i] = (Math.random() * 2 - 1) * 2;
            else crackleData[i] = (Math.random() * 2 - 1) * 0.1;
        }
        const crackleSource = ctx.createBufferSource();
        crackleSource.buffer = crackleBuffer;
        crackleSource.loop = true;

        crackleGainRef.current = ctx.createGain();
        crackleGainRef.current.gain.value = 0;
        
        const crackleFilter = ctx.createBiquadFilter();
        crackleFilter.type = 'highpass';
        crackleFilter.frequency.value = 2000;

        crackleSource.connect(crackleFilter);
        crackleFilter.connect(crackleGainRef.current);
        crackleGainRef.current.connect(ctx.destination);
        crackleSource.start();

        // Ambient (Brown noise approx)
        const ambientBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const ambientData = ambientBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            ambientData[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = ambientData[i];
            ambientData[i] *= 3.5;
        }
        const ambientSource = ctx.createBufferSource();
        ambientSource.buffer = ambientBuffer;
        ambientSource.loop = true;

        ambientGainRef.current = ctx.createGain();
        ambientGainRef.current.gain.value = 0;

        ambientSource.connect(ambientGainRef.current);
        ambientGainRef.current.connect(ctx.destination);
        ambientSource.start();

        // Ambient Music Engine (Procedural)
        ambientMusicGainRef.current = ctx.createGain();
        ambientMusicGainRef.current.gain.value = 0;
        ambientLowpassRef.current = ctx.createBiquadFilter();
        ambientLowpassRef.current.type = 'lowpass';
        ambientLowpassRef.current.frequency.value = 600; // muffled
        ambientMusicGainRef.current.connect(ambientLowpassRef.current);
        ambientLowpassRef.current.connect(ctx.destination);
    } catch (e) {
        console.error("Audio init failed", e);
    }
  }, []);

  const toggleAsmr = useCallback(() => {
    initAudio();
    setAsmrOn(prev => !prev);
  }, [initAudio]);

  const playProceduralAmbientNote = useCallback(() => {
      if (!audioCtxRef.current || !ambientMusicGainRef.current) return;
      const ctx = audioCtxRef.current;
      
      const scales: Record<string, number[]> = {
          'office': [130.81, 155.56, 196.00, 233.08, 261.63], // C minor pentatonic (lofi)
          'nature': [130.81, 146.83, 164.81, 196.00, 220.00], // C major pentatonic (jazz/breezy)
          'cyber': [65.41, 98.00, 130.81, 196.00, 261.63],   // C minor open (synthwave)
          'chai': [138.59, 155.56, 185.00, 207.65, 277.18],  // Db minor pentatonic
          'silent': []
      };

      const scale = scales[currentRoom.id] || scales['office'];
      if (scale.length === 0) return;

      const freq = scale[Math.floor(Math.random() * scale.length)] * (Math.random() > 0.5 ? 2 : 1);
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = currentRoom.id === 'cyber' ? 'sawtooth' : 'sine';
      osc.frequency.value = freq;
      
      osc.connect(gain);
      gain.connect(ambientMusicGainRef.current);
      
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 2); // slow attack
      gain.gain.linearRampToValueAtTime(0, now + 6);   // slow release
      
      osc.start(now);
      osc.stop(now + 6);
  }, [currentRoom.id]);

  useEffect(() => {
    if (!audioCtxRef.current) return;
    
    if (isLit && !isFinished && asmrOn && currentRoom.id !== 'chai') {
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        ambientGainRef.current?.gain.setTargetAtTime(0.1 * asmrVolume, audioCtxRef.current.currentTime, 0.5);
        const crackleTarget = isPuffing ? 0.3 : 0.08;
        crackleGainRef.current?.gain.setTargetAtTime(crackleTarget * asmrVolume, audioCtxRef.current.currentTime, 0.5);
        ambientMusicGainRef.current?.gain.setTargetAtTime(1 * asmrVolume, audioCtxRef.current.currentTime, 0.5);
        
        if (!musicIntervalRef.current) {
            playProceduralAmbientNote();
            musicIntervalRef.current = setInterval(playProceduralAmbientNote, 3000);
        }
    } else if (isLit && !isFinished && asmrOn && currentRoom.id === 'chai') {
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        ambientGainRef.current?.gain.setTargetAtTime(0.15 * asmrVolume, audioCtxRef.current.currentTime, 0.5);
        crackleGainRef.current?.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        ambientMusicGainRef.current?.gain.setTargetAtTime(1 * asmrVolume, audioCtxRef.current.currentTime, 0.5);
        
        if (!musicIntervalRef.current) {
            playProceduralAmbientNote();
            musicIntervalRef.current = setInterval(playProceduralAmbientNote, 3000);
        }
    } else {
        ambientGainRef.current?.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        crackleGainRef.current?.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        ambientMusicGainRef.current?.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        if (musicIntervalRef.current) {
            clearInterval(musicIntervalRef.current);
            musicIntervalRef.current = null;
        }
    }
    
    return () => {
        if (musicIntervalRef.current) {
            clearInterval(musicIntervalRef.current);
            musicIntervalRef.current = null;
        }
    };
  }, [isLit, isFinished, asmrOn, currentRoom.id, asmrVolume, isPuffing, playProceduralAmbientNote]);

  const reset = useCallback(() => {
    setIsLit(false);
    setProgress(0);
    setLastTapProgress(0);
    setIsFinished(false);
    setShowFlame(false);
    setGlow(0);
    particlesRef.current = [];
  }, []);

  const clinkChai = useCallback(() => {
    vibrate([50, 30, 50]);
    if (emberRef.current) {
      const rect = emberRef.current.getBoundingClientRect();
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push({
          id: Math.random(),
          type: 'weather',
          wType: 'rain', // acts like splash
          x: rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width,
          y: rect.top,
          vx: (Math.random() - 0.5) * 4,
          vy: -3 - Math.random() * 4,
          life: 40, maxLife: 40, size: 2 + Math.random() * 2, phase: 0
        });
      }
    }
    if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtxRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2500, audioCtxRef.current.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.3);
    }
  }, [vibrate]);

  const tapAsh = useCallback(() => {
    if (progress > lastTapProgress && !isFinished && isLit && !isStealth) {
      vibrate(50);
      setLastTapProgress(progress);
      
      if (currentRoom.id !== 'chai' && emberRef.current) {
        const rect = emberRef.current.getBoundingClientRect();
        for (let i = 0; i < 15; i++) {
          particlesRef.current.push({
            id: Math.random(),
            type: 'ash',
            x: rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width,
            y: rect.top,
            vx: (Math.random() - 0.5) * 4,
            vy: -2 - Math.random() * 3,
            life: 60, maxLife: 60, size: 2 + Math.random() * 2, phase: 0,
            rotation: Math.random() * 360, rotV: (Math.random() - 0.5) * 20
          });
        }
      }
      
      if (audioCtxRef.current && asmrOn && currentRoom.id !== 'chai') {
          crackleGainRef.current?.gain.setTargetAtTime(0.2, audioCtxRef.current.currentTime, 0.05);
          crackleGainRef.current?.gain.setTargetAtTime(0.08, audioCtxRef.current.currentTime + 0.1, 0.2);
      }
    }
  }, [progress, lastTapProgress, isFinished, isLit, isStealth, vibrate, currentRoom.id, asmrOn]);

  const isPuffingRef = useRef(false);

  useEffect(() => {
    isPuffingRef.current = isPuffing;
  }, [isPuffing]);

  useEffect(() => {
    if (!isLit || isFinished) return;
    let frame: number;
    let lastTime = Date.now();
    let currentVirtualTime = progress * TOTAL_TIME * 1000;

    const update = () => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;
      
      const speedMultiplier = isPuffingRef.current ? 4 : 1;
      currentVirtualTime += delta * speedMultiplier;
      
      const newProgress = Math.min(currentVirtualTime / (TOTAL_TIME * 1000), 1);
      setProgress(newProgress);
      
      if (newProgress >= 1) {
        setIsFinished(true);
        setLastTapProgress(1);
        vibrate([300, 100, 300]); // Pulse when finished
      } else {
        frame = requestAnimationFrame(update);
      }
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [isLit, isFinished]);

  // Canvas setup and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let pointerX = -1000;
    let pointerY = -1000;
    let lastPointerX = -1000;
    let lastPointerY = -1000;
    let isPointerDown = false;

    const handlePointerMove = (e: PointerEvent) => {
      lastPointerX = pointerX;
      lastPointerY = pointerY;
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (isPointerDown && isLit && !isFinished) {
         smokeTrailsRef.current.push({ x: pointerX, y: pointerY, life: 1.0 });
      }
    };
    const handlePointerDown = (e: PointerEvent) => {
      pointerX = e.clientX; pointerY = e.clientY;
      lastPointerX = pointerX; lastPointerY = pointerY;
      isPointerDown = true;
    };
    const handlePointerUp = () => { isPointerDown = false; };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    let frameId: number;
    let lastRenderTime = Date.now();

    const render = () => {
      const now = Date.now();
      const delta = now - lastRenderTime;
      lastRenderTime = now;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw trailing smoke
      smokeTrailsRef.current.forEach(t => {
         t.life -= delta * 0.0001; // fade out over ~10s
         if (t.life > 0) {
            ctx.fillStyle = `rgba(180, 180, 180, ${t.life * 0.1})`;
            ctx.beginPath();
            ctx.ellipse(t.x, t.y, 20 + (1 - t.life) * 40, 15 + (1 - t.life) * 30, t.life * Math.PI, 0, Math.PI * 2);
            ctx.fill();
         }
      });
      smokeTrailsRef.current = smokeTrailsRef.current.filter(t => t.life > 0);
      
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life--;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        
        const lifeRatio = p.life / p.maxLife; // 1 to 0
        
        // Repulsion field
        if (p.type === 'smoke' || p.type === 'weather') {
           const dx = p.x - pointerX;
           const dy = p.y - pointerY;
           const dist = Math.hypot(dx, dy);
           if (dist < 120) {
              const force = (120 - dist) / 120;
              p.vx += (dx / dist) * force * 0.8;
              p.vy += (dy / dist) * force * 0.8;
           }
        }
        
        if (p.type === 'smoke') {
          p.x += p.vx + Math.sin(p.phase + (1 - lifeRatio) * 5) * 0.5;
          p.y += p.vy;
          p.size += 0.4;
          
          ctx.fillStyle = `rgba(200, 200, 200, ${lifeRatio * 0.08})`;
          ctx.beginPath();
          // Realistic smoke blob (overlapping ellipses)
          ctx.ellipse(p.x, p.y, p.size, p.size * 0.7, p.phase, 0, Math.PI * 2);
          ctx.ellipse(p.x + p.size * 0.2, p.y - p.size * 0.1, p.size * 0.8, p.size * 0.6, p.phase + 1, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.shadowColor = 'rgba(200, 200, 200, 0.3)';
          ctx.shadowBlur = 15;
        } else if (p.type === 'steam') {
          p.x += p.vx + Math.sin(p.phase + (1 - lifeRatio) * 3) * 0.5;
          p.y += p.vy;
          p.size += 0.5;
          ctx.fillStyle = `rgba(220, 220, 220, ${lifeRatio * 0.08})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = 'rgba(220, 220, 220, 0.2)';
          ctx.shadowBlur = 15;
        } else if (p.type === 'donut') {
          if (isPointerDown) {
             const dx = pointerX - p.x;
             const dy = pointerY - p.y;
             if (Math.hypot(dx, dy) < p.size + 40) {
                 p.vx = (pointerX - lastPointerX) * 0.8;
                 p.vy = (pointerY - lastPointerY) * 0.8;
                 p.x = pointerX; p.y = pointerY;
             }
          }
          p.x += p.vx;
          p.vx *= 0.95; // friction
          p.y += p.vy;
          p.size += 1.5;
          p.x += Math.sin(p.phase + (1 - lifeRatio) * 2) * 0.2;
          ctx.strokeStyle = `rgba(220, 220, 220, ${lifeRatio * 0.4})`;
          ctx.lineWidth = p.size * 0.15;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        } else if (p.type === 'ash') {
          p.x += p.vx;
          p.vy += 0.2;
          p.y += p.vy;
          if (p.rotation !== undefined && p.rotV !== undefined) p.rotation += p.rotV;
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.rotation) ctx.rotate(p.rotation * Math.PI / 180);
          ctx.fillStyle = `rgba(136, 136, 136, ${lifeRatio})`;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          ctx.restore();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        } else if (p.type === 'weather') {
          p.x += p.vx;
          p.y += p.vy;
          ctx.shadowBlur = 0;
          if (p.wType === 'rain') {
            ctx.strokeStyle = `rgba(150, 200, 255, ${lifeRatio * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx, p.y + p.vy * 2); ctx.stroke();
          } else if (p.wType === 'stars') {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(p.phase) * lifeRatio})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            p.phase += 0.05;
          } else if (p.wType === 'dust') {
            ctx.fillStyle = `rgba(200, 180, 150, ${lifeRatio * 0.3})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            p.x += Math.sin(p.phase) * 0.5; p.phase += 0.02;
          } else if (p.wType === 'leaves') {
            ctx.save();
            ctx.translate(p.x, p.y);
            p.rotation = (p.rotation || 0) + (p.rotV || 2);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = `rgba(180, 100, 50, ${lifeRatio * 0.6})`;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size/2);
            ctx.restore();
            p.x += Math.sin(p.phase) * 1.5; p.phase += 0.05;
          }
        }
      }
      
      frameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Ambient particle emission
  useEffect(() => {
    if (!isLit || isFinished || isStealth) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const isChai = currentRoom.id === 'chai';
    
    const interval = setInterval(() => {
      const targetType = isChai ? 'steam' : 'smoke';
      const pCount = particlesRef.current.filter(p => p.type === targetType).length;
      
      const maxSmoke = isChai ? 30 : (isPuffingRef.current ? 80 : 50);
      const emitsPerTick = isPuffingRef.current && !isChai ? 3 : 1;
      
      if (pCount < maxSmoke && emberRef.current) {
        const rect = emberRef.current.getBoundingClientRect();
        const filterRect = filterRef.current?.getBoundingClientRect();
        
        const baseWind = currentRoom.wind;
        const windVariance = Math.sin(Date.now() / 5000) * 0.5;
        
        for (let i=0; i<emitsPerTick; i++) {
            // normal smoke from ember
            particlesRef.current.push({
              id: Math.random(),
              type: targetType,
              x: rect.left + rect.width / 2,
              y: rect.top,
              vx: baseWind + windVariance + (Math.random() - 0.5) * 0.5,
              vy: isChai ? (-0.5 - Math.random() * 0.5) : (-1 - Math.random() * 0.5 - (isPuffingRef.current ? 1 : 0)),
              life: isChai ? (120 + Math.random() * 60) : (180 + Math.random() * 60),
              maxLife: 240,
              size: isChai ? (10 + Math.random() * 10) : (5 + Math.random() * 5),
              phase: Math.random() * Math.PI * 2
            });
            
            // extra smoke from bottom of filter when puffing
            if (isPuffingRef.current && filterRect && !isChai) {
                particlesRef.current.push({
                  id: Math.random(),
                  type: targetType,
                  x: filterRect.left + filterRect.width / 2 + (Math.random() - 0.5) * 10,
                  y: filterRect.bottom,
                  vx: (Math.random() - 0.5) * 2,
                  vy: 2 + Math.random() * 2, // downwards
                  life: 100 + Math.random() * 40,
                  maxLife: 140,
                  size: 4 + Math.random() * 4,
                  phase: Math.random() * Math.PI * 2
                });
            }
        }
      }

      // Weather Emission
      if (currentRoom.weather) {
          const wCount = particlesRef.current.filter(p => p.type === 'weather').length;
          if (wCount < 40 && Math.random() > 0.5) {
              const wType = currentRoom.weather;
              let vx = currentRoom.wind + (Math.random() - 0.5);
              let vy = 1 + Math.random() * 2;
              let x = Math.random() * window.innerWidth;
              let y = -20;
              let maxLife = 300;
              let size = 2;
              
              if (wType === 'stars') {
                  vx = 0; vy = 0;
                  x = Math.random() * window.innerWidth;
                  y = Math.random() * window.innerHeight;
                  maxLife = 100 + Math.random() * 200;
                  size = Math.random() * 1.5;
              } else if (wType === 'dust') {
                  vy = (Math.random() - 0.5) * 0.5;
                  x = Math.random() * window.innerWidth;
                  y = Math.random() * window.innerHeight;
                  size = Math.random() * 2;
              } else if (wType === 'leaves') {
                  size = 5 + Math.random() * 5;
              }

              particlesRef.current.push({
                  id: Math.random(), type: 'weather', wType, x, y, vx, vy,
                  life: maxLife, maxLife, size, phase: Math.random() * Math.PI * 2,
                  rotation: Math.random() * 360, rotV: (Math.random() - 0.5) * 5
              });
          }
      }
    }, isChai ? 250 : 150);
    return () => clearInterval(interval);
  }, [isLit, isFinished, isStealth, currentRoom.id, currentRoom.wind, currentRoom.weather]);

  // Shake detection for mobile
  useEffect(() => {
    let lastUpdate = 0;
    const handleMotion = (e: DeviceMotionEvent) => {
      const now = Date.now();
      if (now - lastUpdate < 300) return;
      if (e.accelerationIncludingGravity) {
        const { x, y, z } = e.accelerationIncludingGravity;
        const acceleration = Math.sqrt((x || 0)**2 + (y || 0)**2 + (z || 0)**2);
        if (acceleration > 15) { 
            lastUpdate = now; 
            if (currentRoom.id === 'chai') clinkChai();
            else tapAsh(); 
        }
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [tapAsh, clinkChai, currentRoom.id]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    initAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    
    if (isStealth) return;
    pointerDownTimeRef.current = Date.now();
    if (!isLit && !isFinished) {
      let currentGlow = 0;
      lightIntervalRef.current = setInterval(() => {
        currentGlow += 0.05;
        setGlow(Math.min(currentGlow, 1));
      }, 40);

      lightTimerRef.current = setTimeout(() => {
        if (lightIntervalRef.current) clearInterval(lightIntervalRef.current);
        setIsLit(true);
        if (currentRoom.id !== 'chai') {
            setShowFlame(true);
            setTimeout(() => setShowFlame(false), 1000);
        }
        vibrate([150, 50, 150]); // Distinct long pulse when lit
      }, 800);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isStealth) return;
    const duration = Date.now() - pointerDownTimeRef.current;
    
    if (!isLit && !isFinished) {
      if (lightTimerRef.current) clearTimeout(lightTimerRef.current);
      if (lightIntervalRef.current) clearInterval(lightIntervalRef.current);
      setGlow(0);
    }

    if (duration < 250) {
      const now = Date.now();
      if (now - lastTapRef.current < 400) {
         if (currentRoom.id === 'chai') {
             clinkChai();
         } else {
             tapAsh();
         }
      }
      lastTapRef.current = now;
    }
  };

  const spawnSmokeRing = useCallback(() => {
    if (filterRef.current) {
      vibrate(50);
      const rect = filterRef.current.getBoundingClientRect();
      particlesRef.current.push({
        id: Math.random(), type: 'donut',
        x: rect.left + rect.width / 2, y: rect.top, vx: 0, vy: -2 - Math.random() * 0.5,
        life: 180, maxLife: 180, size: 10, phase: Math.random() * Math.PI * 2
      });
    }
  }, [vibrate]);

  const handleFilterPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isLit && !isFinished && currentRoom.id !== 'chai') {
      setIsPuffing(true);
      return;
    }
    if (!isFinished || isStealth || currentRoom.id === 'chai') return;
    filterTimerRef.current = setTimeout(() => {
      spawnSmokeRing();
      spawnIntervalRef.current = setInterval(spawnSmokeRing, 800);
    }, 500);
  };

  const handleFilterPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPuffing(false);
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const timeLeft = Math.max(0, TOTAL_TIME - progress * TOTAL_TIME);

  return (
    <div 
      className={`flex flex-col items-center justify-center min-h-screen overflow-hidden select-none font-sans relative transition-colors duration-1000 ${highContrast ? 'grayscale contrast-125' : ''}`} 
      style={{ backgroundColor: currentRoom.bg }}
      onClick={(e) => {
        // Trigger chat input on background click
        if ((e.target as HTMLElement).id === 'bg-layer' && currentRoom.id !== 'silent') {
          setChatInputOpen(true);
        }
      }}
    >
      {/* Background layer for clicks */}
      <div id="bg-layer" className="absolute inset-0 z-10 cursor-pointer" />
      
      {/* Grain Texture */}
      <svg className="pointer-events-none absolute inset-0 z-50 h-full w-full opacity-[0.03]">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
      
      {/* Global Color Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay transition-colors duration-1000" style={{ backgroundColor: currentRoom.overlay }} />
      
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />
      
      {/* Floating Chat Messages */}
      {currentRoom.id !== 'silent' && !isZenMode && (
        <div 
          className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
          style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 90%, transparent 100%)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 90%, transparent 100%)' }}
        >
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: '5vh', scale: 0.95 }}
                animate={{ opacity: [0, 1, 1, 0], y: ['5vh', '-30vh', '-60vh', '-90vh'], scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 15, ease: 'linear', times: [0, 0.1, 0.8, 1] }}
                className="absolute pointer-events-auto flex flex-col items-center"
                style={{ left: `${msg.x}%`, bottom: '5%' }}
              >
                <div className="text-[10px] font-semibold mb-1 tracking-wider drop-shadow-md" style={{ color: msg.color }}>{msg.nickname}</div>
                <div 
                  className="bg-[#111111]/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 text-sm text-gray-200 shadow-xl cursor-pointer hover:bg-[#222222]/80 transition whitespace-nowrap relative"
                  onPointerDown={(e) => {
                     e.stopPropagation();
                     const timer = setTimeout(() => {
                         setActiveEmojiPicker(msg.id);
                         vibrate(20);
                     }, 500);
                     (e.target as any).dataset.timer = timer.toString();
                  }}
                  onPointerUp={(e) => {
                     clearTimeout(parseInt((e.target as any).dataset.timer));
                  }}
                  onPointerLeave={(e) => {
                     clearTimeout(parseInt((e.target as any).dataset.timer));
                  }}
                  onContextMenu={(e) => {
                     e.preventDefault();
                     setActiveEmojiPicker(msg.id);
                     vibrate(20);
                  }}
                >
                  {msg.text}
                  <AnimatePresence>
                    {activeEmojiPicker === msg.id && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                         className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#1a1a1c]/95 backdrop-blur-xl p-2 rounded-2xl flex space-x-2 border border-white/10 shadow-2xl z-50 pointer-events-auto" 
                         onClick={(e) => e.stopPropagation()}
                       >
                          {['❤️', '👍', '🔥', '😂', '👀', '✨'].map(emoji => (
                             <button key={emoji} onClick={() => { handleReaction(msg.id, emoji); setActiveEmojiPicker(null); }} className="hover:scale-125 transition px-1 text-lg">{emoji}</button>
                          ))}
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {msg.reactions.length > 0 && (
                  <div className="absolute -top-3 -right-3 flex space-x-1">
                    {msg.reactions.map((r, i) => (
                      <motion.span key={i} initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: -20 }} transition={{ duration: 0.5 }} className="text-sm">{r}</motion.span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Typing Indicator */}
      <AnimatePresence>
        {isTyping && currentRoom.id !== 'silent' && !isZenMode && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
             className="absolute bottom-24 left-6 z-30 bg-[#111111]/80 backdrop-blur-md px-3 py-2 rounded-full border border-white/5 text-xs text-gray-400 shadow-xl pointer-events-none flex items-center space-x-1"
           >
              <span>Someone is typing</span>
              <span className="flex space-x-[2px] ml-1">
                 <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }}>.</motion.span>
                 <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                 <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
              </span>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Input Bar */}
      <AnimatePresence>
        {chatInputOpen && currentRoom.id !== 'silent' && !isZenMode && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            className="absolute bottom-0 left-0 w-full bg-[#111111]/95 backdrop-blur-xl border-t border-white/10 p-4 pb-8 sm:pb-4 z-50 flex items-center space-x-3"
            onClick={e => e.stopPropagation()}
          >
            <Smile className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white transition" />
            <form onSubmit={handleSendMessage} className="flex-1 flex">
              <input 
                autoFocus
                type="text" 
                value={chatText} 
                onChange={e => setChatText(e.target.value)} 
                placeholder="Whisper something..." 
                className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-gray-200 focus:outline-none focus:border-white/30 transition shadow-inner"
                maxLength={60}
              />
              <button type="submit" disabled={!chatText.trim()} className="ml-3 p-3 bg-blue-500 text-white rounded-full disabled:opacity-50 hover:bg-blue-600 transition shadow-lg">
                <Send className="w-5 h-5" />
              </button>
            </form>
            <button onClick={() => setChatInputOpen(false)} className="p-2 text-gray-400 hover:text-white transition">
               <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-0 left-0 w-full flex justify-between items-center p-4 text-gray-400 z-40 pointer-events-auto">
            <div className="flex space-x-2 items-center">
                <button onClick={() => setDrawerOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Open Settings"><MoreHorizontal className="w-5 h-5" /></button>
                <button onClick={() => setIsStealth(!isStealth)} className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Toggle Stealth Mode">
                   {isStealth ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
            </div>
            <div className="font-mono text-sm tracking-widest text-gray-300 pointer-events-none" aria-live="polite">
                {isLit && !isFinished ? formatTime(timeLeft) : '0m 00s'}
            </div>
            <div className="flex space-x-2 items-center">
              <button onClick={reset} className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Reset"><RotateCcw className="w-5 h-5" /></button>
              <button onClick={() => setIsZenMode(true)} className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Enable Zen Mode"><Coffee className="w-5 h-5" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zen Mode Exit */}
      <AnimatePresence>
        {isZenMode && (
          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsZenMode(false)}
            aria-label="Exit Zen Mode"
            className="absolute top-8 right-8 z-50 p-3 bg-white/5 backdrop-blur rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Stealth Mode Content */}
      {isStealth && (
        <div className="flex flex-col items-center justify-center space-y-4 opacity-50 z-10 pointer-events-none">
          <Coffee className="w-16 h-16 text-gray-500" />
          <p className="text-gray-500 text-sm tracking-widest uppercase">Break Time</p>
        </div>
      )}

      {/* UI Hints */}
      {!isLit && !isFinished && !isStealth && !isZenMode && (
        <div className="absolute top-32 text-gray-400 text-sm tracking-wide animate-pulse opacity-70 z-10 pointer-events-none" style={{ color: currentRoom.text }}>
          {currentRoom.id === 'chai' ? 'Long-press to sip' : 'Long-press to light'}
        </div>
      )}
      {isLit && !isFinished && !isStealth && currentRoom.id !== 'chai' && !isZenMode && (
        <div className="absolute top-32 text-gray-500 text-xs tracking-wide opacity-50 z-10 pointer-events-none">
          Double-tap or shake to tap ash
        </div>
      )}
      {isFinished && !isStealth && currentRoom.id !== 'chai' && !isZenMode && (
        <div className="absolute top-32 text-[#e9c46a] text-sm tracking-wide animate-pulse opacity-80 z-10 pointer-events-none">
          Long press the filter to blow a smoke ring
        </div>
      )}
      {isFinished && !isStealth && currentRoom.id === 'chai' && !isZenMode && (
        <div className="absolute top-32 text-gray-400 text-sm tracking-wide animate-pulse opacity-80 z-10 pointer-events-none">
          Wash the cup
        </div>
      )}

      {/* Main Interactive Element */}
      {!isStealth && currentRoom.id === 'chai' && (
          <div 
            className="relative w-32 h-40 flex flex-col justify-end mt-10 z-20 cursor-pointer touch-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
             <div className="w-24 h-28 bg-[#d4a373] rounded-b-3xl relative border-t-[6px] border-[#bc6c25] shadow-2xl mx-auto overflow-hidden">
                <div className="absolute bottom-0 w-full bg-[#8b5a2b]" style={{ height: `${(1 - progress) * 100}%`, transition: 'height 1s linear' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/20 pointer-events-none" />
             </div>
             <div ref={emberRef} className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-4 pointer-events-none" />
          </div>
      )}

      {!isStealth && currentRoom.id !== 'chai' && (
        <div 
          className={`relative ${{'slim':'w-8 sm:w-10', 'standard':'w-12 sm:w-16', 'wide':'w-16 sm:w-24'}[cigWidth]} h-[60vh] sm:h-[65vh] flex flex-col cursor-pointer mt-10 z-20 touch-none`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {showFlame && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[90%] w-12 h-20 pointer-events-none z-30" style={{ transformOrigin: 'bottom center', animation: 'flameFlicker 0.1s infinite alternate' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-12 bg-orange-500 blur-[2px] opacity-80" style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-8 bg-yellow-400 blur-[1px]" style={{ borderRadius: '50% 50% 20% 20% / 60% 60% 40% 40%' }} />
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-4 bg-white blur-[1px]" style={{ borderRadius: '50%' }} />
            </div>
          )}

          <div className="relative w-full h-[75%] flex flex-col">
            <div style={{ height: `${lastTapProgress * 100}%` }} className="w-full" />
            <div 
              style={{ height: `${(progress - lastTapProgress) * 100}%`, clipPath: (progress - lastTapProgress) * 100 > 1 ? 'polygon(0 1px, 10% 0, 20% 2px, 30% 0, 40% 2px, 50% 1px, 60% 3px, 70% 0, 80% 2px, 90% 1px, 100% 2px, 100% 100%, 0 100%)' : 'none' }} 
              className="w-full bg-[#888888] relative overflow-hidden rounded-t-[1px]"
            >
              <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#4b5563_2px,#4b5563_4px)]" />
              <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,#6b7280_1px,#6b7280_3px)]" />
            </div>

            <div ref={emberRef} className="w-full relative z-10">
              {(progress > 0 || glow > 0) && progress < 1 && (
                <>
                  <div 
                    className="absolute inset-x-0 bottom-0"
                    style={{ height: progress > 0 ? '4px' : `${Math.max(glow * 4, 1)}px`, backgroundColor: '#f97316', boxShadow: `0 0 ${progress > 0 ? '12px' : glow * 12 + 'px'} 2px #ef4444`, opacity: progress > 0 ? 1 : glow }}
                  >
                    <div className="absolute inset-0 bg-red-500 blur-[2px] animate-pulse" />
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-b from-transparent to-[#7f1d1d] opacity-80" />
                  </div>
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                    style={{ width: `${100 + (1 - progress) * 50}px`, height: `${100 + (1 - progress) * 50}px`, background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0) 70%)', opacity: Math.max(0.2, 1 - progress), animation: 'glowPulse 3s infinite alternate ease-in-out' }}
                  />
                </>
              )}
            </div>

            <div style={{ height: `${(1 - progress) * 100}%` }} className="w-full bg-[#f5f5f5] relative overflow-hidden">
               {progress === 0 && <div className="absolute top-0 inset-x-0 h-[3px] bg-[#3e2723]" />}
               <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(0deg,transparent,transparent_6px,#000_6px,#000_7px)]" />
               <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,#000_1px,#000_2px)]" />
               <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
            </div>
          </div>

          <div 
            ref={filterRef}
            className="w-full h-[25%] bg-gradient-to-b from-[#e9c46a] to-[#d4a373] relative rounded-b-md overflow-hidden cursor-pointer"
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

      {/* Stats Bar */}
      {!isZenMode && (
        <div className="absolute bottom-[90px] w-full text-center text-[10px] sm:text-xs text-gray-500 z-40 flex justify-center items-center space-x-2 opacity-70 pointer-events-none">
            <span>{currentRoom.icon}</span>
            <span>{currentRoom.name} • 3/5 active • 670 completed today</span>
        </div>
      )}

      {/* Bottom Navigation */}
      {!isZenMode && (
        <div className="absolute bottom-[46px] w-full flex justify-center items-center space-x-2 sm:space-x-4 z-40 pointer-events-auto">
            <button onClick={() => setRoomModalOpen(true)} aria-label="Open Teleport Menu" className="bg-[#111]/80 backdrop-blur hover:bg-white/10 transition px-4 py-2 rounded-xl text-xs text-gray-300 flex items-center space-x-2 border border-white/10 shadow-lg">
                <span>Teleport</span>
                <span className="text-[10px]">▼</span>
            </button>
            <button onClick={toggleAsmr} aria-label="Toggle ASMR" className={`transition px-4 py-2 rounded-xl text-xs border shadow-lg backdrop-blur ${asmrOn ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-[#111]/80 text-gray-300 border-white/10 hover:bg-white/10'}`}>
                ASMR {asmrOn ? 'On' : 'Off'}
            </button>
            <button aria-label="Report" className="bg-[#111]/80 backdrop-blur hover:bg-white/10 transition px-4 py-2 rounded-xl text-xs text-gray-300 border border-white/10 flex items-center space-x-1 shadow-lg">
                <Flag className="w-3 h-3" />
                <span>Report</span>
            </button>
        </div>
      )}

      {/* Notice Banner */}
      <AnimatePresence>
          {showNotice && !isZenMode && (
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 w-full bg-[#111111]/95 backdrop-blur-md border-t border-gray-800 text-orange-500 py-2 px-4 flex justify-between items-center z-50 pointer-events-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                  <span className="text-[10px] sm:text-xs truncate pr-4 font-medium tracking-wide">[Notice] Swearing, gambling, illegal promotion, hate speech, and bias are prohibited! - Manager</span>
                  <button onClick={() => setShowNotice(false)} className="text-gray-400 p-1 hover:text-white transition"><X className="w-4 h-4" /></button>
              </motion.div>
          )}
      </AnimatePresence>
      
      {/* Drawer */}
      <AnimatePresence>
          {drawerOpen && (
              <>
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 z-50 backdrop-blur-sm pointer-events-auto" onClick={() => setDrawerOpen(false)} />
                 <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute top-0 left-0 h-full w-64 bg-[#141416] z-50 shadow-2xl flex flex-col border-r border-white/5 pointer-events-auto">
                      <div className="p-6 flex flex-col space-y-1 border-b border-white/5 bg-[#1a1a1c]">
                          <span className="text-gray-200 font-medium tracking-wide flex items-center space-x-2"><MoreHorizontal className="w-5 h-5 text-gray-400" /> <span>Settings & Info</span></span>
                          <span className="text-xs text-gray-500 mt-2">Logged in as <strong style={{ color: nameColor }}>{nickname}</strong></span>
                          {streak > 0 && <span className="text-xs text-orange-400 mt-1">🔥 {streak} Day Streak!</span>}
                      </div>
                      <div className="flex-1 py-4 overflow-y-auto">
                           {isOffline && (
                             <div className="mx-4 mb-4 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs px-3 py-2 rounded-xl text-center">
                               You&apos;re on a solo break (Offline)
                             </div>
                           )}
                           <div className="px-5 py-3 border-b border-white/5 mb-2">
                              <label className="text-xs text-gray-400 block mb-2">ASMR Volume</label>
                              <input type="range" min="0" max="1" step="0.05" value={asmrVolume} onChange={e => setAsmrVolume(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                           </div>
                           <div className="px-5 py-3 border-b border-white/5 mb-2">
                              <label className="text-xs text-gray-400 block mb-2">Cigarette Style</label>
                              <select value={cigWidth} onChange={e => setCigWidth(e.target.value as any)} className="w-full bg-[#111] text-gray-300 border border-white/10 rounded-lg p-2 text-sm outline-none">
                                  <option value="slim">Slim & Minimal</option>
                                  <option value="standard">Standard Premium</option>
                                  <option value="wide">Wide Aesthetic</option>
                              </select>
                           </div>
                           <button onClick={() => setHighContrast(!highContrast)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition text-left text-gray-300">
                             <div className="flex items-center space-x-3">
                               <Eye className="w-4 h-4 opacity-70" />
                               <span className="text-sm">High Contrast Mode</span>
                             </div>
                             <span className="text-xs">{highContrast ? 'ON' : 'OFF'}</span>
                           </button>
                          <MenuButton icon={<Share2 className="w-4 h-4"/>} text="Share Virtual Cig" />
                          <MenuButton icon={<MessageSquare className="w-4 h-4"/>} text="Send Feedback" />
                          <MenuButton icon={<FileText className="w-4 h-4"/>} text="Update Notes" />
                          <MenuButton icon={<Linkedin className="w-4 h-4"/>} text="Developer / About" />
                          <MenuButton icon={<Star className="w-4 h-4"/>} text="Advertising ⭐️⭐️" textColor="text-yellow-500" />
                          <MenuButton icon={<RestoreIcon className="w-4 h-4"/>} text="Restore Nickname" />
                          <MenuButton icon={<Shield className="w-4 h-4"/>} text="Privacy Policy" />
                      </div>
                 </motion.div>
              </>
          )}
      </AnimatePresence>

      {/* Room Modal */}
      <AnimatePresence>
          {roomModalOpen && (
              <>
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 z-50 backdrop-blur-sm pointer-events-auto" onClick={() => setRoomModalOpen(false)} />
                 <motion.div initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }} animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-1/2 left-1/2 bg-[#1a1a1c] border border-white/10 p-5 rounded-2xl z-50 w-[90%] max-w-sm shadow-2xl pointer-events-auto">
                      <h3 className="text-gray-200 font-medium mb-4 text-sm flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-blue-400" /> 
                          <span>Select Teleport Destination</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                          {ROOMS.map(r => (
                              <button key={r.id} onClick={() => { setCurrentRoom(r); setRoomModalOpen(false); }} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${currentRoom.id === r.id ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}>
                                  <span className="text-2xl mb-2 grayscale-[0.2] drop-shadow-md">{r.icon}</span>
                                  <span className="text-xs font-medium tracking-wide">{r.name}</span>
                              </button>
                          ))}
                      </div>
                 </motion.div>
              </>
          )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flameFlicker { 0% { transform: scaleY(1) rotate(-2deg); } 100% { transform: scaleY(1.05) rotate(2deg); } }
        @keyframes glowPulse { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; } 100% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } }
      `}} />
    </div>
  );
}
