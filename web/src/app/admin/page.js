'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

export default function AdminHome() {
  const o = useQuery(api.admin.overview);
  const quotes = useQuery(api.admin.listQuotes, { status: 'new' });

  return (
    <>
      <header className="a-head">
        <div>
          <h1>Overview</h1>
          <p className="a-muted">Changes you make here appear on the website instantly.</p>
        </div>
        <Link href="/admin/products/new" className="a-btn a-btn-primary">+ New product</Link>
      </header>

      <div className="a-stats">
        {[
          ['Live products', o ? `${o.activeProducts} / ${o.products}` : '…', '/admin/products'],
          ['Featured on home', o?.featured ?? '…', '/admin/products'],
          ['Categories', o?.categories ?? '…', '/admin/menu'],
          ['New quote requests', o?.newQuotes ?? '…', '/admin/quotes'],
        ].map(([label, value, href]) => (
          <Link key={label} href={href} className="a-stat">
            <span>{label}</span>
            <b>{value}</b>
          </Link>
        ))}
      </div>

      <section className="a-card">
        <div className="a-card-head">
          <h2>Latest quote requests</h2>
          <Link href="/admin/quotes" className="a-link">View all →</Link>
        </div>
        {quotes === undefined ? (
          <p className="a-muted">Loading…</p>
        ) : quotes.length === 0 ? (
          <p className="a-muted">No new requests. They&apos;ll show up here as soon as a customer submits the form.</p>
        ) : (
          <ul className="a-list">
            {quotes.slice(0, 6).map((q) => (
              <li key={q._id}>
                <div>
                  <b>{q.name}</b> <span className="a-muted">· {q.email}</span>
                  <div className="a-muted a-small">{q.productSlug ? `Product: ${q.productSlug}` : q.interests.join(', ') || 'General enquiry'}</div>
                </div>
                <time className="a-muted a-small">{new Date(q._creationTime).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
