/**
 * ambient-engine.js — a tiny, dependency-free procedural ambient sound engine.
 *
 * Synthesizes calming room soundscapes in the browser with the Web Audio API and
 * zero audio files. This is the reference implementation behind PuffBreak's
 * ambient rooms (https://puffbreak.app).
 *
 * Rooms:
 *   office   → AC ventilation hum (bandpass noise, ~120 Hz)
 *   beach    → ocean waves (pink noise + LFO-modulated lowpass + amplitude LFO)
 *   space    → sci-fi drone (sawtooth + detuned sine + sub-bass + slow LFO)
 *   library  → gentle rain (highpass noise + rain-intensity LFO)
 *   park     → soft wind & rain (highpass noise, slightly brighter)
 *   metro    → café chatter (dual bandpass formants + murmur LFO)
 *   chai     → café chatter, slightly louder
 *   silent   → all gains at 0
 *
 * License: MIT (see LICENSE).
 */

/* ------------------------------------------------------------------ */
/* Noise generators                                                     */
/* ------------------------------------------------------------------ */

function makeNoiseBuffer(ctx, seconds = 2, pink = false) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (pink) {
    // Paul Kellet's economical pink-noise filter.
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function makeLFO(ctx, frequency, depth, base = 1, target) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = frequency;
  gain.gain.value = depth;
  osc.connect(gain);
  // `target` may be a node (connect to its .gain) or an AudioParam (connect directly).
  if (target && target.gain && typeof target.gain.connect === 'function') {
    gain.connect(target.gain);
    target.gain.value = base;
  } else {
    gain.connect(target);
    target.value = base;
  }
  osc.start();
  return osc;
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export class AmbientEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.nodes = null;
    this.roomId = 'silent';
    this.volume = 0.5;
    this.ready = false;
    this.sources = [];
  }

  /** Create (or resume) the AudioContext and build the node graph. Must be
   *  called from a user gesture on most browsers. */
  start() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) throw new Error('Web Audio API is not supported here');
    const ctx = new Ctx();
    this.ctx = ctx;

    // Master bus
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    const s = (label) => {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(master);
      return { node: g, stop: () => {} };
    };

    const nodes = {
      office: s('office'),   // AC hum
      wave: s('wave'),       // beach waves
      space: s('space'),     // space drone
      rain: s('rain'),       // library / park rain
      cafe: s('cafe'),       // metro / chai chatter
    };
    this.nodes = nodes;

    /* ── office: AC ventilation hum ───────────────────────────── */
    {
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, 2, true);
      src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 120;
      bp.Q.value = 1.2;
      src.connect(bp);
      bp.connect(nodes.office.node);
      src.start();
      nodes.office.stop = () => src.stop();
      this.sources.push(src);
    }

    /* ── beach: ocean waves ───────────────────────────────────── */
    {
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, 2, true);
      src.loop = true;
      const low = ctx.createBiquadFilter();
      low.type = 'lowpass';
      low.frequency.value = 600;
      low.Q.value = 0.6;
      src.connect(low);
      low.connect(nodes.wave.node);
      src.start();
      nodes.wave.stop = () => src.stop();
      this.sources.push(src);
      // LFO on the lowpass cutoff → the swell of a wave
      makeLFO(ctx, 0.09, 320, 480, low.frequency);
      // LFO on the amplitude → the crash/retreat of a wave
      makeLFO(ctx, 0.09, 0.06, 0.06, nodes.wave.node);
    }

    /* ── space: sci-fi drone ──────────────────────────────────── */
    {
      const mk = (type, freq, detune) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = freq;
        o.detune.value = detune ?? 0;
        o.connect(nodes.space.node);
        o.start();
        nodes.space.stop = () => o.stop();
        this.sources.push(o);
        return o;
      };
      const saw = mk('sawtooth', 55, 0);
      const sine = mk('sine', 82.5, 6);
      mk('sine', 27.5, 0); // sub-bass
      // Slow breathing modulation on the whole drone layer
      makeLFO(ctx, 0.05, 0.05, 0.05, nodes.space.node);
      // Slight detune wander on the saw
      makeLFO(ctx, 0.03, 3, 55, saw.frequency);
      makeLFO(ctx, 0.04, 4, 82.5, sine.frequency);
    }

    /* ── library / park: rain (and soft wind) ─────────────────── */
    {
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, 2, false);
      src.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1800;
      hp.Q.value = 0.4;
      src.connect(hp);
      hp.connect(nodes.rain.node);
      src.start();
      nodes.rain.stop = () => src.stop();
      this.sources.push(src);
      makeLFO(ctx, 0.35, 0.02, 0.02, nodes.rain.node); // rain intensity shimmer
    }

    /* ── metro / chai: café chatter ───────────────────────────── */
    {
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, 2, false);
      src.loop = true;
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.value = 420;
      f1.Q.value = 3;
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.value = 1250;
      f2.Q.value = 5;
      src.connect(f1);
      src.connect(f2);
      f1.connect(nodes.cafe.node);
      f2.connect(nodes.cafe.node);
      src.start();
      nodes.cafe.stop = () => src.stop();
      this.sources.push(src);
      makeLFO(ctx, 0.7, 40, 420, f1.frequency); // formant murmur
      makeLFO(ctx, 0.55, 0.03, 0.03, nodes.cafe.node);
    }

    this.ready = true;
    this.applyRoom(this.roomId);
    this.applyVolume(this.volume);
    master.gain.setTargetAtTime(this.volume, ctx.currentTime, 0.5);
  }

  /** Per-room target gain for each layer (0–1). */
  roomLevels(roomId) {
    const l = {
      office: { office: 0.05 },
      beach: { wave: 0.15 },
      space: { space: 0.15 },
      library: { rain: 0.08 },
      park: { rain: 0.12, office: 0.04 },
      metro: { cafe: 0.12 },
      chai: { cafe: 0.15 },
      silent: {},
    };
    return l[roomId] || {};
  }

  /** Switch rooms with a smooth crossfade. */
  setRoom(roomId) {
    this.roomId = roomId;
    if (this.ready) this.applyRoom(roomId);
  }

  applyRoom(roomId) {
    const ctx = this.ctx;
    const levels = this.roomLevels(roomId);
    const t = ctx.currentTime;
    for (const key of Object.keys(this.nodes)) {
      const target = levels[key] ?? 0;
      this.nodes[key].node.gain.setTargetAtTime(target, t, 0.8);
    }
  }

  /** Master volume (0–1.5). */
  setVolume(v) {
    this.volume = v;
    if (this.ready) this.applyVolume(v);
  }

  applyVolume(v) {
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(v, t, 0.4);
  }

  /** Fade everything to silence, then release the context. */
  async stop() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(0, t, 0.4);
    await new Promise((r) => setTimeout(r, 500));
    try {
      for (const src of this.sources) { try { src.stop(); } catch (_) {} }
    } catch (_) {}
    try { await this.ctx.close(); } catch (_) {}
    this.ctx = null;
    this.nodes = null;
    this.ready = false;
    this.sources = [];
  }

  isReady() {
    return this.ready;
  }
}
