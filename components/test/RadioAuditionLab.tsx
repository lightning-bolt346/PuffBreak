'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { RADIO_STATIONS, type RadioStation } from '@/lib/radio';

type RadioAuditionCandidate = RadioStation & {
  streamUrl: string;
  homepage: string;
  reason: string;
};

const RADIO_AUDITION_CANDIDATES: RadioAuditionCandidate[] = RADIO_STATIONS.map((station) => ({
  ...station,
  streamUrl: station.url,
  homepage: station.url,
  reason: station.artist
    ? `A dedicated ${station.artist} station adds a recognisable, human entry point to the library while keeping the sound aligned with ${station.moods.join(' and ').toLowerCase()} breaks.`
    : `${station.tagline}. It earns its place through a clear ${station.region.toLowerCase()} identity, useful ${station.moods.join(' and ').toLowerCase()} energy, and a sound that is distinct from the rest of the library.`,
}));

const RADIO_AUDITION_REGIONS = Array.from(new Set(RADIO_AUDITION_CANDIDATES.map((station) => station.region)));
const NEWEST_ADDED_AT = RADIO_AUDITION_CANDIDATES.reduce((latest, station) => station.addedAt && station.addedAt > latest ? station.addedAt : latest, '');

type Decision = 'keep' | 'maybe' | 'remove';
type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'failed';

const DECISIONS_KEY = 'pb_radio_audition_decisions_v2';

const decisionStyles: Record<Decision, string> = {
  keep: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300',
  maybe: 'border-amber-400/40 bg-amber-500/15 text-amber-300',
  remove: 'border-rose-400/40 bg-rose-500/15 text-rose-300',
};

function readSavedDecisions(): Record<string, Decision> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(DECISIONS_KEY) ?? '{}') as Record<string, Decision>;
  } catch {
    return {};
  }
}

function PlayGlyph({ playing, loading }: { playing: boolean; loading: boolean }) {
  if (loading) {
    return <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
  }
  return playing ? <span className="text-sm leading-none">■</span> : <span className="ml-0.5 text-base leading-none">▶</span>;
}

