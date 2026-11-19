import { fetchQuery } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import ContactForm from './ContactForm';
import { COMPANY, waLink } from '@/data/site';

export const metadata = { title: 'Contact & quote', description: 'Request a printing quote from Dar Al Najah Advertising in Dubai — we reply fast on WhatsApp and email.' };

export default async function ContactPage({ searchParams }) {
  const { product, details, estimate } = await searchParams;
  const r = typeof product === 'string' ? await fetchQuery(api.catalog.getProduct, { slug: product }) : null;
  const pre = r?.status === 'ok'
    ? {
        slug: r.product.id,
        name: r.product.name,
        category: r.product.category,
        details: typeof details === 'string' ? details.slice(0, 500) : null,
        estimate: Number.isFinite(Number(estimate)) ? Number(estimate) : null,
      }
    : null;
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
        <ContactForm pre={pre} />
      </div>
    </div>
  );
}
