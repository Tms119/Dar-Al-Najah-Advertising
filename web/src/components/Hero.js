'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Mock from './Mock';
import { useCatalog } from './CatalogProvider';
import { WhatsAppIcon } from './icons';
import { waLink } from '@/data/site';
import { SERVICES } from '@/data/services';

const FLOATERS = [
  { shape: 'card', color: '#2B3BFF', cls: 'f1', depth: 30 },
  { shape: 'mug', color: '#FFB800', cls: 'f2', depth: -24 },
  { shape: 'shirt', color: '#FF3D7F', cls: 'f3', depth: 18 },
  { shape: 'sticker', color: '#00A86B', cls: 'f4', depth: -36 },
  { shape: 'bag', color: '#121212', cls: 'f5', depth: 22 },
  { shape: 'cap', color: '#2B3BFF', cls: 'f6', depth: -16 },
];


export default function Hero() {
  const ref = useRef(null);
  const { products } = useCatalog();

  useEffect(() => {
    const el = ref.current;
    // no parallax on touch screens or low-end devices
    if (!el || window.matchMedia('(pointer: coarse)').matches || document.documentElement.hasAttribute('data-lite')) return;
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    const onMove = (e) => {
      if (!visible || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty('--mx', x.toFixed(3));
        el.style.setProperty('--my', y.toFixed(3));
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  return (
    <section className="hero" ref={ref}>
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="reg reg-tl" aria-hidden="true" />
      <div className="reg reg-br" aria-hidden="true" />

      {FLOATERS.map((f) => (
        <div key={f.cls} className={`floater ${f.cls}`} style={{ '--depth': f.depth }} aria-hidden="true">
          <div className="floater-inner"><Mock shape={f.shape} color={f.color} /></div>
        </div>
      ))}

      <div className="hero-content">
        <span className="eyebrow hero-eyebrow">
          <i className="live-dot" /> Dubai&apos;s one stop print solution
        </span>

        <h1 className="hero-title">
          <span className="ht-line"><span>Print that</span></span>
          <span className="ht-line">
            <span>gets</span>
            <span className="tag tag-blue">same day printing</span>
          </span>
          <span className="ht-line">
            <span className="ht-outline">noticed.</span>
            <span className="tag tag-pink">{products.length}+ products</span>
          </span>
        </h1>

        <p className="hero-sub">
          Business cards to banners, embroidered caps to corporate gifts, all designed, printed and finished
          under one roof by <b>Dar Al Najah Advertising</b>.
        </p>

        <div className="hero-actions">
          <Link href="/products" className="btn btn-ink">Browse products <span className="btn-arrow">→</span></Link>
          <a href={waLink('Hi Dar Al Najah! I would like to discuss a print job.')} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><WhatsAppIcon size={18} /> Chat on WhatsApp</a>
        </div>

        <nav className="hero-quick" aria-label="Our services">
          <span>Our services:</span>
          {SERVICES.map((sv) => (
            <Link key={sv.label} href={sv.href} className="chip">{sv.label}</Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
