import Link from 'next/link';

const DOTS = ['var(--cyan)', 'var(--pink)', 'var(--yellow)', 'var(--ink)'];

/* Scrolling strip. Items are text, or { label, href } to make them links.
   The row is repeated for a seamless loop: the copy is hidden from screen
   readers and from keyboard tabbing, so each link is announced once.
   --dur grows with the list so long lists scroll at the same speed. */
export default function Marquee({ items, variant = 'ink', reverse = false, tilt = 0 }) {
  const row = (copy) => (
    <div className="marquee-row" aria-hidden={copy || undefined}>
      {items.map((t, i) => {
        const label = typeof t === 'string' ? t : t.label;
        const href = typeof t === 'string' ? null : t.href;
        return (
          <span key={i} className="marquee-item">
            {href ? <Link href={href} className="marquee-link" tabIndex={copy ? -1 : undefined}>{label}</Link> : label}
            <i className="marquee-dot" style={{ background: DOTS[i % 4] }} />
          </span>
        );
      })}
    </div>
  );
  return (
    <div className={`marquee marquee-${variant} ${reverse ? 'is-reverse' : ''}`} style={{ transform: `rotate(${tilt}deg)`, '--dur': `${Math.max(32, items.length * 4)}s` }}>
      <div className="marquee-track">{row(false)}{row(true)}</div>
    </div>
  );
}
