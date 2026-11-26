import { preloadQuery, preloadedQueryResult } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import { CatalogProvider } from '@/components/CatalogProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import WhatsAppFab from '@/components/WhatsAppFab';
import PerfObserver from '@/components/PerfObserver';
import { JsonLd, businessSchema } from '@/lib/structuredData';

export default async function SiteLayout({ children }) {
  const preloaded = await preloadQuery(api.catalog.getCatalog, {});
  return (
    <CatalogProvider preloaded={preloaded}>
      {/* who the business is and what it offers, for search and AI answer engines */}
      <JsonLd data={businessSchema(preloadedQueryResult(preloaded)?.categories ?? [])} />
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFab />
      <RevealObserver />
      <PerfObserver />
    </CatalogProvider>
  );
}
