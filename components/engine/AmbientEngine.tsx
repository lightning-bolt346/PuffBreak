'use client';

/**
 * AmbientEngine — Procedural Multi-Room Soundscape Synthesizer
 * ─────────────────────────────────────────────────────────────
 * A headless React component (renders null) that drives all room
 * ambient audio for PuffBreak via the Web Audio API.
 *
 * Architecture:
 *   Shared AudioContext (from parent) → internal procedural nodes → outputGain → ctx.destination
 *
 * Rooms & their synth layers:
 *   office   → AC ventilation hum (bandpass noise, 120 Hz)
 *   beach    → Ocean waves (pink noise + LFO-modulated lowpass filter + amplitude LFO)
 *   space    → Sci-fi drone (sawtooth + detuned sine + sub-bass + slow LFO mod)
 *   library  → Gentle rain (highpass noise + rain-intensity LFO)
 *   park     → Soft wind & rain (highpass noise, slightly brighter)
 *   metro    → Café chatter (dual bandpass formant + murmur LFO)
 *   chai     → Café chatter + slightly louder (same formant synth)
 *   silent   → All gains at 0
 *
 * Usage:
 *   const engineRef = useRef<AmbientEngineHandle>(null);
 *   <AmbientEngine ref={engineRef} audioCtx={audioCtxRef.current} outputGain={ambientGainRef.current}
 *                  roomId={currentRoom.id} volume={ambientVolume} enabled={asmrOn} />
 *
 *   engineRef.current?.setRoom('beach');
 *   engineRef.current?.setVolume(0.8);
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// ─── Public API ───────────────────────────────────────────────────────────────

export interface AmbientEngineHandle {
  /** Switch ambient profile to a new room with a smooth crossfade */
  setRoom: (roomId: string) => void;
  /** Set master ambient volume (0–1.5). Smoothly interpolated. */
  setVolume: (vol: number) => void;
  /** Resume a suspended AudioContext (required after user gesture on Safari) */
  start: () => void;
  /** Fade all ambient audio to silence */
  stop: () => void;
  /** True once all internal nodes have been successfully created */
  isReady: () => boolean;
}

export interface AmbientEngineProps {
  /** The shared AudioContext created by the parent (null until user gesture) */
  audioCtx: AudioContext | null;
  /** The master gain node this engine should connect its output into */
  outputGain: GainNode | null;
  /** Current room ID — triggers smooth ambient crossfade */
  roomId: string;
  /** Master volume (0–1.5). Applied to outputGain. */
  volume: number;
  /** Whether the engine should be producing sound */
  enabled: boolean;
}

// ─── Internal graph snapshot ──────────────────────────────────────────────────

interface EngineNodes {
  waveGain:   GainNode;   // Beach: ocean waves amplitude
  spaceGain:  GainNode;   // Space: drone synthesizer
  rainGain:   GainNode;   // Library/Park: rain
  cafeGain:   GainNode;   // Chai/Metro: café chatter
  officeGain: GainNode;   // Office: AC hum / ventilation noise
}

// ─── Room → layer volumes ─────────────────────────────────────────────────────

const ROOM_LEVELS: Record<string, Partial<Record<keyof EngineNodes, number>>> = {
  office:  { officeGain: 0.05 },
  beach:   { waveGain:   0.15 },
  space:   { spaceGain:  0.15 },
  library: { rainGain:   0.08 },
  park:    { rainGain:   0.06, officeGain: 0.02 }, // gentle wind + barely-there hum
  metro:   { cafeGain:   0.12 },
  chai:    { cafeGain:   0.15 },
  silent:  {},
};

const ALL_LAYERS: (keyof EngineNodes)[] = [
  'waveGain', 'spaceGain', 'rainGain', 'cafeGain', 'officeGain',
];

// ─── Component ────────────────────────────────────────────────────────────────

