import ExhibitionsView from './ExhibitionsView';
import { EXHIBITION_PHOTOS } from '@/data/exhibitions';
import { SITE_URL } from '@/data/site';
import { JsonLd, breadcrumbSchema, serviceSchema } from '@/lib/structuredData';

export const metadata = {
  title: 'Exhibition Stands in Dubai',
  description: 'Exhibition booths, custom stands, pop-up backdrops, roll-ups, flags and lightboxes for trade shows, malls and events in Dubai. See examples of what Dar Al Najah Advertising makes and ask for a quote on WhatsApp.',
  alternates: { canonical: '/exhibitions' },
};

export default function ExhibitionsPage() {
  return (
    <>
      <JsonLd data={[
        serviceSchema({
          name: 'Exhibition stands and event displays',
          description: 'Exhibition booths, shell scheme graphics, custom stands, pop-up backdrops, counters, roll-up banners, flags and lightboxes for trade shows, malls and events in Dubai.',
          path: '/exhibitions',
          image: EXHIBITION_PHOTOS.slice(0, 6).map((p) => `${SITE_URL}${p.src}`),
          category: 'Exhibition stands',
        }),
        breadcrumbSchema([['Home', '/'], ['Exhibitions', '/exhibitions']]),
      ]} />
      <ExhibitionsView />
    </>
  );
}
