import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { preloadQuery, preloadedQueryResult } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import ProductView from './ProductView';
import { categoryHref } from '@/data/site';
import { JsonLd, breadcrumbSchema, serviceSchema } from '@/lib/structuredData';

// generateMetadata and the page share one Convex request per render
const loadProduct = cache(async (slug) => {
  const preloaded = await preloadQuery(api.catalog.getProduct, { slug });
  return { preloaded, result: preloadedQueryResult(preloaded) };
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { result: r } = await loadProduct(id);
  if (r?.status !== 'ok') return { title: 'Product not found' };
  const p = r.product;
  const full = `${p.desc} ${p.categoryName} in Dubai by Dar Al Najah Advertising.`;
  // search results show about 160 characters: cut at a word, not mid-word
  const description = full.length <= 160 ? full : `${full.slice(0, 157).replace(/\s+\S*$/, '')}…`;
  return {
    title: `${p.name} in Dubai`,
    description,
    alternates: { canonical: `/products/${p.id}` },
    openGraph: { title: `${p.name} | Dar Al Najah Advertising`, description, url: `/products/${p.id}`, ...(p.image && { images: [p.image] }) },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const { preloaded, result } = await loadProduct(id);
  if (!result) notFound();
  // hidden/disabled product → send visitors to its category instead of a dead page
  if (result.status === 'inactive') redirect(result.categorySlug ? `/products?cat=${result.categorySlug}` : '/products');
  const p = result.product;
  return (
    <>
      <JsonLd data={[
        serviceSchema({ name: p.name, description: p.desc, path: `/products/${p.id}`, image: p.image, category: p.categoryName }),
        breadcrumbSchema([['Home', '/'], [p.categoryName, categoryHref(p.category)], [p.name, `/products/${p.id}`]]),
      ]} />
      <ProductView preloaded={preloaded} />
    </>
  );
}
