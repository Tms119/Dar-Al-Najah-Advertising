import { fetchQuery } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import Catalog from './Catalog';

const ALL = {
  title: 'All products',
  description: 'Business cards, flyers, banners, packaging, embroidery, gifts, stickers and woven labels in Dubai. Browse the full catalogue and ask for a quote on WhatsApp.',
};

/* ?cat=printing etc. gets its own title and description, so each category
   reads as its own page in search results. */
export async function generateMetadata({ searchParams }) {
  const { cat } = await searchParams;
  if (!cat) return { ...ALL, alternates: { canonical: '/products' } };
  const { categories } = await fetchQuery(api.catalog.getCatalog, {});
  const c = categories.find((x) => x.id === cat);
  if (!c) return { ...ALL, alternates: { canonical: '/products' } };
  return {
    title: `${c.name} in Dubai`,
    description: `${c.tagline} Browse ${c.count} ${c.name.toLowerCase()} products from Dar Al Najah Advertising in Deira, Dubai.`.slice(0, 200),
    alternates: { canonical: `/products?cat=${c.id}` },
  };
}

export default async function ProductsPage({ searchParams }) {
  const { cat } = await searchParams;
  return <Catalog key={cat || 'all'} initialCat={cat || 'all'} />;
}
