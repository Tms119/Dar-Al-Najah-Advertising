import Image from 'next/image';
import Link from 'next/link';
import Mock from './Mock';

export default function ProductCard({ p, i = 0 }) {
  return (
    <Link href={`/products/${p.id}`} className="p-card" data-reveal style={{ '--d': `${(i % 4) * 70}ms`, '--c': p.color, '--t': p.tint }}>
      <div className={`p-card-media ${p.image ? 'has-photo' : ''}`}>
        {p.badge && <span className="p-badge">{p.badge}</span>}
        <span className="p-time">⏱ {p.turnaround}</span>
        {p.image ? (
          <Image src={p.image} alt={p.name} fill sizes="(max-width: 760px) 50vw, (max-width: 1180px) 33vw, 25vw" className="p-photo" />
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
