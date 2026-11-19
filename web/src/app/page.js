import Link from 'next/link';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import ScrollText from '@/components/ScrollText';
import ProductCard from '@/components/ProductCard';
import Faq from '@/components/Faq';
import Mock from '@/components/Mock';
import { CATALOG, FEATURED, PRODUCTS, slugify } from '@/data/catalog';

const STEPS = [
  { n: '01', t: 'Pick a product', d: 'Choose from 90+ print, fabric, gift and photo products — or tell us your idea.', shape: 'card', c: '#2B3BFF' },
  { n: '02', t: 'Send your design', d: 'Upload your artwork, or let our in-house designers create it for you.', shape: 'flyer', c: '#FF3D7F' },
  { n: '03', t: 'Approve the proof', d: 'We send a digital proof. Nothing prints until you say it looks right.', shape: 'sticker', c: '#00A86B' },
  { n: '04', t: 'Print & deliver', d: 'Printed, finished and delivered across the UAE — or pick up in-store.', shape: 'box', c: '#FFB800' },
];

const REVIEWS = [
  { q: 'Our roll-ups and 2,000 flyers were ready overnight for GITEX. Colours were spot-on.', n: 'Sara M.', r: 'Marketing Lead, Tech startup', c: '#2B3BFF' },
  { q: 'Embroidered caps and polos for the whole team. Stitching quality is honestly better than retail.', n: 'Omar K.', r: 'Operations, F&B group', c: '#FF3D7F' },
  { q: 'Got passport photos in ten minutes and they restored my grandparents’ wedding photo. Magic.', n: 'Priya S.', r: 'Walk-in customer', c: '#00A86B' },
  { q: 'Corporate welcome kits for 120 new joiners, boxed and delivered. Zero stress on our side.', n: 'James L.', r: 'HR Manager, Logistics', c: '#FFB800' },
];

const FAQS = [
  { q: 'Do you offer same-day printing?', a: 'Yes — business cards, flyers, stickers, mugs and passport photos can be ready the same day when artwork is approved before noon. Larger jobs usually take 24–72 hours.' },
  { q: 'Can you design my artwork?', a: 'Absolutely. Our in-house designers can create logos, layouts and print-ready files. Just share your brief and brand assets.' },
  { q: 'What file formats do you accept?', a: 'Print-ready PDF is best. We also accept AI, PSD, EPS, high-resolution PNG/JPG and even Canva links — we’ll check every file before printing.' },
  { q: 'Is there a minimum order quantity?', a: 'Most products start from very small runs — even a single mug or roll-up. Bulk pricing kicks in automatically as quantity grows.' },
  { q: 'Do you deliver across the UAE?', a: 'Yes, we deliver to Dubai, Abu Dhabi, Sharjah and all emirates. Express delivery is available within Dubai.' },
];

