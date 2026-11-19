import Link from 'next/link';
import Mock from './Mock';

export default function ProductCard({ p, i = 0 }) {
  return (
    <Link href={`/products/${p.id}`} className="p-card" data-reveal style={{ '--d': `${(i % 4) * 70}ms`, '--c': p.color, '--t': p.tint }}>
      <div className={`p-card-media ${p.image ? 'has-photo' : ''}`}>
        {p.badge && <span className="p-badge">{p.badge}</span>}
        <span className="p-time">⏱ {p.turnaround}</span>
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.name} className="p-photo" loading="lazy" />
        ) : (
          <Mock shape={p.shape} color={p.color} className="p-mock" title={p.name} />
        )}
        <span className="p-cta">Customise <b>↗</b></span>
      </div>
      <div className="p-card-body">
        <div>
          <h3>{p.name}</h3>
          <span className="p-cat">{p.group}</span>
        </div>
        <div className="p-price">
          <small>from</small>
          <b>AED {p.price}</b>
        </div>
      </div>
    </Link>
  );
}
