'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

const STATUSES = ['new', 'quoted', 'won', 'lost'];

export default function AdminQuotes() {
  const [filter, setFilter] = useState(null);
  const quotes = useQuery(api.admin.listQuotes, { status: filter });
  const setStatus = useMutation(api.admin.setQuoteStatus);
  const remove = useMutation(api.admin.deleteQuote);

  return (
    <>
      <header className="a-head">
        <div>
          <h1>Quote requests</h1>
          <p className="a-muted">Submitted from the website&apos;s contact and product pages.</p>
        </div>
      </header>

      <div className="a-tabs">
        {[null, ...STATUSES].map((s) => (
          <button key={s ?? 'all'} className={`a-tab ${filter === s ? 'is-active' : ''}`} onClick={() => setFilter(s)}>{s ?? 'all'}</button>
        ))}
      </div>

      {quotes === undefined ? <p className="a-muted">Loading…</p> : quotes.length === 0 ? (
        <div className="a-card"><p className="a-muted">Nothing here yet.</p></div>
      ) : (
        <div className="a-quotes">
          {quotes.map((q) => {
            const phone = q.phone.replace(/[^\d]/g, '');
            return (
              <article key={q._id} className={`a-card a-quote st-${q.status}`}>
                <div className="a-quote-head">
                  <div>
                    <h3>{q.name}{q.company && <span className="a-muted"> · {q.company}</span>}</h3>
                    <time className="a-muted a-small">{new Date(q._creationTime).toLocaleString()}</time>
                  </div>
                  <select className="a-input a-status" value={q.status} onChange={(e) => setStatus({ id: q._id, status: e.target.value })} aria-label="Status">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {(q.productSlug || q.details) && (
                  <p className="a-quote-product">
                    {q.productSlug && <a href={`/products/${q.productSlug}`} target="_blank" rel="noreferrer"><b>{q.productSlug}</b></a>}
                    {q.details && <span>: {q.details}</span>}
                    {q.estimate !== null && <span className="a-muted"> · est. AED {q.estimate.toLocaleString()}</span>}
                  </p>
                )}
                {q.interests.length > 0 && <p className="a-small">Interested in: {q.interests.join(', ')}</p>}
                {q.message && <p className="a-quote-msg">{q.message}</p>}
                <div className="a-actions">
                  <a className="a-btn a-btn-sm" href={`mailto:${q.email}?subject=${encodeURIComponent('Your quote from Dar Al Najah')}`}>✉ {q.email}</a>
                  {phone && <a className="a-btn a-btn-sm" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">WhatsApp {q.phone}</a>}
                  <button className="a-btn a-btn-sm a-btn-danger" onClick={() => window.confirm('Delete this request permanently?') && remove({ id: q._id })}>Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
