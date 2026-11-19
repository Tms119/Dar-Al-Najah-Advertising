'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATALOG, COMPANY, slugify } from '@/data/catalog';
import Logo from './Logo';
import Mock from './Mock';

export default function Header() {
  const [mega, setMega] = useState(null);
  const [open, setOpen] = useState(false);
  const [mobileCat, setMobileCat] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); setMega(null); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const active = CATALOG.find((c) => c.id === mega);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`} onMouseLeave={() => setMega(null)}>
      <div className="header-bar">
        <Logo />

        <nav className="nav-pills" aria-label="Main">
          {CATALOG.map((c) => (
            <button
              key={c.id}
              className={`pill ${mega === c.id ? 'is-active' : ''}`}
              onMouseEnter={() => setMega(c.id)}
              onFocus={() => setMega(c.id)}
              onClick={() => setMega(mega === c.id ? null : c.id)}
              aria-expanded={mega === c.id}
            >
              <i className="dot" style={{ background: c.color }} />
              {c.short}
            </button>
          ))}
          <Link className="pill" href="/products" onMouseEnter={() => setMega(null)}>All products</Link>
        </nav>

        <div className="header-right">
          <div className="header-hours">
            <span>{COMPANY.hours}</span>
            <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}>{COMPANY.phone}</a>
          </div>
          <Link href="/contact" className="btn btn-ink btn-sm">
            Get a quote <span className="btn-arrow">↗</span>
          </Link>
          <button className="burger" onClick={() => setOpen(true)} aria-label="Open menu">
            <span /><span />
          </button>
        </div>
      </div>

      {/* Desktop mega menu */}
      <div className={`mega ${active ? 'is-open' : ''}`} aria-hidden={!active}>
        {active && (
          <div className="mega-inner" key={active.id}>
            <div className="mega-feature" style={{ background: active.tint }}>
              <span className="eyebrow">{active.name}</span>
              <p>{active.tagline}</p>
              <Mock shape={active.hero} color={active.color} className="mega-mock" />
              <Link href={`/products?cat=${active.id}`} className="btn btn-ink btn-sm">
                View all {active.short.toLowerCase()} <span className="btn-arrow">→</span>
              </Link>
            </div>
            <div className="mega-cols">
              {active.groups.map((g) => (
                <div key={g.name} className="mega-col">
                  <h4>{g.name}</h4>
                  <ul>
                    {g.items.map(([name]) => (
                      <li key={name}><Link href={`/products/${slugify(name)}`}>{name}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile overlay */}
      <div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="mobile-top">
          <Logo onClick={() => setOpen(false)} />
          <button className="pill" onClick={() => setOpen(false)}>Close ✕</button>
        </div>
        <div className="mobile-list">
          {CATALOG.map((c, i) => (
            <div key={c.id} className={`m-cat ${mobileCat === c.id ? 'is-open' : ''}`} style={{ '--i': i }}>
              <button className="m-cat-btn" onClick={() => setMobileCat(mobileCat === c.id ? null : c.id)}>
                <span><i className="dot" style={{ background: c.color }} />{c.name}</span>
                <span className="m-plus">+</span>
              </button>
              <div className="m-cat-body">
                <div>
                  {c.groups.map((g) => (
                    <div key={g.name} className="m-group">
                      <h5>{g.name}</h5>
                      <div className="m-chips">
                        {g.items.map(([name]) => (
                          <Link key={name} href={`/products/${slugify(name)}`} className="chip">{name}</Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <Link href="/products" className="m-link" style={{ '--i': 4 }}>All products</Link>
          <Link href="/contact" className="m-link" style={{ '--i': 5 }}>Contact & quote</Link>
        </div>
        <div className="mobile-foot">
          <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}>{COMPANY.phone}</a>
          <span>{COMPANY.hours}</span>
        </div>
      </div>
    </header>
  );
}
