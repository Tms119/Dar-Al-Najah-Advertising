const DOTS = ['var(--cyan)', 'var(--pink)', 'var(--yellow)', 'var(--ink)'];

export default function Marquee({ items, variant = 'ink', reverse = false, tilt = 0 }) {
  const row = (
    <div className="marquee-row" aria-hidden="true">
      {items.map((t, i) => (
        <span key={i} className="marquee-item">
          {t}
          <i className="marquee-dot" style={{ background: DOTS[i % 4] }} />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee marquee-${variant} ${reverse ? 'is-reverse' : ''}`} style={{ transform: `rotate(${tilt}deg)` }}>
      <span className="sr-only">{items.join(', ')}</span>
      <div className="marquee-track">{row}{row}</div>
    </div>
  );
}
