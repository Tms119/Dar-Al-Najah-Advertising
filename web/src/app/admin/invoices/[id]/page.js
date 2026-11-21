'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import InvoiceEditor from '@/components/admin/InvoiceEditor';

export default function InvoicePage({ params }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const quoteId = useSearchParams().get('quote');
  const invoice = useQuery(api.invoices.get, isNew ? 'skip' : { id });
  const prefill = useQuery(api.invoices.fromQuote, isNew && quoteId ? { quoteId } : 'skip');
  const settings = useQuery(api.invoices.getSettings);

  if (settings === undefined || (!isNew && invoice === undefined) || (isNew && quoteId && prefill === undefined)) {
    return <p className="a-muted">Loading…</p>;
  }
  if (!isNew && invoice === null) return <p>Invoice not found.</p>;
  return <InvoiceEditor invoice={isNew ? null : invoice} prefill={prefill ?? null} settings={settings} key={invoice?._id ?? 'new'} />;
}
