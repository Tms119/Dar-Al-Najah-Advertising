'use client';

import { aed, fmtDate, totals } from '@/lib/invoice';
import { waChat, waNumber } from '@/lib/whatsapp';

/* The PDF library (~1 MB) is loaded only when an invoice PDF is needed. */
export async function buildInvoicePdf(invoice, settings) {
  const [{ pdf, Font }, { default: InvoicePdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./InvoicePdf'),
  ]);
  const origin = window.location.origin;
  // the website's condensed display face, for the headline and total
  Font.register({ family: 'Display', src: `${origin}/fonts/bricolage-display.ttf` });
  Font.registerHyphenationCallback((word) => [word]); // never hyphenate words
  const blob = await pdf(<InvoicePdf invoice={invoice} settings={settings} logoSrc={`${origin}/brand/logo-1200.png`} />).toBlob();
  return new File([blob], invoiceFileName(invoice), { type: 'application/pdf' });
}

export function invoiceFileName(invoice) {
  const who = invoice.customer.company || invoice.customer.name;
  return `${invoice.number || 'Draft invoice'}${who ? ' ' + who : ''}.pdf`.replace(/[\\/:*?"<>|]/g, '');
}

/* ---------- WhatsApp ---------- */

export function invoiceMessage(invoice, settings) {
  const t = totals(invoice.items, invoice.discount, invoice.vatRate);
  const name = invoice.customer.name || invoice.customer.company;
  const overdue = invoice.status === 'issued' && invoice.dueDate && invoice.dueDate < Date.now() - 86400000;
  return [
    `Hello${name ? ' ' + name : ''},`,
    '',
    overdue
      ? `A friendly reminder that invoice ${invoice.number} from ${settings.companyName} is now overdue.`
      : `Here is your invoice ${invoice.number} from ${settings.companyName}.`,
    `Total: ${aed(t.total)}`,
    invoice.dueDate ? `Due: ${fmtDate(invoice.dueDate)}` : null,
    '',
    'Thank you for your business.',
  ].filter((l) => l !== null).join('\n');
}

/** Chat link to the customer's own number (callers check the number first). */
export function waLinkFor(invoice, settings) {
  const n = waNumber(invoice.customer.phone);
  if (!n) throw new Error('No valid phone number');
  return waChat(n, invoiceMessage(invoice, settings));
}
