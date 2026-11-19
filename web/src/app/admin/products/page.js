'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import Mock from '@/components/Mock';
import Toggle from '@/components/admin/Toggle';

export default function AdminProducts() {
  const products = useQuery(api.admin.listProducts);
  const setActive = useMutation(api.admin.setProductActive);
  const setFeatured = useMutation(api.admin.setProductFeatured);
  const remove = useMutation(api.admin.deleteProduct);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');

  const cats = useMemo(() => {
    const m = new Map();
    (products ?? []).forEach((p) => m.set(p.categorySlug ?? 'none', p.categoryName));
    return [...m.entries()];
  }, [products]);

  const list = useMemo(() => (products ?? [])
    .filter((p) => cat === 'all' || (p.categorySlug ?? 'none') === cat)
    .filter((p) => status === 'all' || (status === 'live' ? p.isActive : !p.isActive))
    .filter((p) => !q || `${p.name} ${p.slug} ${p.groupName}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name)), [products, q, cat, status]);

  const onDelete = async (p) => {
    if (!window.confirm(`Permanently delete "${p.name}"? This removes it from every menu and deletes its photos. This can't be undone.\n\nTip: switch it off instead if you might want it back.`)) return;
    await remove({ id: p._id });
  };

  return (
    <>
      <header className="a-head">
        <div>
          <h1>Products</h1>
          <p className="a-muted">Switch a product off to hide it from the menu and catalogue instantly.</p>
        </div>
        <Link href="/admin/products/new" className="a-btn a-btn-primary">+ New product</Link>
      </header>

      <div className="a-toolbar">
        <input className="a-input" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="a-input" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">All categories</option>
          {cats.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
        </select>
        <select className="a-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Live + hidden</option>
          <option value="live">Live only</option>
          <option value="hidden">Hidden only</option>
        </select>
        <span className="a-muted a-small">{products ? `${list.length} of ${products.length}` : ''}</span>
      </div>

      <div className="a-card a-table-wrap">
        {products === undefined ? <p className="a-muted">Loading…</p> : (
          <table className="a-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>From</th><th>Live</th><th>Featured</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id} className={p.isActive ? '' : 'is-off'}>
                  <td>
                    <Link href={`/admin/products/${p._id}`} className="a-prod">
                      <span className="a-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.image ? <img src={p.image} alt="" /> : <Mock shape={p.mockupShape} color={p.color} />}
                      </span>
                      <span><b>{p.name}</b><small className="a-muted">/{p.slug}</small></span>
                    </Link>
                  </td>
                  <td><span className="a-tag" style={{ '--c': p.color }}>{p.categoryName}</span><div className="a-muted a-small">{p.groupName}{p.menuCount > 1 ? ` +${p.menuCount - 1}` : ''}</div></td>
                  <td>AED {p.basePrice}</td>
                  <td><Toggle checked={p.isActive} onChange={(v) => setActive({ id: p._id, isActive: v })} label={`Show ${p.name} on website`} /></td>
                  <td><Toggle checked={p.isFeatured} onChange={(v) => setFeatured({ id: p._id, isFeatured: v })} label={`Feature ${p.name} on home page`} /></td>
                  <td className="a-actions">
                    <Link href={`/admin/products/${p._id}`} className="a-btn a-btn-sm">Edit</Link>
                    {p.isActive && p.categorySlug && <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className="a-btn a-btn-sm a-btn-ghost" title="View on website">↗</a>}
                    <button className="a-btn a-btn-sm a-btn-danger" onClick={() => onDelete(p)} title="Delete">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