const AmbientEngine = forwardRef<AmbientEngineHandle, AmbientEngineProps>(
  ({ audioCtx, outputGain, roomId, volume, enabled }, ref) => {

    const nodesRef   = useRef<EngineNodes | null>(null);
    const builtForRef = useRef<AudioContext | null>(null); // track which ctx we built for

    // ── Build the audio graph (once per AudioContext) ──────────────────────
    useEffect(() => {
      if (!audioCtx || !outputGain) return;
      // Already built for this exact context instance — skip
      if (builtForRef.current === audioCtx && nodesRef.current) return;
      builtForRef.current = audioCtx;

      const ctx = audioCtx;
      const out = outputGain;
      const sr  = ctx.sampleRate;

      // ── Pink Noise Buffer (shared base for several layers) ──────────────
      //    Paul Kellett's pink noise approximation — warm, natural sounding.
      const noiseBufferSize = sr * 3; // 3 seconds — longer = less looping artefact
      const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, sr);
      const noiseData   = noiseBuffer.getChannelData(0);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < noiseBufferSize; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886*b0 + w*0.0555179;
        b1 = 0.99332*b1 + w*0.0750759;
        b2 = 0.96900*b2 + w*0.1538520;
        b3 = 0.86650*b3 + w*0.3104856;
        b4 = 0.55000*b4 + w*0.5329522;
        b5 = -0.7616*b5 - w*0.0168980;
        noiseData[i] = (b0+b1+b2+b3+b4+b5+b6 + w*0.5362) * 0.11;
        b6 = w*0.115926;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop   = true;

      // ── LAYER 1: Beach — Ocean Waves ────────────────────────────────────
      //    Low-pass filter whose cutoff is LFO-modulated to simulate
      //    approaching/receding waves. Amplitude also synced to LFO.
      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type           = 'lowpass';
      waveFilter.frequency.value = 420;

      const waveGain = ctx.createGain();
      waveGain.gain.value = 0; // starts silent

      const waveLfo = ctx.createOscillator();
      waveLfo.type            = 'sine';
      waveLfo.frequency.value = 0.15; // ~6.7 s wave period

      // Frequency modulation: LFO sweeps cutoff 420 ± 600 Hz
      const waveLfoFreqGain = ctx.createGain();
      waveLfoFreqGain.gain.value = 600;
      waveLfo.connect(waveLfoFreqGain);
      waveLfoFreqGain.connect(waveFilter.frequency);

      // Amplitude modulation: same LFO also swells the amplitude
      const waveAmpLfo = ctx.createGain();
      waveAmpLfo.gain.value = 0.6;
      // Connecting an AudioNode output to an AudioParam is valid Web Audio API
      waveLfo.connect(waveAmpLfo.gain as unknown as AudioNode);

      noiseSource.connect(waveFilter);
      waveFilter.connect(waveAmpLfo);
      waveAmpLfo.connect(waveGain);
      waveGain.connect(out);

      // ── LAYER 2: Space — Sci-fi Drone ───────────────────────────────────
      //    Three oscillators (sawtooth + 2× sine at slightly detuned freqs)
      //    through a resonant low-pass filter, slowly LFO-modulated.
      const spaceGain = ctx.createGain();
      spaceGain.gain.value = 0;

      const drone1 = ctx.createOscillator(); drone1.type = 'sawtooth'; drone1.frequency.value = 55;
      const drone2 = ctx.createOscillator(); drone2.type = 'sine';     drone2.frequency.value = 55.5; // slight beating
      const drone3 = ctx.createOscillator(); drone3.type = 'sine';     drone3.frequency.value = 27.5; // sub octave

      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type            = 'lowpass';
      droneFilter.frequency.value = 220;
      droneFilter.Q.value         = 6;

      // Very slow filter sweep — feels like passing through the void
      const droneLfo = ctx.createOscillator();
      droneLfo.type            = 'sine';
      droneLfo.frequency.value = 0.06; // ~16 s period
      const droneLfoGain = ctx.createGain();
      droneLfoGain.gain.value = 45;
      droneLfo.connect(droneLfoGain);
      droneLfoGain.connect(droneFilter.frequency);

      drone1.connect(droneFilter);
      drone2.connect(droneFilter);
      drone3.connect(droneFilter);
      droneFilter.connect(spaceGain);
      spaceGain.connect(out);

      // ── LAYER 3: Library & Park — Rain / Soft Wind ──────────────────────
      //    High-pass filtered noise gives airy rain texture.
      //    A slow LFO gently modulates rain intensity (gusts).
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type            = 'highpass';
      rainFilter.frequency.value = 1600;

      const rainGain = ctx.createGain();
      rainGain.gain.value = 0;

      const rainLfo = ctx.createOscillator();
      rainLfo.type            = 'sine';
      rainLfo.frequency.value = 0.25; // gust every ~4 s
      const rainLfoGain = ctx.createGain();
      rainLfoGain.gain.value = 0.06; // subtle swell
      rainLfo.connect(rainLfoGain);
      rainLfoGain.connect(rainGain.gain);

      noiseSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(out);

      // ── LAYER 4: Chai & Metro — Café Chatter (Formant approximation) ────
      //    Two bandpass filters at vowel formant frequencies (~600 + 1200 Hz),
      //    both LFO-modulated to simulate the rise and fall of conversation.
      const cafeGain = ctx.createGain();
      cafeGain.gain.value = 0;

      const cafeFilter1 = ctx.createBiquadFilter();
      cafeFilter1.type            = 'bandpass';
      cafeFilter1.frequency.value = 620;
      cafeFilter1.Q.value         = 2;

      const cafeFilter2 = ctx.createBiquadFilter();
      cafeFilter2.type            = 'bandpass';
      cafeFilter2.frequency.value = 1250;
      cafeFilter2.Q.value         = 2;

      const murmurLfo = ctx.createOscillator();
      murmurLfo.type            = 'triangle'; // softer than sine for speech rhythm
      murmurLfo.frequency.value = 0.45;
      const murmurLfoGain = ctx.createGain();
      murmurLfoGain.gain.value = 220;
      murmurLfo.connect(murmurLfoGain);
      murmurLfoGain.connect(cafeFilter1.frequency);
      murmurLfoGain.connect(cafeFilter2.frequency);

      noiseSource.connect(cafeFilter1);
      noiseSource.connect(cafeFilter2);
      cafeFilter1.connect(cafeGain);
      cafeFilter2.connect(cafeGain);
      cafeGain.connect(out);

      // ── LAYER 5: Office — AC/Ventilation Hum ───────────────────────────
      //    Narrow bandpass around 120 Hz (AC unit frequency).
      //    Very subtle — just enough to feel "indoors".
      const officeFilter = ctx.createBiquadFilter();
      officeFilter.type            = 'bandpass';
      officeFilter.frequency.value = 120;
      officeFilter.Q.value         = 0.8;

      const officeGain = ctx.createGain();
      officeGain.gain.value = 0;

      noiseSource.connect(officeFilter);
      officeFilter.connect(officeGain);
      officeGain.connect(out);

      // ── Start all oscillators and the noise source ──────────────────────
      noiseSource.start();
      waveLfo.start();
      drone1.start(); drone2.start(); drone3.start();
      droneLfo.start();
      rainLfo.start();
      murmurLfo.start();

      // ── Store node references ───────────────────────────────────────────
      nodesRef.current = { waveGain, spaceGain, rainGain, cafeGain, officeGain };

      // Apply initial room and volume immediately (no ramp — first load)
      applyRoom(nodesRef.current, ctx, roomId, enabled, 0.01);
      out.gain.setTargetAtTime(enabled ? volume : 0, ctx.currentTime, 0.01);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioCtx, outputGain]);

    // ── React to room changes ──────────────────────────────────────────────
    useEffect(() => {
      const nodes = nodesRef.current;
      const ctx   = builtForRef.current;
      if (!nodes || !ctx) return;
      applyRoom(nodes, ctx, roomId, enabled, 0.7);
    }, [roomId, enabled]);

    // ── React to volume / enabled changes ─────────────────────────────────
    useEffect(() => {
      const ctx = builtForRef.current;
      if (!outputGain || !ctx) return;
      outputGain.gain.setTargetAtTime(enabled ? volume : 0, ctx.currentTime, 0.5);
    }, [volume, enabled, outputGain]);

    // ── Imperative handle ──────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      setRoom: (id: string) => {
        const nodes = nodesRef.current;
        const ctx   = builtForRef.current;
        if (!nodes || !ctx) return;
        applyRoom(nodes, ctx, id, enabled, 0.7);
      },
      setVolume: (vol: number) => {
        const ctx = builtForRef.current;
        if (!outputGain || !ctx) return;
        outputGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.5);
      },
      start: () => {
        const ctx = builtForRef.current;
        if (ctx?.state === 'suspended') ctx.resume();
      },
      stop: () => {
        const ctx = builtForRef.current;
        if (!outputGain || !ctx) return;
        outputGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      },
      isReady: () => !!nodesRef.current,
    }));

    // This component has no visual output
    return null;
  }
);

AmbientEngine.displayName = 'AmbientEngine';
export default AmbientEngine;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Smoothly transition all layer gains to match the target room's profile.
 * @param tau  Web Audio time constant for the exponential ramp (seconds)
 */
function applyRoom(
  nodes:   EngineNodes,
  ctx:     AudioContext,
  roomId:  string,
  enabled: boolean,
  tau:     number,
): void {
  const t       = ctx.currentTime;
  const profile = ROOM_LEVELS[roomId] ?? {};
  const scale   = enabled ? 1 : 0;

  for (const layer of ALL_LAYERS) {
    const target = ((profile[layer] ?? 0) as number) * scale;
    nodes[layer].gain.setTargetAtTime(target, t, tau);
  }
}
