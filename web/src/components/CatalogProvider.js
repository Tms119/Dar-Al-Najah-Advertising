'use client';

import { createContext, useContext } from 'react';
import { usePreloadedQuery } from 'convex/react';

/* Holds the live catalogue (categories + product cards). It is preloaded on
   the server for the first paint, then stays subscribed — when an admin adds,
   edits or hides a product, every menu and grid updates in place. */
const CatalogContext = createContext({ categories: [], products: [] });

export function CatalogProvider({ preloaded, children }) {
  const catalog = usePreloadedQuery(preloaded);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
