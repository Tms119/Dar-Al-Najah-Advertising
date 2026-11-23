import '../../admin/admin.css';
import './studio.css';

export const metadata = {
  title: 'Mockup Studio',
  description: 'See your logo on real products before you print. By invitation from Dar Al Najah Advertising.',
  robots: { index: false, follow: false },
};

/* The Mockup Studio sits inside the main site (menu, footer, WhatsApp button)
   but is invite only: it asks for an access code before anything else. */
export default function StudioLayout({ children }) {
  return children;
}
