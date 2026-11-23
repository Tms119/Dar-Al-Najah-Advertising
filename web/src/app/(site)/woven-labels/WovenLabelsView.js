'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePreloadedQuery } from 'convex/react';
import Faq from '@/components/Faq';
import Marquee from '@/components/Marquee';
import Mock from '@/components/Mock';
import { WhatsAppIcon } from '@/components/icons';
import { waLink } from '@/data/site';
import { slugify } from '@/lib/slugify';

/* Woven Labels landing page. Same building blocks as the home page (hero,
   marquee, stacking cards, steps, stats, FAQ); the products and photos come
   live from the catalogue, so edits in the admin show here instantly. */

const FLOATERS = [
  { shape: 'tag', color: '#7B3FE4', cls: 'f1', depth: 30 },
  { shape: 'shirt', color: '#FFB800', cls: 'f2', depth: -24 },
  { shape: 'patch', color: '#FF3D7F', cls: 'f3', depth: 18 },
  { shape: 'ribbon', color: '#00A86B', cls: 'f4', depth: -36 },
  { shape: 'bag', color: '#121212', cls: 'f5', depth: 22 },
  { shape: 'cap', color: '#2B3BFF', cls: 'f6', depth: -16 },
];

const GROUP_COPY = {
  'Label types': 'Damask for detail, satin for softness, polyester for strength, cotton for a natural feel. We help you pick the right weave for your product.',
  'Folds and finishes': 'How a label is cut and folded decides where it sits and how it feels. Choose the fold, cut and edge that suits your garment.',
  'Labels by product': 'Labels sized and finished for what you make, from neck labels on tees to tiny tabs on caps and tough labels for uniforms.',
  'Manufacturing and supply': 'From a first run for a new brand to repeat bulk orders, private label and OEM production with consistent quality.',
};
const GROUP_COLORS = ['#7B3FE4', '#FF3D7F', '#00A86B', '#2B3BFF'];
const GROUP_TINTS = ['#EFE7FF', '#FFE6EE', '#DDF6EA', '#E6E8FF'];

const STEPS = [
  { n: '01', t: 'Share your logo', d: 'Send your logo, label size and quantity on WhatsApp. No artwork yet? Our designers can help.', shape: 'tag', c: '#7B3FE4' },
  { n: '02', t: 'Approve the design', d: 'We send a digital proof with thread colours matched to your brand. Nothing is woven until you approve it.', shape: 'patch', c: '#FF3D7F' },
  { n: '03', t: 'Weaving and finishing', d: 'Your labels are woven, cut, folded and quality checked to the finish you chose.', shape: 'ribbon', c: '#00A86B' },
  { n: '04', t: 'Delivered to you', d: 'Packed and delivered across the UAE, or collected from our store in Dubai.', shape: 'box', c: '#FFB800' },
];

const FAQS = [
  { q: 'What is the minimum order for woven labels?', a: 'We handle small first runs for new brands as well as large bulk orders. Tell us your quantity on WhatsApp and we will recommend the most cost effective option.' },
  { q: 'Which woven label type should I choose?', a: 'Damask gives the sharpest detail and a premium feel, satin is the softest, polyester is the most durable for frequent washing, and cotton suits natural and organic brands. We will advise based on your garment.' },
  { q: 'Can you match my brand colours?', a: 'Yes. We match thread colours to your logo or brand guide and send a proof before production.' },
  { q: 'How are the labels attached?', a: 'Labels can be sewn into a seam, sewn flat on all sides, or supplied with an iron on backing, depending on the fold and your product.' },
  { q: 'Do you make size and care labels too?', a: 'Yes. Alongside brand labels we produce size labels, care labels and hang tags so your whole range matches.' },
  { q: 'How long does production take?', a: 'Most orders are ready within a few working days after you approve the proof. Larger or more complex runs can take longer, and we always confirm the date up front.' },
];

const anchor = (name) => slugify(name);

function LabelCard({ p, i, color, tint }) {
  return (
    <article className="p-card wl-card" data-reveal style={{ '--d': `${(i % 4) * 70}ms`, '--c': color, '--t': tint }}>
      <Link href={`/products/${p.slug}`} className={`p-card-media ${p.image ? 'has-photo' : ''}`}>
        {p.badge && <span className="p-badge">{p.badge}</span>}
        {p.image ? (
          <Image src={p.image} alt={p.name} fill sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw" className="p-photo" />
        ) : (
          <Mock shape={p.shape} color={color} className="p-mock" title={p.name} />
        )}
        <span className="p-cta">View <b>↗</b></span>
      </Link>
      <div className="p-card-body">
        <h3><Link href={`/products/${p.slug}`}>{p.name}</Link></h3>
        <p className="wl-desc">{p.desc}</p>
        <a className="wl-ask" href={waLink(`Hi Dar Al Najah! I'm interested in ${p.name}.`)} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={15} /> Ask on WhatsApp
        </a>
      </div>
    </article>
  );
}

