import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import ScrollText from '@/components/ScrollText';
import Faq from '@/components/Faq';
import Mock from '@/components/Mock';
import { Bestsellers, ProductCount, ServicesStack } from '@/components/HomeLive';

const STEPS = [
  { n: '01', t: 'Pick a product', d: 'Choose from our print, fabric, gift and photo products, or tell us your idea.', shape: 'card', c: '#2B3BFF' },
  { n: '02', t: 'Send your design', d: 'Upload your artwork, or let our own designers create it for you.', shape: 'flyer', c: '#FF3D7F' },
  { n: '03', t: 'Approve the proof', d: 'We send a digital proof. Nothing prints until you say it looks right.', shape: 'sticker', c: '#00A86B' },
  { n: '04', t: 'Print & deliver', d: 'Printed, finished and delivered across the UAE, or collected from our store.', shape: 'box', c: '#FFB800' },
];

const REVIEWS = [
  { q: 'Our roll up banners and 2,000 flyers were ready overnight for GITEX. Colours were spot on.', n: 'Sara M.', r: 'Marketing Lead, Tech startup', c: '#2B3BFF' },
  { q: 'Embroidered caps and polos for the whole team. Stitching quality is honestly better than retail.', n: 'Omar K.', r: 'Operations, F&B group', c: '#FF3D7F' },
  { q: 'Got passport photos in ten minutes and they restored my grandparents’ wedding photo. Magic.', n: 'Priya S.', r: 'Studio customer', c: '#00A86B' },
  { q: 'Corporate welcome kits for 120 new joiners, boxed and delivered. Zero stress on our side.', n: 'James L.', r: 'HR Manager, Logistics', c: '#FFB800' },
];

const FAQS = [
  { q: 'Do you offer same day printing?', a: 'Yes. Business cards, flyers, stickers, mugs and passport photos can be ready the same day when artwork is approved before noon. Larger jobs usually take 24 to 72 hours.' },
  { q: 'Can you design my artwork?', a: 'Absolutely. Our own designers can create logos, layouts and print ready files. Just share your brief and brand assets.' },
  { q: 'What file formats do you accept?', a: 'A print ready PDF is best. We also accept AI, PSD, EPS, high resolution PNG or JPG files and even Canva links, and we check every file before printing.' },
  { q: 'Is there a minimum order quantity?', a: 'Most products start from very small runs, even a single mug or roll up banner. Bulk pricing kicks in automatically as quantity grows.' },
  { q: 'Do you deliver across the UAE?', a: 'Yes, we deliver to Dubai, Abu Dhabi, Sharjah and all emirates. Express delivery is available within Dubai.' },
];

export default function Home() {
  return (
    <>
      <Hero />

      <div className="marquee-wrap">
        <Marquee tilt={-2} items={['Business cards', 'Roll up stands', 'Embroidery', 'Packaging', 'Corporate gifts', 'Stickers', 'Photo studio', 'Signage']} />
      </div>

      {/* About */}
      <section className="section about">
        <div className="container">
          <span className="eyebrow center" data-reveal>A bit about us</span>
          <ScrollText
            text="We’re the print partner Dubai calls when it has to *look *right and *land *on *time. Cards, boxes, banners, embroidery, gifts and photos, all designed, printed and finished under one roof, so you only ever need one number."
            pills={[
              { label: 'Made in our studio', at: 0.25, top: '18%', left: '58%', bg: 'var(--blue)', rot: -6 },
              { label: 'Proof before print', at: 0.45, top: '46%', left: '6%', bg: 'var(--pink)', rot: 5 },
              { label: 'Delivery across the UAE', at: 0.65, top: '74%', left: '64%', bg: 'var(--green)', rot: -4 },
            ]}
          />
        </div>
      </section>

      {/* Services: sticky stacking cards */}
      <section className="section services" id="services">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">What we do</span>
            <h2 className="display">Four studios.<br />One print partner.</h2>
          </div>
          <ServicesStack />
        </div>
      </section>

      <Bestsellers />

      {/* Process */}
      <section className="section process">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">How it works</span>
            <h2 className="display">From idea to<br />in hand in 4 steps</h2>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.n} className="step" data-reveal style={{ '--d': `${i * 90}ms`, '--c': s.c }}>
                <span className="step-n">{s.n}</span>
                <Mock shape={s.shape} color={s.c} className="step-mock" />
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container stats-grid">
          {[
            [<ProductCount key="n" />, 'Products & services'],
            ['Same day', 'Express printing'],
            ['4', 'Studios under one roof'],
            ['7', 'Emirates we deliver to'],
          ].map(([v, l], i) => (
            <div key={l} className="stat" data-reveal style={{ '--d': `${i * 80}ms` }}>
              <b>{v}</b><span>{l}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="marquee-wrap">
        <Marquee variant="blue" reverse tilt={1.5} items={['Good print', 'No funny business', 'Proof before print', 'Made in Dubai', 'Sharp colours', 'On time, every time']} />
      </div>

      {/* Reviews */}
      <section className="section reviews">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">Kind words</span>
            <h2 className="display">People keep<br />coming back</h2>
          </div>
          <div className="review-row">
            {REVIEWS.map((r, i) => (
              <figure key={r.n} className="review" data-reveal style={{ '--d': `${i * 80}ms`, '--c': r.c }}>
                <div className="stars" aria-label="5 stars">★★★★★</div>
                <blockquote>“{r.q}”</blockquote>
                <figcaption>
                  <span className="avatar">{r.n[0]}</span>
                  <span><b>{r.n}</b><small>{r.r}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq-section">
        <div className="container faq-wrap">
          <div className="section-head" data-reveal>
            <span className="eyebrow">FAQ</span>
            <h2 className="display">Good<br />questions</h2>
            <p className="muted">Can’t find your answer? Message us on WhatsApp and we will reply fast.</p>
          </div>
          <Faq items={FAQS} />
        </div>
      </section>
    </>
  );
}
