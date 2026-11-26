import { COMPANY, SITE_URL, SOCIALS, categoryHref } from '@/data/site';

/* schema.org structured data. Search engines use it for rich results and AI
   answer engines use it to understand who the business is and what it
   offers. Every page refers back to the one business node by its @id. */

export const BUSINESS_ID = `${SITE_URL}/#business`;

/** <script type="application/ld+json"> for one or more schema objects. */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/** The business itself, with its catalogue of services by category. */
export function businessSchema(categories = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': BUSINESS_ID,
    name: COMPANY.full,
    alternateName: COMPANY.name,
    description: 'Printing and advertising shop in Deira, Dubai: commercial printing, fabric printing and embroidery, customised corporate gifts, woven labels, stickers and graphics, and exhibition stands.',
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-1200.png`,
    image: `${SITE_URL}/opengraph-image`,
    telephone: COMPANY.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shop No. 10, Nakheel Plaza',
      addressLocality: 'Deira, Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    areaServed: [{ '@type': 'City', name: 'Dubai' }, { '@type': 'Country', name: 'United Arab Emirates' }],
    sameAs: SOCIALS.map((s) => s.url),
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '09:00',
      closes: '22:00',
    }],
    contactPoint: [{
      '@type': 'ContactPoint',
      telephone: COMPANY.phone,
      contactType: 'sales',
      areaServed: 'AE',
      availableLanguage: ['English', 'Arabic'],
    }],
    ...(categories.length && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Printing and advertising services',
        itemListElement: categories.map((c) => ({
          '@type': 'OfferCatalog',
          name: c.name,
          url: `${SITE_URL}${categoryHref(c.id)}`,
        })),
      },
    }),
  };
}

/** Breadcrumb trail: [[name, path], ...]. */
export function breadcrumbSchema(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${SITE_URL}${path}`,
    })),
  };
}

/** A service the shop offers (products have no online prices, so Service,
    not Product: Google requires a price, review or rating for Product). */
export function serviceSchema({ name, description, path, image, category }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: `${SITE_URL}${path}`,
    ...(image && { image }),
    ...(category && { serviceType: category, category }),
    provider: { '@id': BUSINESS_ID },
    areaServed: { '@type': 'City', name: 'Dubai' },
  };
}

/** Questions and answers shown on the page. */
export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
