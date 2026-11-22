import '../admin/admin.css';
import './studio.css';

export const metadata = {
  title: { absolute: 'Mockup Studio | Dar Al Najah' },
  description: 'See your logo on real products before you print. By invitation from Dar Al Najah Advertising.',
  robots: { index: false, follow: false },
};

/* The Mockup Studio is a standalone site: none of the shop's header, footer
   or menus. It can also be served from its own subdomain (see next.config). */
export default function StudioLayout({ children }) {
  return <div className="st-app">{children}</div>;
}
