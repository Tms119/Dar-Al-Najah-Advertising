import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import ScrollText from '@/components/ScrollText';
import Faq from '@/components/Faq';
import Mock from '@/components/Mock';
import { Bestsellers, CategoryCount, ProductCount, ServicesStack } from '@/components/HomeLive';
import { JsonLd, faqSchema } from '@/lib/structuredData';

const STEPS = [
  { n: '01', t: 'Pick a product', d: 'Choose from our print, fabric, gift and photo products, or tell us your idea.', shape: 'card', c: '#2B3BFF' },
  { n: '02', t: 'Send your design', d: 'Upload your artwork, or let our own designers create it for you.', shape: 'flyer', c: '#FF3D7F' },
  { n: '03', t: 'Approve the proof', d: 'We send a digital proof. Nothing prints until you say it looks right.', shape: 'sticker', c: '#00A86B' },
  { n: '04', t: 'Print & deliver', d: 'Printed, finished and delivered across the UAE, or collected from our store.', shape: 'box', c: '#FFB800' },
];

/* Real reviews from the shop's Google Maps listing (names shortened). */
const GOOGLE_REVIEWS_URL = 'https://maps.app.goo.gl/ikETVeX5wNrtRhAb9';
const REVIEWS = [
  { q: 'Amazing work on our signage and display materials! Everything looks sharp, durable, and well-crafted. Dar Al Najah Advertising made our brand stand out effortlessly.', n: 'Md A.', c: '#2B3BFF' },
  { q: "Consistently great service every single time. Whether it's signage, promotional items, or urgent printing, Dar Al Najah Advertising always delivers beyond expectations.", n: 'Mostafa M.', c: '#FF3D7F' },
  { q: 'Everything from initial inquiry to final handover was effortless. Great quality, honest pricing, and five-star customer service all around!', n: 'Md R.', c: '#00A86B' },
  { q: 'Exceeded my expectations from start to finish. Clear communication, great attention to detail, and impressive results. I will definitely work with them again.', n: 'Salman S.', c: '#FFB800' },
];

/* The shop's service list (from its flyer), each linked to the matching
   product or category. */
const SERVICES = [
  { label: 'Offset Printing', href: '/products/offset-printing' },
  { label: 'Digital Printing', href: '/products/digital-printing' },
  { label: 'Screen Printing', href: '/products/screen-printing' },
  { label: 'Business Cards', href: '/products/business-cards' },
  { label: 'Invoice Books', href: '/products/invoice-book' },
  { label: 'T-Shirt, Cap & Pen Printing', href: '/products/t-shirt-printing' },
  { label: 'Diary & Calendar', href: '/products/diary' },
  { label: 'Promotional Gifts', href: '/products?cat=gifts' },
  { label: 'Letterhead', href: '/products/letterhead' },
  { label: 'Catalogues', href: '/products/catalog' },
  { label: 'Flyers & Brochures', href: '/products/brochures' },
  { label: 'Box Making', href: '/products/box' },
  { label: 'Shopping Bags', href: '/products/paper-bag' },
  { label: 'Embroidery Labels', href: '/woven-labels' },
  { label: 'Stickers & Logos', href: '/products?cat=stickers' },
  { label: 'Sign Boards', href: '/products/sign-board' },
  { label: 'LED & Letter Signs', href: '/products/led-sign-board' },
  { label: 'Posters & Stickers', href: '/products/poster' },
  { label: 'Roll-up Stands', href: '/products/roll-up-stands' },
  { label: 'Pop-up Stands', href: '/products/pop-up-stands' },
  { label: 'Exhibition Stands', href: '/exhibitions' },
  { label: 'Banner, Sticker & Flex', href: '/products/flex-banner-printing' },
];

const FAQS = [
  { q: 'Do you offer same day printing?', a: 'Yes. Business cards, flyers, stickers and mugs can be ready the same day when artwork is approved before noon. Larger jobs usually take 24 to 72 hours.' },
  { q: 'Can you design my artwork?', a: 'Absolutely. Our own designers can create logos, layouts and print ready files. Just share your brief and brand assets.' },
  { q: 'What file formats do you accept?', a: 'A print ready PDF is best. We also accept AI, PSD, EPS, high resolution PNG or JPG files and even Canva links, and we check every file before printing.' },
  { q: 'Is there a minimum order quantity?', a: 'Most products start from very small runs, even a single mug or roll up banner. Bulk pricing kicks in automatically as quantity grows.' },
  { q: 'Do you deliver across the UAE?', a: 'Yes, we deliver to Dubai, Abu Dhabi, Sharjah and all emirates. Express delivery is available within Dubai.' },
];

export const metadata = { alternates: { canonical: '/' } };

export default function Home() {
  return (
    <>
      <JsonLd data={faqSchema(FAQS)} />
      <Hero />

      <div className="marquee-wrap">
        <Marquee tilt={-2} items={SERVICES} />
      </div>

      {/* About */}
      <section className="section about">
        <div className="container">
          <span className="eyebrow center" data-reveal>A bit about us</span>
          <ScrollText
            text="We’re the print partner Dubai calls when it has to *look *right and *land *on *time. Cards, boxes, banners, embroidery, gifts and stickers, all designed, printed and finished under one roof, so you only ever need one number."
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
            <h2 className="display">Everything you print.<br />One partner.</h2>
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
            [<CategoryCount key="c" />, 'Product ranges under one roof'],
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
                  <span><b>{r.n}</b><small>Google review</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="reviews-more" data-reveal>
            <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Read all reviews on Google <span className="btn-arrow">↗</span>
            </a>
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
