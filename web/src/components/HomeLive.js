'use client';

import Photo from './Photo';
import Link from 'next/link';
import Mock from './Mock';
import { categoryHref } from '@/data/site';
import ProductCard from './ProductCard';
import { useCatalog } from './CatalogProvider';
import { EXHIBITION, EXHIBITION_GROUPS, EXHIBITION_PHOTOS, EXHIBITIONS_BEFORE } from '@/data/exhibitions';

/* Home-page sections driven by the live catalogue. */

export function ServicesStack() {
  const { categories } = useCatalog();
  // same service order as the menu: Exhibitions goes before EXHIBITIONS_BEFORE
  const cut = categories.findIndex((c) => EXHIBITIONS_BEFORE.includes(c.id));
  const before = cut === -1 ? categories : categories.slice(0, cut);
  const after = cut === -1 ? [] : categories.slice(cut);
  const card = (c, i) => {
    const items = c.groups.flatMap((g) => g.items);
    const sample = items.slice(0, 7);
    const shapes = [...new Set(items.map((it) => it.shape))].filter((s) => s !== c.hero);
    return (
      <article key={c.id} className="stack-card" style={{ '--c': c.color, '--t': c.tint, '--i': i }}>
        <div className="stack-text">
          <div className="stack-top">
            <span className="stack-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="pill pill-solid">{c.count} products</span>
          </div>
          <h3>{c.name}</h3>
          <p>{c.tagline}</p>
          <div className="stack-chips">
            {sample.map((it) => (
              <Link key={it.slug} href={`/products/${it.slug}`} className="chip chip-white">{it.name}</Link>
            ))}
          </div>
          <Link href={categoryHref(c.id)} className="btn btn-ink">
            Explore {c.short.toLowerCase()} <span className="btn-arrow">→</span>
          </Link>
        </div>
        {c.image ? (
          <div className="stack-art stack-art-photo">
            <Photo src={c.image} alt={c.name} fill sizes="(max-width: 980px) 100vw, 45vw" />
          </div>
        ) : (
          <div className="stack-art">
            <div className="stack-circle" />
            <Mock shape={c.hero} color={c.color} className="stack-mock" />
            {shapes[0] && <Mock shape={shapes[0]} color={c.color} className="stack-mock-sm a" />}
            {shapes[1] && <Mock shape={shapes[1]} color={c.color} className="stack-mock-sm b" />}
          </div>
        )}
      </article>
    );
  };
  return (
    <div className="stack">
      {before.map((c, i) => card(c, i))}
      <ExhibitionCard i={before.length} />
      {after.map((c, i) => card(c, before.length + 1 + i))}
    </div>
  );
}

/* Exhibitions isn't a product category (it's a gallery page), but it sits in
   the same stack so visitors see the shop takes on stands and event displays. */
function ExhibitionCard({ i }) {
  const cover = EXHIBITION_PHOTOS[0];
  return (
    <article className="stack-card" style={{ '--c': EXHIBITION.color, '--t': EXHIBITION.tint, '--i': i }}>
      <div className="stack-text">
        <div className="stack-top">
          <span className="stack-num">{String(i + 1).padStart(2, '0')}</span>
          <span className="pill pill-solid">{EXHIBITION_PHOTOS.length} examples</span>
        </div>
        <h3>Exhibition Stands</h3>
        <p>Booths, pop-up backdrops and event signage for trade shows, malls and launches across Dubai.</p>
        <div className="stack-chips">
          {EXHIBITION_GROUPS.map((g) => (
            <Link key={g.id} href="/exhibitions" className="chip chip-white">{g.name}</Link>
          ))}
        </div>
        <Link href="/exhibitions" className="btn btn-ink">
          Explore exhibitions <span className="btn-arrow">→</span>
        </Link>
      </div>
      <div className="stack-art stack-art-photo">
        <Photo src={cover.src} alt={cover.title} fill sizes="(max-width: 980px) 100vw, 45vw" />
      </div>
    </article>
  );
}

export function Bestsellers() {
  const { products } = useCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const list = featured.length ? featured : products.slice(0, 8);
  if (!list.length) return null;
  return (
    <section className="section bestsellers">
      <div className="container">
        <div className="section-head split" data-reveal>
          <div>
            <span className="eyebrow">Bestsellers</span>
            <h2 className="display">Customers&apos; <span className="hl">favourites</span></h2>
          </div>
          <Link href="/products" className="btn btn-ghost">See all {products.length} products <span className="btn-arrow">→</span></Link>
        </div>
        <div className="p-grid">
          {list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        </div>
      </div>
    </section>
  );
}

export function ProductCount() {
  const { products } = useCatalog();
  return <>{products.length}+</>;
}

export function CategoryCount() {
  const { categories } = useCatalog();
  return <>{categories.length}</>;
}
