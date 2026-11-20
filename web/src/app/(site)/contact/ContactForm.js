'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';
import { api } from '@convex/_generated/api';
import { useCatalog } from '@/components/CatalogProvider';

export default function ContactForm({ pre }) {
  const { categories } = useCatalog();
  const submit = useMutation(api.quotes.submit);
  const [cats, setCats] = useState(pre ? [pre.category] : []);
  const [state, setState] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState(null);

  const toggle = (id) => setCats(cats.includes(id) ? cats.filter((c) => c !== id) : [...cats, id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // honeypot: real people never fill this hidden field
    if (f.get('website')) { setState('sent'); return; }
    setError(null);
    setState('sending');
    try {
      await submit({
        name: String(f.get('name') || ''),
        company: String(f.get('company') || ''),
        email: String(f.get('email') || ''),
        phone: String(f.get('phone') || ''),
        message: String(f.get('message') || ''),
        interests: cats,
        productSlug: pre?.slug ?? null,
        details: pre?.details ?? null,
        estimate: pre?.estimate ?? null,
      });
      setState('sent');
    } catch (err) {
      setState('idle');
      setError(err instanceof ConvexError ? String(err.data) : 'Something went wrong. Please try WhatsApp instead.');
    }
  };

  if (state === 'sent') {
    return (
      <div className="form-card sent">
        <span className="sent-ic">✓</span>
        <h2 className="display sm">Thanks, we&apos;re on it!</h2>
        <p className="muted">We&apos;ve received your request and will reply with a quote shortly, usually within a few working hours.</p>
        <button className="btn btn-ghost" onClick={() => setState('idle')}>Send another</button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <h2>Tell us what you need</h2>
      {pre && (
        <div className="pre-product">
          <b>{pre.name}</b>
          {pre.details && <span>{pre.details}</span>}
          {pre.estimate !== null && <span>Estimate: AED {pre.estimate.toLocaleString()}</span>}
        </div>
      )}
      <div className="field-label">I&apos;m interested in</div>
      <div className="opt-row">
        {categories.map((c) => (
          <button type="button" key={c.id} className={`opt-btn ${cats.includes(c.id) ? 'is-active' : ''}`} onClick={() => toggle(c.id)} aria-pressed={cats.includes(c.id)}>
            <i className="dot" style={{ background: c.color }} />{c.short}
          </button>
        ))}
      </div>
      <div className="field-row">
        <label className="field"><span>Name</span><input name="name" required maxLength={100} placeholder="Your name" autoComplete="name" /></label>
        <label className="field"><span>Company</span><input name="company" maxLength={120} placeholder="Optional" autoComplete="organization" /></label>
      </div>
      <div className="field-row">
        <label className="field"><span>Email</span><input name="email" type="email" required maxLength={200} placeholder="you@company.com" autoComplete="email" /></label>
        <label className="field"><span>Phone</span><input name="phone" type="tel" maxLength={40} placeholder="+971" autoComplete="tel" /></label>
      </div>
      <label className="field">
        <span>Project details</span>
        <textarea name="message" rows={5} maxLength={3000} defaultValue={pre ? `I'd like a quote for ${pre.name}. ` : ''} placeholder="Product, quantity, size, deadline…" />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-ink btn-block" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : <>Send request <span className="btn-arrow">→</span></>}
      </button>
    </form>
  );
}
