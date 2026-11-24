'use client';

import Image from 'next/image';
import { useState } from 'react';
import Mock from '@/components/Mock';
import { WhatsAppIcon } from '@/components/icons';
import { COMPANY, waLink } from '@/data/site';

const PERKS = [
  { title: 'High-quality print', text: 'Bright, durable prints that make your brand stand out.', path: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z' },
  { title: 'Fast turnaround', text: `Urgent jobs ready same or next day. Open ${COMPANY.hours}.`, path: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
  { title: 'Made for your brand', text: 'We suggest the right material and finish for the job.', path: 'M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10zM13.5 7.5l3 3' },
];

const STEPS = [
  ['Send your idea', 'Share your design, logo or just an idea on WhatsApp.'],
  ['Get a quote and proof', 'We reply with options, a price and a proof to approve.'],
  ['Pick up or delivery', 'Collect from our Deira shop or get it delivered.'],
];

/* Product photos (or illustrations) with the name and description.
   No prices online: customers ask on WhatsApp and get a tailored quote. */
export default function ProductDetails({ p }) {
  const [view, setView] = useState(0);

  // real photos when uploaded, otherwise illustrated views
  const views = p.images.length
    ? p.images.map((url) => ({ url }))
    : [{ bg: p.tint }, { bg: '#fff' }, { bg: '#121212' }];
  const cur = views[Math.min(view, views.length - 1)];

  return (
    <section className="pdp-main">
      <div className="pdp-gallery">
        <div className="pdp-stage" style={{ background: cur.url ? '#fff' : cur.bg }}>
          {p.badge && <span className="p-badge">{p.badge}</span>}
          {cur.url ? (
            <Image src={cur.url} alt={p.name} fill priority sizes="(max-width: 980px) 100vw, 50vw" className="pdp-photo" key={cur.url} />
          ) : (
            <>
              <Mock shape={p.shape} color={p.color} className="pdp-mock" title={p.name} key={view} />
              <span className="pdp-note">Illustration. Product photos coming soon</span>
            </>
          )}
        </div>
        {views.length > 1 && (
          <div className="pdp-thumbs">
            {views.map((v, i) => (
              <button key={i} className={`thumb ${view === i ? 'is-active' : ''}`} style={{ background: v.url ? '#fff' : v.bg }} onClick={() => setView(i)} aria-label={`View ${i + 1}`}>
                {v.url ? <Image src={v.url} alt="" fill sizes="160px" className="thumb-photo" /> : <Mock shape={p.shape} color={p.color} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pdp-panel">
        <span className="pill pill-solid" style={{ background: p.color }}>{p.group}</span>
        <h1 className="display lg">{p.name}</h1>
        <p className="pdp-desc">{p.desc}</p>

        <div className="pdp-ask">
          <p>Tell us what you need: size, quantity, finish and deadline. We reply fast with options and a quote.</p>
          <a className="btn btn-ink btn-wa" href={waLink(`Hi Dar Al Najah! I'm interested in ${p.name}.`)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={18} /> Ask on WhatsApp
          </a>
        </div>

        <ul className="pdp-perks">
          {PERKS.map((k) => (
            <li key={k.title}>
              <span className="pdp-perk-ic" style={{ color: p.color, background: `color-mix(in srgb, ${p.color} 12%, #fff)` }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={k.path} /></svg>
              </span>
              <div><strong>{k.title}</strong><p>{k.text}</p></div>
            </li>
          ))}
        </ul>

        <div className="pdp-how" style={{ '--c': p.color }}>
          <h2>How it works</h2>
          <ol>
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <span className="pdp-step">{i + 1}</span>
                <div>
                  <strong>{t}</strong>
                  <p>{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
