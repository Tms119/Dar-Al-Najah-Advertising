import { fetchQuery } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import { COMPANY, SITE_URL, SOCIALS, categoryHref, waLink } from '@/data/site';
import { EXHIBITION_GROUPS } from '@/data/exhibitions';

/* /llms.txt: a plain summary of the business for AI assistants and answer
   engines (see llmstxt.org). Built from the live catalogue, so it always
   matches the site. */

export const revalidate = 3600;

export async function GET() {
  const { categories, products } = await fetchQuery(api.catalog.getCatalog, {});

  const sections = categories.map((c) => {
    const items = products.filter((p) => p.in.some((x) => x.c === c.id));
    return [
      `### ${c.name}`,
      `${SITE_URL}${categoryHref(c.id)}`,
      '',
      ...items.map((p) => `- [${p.name}](${SITE_URL}/products/${p.id})`),
    ].join('\n');
  });

  const body = `# ${COMPANY.full}

> Printing and advertising shop in Deira, Dubai, United Arab Emirates. Commercial printing, fabric printing and embroidery, customised corporate gifts, woven labels, stickers and graphics, and exhibition stands, designed and produced in Dubai. Customers ask for quotes on WhatsApp; prices are not listed online.

## Contact

- Phone and WhatsApp: ${COMPANY.phone}
- WhatsApp chat: ${waLink('Hi Dar Al Najah!')}
- Address: ${COMPANY.address}
- Opening hours: ${COMPANY.hours} (Friday closed)
- Website: ${SITE_URL}
${SOCIALS.map((s) => `- ${s.name}: ${s.url}`).join('\n')}

## How ordering works

1. Send your design, logo or idea on WhatsApp.
2. Get options, a quote and a proof to approve.
3. Collect from the Deira shop.

Same day printing is available for many items, such as business cards, flyers and stickers, when artwork is approved early in the day.

## Exhibition stands

${SITE_URL}/exhibitions

Examples of the work the shop takes on: ${EXHIBITION_GROUPS.map((g) => g.name.toLowerCase()).join(', ')}. Booths and custom stands, shell scheme graphics, pop-up backdrops with counters, roll-up banners, feather flags and lightboxes for trade shows, malls and launches.

## Products (${products.length})

${sections.join('\n\n')}

## Pages

- [Home](${SITE_URL}/)
- [All products](${SITE_URL}/products)
- [Woven labels](${SITE_URL}/woven-labels)
- [Exhibitions](${SITE_URL}/exhibitions)
- [Contact](${SITE_URL}/contact)
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
