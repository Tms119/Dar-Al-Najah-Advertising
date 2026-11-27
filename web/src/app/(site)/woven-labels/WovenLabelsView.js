'use client';

import Photo from '@/components/Photo';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePreloadedQuery } from 'convex/react';
import Mock from '@/components/Mock';
import { useCatalog } from '@/components/CatalogProvider';
import { WhatsAppIcon } from '@/components/icons';
import { categoryHref, waAbout } from '@/data/site';
import { useTabsRow } from '@/lib/useTabsRow';

/* Woven Labels: same layout as the other category pages (header, category
   tabs, search, group chips), with each label shown with its description.
   Products come live from the catalogue, so admin edits show instantly. */

function LabelCard({ p, i, color, tint, eager = false }) {
  return (
    <article className="p-card wl-card" data-reveal style={{ '--d': `${(i % 3) * 70}ms`, '--c': color, '--t': tint }}>
      <Link href={`/products/${p.slug}`} className={`p-card-media ${p.image ? 'has-photo' : ''}`}>
        {p.badge && <span className="p-badge">{p.badge}</span>}
        {p.image ? (
          <Photo src={p.image} alt={p.name} fill eager={eager} sizes="(max-width: 640px) 100vw, (max-width: 1180px) 50vw, 33vw" className="p-photo" />
        ) : (
          <Mock shape={p.shape} color={color} className="p-mock" title={p.name} />
        )}
        <span className="p-cta">View <b>↗</b></span>
      </Link>
      <div className="p-card-body">
        <h3><Link href={`/products/${p.slug}`}>{p.name}</Link></h3>
        <p className="wl-desc">{p.desc}</p>
        <a className="wl-ask" href={waAbout(`Hi Dar Al Najah! I'm interested in ${p.name}.`, `/products/${p.slug}`)} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={15} /> Ask on WhatsApp
        </a>
      </div>
    </article>
  );
}

export default function WovenLabelsView({ preloaded }) {
  const page = usePreloadedQuery(preloaded);
  const { categories, products } = useCatalog();
  const [group, setGroup] = useState('all');
  const [q, setQ] = useState('');
  const tabsRef = useTabsRow();

  const sections = useMemo(() => {
    if (!page) return [];
    const needle = q.trim().toLowerCase();
    return page.sections
      .filter((s) => group === 'all' || s.name === group)
      .map((s) => ({ ...s, items: s.items.filter((p) => !needle || `${p.name} ${p.desc} ${s.name}`.toLowerCase().includes(needle)) }))
      .filter((s) => s.items.length);
  }, [page, group, q]);

  if (!page) return null;
  const shown = sections.reduce((a, s) => a + s.items.length, 0);
  const countByCat = (slug) => products.filter((p) => p.in.some((x) => x.c === slug)).length;

  return (
    <div className="catalog page-pad">
      <div className="container">
        <header className="cat-head" style={{ '--c': page.color }}>
          <span className="eyebrow">Category</span>
          <h1 className="display xl">{page.name}</h1>
          <p className="muted">{page.tagline}</p>
        </header>

        <div className="cat-toolbar">
          <nav className="tabs" aria-label="Categories" ref={tabsRef}>
            <Link href="/products" className="tab">All <span>{products.length}</span></Link>
            {categories.map((c) => (
              <Link key={c.id} href={categoryHref(c.id)} className={`tab ${c.id === page.slug ? 'is-active' : ''}`} aria-current={c.id === page.slug ? 'page' : undefined} style={{ '--c': c.color }}>
                <i className="dot" style={{ background: c.color }} />{c.short}
                <span>{countByCat(c.id)}</span>
              </Link>
            ))}
          </nav>
          <div className="cat-tools wl-tools">
            <label className="search">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search labels…" aria-label="Search labels" />
            </label>
          </div>
        </div>

        <div className="group-chips">
          <button className={`chip ${group === 'all' ? 'is-active' : ''}`} onClick={() => setGroup('all')}>All labels</button>
          {page.sections.map((s) => (
            <button key={s.name} className={`chip ${group === s.name ? 'is-active' : ''}`} onClick={() => setGroup(s.name)}>{s.name}</button>
          ))}
        </div>

        <p className="result-count">{shown} label{shown === 1 ? '' : 's'}</p>

        {sections.length ? sections.map((s, si) => (
          <section key={s.name} className="wl-section">
            <h2 className="wl-section-title">{s.name}<span>{s.items.length}</span></h2>
            <div className="p-grid wl-grid">
              {s.items.map((p, i) => <LabelCard key={p.slug} p={p} i={i} color={page.color} tint={page.tint} eager={si === 0 && i < 3} />)}
            </div>
          </section>
        )) : (
          <div className="empty">
            <h3>Nothing matches “{q}”</h3>
            <p className="muted">We probably still make it. Ask us on WhatsApp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
