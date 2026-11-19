'use client';

import Link from 'next/link';

export default function SiteError({ reset }) {
  return (
    <div className="nf page-pad">
      <div className="container nf-inner">
        <span className="eyebrow">Something went wrong</span>
        <h1 className="display lg">Paper jam.</h1>
        <p className="muted">We couldn&apos;t load this page. Please try again — or message us on WhatsApp and we&apos;ll help right away.</p>
        <div className="hero-actions" style={{ justifyContent: 'flex-start', animation: 'none' }}>
          <button className="btn btn-ink" onClick={reset}>Try again</button>
          <Link href="/" className="btn btn-ghost">Go home</Link>
        </div>
      </div>
    </div>
  );
}
