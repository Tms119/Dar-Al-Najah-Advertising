import Link from 'next/link';
import { notFound } from 'next/navigation';
import Configurator from './Configurator';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS, getProduct } from '@/data/catalog';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = getProduct(id);
  return { title: p ? `${p.name} — Dar Al Najah Advertising` : 'Product not found' };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();

  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id)
    .sort((a, b) => (b.group === p.group) - (a.group === p.group) || b.featured - a.featured)
    .slice(0, 4);

  return (
    <div className="pdp page-pad">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span>
          <Link href={`/products?cat=${p.category}`}>{p.categoryName}</Link><span>/</span>
          <span>{p.name}</span>
        </nav>

        <Configurator p={p} />

        <section className="pdp-info">
          {[
            ['Free proof', 'We send a digital proof before anything is printed.', '✓'],
            ['Design help', 'No artwork? Our designers can create it for you.', '✎'],
            ['UAE delivery', 'Express in Dubai, and delivery to every emirate.', '→'],
          ].map(([t, d, ic], i) => (
            <div key={t} className="info-card" data-reveal style={{ '--d': `${i * 80}ms` }}>
              <span className="info-ic">{ic}</span>
              <h4>{t}</h4>
              <p>{d}</p>
            </div>
          ))}
        </section>

        {related.length > 0 && (
          <section className="related">
            <div className="section-head split" data-reveal>
              <h2 className="display sm">You might also need</h2>
              <Link href={`/products?cat=${p.category}`} className="btn btn-ghost btn-sm">View all <span className="btn-arrow">→</span></Link>
            </div>
            <div className="p-grid">
              {related.map((r, i) => <ProductCard key={r.id} p={r} i={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
