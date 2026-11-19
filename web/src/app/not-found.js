import Link from 'next/link';
import NotFoundView from '@/components/NotFoundView';

export const metadata = { title: 'Page not found', robots: { index: false } };

// URLs that match no route at all (outside the site layout)
export default function NotFound() {
  return (
    <>
      <header className="nf-bar container"><Link href="/" className="btn btn-ghost btn-sm">← Dar Al Najah</Link></header>
      <NotFoundView />
    </>
  );
}
