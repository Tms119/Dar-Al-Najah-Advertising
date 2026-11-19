import Link from 'next/link';
import { CATALOG, COMPANY, slugify } from '@/data/catalog';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-cta" data-reveal>
          <span className="eyebrow">Ready when you are</span>
          <Link href="/contact" className="footer-big">
            <span>Let&apos;s print</span>
            <span>something <em>great</em></span>
            <span className="footer-big-arrow">↗</span>
          </Link>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>Full-service printing, embroidery, gifting and photo studio in Dubai. Designed, printed and finished in-house.</p>
            <div className="socials">
              {['Instagram', 'TikTok', 'LinkedIn', 'Facebook'].map((s) => (
                <a key={s} href="#" className="pill">{s}</a>
              ))}
            </div>
          </div>
          {CATALOG.map((c) => (
            <div key={c.id} className="footer-col">
              <h4><i className="dot" style={{ background: c.color }} />{c.short}</h4>
              <ul>
                {c.groups[0].items.slice(0, 6).map(([n]) => (
                  <li key={n}><Link href={`/products/${slugify(n)}`}>{n}</Link></li>
                ))}
                <li><Link href={`/products?cat=${c.id}`} className="more">See all →</Link></li>
              </ul>
            </div>
          ))}
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}>{COMPANY.phone}</a></li>
              <li><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
              <li>{COMPANY.address}</li>
              <li>{COMPANY.hours}</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {COMPANY.full}. All rights reserved.</span>
          <span>Printed with love in Dubai 🇦🇪</span>
        </div>
      </div>
    </footer>
  );
}
