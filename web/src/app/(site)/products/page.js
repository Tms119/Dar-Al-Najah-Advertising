import Catalog from './Catalog';

export const metadata = { title: 'All products', description: 'Business cards, flyers, banners, packaging, embroidery, gifts, stickers and woven labels. Browse the full catalogue.' };

export default async function ProductsPage({ searchParams }) {
  const { cat } = await searchParams;
  return <Catalog key={cat || 'all'} initialCat={cat || 'all'} />;
}
