import { NextResponse } from 'next/server';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@convex/_generated/api';

/* Mockup Studio sign-in. Access codes can only be checked here: this route
   adds the visitor IP (set by Vercel's edge, so it can't be spoofed) and the
   server-only STUDIO_SERVER_KEY, and Convex limits attempts per IP and
   site-wide. A correct code returns a 256-bit session key. */

const json = (body, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request) {
  const serverKey = process.env.STUDIO_SERVER_KEY;
  if (!serverKey) return json({ error: 'The studio is not configured yet.' }, 503);

  // only accept requests made by this site's own pages
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host || new URL(origin).host !== host) return json({ error: 'Not allowed.' }, 403);

  let code = '';
  try {
    const body = await request.json();
    code = typeof body?.code === 'string' ? body.code.slice(0, 40) : '';
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  if (!code.trim()) return json({ error: 'Enter your access code.' }, 400);

  const ip = (request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local')
    .split(',')[0].trim();

  try {
    const r = await fetchMutation(api.mockups.startSession, { serverKey, ip, code });
    if (r.ok) return json({ token: r.token });
    if (r.reason === 'limited') {
      const mins = Math.max(1, Math.ceil(r.retryAfterMs / 60000));
      return json({ error: `Too many attempts. Please try again in ${mins} minute${mins === 1 ? '' : 's'}.` }, 429);
    }
    return json({ error: "That code isn't valid or has been switched off." }, 401);
  } catch (err) {
    console.error('studio sign-in failed', err);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
