#!/usr/bin/env node
/* Warms Vercel's image cache so visitors never wait for a photo to be
   converted on first view. Reads the sitemap, visits every page, and
   requests every optimised image in it once (AVIF, as modern browsers do).
   Run after adding or regenerating photos:
     node scripts/warm-image-cache.mjs                 (live site)
     node scripts/warm-image-cache.mjs http://localhost:3000 */

const SITE = (process.argv[2] || 'https://daralnajahadv.ae').replace(/\/$/, '');
const CONCURRENCY = 8;

async function pool(items, worker) {
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) await worker(items[i++]);
  }));
}

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&').replace(/^https?:\/\/[^/]+/, SITE));
pages.push(`${SITE}/exhibitions`);

const images = new Set();
await pool(pages, async (url) => {
  const html = await (await fetch(url)).text().catch(() => '');
  for (const m of html.matchAll(/\/_next\/image\?url=[^"\s,]+/g)) images.add(m[0].replace(/&amp;/g, '&'));
});

let hit = 0, miss = 0, failed = 0;
const started = Date.now();
await pool([...images], async (path) => {
  try {
    const res = await fetch(`${SITE}${path}`, { headers: { Accept: 'image/avif,image/webp,*/*' } });
    await res.arrayBuffer();
    if (!res.ok) failed++;
    else if (res.headers.get('x-vercel-cache') === 'HIT') hit++;
    else miss++;
  } catch { failed++; }
});

console.log(`${pages.length} pages, ${images.size} image variants: ${hit} already cached, ${miss} warmed now, ${failed} failed (${((Date.now() - started) / 1000).toFixed(0)}s)`);