export default function WovenLabelsView({ preloaded }) {
  const page = usePreloadedQuery(preloaded);
  if (!page) return null;
  const total = page.sections.reduce((a, s) => a + s.items.length, 0);

  return (
    <>
      {/* Hero */}
      <section className="hero wl-hero">
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="reg reg-tl" aria-hidden="true" />
        <div className="reg reg-br" aria-hidden="true" />
        {FLOATERS.map((f) => (
          <div key={f.cls} className={`floater ${f.cls}`} style={{ '--depth': f.depth }} aria-hidden="true">
            <div className="floater-inner"><Mock shape={f.shape} color={f.color} /></div>
          </div>
        ))}
        <div className="hero-content">
          <span className="eyebrow hero-eyebrow"><i className="live-dot" /> Woven labels made in Dubai</span>
          <h1 className="hero-title">
            <span className="ht-line"><span>Labels that</span></span>
            <span className="ht-line">
              <span>carry your</span>
              <span className="tag tag-blue">damask · satin · cotton</span>
            </span>
            <span className="ht-line">
              <span className="ht-outline">brand.</span>
              <span className="tag tag-pink">{total} label styles</span>
            </span>
          </h1>
          <p className="hero-sub">{page.tagline}</p>
          <div className="hero-actions">
            <a href={waLink('Hi Dar Al Najah! I would like a quote for woven labels.')} target="_blank" rel="noopener noreferrer" className="btn btn-ink btn-wa">
              <WhatsAppIcon size={18} /> Get labels on WhatsApp
            </a>
            <a href="#label-range" className="btn btn-ghost">Explore the range</a>
          </div>
          <div className="hero-quick">
            <span>Jump to:</span>
            {page.sections.map((s) => <a key={s.name} href={`#${anchor(s.name)}`} className="chip">{s.name}</a>)}
          </div>
        </div>
      </section>

      <div className="marquee-wrap">
        <Marquee tilt={-2} items={['Damask', 'Satin', 'Polyester', 'Cotton', 'Center fold', 'End fold', 'Straight cut', 'Soft edge', 'Private label', 'OEM']} />
      </div>

      {/* The range: one stacking card per group, like the home page services */}
      <section className="section services" id="label-range">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">The range</span>
            <h2 className="display">Every label<br />your brand needs.</h2>
          </div>
          <div className="stack">
            {page.sections.map((s, i) => {
              const color = GROUP_COLORS[i % GROUP_COLORS.length];
              const cover = s.items.find((it) => it.image);
              return (
                <article key={s.name} className="stack-card" style={{ '--c': color, '--t': GROUP_TINTS[i % GROUP_TINTS.length], '--i': i }}>
                  <div className="stack-text">
                    <div className="stack-top">
                      <span className="stack-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="pill pill-solid">{s.items.length} options</span>
                    </div>
                    <h3>{s.name}</h3>
                    <p>{GROUP_COPY[s.name] ?? page.tagline}</p>
                    <div className="stack-chips">
                      {s.items.map((it) => <Link key={it.slug} href={`/products/${it.slug}`} className="chip chip-white">{it.name}</Link>)}
                    </div>
                    <a href={`#${anchor(s.name)}`} className="btn btn-ink">See {s.name.toLowerCase()} <span className="btn-arrow">↓</span></a>
                  </div>
                  {cover ? (
                    <div className="stack-art stack-art-photo">
                      <Image src={cover.image} alt={s.name} fill sizes="(max-width: 980px) 100vw, 45vw" />
                    </div>
                  ) : (
                    <div className="stack-art"><div className="stack-circle" /><Mock shape={page.hero} color={color} className="stack-mock" /></div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Each group with every label, its photo and description */}
      {page.sections.map((s, i) => (
        <section key={s.name} className="section wl-group" id={anchor(s.name)}>
          <div className="container">
            <div className="section-head split" data-reveal>
              <div>
                <span className="eyebrow">{String(i + 1).padStart(2, '0')} · {s.name}</span>
                <h2 className="display">{s.name}</h2>
              </div>
              <p className="muted">{GROUP_COPY[s.name]}</p>
            </div>
            <div className="p-grid wl-grid">
              {s.items.map((p, j) => (
                <LabelCard key={p.slug} p={p} i={j} color={GROUP_COLORS[i % GROUP_COLORS.length]} tint={GROUP_TINTS[i % GROUP_TINTS.length]} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Process */}
      <section className="section process">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">How it works</span>
            <h2 className="display">From logo to<br />label in 4 steps</h2>
          </div>
          <div className="steps">
            {STEPS.map((st, i) => (
              <div key={st.n} className="step" data-reveal style={{ '--d': `${i * 90}ms`, '--c': st.c }}>
                <span className="step-n">{st.n}</span>
                <Mock shape={st.shape} color={st.c} className="step-mock" />
                <h3>{st.t}</h3>
                <p>{st.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container stats-grid">
          {[[`${total}`, 'Label styles'], ['4', 'Weave types'], ['Any', 'Size, shape and colour'], ['7', 'Emirates we deliver to']].map(([v, l], i) => (
            <div key={l} className="stat" data-reveal style={{ '--d': `${i * 80}ms` }}><b>{v}</b><span>{l}</span></div>
          ))}
        </div>
      </section>

      <div className="marquee-wrap">
        <Marquee variant="blue" reverse tilt={1.5} items={['Proof before production', 'Brand colour matching', 'Small runs welcome', 'Bulk pricing', 'Made in Dubai', 'UAE delivery']} />
      </div>

      <section className="section faq-section">
        <div className="container faq-wrap">
          <div className="section-head" data-reveal>
            <span className="eyebrow">FAQ</span>
            <h2 className="display">Woven label<br />questions</h2>
            <p className="muted">Can’t find your answer? Message us on WhatsApp and we will reply fast.</p>
          </div>
          <Faq items={FAQS} />
        </div>
      </section>
    </>
  );
}
