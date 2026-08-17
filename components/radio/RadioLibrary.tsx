'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check, ChevronDown, Heart, MapPin, Pause, Play, Radio, Search,
  Send, SlidersHorizontal, Sparkles, X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  RADIO_LANGUAGES,
  RADIO_REGIONS,
  RADIO_STATIONS,
  type RadioMood,
  type RadioStation,
} from '@/lib/radio';

type LibraryMode = 'discover' | 'artists' | 'saved';
type RequestState = 'idle' | 'sending' | 'sent' | 'error';

type RadioLibraryProps = {
  open: boolean;
  activeStationId: string;
  isPlaying: boolean;
  roomId: string;
  roomName: string;
  onClose: () => void;
  onSelect: (stationId: string) => void;
  onTogglePlayback: () => void;
};

const FAVOURITES_KEY = 'pb_radio_favourites_v1';
const MOOD_OPTIONS: Array<{ value: RadioMood | 'All'; label: string; note: string }> = [
  { value: 'All', label: 'Anything', note: 'show every signal' },
  { value: 'Unwind', label: 'Need calm', note: 'soft and unhurried' },
  { value: 'Focus', label: 'Want focus', note: 'steady, low-distraction' },
  { value: 'Discover', label: 'Surprise me', note: 'fresh and unfamiliar' },
  { value: 'Energy', label: 'Lift me up', note: 'rhythm and momentum' },
  { value: 'Nostalgia', label: 'Feel familiar', note: 'warm, known favourites' },
];

const MOOD_SEARCH_TERMS: Record<RadioMood, string> = {
  Unwind: 'calm relax peaceful soft chill mellow sleep quiet',
  Focus: 'focus study work concentrate instrumental low distraction',
  Discover: 'discover surprise new fresh curious eclectic',
  Energy: 'energy upbeat happy workout dance lift motivation',
  Nostalgia: 'nostalgia familiar oldies retro classics memories comfort',
};

const ROOM_MOOD: Record<string, RadioMood> = {
  office: 'Focus', beach: 'Unwind', space: 'Discover', library: 'Focus',
  park: 'Unwind', metro: 'Energy', chai: 'Nostalgia', silent: 'Focus',
};

const moodCopy: Record<RadioMood, string> = {
  Unwind: 'soft edges', Focus: 'steady attention', Discover: 'something new',
  Energy: 'a little lift', Nostalgia: 'familiar warmth',
};

function StationGlyph({ station, active }: { station: RadioStation; active: boolean }) {
  return (
    <span
      className={`relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[14px] border text-[10px] font-black tracking-[-0.03em] transition-colors ${
        active
          ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-200'
          : 'border-white/[0.08] bg-white/[0.045] text-white/70'
      }`}
      aria-hidden="true"
    >
      <span className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-emerald-300/10 blur-lg" />
      <span className="relative">{station.icon}</span>
    </span>
  );
}

function Equalizer() {
  return (
    <span className="flex h-3 items-end gap-[2px] text-emerald-300" aria-hidden="true">
      <span className="eq-bar" style={{ animationDelay: '0ms' }} />
      <span className="eq-bar" style={{ animationDelay: '140ms' }} />
      <span className="eq-bar" style={{ animationDelay: '280ms' }} />
    </span>
  );
}

