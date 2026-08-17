import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_FEEDBACK_LENGTH = 2_000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

type RateEntry = { count: number; resetAt: number };
const globalForFeedback = globalThis as typeof globalThis & { puffBreakFeedbackRate?: Map<string, RateEntry> };
const feedbackRate = globalForFeedback.puffBreakFeedbackRate ?? new Map<string, RateEntry>();
globalForFeedback.puffBreakFeedbackRate = feedbackRate;

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function getWebhook() {
  const webhook = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;
  if (!webhook) return null;
  try {
    const url = new URL(webhook);
    if (url.protocol !== 'https:' || !['discord.com', 'discordapp.com'].includes(url.hostname)) return null;
    if (!url.pathname.startsWith('/api/webhooks/')) return null;
    return webhook;
  } catch {
    return null;
  }
}

function checkRateLimit(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const key = forwarded || request.headers.get('x-real-ip') || 'local';
  const now = Date.now();
  const current = feedbackRate.get(key);
  if (!current || current.resetAt <= now) {
    feedbackRate.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

async function sendToDiscord(webhook: string, body: BodyInit, contentType?: string) {
  const response = await fetch(webhook, {
    method: 'POST',
    headers: contentType ? { 'Content-Type': contentType } : undefined,
    body,
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Discord returned ${response.status}`);
}

export async function POST(request: NextRequest) {
  if (!checkRateLimit(request)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const webhook = getWebhook();
  if (!webhook) {
    return NextResponse.json({ error: 'Feedback delivery is not configured.' }, { status: 503 });
  }

  try {
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const incoming = await request.formData();
      if (clean(incoming.get('website'), 200)) return NextResponse.json({ ok: true });

      const message = clean(incoming.get('message'), MAX_FEEDBACK_LENGTH);
      if (message.length < 3) return NextResponse.json({ error: 'Feedback is too short.' }, { status: 400 });

      const outgoing = new FormData();
      outgoing.append('payload_json', JSON.stringify({
        content: `**PuffBreak feedback**\n\n${message}`,
        allowed_mentions: { parse: [] },
      }));

      const files = incoming.getAll('files').filter((value): value is File => value instanceof File).slice(0, 3);
      for (const [index, file] of files.entries()) {
        if (!file.type.startsWith('image/') || file.size > MAX_FILE_BYTES) continue;
        outgoing.append(`files[${index}]`, file, file.name);
      }
      await sendToDiscord(webhook, outgoing);
      return NextResponse.json({ ok: true });
    }

    const payload = await request.json() as Record<string, unknown>;
    if (clean(payload.website, 200)) return NextResponse.json({ ok: true });

    if (payload.type === 'radio_request') {
      const station = clean(payload.station, 120);
      const place = clean(payload.place, 100);
      const note = clean(payload.note, 500);
      if (station.length < 2) return NextResponse.json({ error: 'A station or artist is required.' }, { status: 400 });

      await sendToDiscord(webhook, JSON.stringify({
        embeds: [{
          title: 'Radio frequency request',
          color: 0x34d399,
          fields: [
            { name: 'Station / artist', value: station, inline: false },
            ...(place ? [{ name: 'Region / language', value: place, inline: false }] : []),
            ...(note ? [{ name: 'Why it fits', value: note, inline: false }] : []),
          ],
          footer: { text: 'Sent from the PuffBreak radio library' },
          timestamp: new Date().toISOString(),
        }],
        allowed_mentions: { parse: [] },
      }), 'application/json');
      return NextResponse.json({ ok: true });
    }

    const message = clean(payload.message, MAX_FEEDBACK_LENGTH);
    if (message.length < 3) return NextResponse.json({ error: 'Feedback is too short.' }, { status: 400 });
    await sendToDiscord(webhook, JSON.stringify({
      content: `**PuffBreak feedback**\n\n${message}`,
      allowed_mentions: { parse: [] },
    }), 'application/json');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Feedback delivery failed', error);
    return NextResponse.json({ error: 'Could not deliver feedback.' }, { status: 502 });
  }
}
