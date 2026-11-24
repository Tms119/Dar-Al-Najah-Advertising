import { preloadQuery } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import { CatalogProvider } from '@/components/CatalogProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import WhatsAppFab from '@/components/WhatsAppFab';
import PerfObserver from '@/components/PerfObserver';
import { COMPANY, SITE_URL, SOCIALS } from '@/data/site';

// structured data so search engines show the business card (name, phone, hours)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: COMPANY.full,
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  telephone: COMPANY.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shop No. 10, Nakheel Plaza',
    addressLocality: 'Deira, Dubai',
    addressRegion: 'Dubai',
    addressCountry: 'AE',
  },
  areaServed: 'United Arab Emirates',
  sameAs: SOCIALS.map((s) => s.url),
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    opens: '09:00',
    closes: '22:00',
  }],
};

export default async function SiteLayout({ children }) {
  const preloaded = await preloadQuery(api.catalog.getCatalog, {});
  return (
    <CatalogProvider preloaded={preloaded}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFab />
      <RevealObserver />
      <PerfObserver />
    </CatalogProvider>
  );
}
