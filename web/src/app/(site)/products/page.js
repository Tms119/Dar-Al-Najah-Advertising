import Catalog from './Catalog';

export const metadata = { title: 'All products', description: 'Business cards, flyers, banners, packaging, embroidery, gifts and photo services — browse the full catalogue.' };

export default async function ProductsPage({ searchParams }) {
  const { cat } = await searchParams;
  return <Catalog key={cat || 'all'} initialCat={cat || 'all'} />;
}
