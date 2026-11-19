import { fetchQuery } from 'convex/nextjs';
import { api } from '@convex/_generated/api';

export const revalidate = 3600;

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { categories, products } = await fetchQuery(api.catalog.getCatalog, {});
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/products`, priority: 0.9 },
    { url: `${base}/contact`, priority: 0.6 },
    ...categories.map((c) => ({ url: `${base}/products?cat=${c.id}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/products/${p.id}`, priority: 0.7 })),
  ];
}
