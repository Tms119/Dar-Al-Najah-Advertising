'use client';

import { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import ProductEditor from '@/components/admin/ProductEditor';

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const product = useQuery(api.admin.getProduct, isNew ? 'skip' : { id });
  const structure = useQuery(api.admin.structure);

  if (structure === undefined || (!isNew && product === undefined)) return <p className="a-muted">Loading…</p>;
  if (!isNew && product === null) return <p>Product not found.</p>;
  return <ProductEditor product={isNew ? null : product} structure={structure} key={id} />;
}
