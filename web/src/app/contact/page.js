import ContactForm from './ContactForm';
import { COMPANY, waLink } from '@/data/catalog';

export const metadata = { title: 'Contact & quote — Dar Al Najah Advertising' };

export default async function ContactPage({ searchParams }) {
  const { product } = await searchParams;
  return (
    <div className="contact page-pad">
      <div className="container contact-grid">
        <div className="contact-left">
          <span className="eyebrow">Contact</span>
          <h1 className="display xl stacked">
            <span>Want</span><span>to start</span><span className="hl">a new</span><span>print?</span>
          </h1>
          <div className="contact-cards">
            <a href={waLink('Hi Dar Al Najah!')} target="_blank" rel="noopener noreferrer" className="c-card" style={{ '--c': '#00A86B' }}>
              <small>WhatsApp</small><b>Chat with us</b><span>↗</span>
            </a>
            <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`} className="c-card" style={{ '--c': '#2B3BFF' }}>
              <small>Call</small><b>{COMPANY.phone}</b><span>↗</span>
            </a>
            <a href={`mailto:${COMPANY.email}`} className="c-card" style={{ '--c': '#FF3D7F' }}>
              <small>Email</small><b>{COMPANY.email}</b><span>↗</span>
            </a>
            <div className="c-card" style={{ '--c': '#FFB800' }}>
              <small>Visit</small><b>{COMPANY.address}</b><span>{COMPANY.hours}</span>
            </div>
          </div>
        </div>
        <ContactForm productId={product} />
      </div>
    </div>
  );
}
