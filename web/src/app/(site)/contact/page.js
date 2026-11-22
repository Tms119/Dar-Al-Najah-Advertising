import { COMPANY, telHref, waLink } from '@/data/site';
import { WhatsAppIcon } from '@/components/icons';

export const metadata = { title: 'Contact', description: 'Talk to Dar Al Najah Advertising in Dubai on WhatsApp, by phone or email, or visit our studio.' };

export default function ContactPage() {
  return (
    <div className="contact page-pad">
      <div className="container contact-grid">
        <div className="contact-left">
          <span className="eyebrow">Contact</span>
          <h1 className="display xl stacked">
            <span>Want</span><span>to start</span><span className="hl">a new</span><span>print?</span>
          </h1>
          <div className="contact-cards">
            <a href={telHref} className="c-card" style={{ '--c': '#2B3BFF' }}>
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

        <div className="form-card contact-wa">
          <span className="sent-ic"><WhatsAppIcon size={30} /></span>
          <h2 className="display sm">Message us on WhatsApp</h2>
          <p className="muted">Send us the product, quantity, size and deadline, and your artwork if you have it. We usually reply within minutes during opening hours.</p>
          <a className="btn btn-ink btn-block btn-wa" href={waLink('Hi Dar Al Najah! I would like to discuss a print job.')} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={18} /> Chat on WhatsApp
          </a>
          <small className="muted">{COMPANY.hours}</small>
        </div>
      </div>
    </div>
  );
}
