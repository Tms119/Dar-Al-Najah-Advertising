import Link from 'next/link';

export default function Logo({ onClick }) {
  return (
    <Link href="/" className="logo" onClick={onClick} aria-label="Dar Al Najah Advertising — home">
      <span className="logo-dots" aria-hidden="true">
        <i style={{ background: 'var(--cyan)' }} />
        <i style={{ background: 'var(--pink)' }} />
        <i style={{ background: 'var(--yellow)' }} />
        <i style={{ background: 'var(--ink)' }} />
      </span>
      <span className="logo-text">
        <b>Dar Al Najah</b>
        <small>Advertising · Printing</small>
      </span>
    </Link>
  );
}
