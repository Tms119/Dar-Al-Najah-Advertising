import { fetchQuery } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import { SITE_URL as base } from '@/data/site';

export const revalidate = 3600;

export default async function sitemap() {
  const { categories, products } = await fetchQuery(api.catalog.getCatalog, {});
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/products`, priority: 0.9 },
    { url: `${base}/woven-labels`, priority: 0.9 },
    { url: `${base}/exhibitions`, priority: 0.8 },
    { url: `${base}/contact`, priority: 0.6 },
    ...categories.map((c) => ({ url: `${base}/products?cat=${c.id}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/products/${p.id}`, priority: 0.7 })),
  ];
}
