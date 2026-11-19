'use client';

import Link from 'next/link';

export default function AdminError({ error, reset }) {
  return (
    <div className="a-card">
      <h2>Something went wrong</h2>
      <p className="a-muted">{error?.message?.includes('Not authorized') ? 'Your account does not have admin access.' : 'This page could not be loaded.'}</p>
      <div className="a-actions">
        <button className="a-btn" onClick={reset}>Try again</button>
        <Link className="a-btn" href="/admin">Back to overview</Link>
      </div>
    </div>
  );
}
