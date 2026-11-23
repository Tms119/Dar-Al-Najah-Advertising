import { notFound } from 'next/navigation';
import { preloadQuery, preloadedQueryResult } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import WovenLabelsView from './WovenLabelsView';

export const metadata = {
  title: 'Woven Labels in Dubai',
  description: 'Custom woven labels in Dubai: damask, satin, polyester and cotton. Center fold, end fold, straight cut and soft edge labels for garments, t shirts, caps, bags and uniforms. Bulk, wholesale, private label and OEM.',
};

export default async function WovenLabelsPage() {
  const preloaded = await preloadQuery(api.catalog.getCategoryPage, { slug: 'woven-labels' });
  if (!preloadedQueryResult(preloaded)) notFound();
  return <WovenLabelsView preloaded={preloaded} />;
}
