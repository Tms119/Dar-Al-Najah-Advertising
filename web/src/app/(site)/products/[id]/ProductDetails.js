'use client';

import Image from 'next/image';
import { useState } from 'react';
import Mock from '@/components/Mock';
import { WhatsAppIcon } from '@/components/icons';
import { waLink } from '@/data/site';

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
      </div>
    </section>
  );
}
