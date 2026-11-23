'use client';

import Image from 'next/image';
import Link from 'next/link';
import { COMPANY, categoryHref, telHref, waLink } from '@/data/site';
import { useCatalog } from './CatalogProvider';

const SOCIALS = ['Instagram', 'TikTok', 'LinkedIn', 'Facebook'];

export default function Footer() {
  const { categories } = useCatalog();

  return (
    <footer className="site-footer">
      <div className="container">
        {/* CTA band */}
        <div className="f-cta">
          <div className="f-cta-text" data-reveal>
            <span className="eyebrow">Ready when you are</span>
            <Link href="/contact" className="footer-big">
              <span>Let&apos;s print</span>
              <span>something <em>great</em></span>
            </Link>
          </div>
          <div className="f-quick" data-reveal style={{ '--d': '120ms' }}>
            <a href={waLink('Hi Dar Al Najah! I need a quote.')} target="_blank" rel="noopener noreferrer" className="f-quick-btn is-wa">
              <small>WhatsApp</small><b>Chat with us</b><span aria-hidden="true">↗</span>
            </a>
            <a href={telHref} className="f-quick-btn">
              <small>Call</small><b>{COMPANY.phone}</b><span aria-hidden="true">↗</span>
            </a>
            <a href={`mailto:${COMPANY.email}`} className="f-quick-btn">
              <small>Email</small><b>{COMPANY.email}</b><span aria-hidden="true">↗</span>
            </a>
            <Link href="/products" className="f-quick-btn is-accent">
              <small>Catalogue</small><b>Browse products</b><span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Link grid */}
        <div className="f-grid">
          <div className="f-about">
            <Link href="/" className="f-logo" aria-label="Dar Al Najah Advertising, home">
              <Image src="/brand/logo-1200.webp" alt="Dar Al Najah Advertising. All Kinds of Printing Solution" width={1200} height={602} sizes="300px" />
            </Link>
            <p className="f-about-text">
              Printing, embroidery, gifting and a photo studio in Dubai. Everything is designed, printed and finished in our own studio.
            </p>
            <dl className="f-info">
              <div><dt>Visit</dt><dd>{COMPANY.address}</dd></div>
              <div><dt>Hours</dt><dd>{COMPANY.hours}</dd></div>
            </dl>
            <div className="socials">
              {SOCIALS.map((s) => <a key={s} href="#" className="pill">{s}</a>)}
            </div>
          </div>

          <nav className="f-cols" aria-label="Footer">
            {categories.map((c) => (
              <div key={c.id} className="footer-col">
                <h4><i className="dot" style={{ background: c.color }} />{c.short}</h4>
                <ul>
                  {c.groups.flatMap((g) => g.items).slice(0, 6).map((it) => (
                    <li key={it.slug}><Link href={`/products/${it.slug}`}>{it.name}</Link></li>
                  ))}
                  <li><Link href={categoryHref(c.id)} className="more">All {c.count} →</Link></li>
                </ul>
              </div>
            ))}
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/products">All products</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><a href={waLink('Hi! I have a question.')} target="_blank" rel="noopener noreferrer">WhatsApp support</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* Giant wordmark */}
      <div className="f-mark" aria-hidden="true">
        <span>Dar Al Najah</span>
        <i style={{ background: 'var(--cyan)' }} /><i style={{ background: 'var(--pink)' }} /><i style={{ background: 'var(--yellow)' }} />
      </div>

      <div className="container">
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {COMPANY.full}. All rights reserved.</span>
          <span>Printed with care in Dubai</span>
          <button type="button" className="f-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
