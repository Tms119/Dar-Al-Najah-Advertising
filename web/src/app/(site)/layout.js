import { preloadQuery } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import { CatalogProvider } from '@/components/CatalogProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import WhatsAppFab from '@/components/WhatsAppFab';

export default async function SiteLayout({ children }) {
  const preloaded = await preloadQuery(api.catalog.getCatalog, {});
  return (
    <CatalogProvider preloaded={preloaded}>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFab />
      <RevealObserver />
    </CatalogProvider>
  );
}
