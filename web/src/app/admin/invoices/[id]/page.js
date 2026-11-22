'use client';

import { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import InvoiceEditor from '@/components/admin/InvoiceEditor';

export default function InvoicePage({ params }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const invoice = useQuery(api.invoices.get, isNew ? 'skip' : { id });
  const settings = useQuery(api.invoices.getSettings);

  if (settings === undefined || (!isNew && invoice === undefined)) {
    return <p className="a-muted">Loading…</p>;
  }
  if (!isNew && invoice === null) return <p>Invoice not found.</p>;
  return <InvoiceEditor invoice={isNew ? null : invoice} settings={settings} key={invoice?._id ?? 'new'} />;
}
