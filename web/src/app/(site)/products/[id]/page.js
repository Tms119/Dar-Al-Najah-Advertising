import { notFound, redirect } from 'next/navigation';
import { fetchQuery, preloadQuery, preloadedQueryResult } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import ProductView from './ProductView';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const r = await fetchQuery(api.catalog.getProduct, { slug: id });
  if (r?.status !== 'ok') return { title: 'Product not found' };
  return {
    title: r.product.name,
    description: r.product.desc.slice(0, 155),
    openGraph: r.product.image ? { images: [r.product.image] } : undefined,
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const preloaded = await preloadQuery(api.catalog.getProduct, { slug: id });
  const result = preloadedQueryResult(preloaded);
  if (!result) notFound();
  // hidden/disabled product → send visitors to its category instead of a dead page
  if (result.status === 'inactive') redirect(result.categorySlug ? `/products?cat=${result.categorySlug}` : '/products');
  return <ProductView preloaded={preloaded} />;
}
