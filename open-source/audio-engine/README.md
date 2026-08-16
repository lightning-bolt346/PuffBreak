# ambient-synth

A tiny, dependency-free **procedural ambient sound engine** for the browser. It
synthesizes calming room soundscapes in real time with the Web Audio API and
**zero audio files** — the waves, rain and drones are generated live from noise
and oscillators, so nothing ever loops or repeats.

This is the reference implementation of the audio engine behind
[PuffBreak](https://puff-break.vercel.app), a free anonymous virtual break room.

![license](https://img.shields.io/badge/license-MIT-blue) ![size](https://img.shields.io/badge/minified-%3C4KB-informational) ![deps](https://img.shields.io/badge/dependencies-0-brightgreen)

---

## Why

Recorded ambient loops are fine until your brain notices the seam. Procedural
audio never repeats — the ocean is always a slightly different ocean. The engine
uses three cheap building blocks (pink/white noise, biquad filters, LFOs) to
produce sounds that read as "safe and undemanding", which is exactly what a
break, focus session or sleep environment needs.

## Rooms

| id       | soundscape                                        | recipe |
|----------|---------------------------------------------------|--------|
| `office` | AC ventilation hum                                | bandpass noise @ ~120 Hz |
| `beach`  | ocean waves                                       | pink noise + LFO-modulated lowpass + amplitude LFO |
| `space`  | sci-fi drone                                      | sawtooth + detuned sine + sub-bass + slow LFOs |
| `library`| gentle rain                                       | highpass noise + rain-intensity LFO |
| `park`   | soft wind & rain                                  | highpass noise, slightly brighter |
| `metro`  | café chatter                                      | dual bandpass formants + murmur LFO |
| `chai`   | café chatter (a touch louder)                     | same formant synth |
| `silent` | nothing                                           | all gains 0 |

## Usage

```html
<script type="module">
  import { AmbientEngine } from './src/ambient-engine.js';

  const engine = new AmbientEngine();

  // Must be called from a user gesture (browser autoplay rules)
  document.querySelector('button').addEventListener('click', () => {
    engine.start();
    engine.setRoom('beach');
    engine.setVolume(0.5);
  });
</script>
```

### API

| method | description |
|--------|-------------|
| `start()` | Create/resume the AudioContext and build the graph (call from a user gesture). |
| `setRoom(id)` | Crossfade to a room preset (`office`, `beach`, `space`, `library`, `park`, `metro`, `chai`, `silent`). |
| `setVolume(0–1.5)` | Master volume, smoothly interpolated. |
| `stop()` | Fade to silence and release the context. |
| `isReady()` | `true` once the graph is built. |

The engine is a single ES module (`src/ambient-engine.js`), ~4 KB, zero
dependencies. It works in any browser with Web Audio API support — no build
step, no framework, no bundler.

## Demo

Open `demo/index.html` directly in a browser (no server needed) and click Play.

Or run a local server:

```bash
cd demo
python3 -m http.server 8000   # or: npx serve
# → http://localhost:8000
```

## Extending

Add a room by appending a recipe to `roomLevels()` and wiring the node graph in
`start()`. Each room is just a set of target gains over a few shared synth
layers — adding a new one is ~10 lines.

## License

MIT — use it, fork it, ship it. A link back is appreciated, never required.
