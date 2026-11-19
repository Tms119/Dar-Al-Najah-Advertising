'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import Mock from './Mock';

const FLOATERS = [
  { shape: 'card', color: '#2B3BFF', cls: 'f1', depth: 30 },
  { shape: 'mug', color: '#FFB800', cls: 'f2', depth: -24 },
  { shape: 'shirt', color: '#FF3D7F', cls: 'f3', depth: 18 },
  { shape: 'sticker', color: '#00A86B', cls: 'f4', depth: -36 },
  { shape: 'bag', color: '#121212', cls: 'f5', depth: 22 },
  { shape: 'cap', color: '#2B3BFF', cls: 'f6', depth: -16 },
];

const QUICK = [
  ['Business cards', 'business-cards'],
  ['Roll-ups', 'roll-up-stands'],
  ['T-shirts', 't-shirt-printing'],
  ['Stickers', 'sticker'],
  ['Boxes', 'box'],
  ['Passport photos', 'passport-size-photo'],
];

export default function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty('--mx', x.toFixed(3));
        el.style.setProperty('--my', y.toFixed(3));
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
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
          <i className="live-dot" /> Dubai&apos;s one-stop print shop
        </span>

        <h1 className="hero-title">
          <span className="ht-line"><span>Print that</span></span>
          <span className="ht-line">
            <span>gets</span>
            <span className="tag tag-blue">same-day printing</span>
          </span>
          <span className="ht-line">
            <span className="ht-outline">noticed.</span>
            <span className="tag tag-pink">90+ products</span>
          </span>
        </h1>

        <p className="hero-sub">
          Business cards to banners, embroidered caps to corporate gifts — designed, printed and finished
          under one roof by <b>Dar Al Najah Advertising</b>.
        </p>

        <div className="hero-actions">
          <Link href="/products" className="btn btn-ink">Browse products <span className="btn-arrow">→</span></Link>
          <Link href="/contact" className="btn btn-ghost">Request a quote</Link>
        </div>

        <div className="hero-quick">
          <span>Popular:</span>
          {QUICK.map(([label, id]) => (
            <Link key={id} href={`/products/${id}`} className="chip">{label}</Link>
          ))}
        </div>
      </div>
    </section>
  );
}
