import { NextResponse } from 'next/server';
import { fetchMutation } from 'convex/nextjs';
import { ConvexError } from 'convex/values';
import { api } from '@convex/_generated/api';

/* Quote form endpoint. Adds the visitor IP (set by Vercel's edge, not by the
   client) and the server-only QUOTE_SERVER_KEY, then forwards to Convex,
   which rate-limits per IP. The key never reaches the browser. */

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

export async function POST(request) {
  const key = process.env.QUOTE_SERVER_KEY;
  if (!key) return NextResponse.json({ error: 'Quote form is not configured.' }, { status: 503 });

  // only accept same-site submissions
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  // Vercel sets these at its edge and overwrites client-supplied values, so they can't be spoofed
  const ip = (request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local')
    .split(',')[0].trim();
  const estimate = Number(body.estimate);

  try {
    await fetchMutation(api.quotes.submit, {
      serverKey: key,
      ip,
      name: str(body.name, 200),
      email: str(body.email, 300),
      phone: str(body.phone, 80),
      company: str(body.company, 200),
      message: str(body.message, 4000),
      interests: Array.isArray(body.interests) ? body.interests.filter((i) => typeof i === 'string').slice(0, 10).map((i) => i.slice(0, 40)) : [],
      productSlug: typeof body.productSlug === 'string' ? body.productSlug.slice(0, 100) : null,
      details: typeof body.details === 'string' ? body.details.slice(0, 1000) : null,
      estimate: Number.isFinite(estimate) && estimate >= 0 ? estimate : null,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ConvexError) {
      const msg = String(err.data);
      const limited = /rate limit/i.test(msg) || (err.data && typeof err.data === 'object' && err.data.kind === 'RateLimited');
      return NextResponse.json(
        { error: limited ? 'Too many requests. Please wait a little, or message us on WhatsApp.' : msg },
        { status: limited ? 429 : 400 },
      );
    }
    console.error('quote submit failed', err);
    return NextResponse.json({ error: 'Something went wrong. Please try WhatsApp instead.' }, { status: 500 });
  }
}
