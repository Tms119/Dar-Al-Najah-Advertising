'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

export default function AdminHome() {
  const o = useQuery(api.admin.overview);

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
          ['Unpaid invoices', o?.unpaidInvoices ?? '…', '/admin/invoices'],
        ].map(([label, value, href]) => (
          <Link key={label} href={href} className="a-stat">
            <span>{label}</span>
            <b>{value}</b>
          </Link>
        ))}
      </div>

      <section className="a-card">
        <div className="a-card-head">
          <h2>Quick links</h2>
        </div>
        <ul className="a-list">
          <li><Link href="/admin/products/new">Add a product</Link><span className="a-muted a-small">Photos, description and menu placement</span></li>
          <li><Link href="/admin/invoices/new">Create an invoice</Link><span className="a-muted a-small">PDF download and WhatsApp sending</span></li>
          <li><Link href="/admin/mockups">Studio access</Link><span className="a-muted a-small">Give a customer a Mockup Studio pass</span></li>
        </ul>
      </section>
    </>
  );
}
