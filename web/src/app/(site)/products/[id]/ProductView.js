'use client';

import Link from 'next/link';
import { usePreloadedQuery } from 'convex/react';
import ProductDetails from './ProductDetails';
import ProductCard from '@/components/ProductCard';
import { highlightsFor } from '@/data/categoryHighlights';

export default function ProductView({ preloaded }) {
  const result = usePreloadedQuery(preloaded);

  // the product was hidden or deleted while this page was open
  if (!result || result.status !== 'ok') {
    return (
      <div className="pdp page-pad">
        <div className="container empty">
          <h1 className="display sm">This product is no longer available</h1>
          <p className="muted">It may have been updated or removed.</p>
          <Link href="/products" className="btn btn-ink">Browse all products</Link>
        </div>
      </div>
    );
  }

  const { product: p, related } = result;
  return (
    <div className="pdp page-pad">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span>
          <Link href={`/products?cat=${p.category}`}>{p.categoryName}</Link><span>/</span>
          <span>{p.name}</span>
        </nav>

        <ProductDetails p={p} key={p.id} />

        <section className="pdp-info" style={{ '--c': p.color, '--t': p.tint }}>
          {highlightsFor(p.category).map(([t, d, path], i) => (
            <div key={t} className="info-card" data-reveal style={{ '--d': `${i * 80}ms` }}>
              <div className="info-top">
                <span className="info-ic">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
                </span>
                <span className="info-n">0{i + 1}</span>
              </div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </section>

        {related.length > 0 && (
          <section className="related">
            <div className="section-head split" data-reveal>
              <h2 className="display sm">You might also need</h2>
              <Link href={`/products?cat=${p.category}`} className="btn btn-ghost btn-sm">View all <span className="btn-arrow">→</span></Link>
            </div>
            <div className="p-grid">
              {related.map((r, i) => <ProductCard key={r.id} p={r} i={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
