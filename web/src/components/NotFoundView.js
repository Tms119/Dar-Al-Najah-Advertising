import Link from 'next/link';
import Mock from './Mock';

export default function NotFoundView() {
  return (
    <div className="nf page-pad">
      <div className="container nf-inner">
        <div className="nf-art" aria-hidden="true">
          <Mock shape="sticker" color="#FF3D7F" />
        </div>
        <span className="eyebrow">Error 404</span>
        <h1 className="display xl">Misprint.</h1>
        <p className="muted">This page doesn&apos;t exist, or the product was moved. Let&apos;s get you back on paper.</p>
        <div className="hero-actions" style={{ justifyContent: 'flex-start', animation: 'none' }}>
          <Link href="/products" className="btn btn-ink">Browse products <span className="btn-arrow">→</span></Link>
          <Link href="/" className="btn btn-ghost">Go home</Link>
        </div>
      </div>
    </div>
  );
}