export default function Home() {
  return (
    <>
      <Hero />

      <div className="marquee-wrap">
        <Marquee tilt={-2} items={['Business cards', 'Roll-up stands', 'Embroidery', 'Packaging', 'Corporate gifts', 'Stickers', 'Photo studio', 'Signage']} />
      </div>

      {/* About */}
      <section className="section about">
        <div className="container">
          <span className="eyebrow center" data-reveal>A bit about us</span>
          <ScrollText
            text="We’re the print partner Dubai calls when it has to *look *right and *land *on *time. Cards, boxes, banners, embroidery, gifts and photos — designed, printed and finished under one roof, so you only ever need one number."
            pills={[
              { label: 'In-house production', at: 0.25, top: '18%', left: '58%', bg: 'var(--blue)', rot: -6 },
              { label: 'Proof before print', at: 0.45, top: '46%', left: '6%', bg: 'var(--pink)', rot: 5 },
              { label: 'UAE-wide delivery', at: 0.65, top: '74%', left: '64%', bg: 'var(--green)', rot: -4 },
            ]}
          />
        </div>
      </section>

      {/* Services — sticky stacking cards */}
      <section className="section services" id="services">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">What we do</span>
            <h2 className="display">Four studios.<br />One print partner.</h2>
          </div>
          <div className="stack">
            {CATALOG.map((c, i) => {
              const count = c.groups.reduce((a, g) => a + g.items.length, 0);
              const sample = c.groups.flatMap((g) => g.items).slice(0, 7);
              return (
                <article key={c.id} className="stack-card" style={{ '--c': c.color, '--t': c.tint, '--i': i }}>
                  <div className="stack-text">
                    <div className="stack-top">
                      <span className="stack-num">0{i + 1}</span>
                      <span className="pill pill-solid">{count} products</span>
                    </div>
                    <h3>{c.name}</h3>
                    <p>{c.tagline}</p>
                    <div className="stack-chips">
                      {sample.map(([n]) => (
                        <Link key={n} href={`/products/${slugify(n)}`} className="chip chip-white">{n}</Link>
                      ))}
                    </div>
                    <Link href={`/products?cat=${c.id}`} className="btn btn-ink">
                      Explore {c.short.toLowerCase()} <span className="btn-arrow">→</span>
                    </Link>
                  </div>
                  <div className="stack-art">
                    <div className="stack-circle" />
                    <Mock shape={c.hero} color={c.color} className="stack-mock" />
                    <Mock shape={c.groups[0].items[2][1]} color={c.color} className="stack-mock-sm a" />
                    <Mock shape={c.groups[c.groups.length - 1].items[0][1]} color={c.color} className="stack-mock-sm b" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="section bestsellers">
        <div className="container">
          <div className="section-head split" data-reveal>
            <div>
              <span className="eyebrow">Bestsellers</span>
              <h2 className="display">Customers&apos; <span className="hl">favourites</span></h2>
            </div>
            <Link href="/products" className="btn btn-ghost">See all {PRODUCTS.length} products <span className="btn-arrow">→</span></Link>
          </div>
          <div className="p-grid">
            {FEATURED.slice(0, 8).map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section process">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">How it works</span>
            <h2 className="display">From idea to<br />in-hand in 4 steps</h2>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.n} className="step" data-reveal style={{ '--d': `${i * 90}ms`, '--c': s.c }}>
                <span className="step-n">{s.n}</span>
                <Mock shape={s.shape} color={s.c} className="step-mock" />
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container stats-grid">
          {[
            [`${PRODUCTS.length}+`, 'Products & services'],
            ['Same day', 'Express printing'],
            ['4', 'In-house studios'],
            ['7', 'Emirates we deliver to'],
          ].map(([v, l], i) => (
            <div key={l} className="stat" data-reveal style={{ '--d': `${i * 80}ms` }}>
              <b>{v}</b><span>{l}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="marquee-wrap">
        <Marquee variant="blue" reverse tilt={1.5} items={['Good print', 'No funny business', 'Proof before print', 'Made in Dubai', 'Sharp colours', 'On time, every time']} />
      </div>

      {/* Reviews */}
      <section className="section reviews">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">Kind words</span>
            <h2 className="display">People keep<br />coming back</h2>
          </div>
          <div className="review-row">
            {REVIEWS.map((r, i) => (
              <figure key={r.n} className="review" data-reveal style={{ '--d': `${i * 80}ms`, '--c': r.c }}>
                <div className="stars" aria-label="5 stars">★★★★★</div>
                <blockquote>“{r.q}”</blockquote>
                <figcaption>
                  <span className="avatar">{r.n[0]}</span>
                  <span><b>{r.n}</b><small>{r.r}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq-section">
        <div className="container faq-wrap">
          <div className="section-head" data-reveal>
            <span className="eyebrow">FAQ</span>
            <h2 className="display">Good<br />questions</h2>
            <p className="muted">Can’t find your answer? Message us on WhatsApp — we reply fast.</p>
          </div>
          <Faq items={FAQS} />
        </div>
      </section>
    </>
  );
}
