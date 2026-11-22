'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useCatalog } from '@/components/CatalogProvider';

export default function Catalog({ initialCat = 'all' }) {
  const { categories: CATALOG, products: PRODUCTS } = useCatalog();
  const [cat, setCatState] = useState(initialCat);
  const [group, setGroup] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('featured');

  const category = CATALOG.find((c) => c.id === cat);
  const countByCat = useMemo(() => {
    const m = {};
    for (const p of PRODUCTS) m[p.category] = (m[p.category] ?? 0) + 1;
    return m;
  }, [PRODUCTS]);

  const setCat = (id) => {
    setGroup('all');
    setCatState(id);
    window.history.replaceState(null, '', id === 'all' ? '/products' : `/products?cat=${id}`);
  };

  const list = useMemo(() => {
    let l = PRODUCTS.filter((p) =>
      (cat === 'all' || p.category === cat) &&
      (group === 'all' || p.group === group) &&
      (!q || `${p.name} ${p.group} ${p.categoryName}`.toLowerCase().includes(q.toLowerCase()))
    );
    // filter() already returned a fresh array, so sorting in place is safe
    if (sort === 'featured') l.sort((a, b) => b.featured - a.featured);
    if (sort === 'az') l.sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [PRODUCTS, cat, group, q, sort]);

  return (
    <div className="catalog page-pad">
      <div className="container">
        <header className="cat-head" style={{ '--c': category?.color || 'var(--ink)' }}>
          <span className="eyebrow">{category ? 'Category' : 'Shop'}</span>
          <h1 className="display xl">{category ? category.name : 'All products'}</h1>
          <p className="muted">{category ? category.tagline : 'Everything we print, stitch, engrave and shoot, all in one place.'}</p>
        </header>

        <div className="cat-toolbar">
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={cat === 'all'} className={`tab ${cat === 'all' ? 'is-active' : ''}`} onClick={() => setCat('all')}>
              All <span>{PRODUCTS.length}</span>
            </button>
            {CATALOG.map((c) => (
              <button key={c.id} role="tab" aria-selected={cat === c.id} className={`tab ${cat === c.id ? 'is-active' : ''}`} onClick={() => setCat(c.id)} style={{ '--c': c.color }}>
                <i className="dot" style={{ background: c.color }} />{c.short}
                <span>{countByCat[c.id] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="cat-tools">
            <label className="search">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" aria-label="Search products" />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="featured">Featured</option>
              <option value="az">A to Z</option>
            </select>
          </div>
        </div>

        {category && (
          <div className="group-chips">
            <button className={`chip ${group === 'all' ? 'is-active' : ''}`} onClick={() => setGroup('all')}>All {category.short.toLowerCase()}</button>
            {category.groups.map((g) => (
              <button key={g.name} className={`chip ${group === g.name ? 'is-active' : ''}`} onClick={() => setGroup(g.name)}>{g.name}</button>
            ))}
          </div>
        )}

        <p className="result-count">{list.length} product{list.length === 1 ? '' : 's'}</p>

        {list.length ? (
          <div className="p-grid" key={`${cat}-${group}-${sort}`}>
            {list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
          </div>
        ) : (
          <div className="empty">
            <h3>Nothing matches “{q}”</h3>
            <p className="muted">We probably still make it. Ask us on WhatsApp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