function StationCard({
  station, active, playing, favourite, onChoose, onFavourite,
}: {
  station: RadioStation;
  active: boolean;
  playing: boolean;
  favourite: boolean;
  onChoose: () => void;
  onFavourite: () => void;
}) {
  return (
    <div
      className={`group relative flex min-w-0 items-center gap-3 rounded-[18px] border p-3 transition-all duration-200 ${
        active
          ? 'border-emerald-300/30 bg-emerald-300/[0.075] shadow-[0_10px_40px_-20px_rgba(52,211,153,0.45)]'
          : 'border-white/[0.065] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.05]'
      }`}
    >
      <button type="button" onClick={onChoose} className="absolute inset-0 rounded-[18px]" aria-label={`Tune to ${station.name}`} />
      <StationGlyph station={station} active={active} />
      <span className="relative min-w-0 flex-1 pointer-events-none">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[13px] font-semibold text-white/90">{station.name}</span>
          {active && playing && <Equalizer />}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-white/38">{station.source === 'youtube-playlist' ? 'In-app catalogue · ' : ''}{station.country} · {station.genres.slice(0, 2).join(' · ')}</span>
      </span>
      <button
        type="button"
        onClick={onFavourite}
        className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
          favourite ? 'bg-rose-400/12 text-rose-300' : 'text-white/25 hover:bg-white/[0.07] hover:text-white/65'
        }`}
        aria-label={favourite ? `Remove ${station.name} from saved stations` : `Save ${station.name}`}
        aria-pressed={favourite}
      >
        <Heart className={`h-3.5 w-3.5 ${favourite ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}

export default function RadioLibrary({
  open, activeStationId, isPlaying, roomId, roomName, onClose, onSelect, onTogglePlayback,
}: RadioLibraryProps) {
  const [mode, setMode] = useState<LibraryMode>('discover');
  const [query, setQuery] = useState('');
  const [mood, setMood] = useState<RadioMood | 'All'>('All');
  const [region, setRegion] = useState('All');
  const [language, setLanguage] = useState('All');
  const [favourites, setFavourites] = useState<string[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestState, setRequestState] = useState<RequestState>('idle');
  const [requestName, setRequestName] = useState('');
  const [requestPlace, setRequestPlace] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const activeStation = RADIO_STATIONS.find((station) => station.id === activeStationId) ?? RADIO_STATIONS[0];
  const roomMood = ROOM_MOOD[roomId] ?? 'Unwind';

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(FAVOURITES_KEY) ?? '[]');
        if (Array.isArray(stored)) setFavourites(stored.filter((id): id is string => typeof id === 'string'));
      } catch {
        // A corrupt preference should never block the library.
      }
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const toggleFavourite = (stationId: string) => {
    setFavourites((current) => {
      const next = current.includes(stationId)
        ? current.filter((id) => id !== stationId)
        : [...current, stationId];
      window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const recommended = useMemo(() => {
    const roomMatches = RADIO_STATIONS.filter((station) => station.region !== 'Artist Radio' && station.moods.includes(roomMood));
    return [...roomMatches].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))).slice(0, 4);
  }, [roomMood]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return RADIO_STATIONS.filter((station) => {
      if (mode === 'artists' && !station.artist) return false;
      if (mode === 'saved' && !favourites.includes(station.id)) return false;
      if (mode === 'discover' && station.region === 'Artist Radio') return false;
      if (mood !== 'All' && !station.moods.includes(mood)) return false;
      if (region !== 'All' && station.region !== region) return false;
      if (language !== 'All' && !station.languages.includes(language)) return false;
      if (!needle) return true;
      const haystack = [
        station.name, station.artist, station.country, station.region, station.tagline,
        ...station.genres, ...station.languages, ...station.moods,
        ...station.moods.map((item) => MOOD_SEARCH_TERMS[item]),
      ]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }, [favourites, language, mode, mood, query, region]);

  const clearFilters = () => {
    setQuery('');
    setMood('All');
    setRegion('All');
    setLanguage('All');
  };

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestName.trim().length < 2 || requestState === 'sending') return;
    setRequestState('sending');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'radio_request', station: requestName.trim(), place: requestPlace.trim(),
          note: requestNote.trim(), website: '',
        }),
      });
      if (!response.ok) throw new Error('Request failed');
      setRequestState('sent');
    } catch {
      setRequestState('error');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="radio-library-title">
          <motion.button
            type="button"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/76 backdrop-blur-md"
            aria-label="Close radio library"
          />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-[92dvh] w-full max-w-[980px] flex-col overflow-hidden rounded-t-[28px] border border-white/[0.09] bg-[#090a0d]/[0.985] shadow-[0_30px_100px_rgba(0,0,0,0.8)] sm:h-[min(86dvh,780px)] sm:rounded-[28px]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_20%_-20%,rgba(52,211,153,0.14),transparent_55%),radial-gradient(circle_at_85%_0%,rgba(56,189,248,0.08),transparent_40%)]" />

            <header className="relative shrink-0 border-b border-white/[0.065] px-4 pb-4 pt-4 sm:px-7 sm:pb-5 sm:pt-6">
              <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-white/14 sm:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300/70">
                    <Radio className="h-3 w-3" /> PuffBreak frequencies
                  </div>
                  <h2 id="radio-library-title" className="text-[22px] font-semibold tracking-[-0.035em] text-white sm:text-[28px]">Find your frequency.</h2>
                  <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-white/38 sm:text-[13px]">Human-picked music for a better three-minute reset. No algorithms, no infinite feed.</p>
                </div>
                <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.07] bg-white/[0.035] text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white" aria-label="Close radio library">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-emerald-300/15 bg-emerald-300/[0.055] p-2.5 sm:p-3">
                <button type="button" onClick={onTogglePlayback} className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-emerald-300 text-[#06110d] shadow-[0_8px_24px_-10px_rgba(52,211,153,0.9)] transition-transform active:scale-95" aria-label={isPlaying ? 'Pause radio' : 'Play radio'}>
                  {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/65">{isPlaying ? <><Equalizer /> Live now</> : 'Ready when you are'}</div>
                  <div className="mt-0.5 truncate text-[13px] font-semibold text-white/90 sm:text-[14px]">{activeStation.name}</div>
                  <div className="truncate text-[10px] text-white/35 sm:text-[11px]">{activeStation.tagline}</div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/25">Signal</div>
                  <div className="mt-0.5 text-[11px] text-white/55">{activeStation.country}</div>
                </div>
              </div>
            </header>

            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-28 pt-4 no-scrollbar sm:px-7 sm:pb-8 sm:pt-5">
              <div className="flex gap-1 rounded-[14px] border border-white/[0.055] bg-white/[0.025] p-1">
                {([
                  ['discover', 'Stations'], ['artists', 'Artist radio'], ['saved', `Saved${favourites.length ? ` · ${favourites.length}` : ''}`],
                ] as Array<[LibraryMode, string]>).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => { setMode(value); setRegion('All'); }} className={`flex-1 rounded-[10px] px-3 py-2 text-[11px] font-semibold transition-all sm:text-[12px] ${mode === value ? 'bg-white/[0.09] text-white shadow-sm' : 'text-white/38 hover:text-white/65'}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <label className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/28" />
                  <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a mood, sound, country or artist" className="h-11 w-full rounded-[14px] border border-white/[0.07] bg-white/[0.035] pl-10 pr-12 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-emerald-300/25 focus:bg-white/[0.05]" />
                  <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-white/[0.08] px-1.5 py-0.5 text-[9px] text-white/25 sm:block">⌘ K</span>
                </label>
                <div className="flex gap-2">
                  <label className="relative flex-1 sm:w-36 sm:flex-none">
                    <span className="sr-only">Region</span>
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/28" />
                    <select value={region} onChange={(event) => setRegion(event.target.value)} disabled={mode === 'artists'} className="h-11 w-full appearance-none rounded-[14px] border border-white/[0.07] bg-[#101115] pl-9 pr-8 text-[11px] text-white/60 outline-none disabled:opacity-35">
                      <option>All</option>{RADIO_REGIONS.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25" />
                  </label>
                  <label className="relative flex-1 sm:w-36 sm:flex-none">
                    <span className="sr-only">Language</span>
                    <select value={language} onChange={(event) => setLanguage(event.target.value)} className="h-11 w-full appearance-none rounded-[14px] border border-white/[0.07] bg-[#101115] pl-3 pr-8 text-[11px] text-white/60 outline-none">
                      <option>All</option>{RADIO_LANGUAGES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25" />
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2.5 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">How should this break feel?</div>
                    <div className="mt-0.5 text-[10px] text-white/22">Choose a feeling; we’ll narrow the dial.</div>
                  </div>
                  {mood !== 'All' && <button type="button" onClick={() => setMood('All')} className="text-[10px] text-white/32 hover:text-white/60">Reset mood</button>}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {MOOD_OPTIONS.map((item) => (
                    <button key={item.value} type="button" onClick={() => setMood(item.value)} aria-pressed={mood === item.value} className={`shrink-0 rounded-[14px] border px-3 py-2 text-left transition-colors ${mood === item.value ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100' : 'border-white/[0.065] bg-white/[0.025] text-white/45 hover:text-white/70'}`}>
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold">{item.value === 'All' && <SlidersHorizontal className="h-3 w-3" />}{item.label}</span>
                      <span className="mt-0.5 block text-[8px] font-medium text-white/25">{item.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'discover' && !query && mood === 'All' && region === 'All' && language === 'All' && (
                <section className="mt-6">
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/65"><Sparkles className="h-3 w-3" /> Fits this room</div>
                      <h3 className="mt-1 text-[15px] font-semibold text-white/85">{roomName} · {moodCopy[roomMood]}</h3>
                    </div>
                    <span className="text-[10px] text-white/25">curated, not generated</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {recommended.map((station) => (
                      <StationCard key={station.id} station={station} active={station.id === activeStationId} playing={isPlaying} favourite={favourites.includes(station.id)} onChoose={() => onSelect(station.id)} onFavourite={() => toggleFavourite(station.id)} />
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">{mode === 'artists' ? 'Artist frequencies' : mode === 'saved' ? 'Your saved stations' : 'All frequencies'}</h3>
                  <span className="text-[10px] tabular-nums text-white/24">{filtered.length} {mode === 'artists' ? 'frequencies' : 'live'}</span>
                </div>
                {filtered.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {filtered.map((station) => (
                      <StationCard key={station.id} station={station} active={station.id === activeStationId} playing={isPlaying} favourite={favourites.includes(station.id)} onChoose={() => onSelect(station.id)} onFavourite={() => toggleFavourite(station.id)} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[20px] border border-dashed border-white/[0.08] px-5 py-12 text-center">
                    <div className="text-[13px] font-semibold text-white/60">No frequency found.</div>
                    <p className="mt-1 text-[11px] text-white/28">Try fewer filters, or ask us to add the station you miss.</p>
                    <button type="button" onClick={clearFilters} className="mt-4 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[10px] font-semibold text-white/55">Clear filters</button>
                  </div>
                )}
              </section>

              <section className="mt-7 overflow-hidden rounded-[22px] border border-white/[0.07] bg-[linear-gradient(135deg,rgba(255,255,255,0.035),rgba(52,211,153,0.025))]">
                {!requestOpen ? (
                  <button type="button" onClick={() => setRequestOpen(true)} className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/[0.025] sm:p-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border border-white/[0.07] bg-white/[0.04] text-white/45"><Send className="h-3.5 w-3.5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-white/78">Missing your part of the world?</span>
                      <span className="mt-0.5 block text-[11px] text-white/32">Request a regional station, language, or artist radio. A human reviews every suggestion.</span>
                    </span>
                    <span className="text-lg text-white/22">↗</span>
                  </button>
                ) : requestState === 'sent' ? (
                  <div className="flex items-center gap-3 p-5">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-300/12 text-emerald-300"><Check className="h-4 w-4" /></span>
                    <div><div className="text-[13px] font-semibold text-white/80">Request received.</div><div className="mt-0.5 text-[11px] text-white/32">We’ll listen before it ever appears here.</div></div>
                  </div>
                ) : (
                  <form onSubmit={submitRequest} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div><h3 className="text-[14px] font-semibold text-white/82">Request a frequency</h3><p className="mt-1 text-[11px] text-white/32">Station, artist, region or language—we’ll verify the stream and fit.</p></div>
                      <button type="button" onClick={() => setRequestOpen(false)} className="p-1 text-white/30 hover:text-white/60" aria-label="Close request form"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                      <input required minLength={2} maxLength={120} value={requestName} onChange={(event) => setRequestName(event.target.value)} placeholder="Station or artist *" className="h-11 rounded-[13px] border border-white/[0.07] bg-black/20 px-3.5 text-[12px] text-white outline-none placeholder:text-white/23 focus:border-emerald-300/25" />
                      <input maxLength={100} value={requestPlace} onChange={(event) => setRequestPlace(event.target.value)} placeholder="Region or language" className="h-11 rounded-[13px] border border-white/[0.07] bg-black/20 px-3.5 text-[12px] text-white outline-none placeholder:text-white/23 focus:border-emerald-300/25" />
                    </div>
                    <textarea maxLength={500} rows={3} value={requestNote} onChange={(event) => setRequestNote(event.target.value)} placeholder="Why does it belong on PuffBreak? (optional)" className="mt-2.5 w-full resize-none rounded-[13px] border border-white/[0.07] bg-black/20 p-3.5 text-[12px] leading-relaxed text-white outline-none placeholder:text-white/23 focus:border-emerald-300/25" />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className={`text-[10px] ${requestState === 'error' ? 'text-rose-300' : 'text-white/24'}`}>{requestState === 'error' ? 'Couldn’t send. Please try again.' : 'Sent privately to the PuffBreak team.'}</span>
                      <button type="submit" disabled={requestName.trim().length < 2 || requestState === 'sending'} className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-300 px-4 text-[11px] font-bold text-[#07110d] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-35">
                        {requestState === 'sending' ? 'Sending…' : <><Send className="h-3 w-3" /> Send request</>}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
