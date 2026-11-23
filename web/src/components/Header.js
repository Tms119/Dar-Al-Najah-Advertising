'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { COMPANY, categoryHref, telHref, waLink } from '@/data/site';
import { WhatsAppIcon } from './icons';
import { useCatalog } from './CatalogProvider';
import Logo from './Logo';
import Image from 'next/image';
import Mock from './Mock';

const MEGA_LIMIT = 12;

export default function Header() {
  const { categories: CATALOG } = useCatalog();
  const [mega, setMega] = useState(null);
  const [open, setOpen] = useState(false);
  const [mobileCat, setMobileCat] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // close menus on navigation (reset during render, not in an effect: no extra paint)
  const [shownPath, setShownPath] = useState(pathname);
  if (pathname !== shownPath) { setShownPath(pathname); setOpen(false); setMega(null); }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const active = CATALOG.find((c) => c.id === mega);

  // Hover intent: wait a moment before closing, so moving the mouse from a
  // pill down into the dropdown (or a slightly wobbly path) doesn't close it.
  const closeTimer = useRef(null);
  const cancelClose = () => { clearTimeout(closeTimer.current); };
  const openMega = (id) => { cancelClose(); setMega(id); };
  const closeMegaSoon = () => { cancelClose(); closeTimer.current = setTimeout(() => setMega(null), 220); };
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`} onMouseLeave={closeMegaSoon} onMouseEnter={cancelClose}>
      <div className="header-bar">
        <Logo />

        <nav className="nav-pills" aria-label="Main">
          {CATALOG.map((c) => (
            <button
              key={c.id}
              className={`pill ${mega === c.id ? 'is-active' : ''}`}
              onMouseEnter={() => openMega(c.id)}
              onFocus={() => openMega(c.id)}
              onClick={() => setMega(mega === c.id ? null : c.id)}
              aria-expanded={mega === c.id}
            >
              <i className="dot" style={{ background: c.color }} />
              {c.short}
            </button>
          ))}
          <Link className="pill" href="/products" onMouseEnter={() => { cancelClose(); setMega(null); }}>All products</Link>
        </nav>

        <div className="header-right">
          <div className="header-hours">
            <span>{COMPANY.hours}</span>
            <a href={telHref}>{COMPANY.phone}</a>
          </div>
          <a href={waLink('Hi Dar Al Najah! I have a question about printing.')} target="_blank" rel="noopener noreferrer" className="btn btn-ink btn-sm btn-wa">
            <WhatsAppIcon size={16} /> WhatsApp
          </a>
          <button className="burger" onClick={() => setOpen(true)} aria-label="Open menu">
            <span /><span />
          </button>
        </div>
      </div>

      {/* Desktop mega menu. The wrapper's top padding bridges the gap under the
          bar so the pointer never "leaves" the menu on the way down. */}
      <div className={`mega-wrap ${active ? 'is-open' : ''}`} onMouseEnter={cancelClose}>
      <div className={`mega ${active ? 'is-open' : ''}`} aria-hidden={!active}>
        {active && (
          <div className="mega-inner" key={active.id}>
            <div className="mega-feature" style={{ background: active.tint }}>
              <span className="eyebrow">{active.name}</span>
              <p>{active.tagline}</p>
              {active.image ? (
                <div className="mega-photo"><Image src={active.image} alt={active.name} fill sizes="260px" /></div>
              ) : (
                <Mock shape={active.hero} color={active.color} className="mega-mock" />
              )}
              <Link href={categoryHref(active.id)} className="btn btn-ink btn-sm">
                View all {active.short.toLowerCase()} <span className="btn-arrow">→</span>
              </Link>
            </div>
            <div className="mega-cols">
              {active.groups.map((g) => (
                <div key={g.name} className="mega-col">
                  <h4>{g.name}</h4>
                  <ul>
                    {g.items.slice(0, MEGA_LIMIT).map((it) => (
                      <li key={it.slug}><Link href={`/products/${it.slug}`}>{it.name}</Link></li>
                    ))}
                    {g.items.length > MEGA_LIMIT && (
                      <li><Link href={categoryHref(active.id)} className="mega-more">See all {g.items.length} →</Link></li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
                        {g.items.map((it) => (
                          <Link key={it.slug} href={`/products/${it.slug}`} className="chip">{it.name}</Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <Link href="/products" className="m-link" style={{ '--i': CATALOG.length }}>All products</Link>
          <Link href="/contact" className="m-link" style={{ '--i': CATALOG.length + 1 }}>Contact</Link>
        </div>
        <div className="mobile-foot">
          <a href={telHref}>{COMPANY.phone}</a>
          <span>{COMPANY.hours}</span>
        </div>
      </div>
    </header>
  );
}
