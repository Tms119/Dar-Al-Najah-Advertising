'use client';

import { useState } from 'react';
import { CATALOG, getProduct } from '@/data/catalog';

export default function ContactForm({ productId }) {
  const pre = getProduct(productId || '');
  const [cats, setCats] = useState(pre ? [pre.category] : []);
  const [sent, setSent] = useState(false);

  const toggle = (id) => setCats(cats.includes(id) ? cats.filter((c) => c !== id) : [...cats, id]);

  if (sent) {
    return (
      <div className="form-card sent">
        <span className="sent-ic">✓</span>
        <h2 className="display sm">Thanks — we&apos;re on it!</h2>
        <p className="muted">Demo mode: nothing was sent. Once the backend is connected, this form will email the team and save the lead.</p>
        <button className="btn btn-ghost" onClick={() => setSent(false)}>Send another</button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
      <h2>Tell us what you need</h2>
      <div className="field-label">I&apos;m interested in</div>
      <div className="opt-row">
        {CATALOG.map((c) => (
          <button type="button" key={c.id} className={`opt-btn ${cats.includes(c.id) ? 'is-active' : ''}`} onClick={() => toggle(c.id)}>
            <i className="dot" style={{ background: c.color }} />{c.short}
          </button>
        ))}
      </div>
      <div className="field-row">
        <label className="field"><span>Name</span><input required placeholder="Your name" /></label>
        <label className="field"><span>Company</span><input placeholder="Optional" /></label>
      </div>
      <div className="field-row">
        <label className="field"><span>Email</span><input type="email" required placeholder="you@company.com" /></label>
        <label className="field"><span>Phone</span><input type="tel" placeholder="+971" /></label>
      </div>
      <label className="field">
        <span>Project details</span>
        <textarea rows={5} defaultValue={pre ? `I'd like a quote for ${pre.name}. ` : ''} placeholder="Product, quantity, size, deadline…" />
      </label>
      <button className="btn btn-ink btn-block" type="submit">Send request <span className="btn-arrow">→</span></button>
    </form>
  );
}