export default function RadioAuditionLab() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [playbackError, setPlaybackError] = useState('');
  const [region, setRegion] = useState('All');
  const [query, setQuery] = useState('');
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Read after hydration so server-rendered markup and the first client render
    // agree. Queueing the update also keeps the effect free of synchronous state work.
    const saved = readSavedDecisions();
    queueMicrotask(() => setDecisions(saved));
  }, []);

  const activeStation = RADIO_AUDITION_CANDIDATES.find((station) => station.id === activeId) ?? null;

  const filteredStations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return RADIO_AUDITION_CANDIDATES.filter((station) => {
      const inRegion = region === 'All' || station.region === region;
      const searchable = `${station.name} ${station.country} ${station.region} ${station.tagline}`.toLowerCase();
      return inRegion && (!needle || searchable.includes(needle));
    }).sort((a, b) => Number(b.addedAt === NEWEST_ADDED_AT) - Number(a.addedAt === NEWEST_ADDED_AT));
  }, [query, region]);

  const filteredJustAddedCount = filteredStations.filter((station) => station.addedAt === NEWEST_ADDED_AT).length;

  const decisionCounts = useMemo(() => ({
    keep: Object.values(decisions).filter((value) => value === 'keep').length,
    maybe: Object.values(decisions).filter((value) => value === 'maybe').length,
    remove: Object.values(decisions).filter((value) => value === 'remove').length,
  }), [decisions]);

  const ensureAudioGraph = () => {
    const audio = audioRef.current;
    if (!audio || mediaSourceRef.current) return;
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const context = new AudioContextCtor();
    const source = context.createMediaElementSource(audio);
    source.connect(context.destination);
    audioContextRef.current = context;
    mediaSourceRef.current = source;
  };

  const stopPlayback = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setPlaybackStatus('idle');
    setActiveId(null);
    setPlaybackError('');
  };

  const audition = async (station: RadioAuditionCandidate) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeId === station.id && playbackStatus === 'playing') {
      stopPlayback();
      return;
    }

    setActiveId(station.id);
    setPlaybackStatus('loading');
    setPlaybackError('');

    if (station.source === 'youtube-external') {
      window.open(station.url, '_blank', 'noopener,noreferrer');
      setPlaybackStatus('idle');
      setActiveId(null);
      return;
    }

    if (station.source === 'youtube-playlist') {
      audio.pause();
      audio.removeAttribute('src');
      setPlaybackStatus('playing');
      return;
    }

    try {
      ensureAudioGraph();
      if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();
      audio.src = station.streamUrl;
      audio.load();
      await audio.play();
      setPlaybackStatus('playing');
    } catch (error) {
      setPlaybackStatus('failed');
      setPlaybackError(error instanceof Error ? error.message : 'The browser could not start this stream.');
    }
  };

  const choose = (id: string, decision: Decision) => {
    const next = { ...decisions, [id]: decision };
    setDecisions(next);
    try {
      window.localStorage.setItem(DECISIONS_KEY, JSON.stringify(next));
    } catch {
      // The decisions still work for this render when storage is unavailable.
    }
  };

  const copyResults = async () => {
    const grouped = (['keep', 'maybe', 'remove'] as Decision[]).map((decision) => {
      const names = RADIO_AUDITION_CANDIDATES
        .filter((station) => decisions[station.id] === decision)
        .map((station) => `- ${station.name} (${station.country})`);
      return `${decision.toUpperCase()} (${names.length})\n${names.length ? names.join('\n') : '- None selected'}`;
    });
    const untested = RADIO_AUDITION_CANDIDATES.filter((station) => !decisions[station.id]);
    const text = [
      'PuffBreak radio audition results',
      '',
      ...grouped.flatMap((group) => [group, '']),
      `UNRATED (${untested.length})`,
      ...untested.map((station) => `- ${station.name} (${station.country})`),
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="mb-10" aria-labelledby="radio-audition-title">
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="none"
        onPlaying={() => setPlaybackStatus('playing')}
        onWaiting={() => setPlaybackStatus('loading')}
        onError={() => {
          const code = audioRef.current?.error?.code;
          setPlaybackStatus('failed');
          setPlaybackError(`Browser media error${code ? ` (code ${code})` : ''}. Mark it Remove if this repeats.`);
        }}
      />

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-300">
              audition lab
            </span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
              {RADIO_AUDITION_CANDIDATES.length} production stations
            </span>
          </div>
          <h2 id="radio-audition-title" className="text-2xl font-bold tracking-tight text-white">5 · Global music radio audition</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-400">
            This is now the complete production catalogue—not a separate shortlist. Direct streams and artist stations all appear here automatically. Listen, then mark Keep, Maybe or Remove.
          </p>
        </div>

        <button
          type="button"
          onClick={copyResults}
          className="shrink-0 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-white/20 hover:bg-white/[0.09]"
        >
          {copied ? '✓ Results copied' : 'Copy my shortlist'}
        </button>
      </div>

      <div className="mb-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        <div className="border-r border-white/[0.07] px-4 py-3 text-center">
          <div className="text-xl font-bold text-emerald-300">{decisionCounts.keep}</div>
          <div className="text-[10px] uppercase tracking-widest text-gray-500">keep</div>
        </div>
        <div className="border-r border-white/[0.07] px-4 py-3 text-center">
          <div className="text-xl font-bold text-amber-300">{decisionCounts.maybe}</div>
          <div className="text-[10px] uppercase tracking-widest text-gray-500">maybe</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-xl font-bold text-rose-300">{decisionCounts.remove}</div>
          <div className="text-[10px] uppercase tracking-widest text-gray-500">remove</div>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-white/10 bg-[#0f1018] p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search stations</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search station, country or sound…"
              className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-cyan-400/40"
            />
          </label>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {['All', ...RADIO_AUDITION_REGIONS].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRegion(item)}
                className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition ${region === item ? 'border-cyan-400/35 bg-cyan-500/15 text-cyan-200' : 'border-white/[0.07] bg-white/[0.03] text-gray-500 hover:text-gray-300'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeStation && (
        <div className={`sticky top-3 z-20 mb-5 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${playbackStatus === 'failed' ? 'border-rose-400/30 bg-rose-950/90' : 'border-cyan-400/25 bg-[#101923]/95'}`}>
          <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => audition(activeStation)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[#071014] shadow-[0_0_24px_rgba(34,211,238,0.22)]"
            aria-label={playbackStatus === 'playing' ? 'Stop radio' : 'Retry radio'}
          >
            <PlayGlyph playing={playbackStatus === 'playing'} loading={playbackStatus === 'loading'} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-white">{activeStation.icon} {activeStation.name}</div>
            <div className={`truncate text-xs ${playbackStatus === 'failed' ? 'text-rose-300' : 'text-gray-400'}`}>
              {playbackStatus === 'loading' && 'Connecting to live stream…'}
              {playbackStatus === 'playing' && `Live now · ${activeStation.country} · ${activeStation.tagline}`}
              {playbackStatus === 'failed' && playbackError}
            </div>
          </div>
          <button type="button" onClick={stopPlayback} className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-white/5 hover:text-white">Close</button>
          </div>
          {activeStation.source === 'youtube-playlist' && (activeStation.videoIds?.[0] || activeStation.playlistId) && (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black">
              <iframe
                key={activeStation.id}
                className="aspect-video w-full"
                src={activeStation.playlistId
                  ? `https://www.youtube.com/embed/videoseries?list=${activeStation.playlistId}&autoplay=1&rel=0`
                  : `https://www.youtube.com/embed/${activeStation.videoIds?.[0]}?autoplay=1&rel=0${(activeStation.videoIds?.length ?? 0) > 1 ? `&playlist=${activeStation.videoIds?.join(',')}` : ''}`}
                title={`${activeStation.name} audition player`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {filteredStations.map((station, index) => {
          const isActive = activeId === station.id;
          const isPlaying = isActive && playbackStatus === 'playing';
          const isLoading = isActive && playbackStatus === 'loading';
          const decision = decisions[station.id];

          return (<div key={station.id} className="contents">
            {index === 0 && filteredJustAddedCount > 0 && (
              <div className="mb-1 rounded-2xl border border-violet-400/20 bg-violet-500/[0.07] px-4 py-3 lg:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">Just added · test these next</div>
                <p className="mt-1 text-xs text-gray-400">Newest catalogue batch · {filteredJustAddedCount} station{filteredJustAddedCount === 1 ? '' : 's'} · {NEWEST_ADDED_AT}</p>
              </div>
            )}
            {index === filteredJustAddedCount && filteredJustAddedCount > 0 && (
              <div className="mt-3 border-t border-white/[0.08] pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600 lg:col-span-2">Full production library</div>
            )}
            <article
              className={`group rounded-2xl border p-4 transition ${isPlaying ? 'border-cyan-400/40 bg-cyan-500/[0.07] shadow-[0_0_30px_rgba(34,211,238,0.07)]' : 'border-white/[0.08] bg-white/[0.025] hover:border-white/[0.15] hover:bg-white/[0.04]'}`}
            >
              <div className="flex gap-3.5">
                <button
                  type="button"
                  onClick={() => audition(station)}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition ${isPlaying ? 'border-cyan-300/50 bg-cyan-400 text-[#071014]' : 'border-white/10 bg-white/[0.06] text-gray-300 hover:border-cyan-400/35 hover:text-cyan-300'}`}
                  aria-label={station.source === 'youtube-external' ? `Open ${station.name} on YouTube Music` : isPlaying ? `Stop ${station.name}` : `Play ${station.name}`}
                >
                  {station.source === 'youtube-external' ? <span className="text-base leading-none">↗</span> : <PlayGlyph playing={isPlaying} loading={isLoading} />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-white">{station.icon} {station.name}</h3>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{station.country} · {station.tagline}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[9px] uppercase tracking-wider text-gray-500">
                      {station.region}
                    </span>
                  </div>

                  <div className="mt-3 rounded-xl border border-white/[0.06] bg-black/15 p-3">
                    <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-400/70">Why it made the cut</div>
                    <p className="text-xs leading-relaxed text-gray-400">{station.reason}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {(['keep', 'maybe', 'remove'] as Decision[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => choose(station.id, option)}
                        className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold capitalize transition ${decision === option ? decisionStyles[option] : 'border-white/[0.07] bg-white/[0.025] text-gray-600 hover:text-gray-300'}`}
                        aria-pressed={decision === option}
                      >
                        {option === 'keep' ? '✓ ' : option === 'maybe' ? '? ' : '× '}{option}
                      </button>
                    ))}
                    <a
                      href={station.homepage}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto px-1.5 py-1 text-[10px] text-gray-600 hover:text-cyan-300"
                    >
                      Station site ↗
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </div>
          );
        })}
      </div>

      {filteredStations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-gray-600">No stations match that filter.</div>
      )}

      <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-500/[0.05] px-4 py-3 text-xs leading-relaxed text-amber-200/60">
        Technical pass means the endpoint returned live audio and the CORS headers PuffBreak needs. Your listening test is still the final authority: station uptime, regional availability, ads and programming can change. Public listening access is not automatically a brand or rebroadcast licence, so terms should be confirmed before final production use. Your approved shortlist now powers the home radio library.
      </div>
    </section>
  );
}
