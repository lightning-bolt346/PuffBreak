// Probe the production catalogue browser-accurately (Origin + Range + UA + redirects).
import https from 'node:https';
import http from 'node:http';
import { RADIO_STATIONS } from '../lib/radio.ts';

const H = { 'Origin': 'https://puffbreak.app', 'Range': 'bytes=0-', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36', 'Accept': '*/*' };

const filter = process.argv.slice(2).join(' ').trim().toLowerCase();
const candidates = RADIO_STATIONS
  .filter(({ source }) => source !== 'youtube-playlist')
  .filter(({ id, name }) => !filter || id.includes(filter) || name.toLowerCase().includes(filter))
  .map(({ name, url }) => [name, url]);

function request(url, redirectsLeft = 3) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: H, timeout: 8000 }, (res) => {
      const loc = res.headers.location;
      const status = res.statusCode ?? 0;
      if (status >= 300 && status < 400 && loc && redirectsLeft > 0) { res.resume(); resolve(request(new URL(loc, url).toString(), redirectsLeft - 1)); return; }
      const acao = res.headers['access-control-allow-origin'] ?? '(none)';
      const contentType = res.headers['content-type'] ?? '(unknown)';
      const corsOk = acao === '*' || acao === 'https://puffbreak.app';
      let bytes = 0;
      let settled = false;
      const finish = (reason) => {
        if (settled) return;
        settled = true;
        const audioLike = /audio|mpeg|aac|ogg|octet-stream/i.test(contentType);
        const ok = status >= 200 && status < 300 && corsOk && audioLike && bytes > 1024;
        res.destroy();
        resolve({ status, ok, acao, contentType, bytes, reason });
      };
      res.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes >= 16384) finish('audio received');
      });
      res.on('end', () => finish('stream ended'));
      res.on('error', () => finish('response error'));
      setTimeout(() => finish('read timeout'), 6000);
    });
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, ok: false, acao: '(timeout)', contentType: '(none)', bytes: 0, reason: 'connect timeout' }); });
    req.on('error', (error) => resolve({ status: 0, ok: false, acao: '(error)', contentType: '(none)', bytes: 0, reason: error.code ?? 'request error' }));
  });
}

(async () => {
  for (const [name, url] of candidates) {
    const r = await request(url);
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${String(r.status).padStart(3)}  ${String(r.bytes).padStart(5)}B  cors="${r.acao}"  type="${r.contentType}"  ${name}  (${r.reason})`);
  }
  console.log('done');
})();
