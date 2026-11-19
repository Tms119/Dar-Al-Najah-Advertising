'use client';

import { useMemo, useRef, useState } from 'react';
import Mock from '@/components/Mock';
import { waLink } from '@/data/catalog';

/* Demo pricing: tiers scale sub-linearly with quantity; higher option
   indices add a small premium. Real pricing will come from the DB. */
const QTY_MULT = [1, 2.1, 3.8, 6.9, 12];

export default function Configurator({ p }) {
  const groups = Object.entries(p.options);
  const [sel, setSel] = useState(() => Object.fromEntries(groups.map(([k, v]) => [k, v[0]])));
  const [qi, setQi] = useState(0);
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [view, setView] = useState(0);
  const inputRef = useRef(null);

  const price = useMemo(() => {
    const premium = groups.reduce((a, [k, v]) => a + v.indexOf(sel[k]) * 0.08, 0);
    return Math.round(p.price * (QTY_MULT[qi] ?? qi + 1) * (1 + premium));
  }, [sel, qi]); // eslint-disable-line react-hooks/exhaustive-deps

  const summary = `${p.name} — ${groups.map(([k]) => `${k}: ${sel[k]}`).join(', ')}, Qty: ${p.qty[qi]}`;
  const onFile = (f) => f && setFile(f);

  const views = [
    { bg: p.tint, rot: 0 },
    { bg: '#fff', rot: -8 },
    { bg: '#121212', rot: 6 },
  ];

  return (
    <section className="pdp-main">
      <div className="pdp-gallery">
        <div className="pdp-stage" style={{ background: views[view].bg }}>
          {p.badge && <span className="p-badge">{p.badge}</span>}
          <Mock shape={p.shape} color={p.color} className="pdp-mock" title={p.name} key={view} />
          <span className="pdp-note">Illustration — real photos coming via admin panel</span>
        </div>
        <div className="pdp-thumbs">
          {views.map((v, i) => (
            <button key={i} className={`thumb ${view === i ? 'is-active' : ''}`} style={{ background: v.bg }} onClick={() => setView(i)} aria-label={`View ${i + 1}`}>
              <Mock shape={p.shape} color={p.color} />
            </button>
          ))}
        </div>
      </div>

      <div className="pdp-panel">
        <span className="pill pill-solid" style={{ background: p.color }}>{p.group}</span>
        <h1 className="display lg">{p.name}</h1>
        <p className="pdp-desc">{p.desc}</p>

        <div className="pdp-meta">
          <span>⏱ <b>{p.turnaround}</b> turnaround</span>
          <span>✓ <b>Free</b> digital proof</span>
        </div>

        {groups.map(([k, vals]) => (
          <div key={k} className="opt">
            <div className="opt-label">{k} <span>{sel[k]}</span></div>
            <div className="opt-row">
              {vals.map((v) => (
                <button key={v} className={`opt-btn ${sel[k] === v ? 'is-active' : ''}`} onClick={() => setSel({ ...sel, [k]: v })}>{v}</button>
              ))}
            </div>
          </div>
        ))}

        <div className="opt">
          <div className="opt-label">Quantity <span>{p.qty[qi]}</span></div>
          <div className="opt-row">
            {p.qty.map((q, i) => (
              <button key={q} className={`opt-btn ${qi === i ? 'is-active' : ''}`} onClick={() => setQi(i)}>{q}</button>
            ))}
          </div>
        </div>

        <div
          className={`drop ${drag ? 'is-drag' : ''} ${file ? 'has-file' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0]); }}
          role="button"
          tabIndex={0}
        >
          <input ref={inputRef} type="file" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          {file ? (
            <><b>✓ {file.name}</b><span>Click to replace</span></>
          ) : (
            <><b>Upload your artwork</b><span>PDF, AI, PSD, PNG — or skip and we’ll design it</span></>
          )}
        </div>

        <div className="pdp-buy">
          <div className="pdp-price">
            <small>Estimated total</small>
            <b key={price}>AED {price.toLocaleString()}</b>
            <small>excl. VAT · final price on proof</small>
          </div>
          <div className="pdp-btns">
            <a className="btn btn-ink" href={waLink(`Hi! I'd like a quote for: ${summary}. Estimated AED ${price}.`)} target="_blank" rel="noopener noreferrer">
              Get quote on WhatsApp <span className="btn-arrow">↗</span>
            </a>
            <a className="btn btn-ghost" href={`/contact?product=${p.id}`}>Email quote</a>
          </div>
        </div>
      </div>
    </section>
  );
}
