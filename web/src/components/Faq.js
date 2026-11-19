'use client';

import { useState } from 'react';

export default function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {items.map((it, i) => (
        <div key={it.q} className={`faq-item ${open === i ? 'is-open' : ''}`} data-reveal style={{ '--d': `${i * 60}ms` }}>
          <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            <span className="faq-n">{String(i + 1).padStart(2, '0')}</span>
            <span className="faq-q">{it.q}</span>
            <span className="faq-icon" aria-hidden="true" />
          </button>
          <div className="faq-a"><div><p>{it.a}</p></div></div>
        </div>
      ))}
    </div>
  );
}
