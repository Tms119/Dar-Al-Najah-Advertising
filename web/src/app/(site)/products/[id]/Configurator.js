'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Mock from '@/components/Mock';
import { waLink } from '@/data/site';

/* Price = chosen quantity tier × (1 + sum of selected options' % modifiers).
   Tiers and modifiers are managed per product in the admin dashboard. */
export default function Configurator({ p }) {
  const [sel, setSel] = useState(() => Object.fromEntries(p.options.map((o) => [o.name, o.values[0]?.label])));
  const [qi, setQi] = useState(0);
  const [view, setView] = useState(0);

  const tier = p.tiers[qi] ?? p.tiers[0];
  const price = useMemo(() => {
    const pct = p.options.reduce((a, o) => a + (o.values.find((v) => v.label === sel[o.name])?.priceModifier ?? 0), 0);
    return Math.round((tier?.price ?? p.price) * (1 + pct / 100));
  }, [p, sel, tier]);

  const summary = [...p.options.map((o) => `${o.name}: ${sel[o.name]}`), `Qty: ${tier?.quantity ?? 1}`].join(', ');

  // real photos when uploaded, otherwise illustrated views
  const views = p.images.length
    ? p.images.map((url) => ({ url }))
    : [{ bg: p.tint }, { bg: '#fff' }, { bg: '#121212' }];
  const cur = views[Math.min(view, views.length - 1)];

  const quoteHref = `/contact?product=${encodeURIComponent(p.id)}&details=${encodeURIComponent(summary)}&estimate=${price}`;

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
                {v.url ? (
                  <Image src={v.url} alt="" fill sizes="160px" className="thumb-photo" />
                ) : (
                  <Mock shape={p.shape} color={p.color} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pdp-panel">
        <span className="pill pill-solid" style={{ background: p.color }}>{p.group}</span>
        <h1 className="display lg">{p.name}</h1>
        <p className="pdp-desc">{p.desc}</p>

        <div className="pdp-meta">
          <span>⏱ <b>{p.turnaround}</b> turnaround</span>
          <span>✓ <b>Free</b> digital proof</span>
        </div>

        {p.options.map((o) => (
          <div key={o.name} className="opt">
            <div className="opt-label">{o.name} <span>{sel[o.name]}</span></div>
            <div className="opt-row">
              {o.values.map((v) => (
                <button key={v.label} className={`opt-btn ${sel[o.name] === v.label ? 'is-active' : ''}`} onClick={() => setSel({ ...sel, [o.name]: v.label })}>{v.label}</button>
              ))}
            </div>
          </div>
        ))}

        {p.tiers.length > 0 && (
          <div className="opt">
            <div className="opt-label">Quantity <span>{tier.quantity}</span></div>
            <div className="opt-row">
              {p.tiers.map((t, i) => (
                <button key={t.quantity} className={`opt-btn ${qi === i ? 'is-active' : ''}`} onClick={() => setQi(i)}>{t.quantity}</button>
              ))}
            </div>
          </div>
        )}

        <p className="pdp-artwork">Have artwork ready? Send it on WhatsApp after you request a quote, or let our designers create it.</p>

        <div className="pdp-buy">
          <div className="pdp-price">
            <small>Estimated total</small>
            <b key={price}>AED {price.toLocaleString()}</b>
            <small>excl. VAT · final price on proof</small>
          </div>
          <div className="pdp-btns">
            <Link className="btn btn-ink" href={quoteHref}>
              Request a quote <span className="btn-arrow">→</span>
            </Link>
            <a className="btn btn-ghost" href={waLink(`Hi! I'd like a quote for ${p.name}: ${summary}. Estimated AED ${price}.`)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
