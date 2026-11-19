import Catalog from './Catalog';

export const metadata = { title: 'All products — Dar Al Najah Advertising' };

export default async function ProductsPage({ searchParams }) {
  const { cat } = await searchParams;
  return <Catalog key={cat || 'all'} initialCat={cat || 'all'} />;
}
