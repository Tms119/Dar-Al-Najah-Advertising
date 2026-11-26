import Image from 'next/image';
import Link from 'next/link';

/* Brand lockup for small sizes: the "dh" monogram from the official logo
   (design/brand/daralnajah.svg) + the name set in type. The full stacked logo is
   used where there's room for it (footer). */
export default function Logo({ onClick }) {
  return (
    <Link href="/" className="logo" onClick={onClick} aria-label="Dar Al Najah Advertising · Printing, home">
      <Image src="/brand/mark-144.webp" alt="" width={46} height={43} className="logo-mark" preload />
      <span className="logo-text">
        <b>Dar Al Najah</b>
        <small>Advertising · Printing</small>
      </span>
    </Link>
  );
}
