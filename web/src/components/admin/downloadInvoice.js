'use client';

import { aed, fmtDate, totals } from '@/lib/invoice';

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
  return `${invoice.number}${who ? ' ' + who : ''}.pdf`.replace(/[\\/:*?"<>|]/g, '');
}

export function saveFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function downloadInvoicePdf(invoice, settings) {
  saveFile(await buildInvoicePdf(invoice, settings));
}

/* ---------- WhatsApp ---------- */

/** Digits only, in international format. UAE local numbers (05x…) get 971. */
export function waNumber(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('05')) d = '971' + d.slice(1);
  if (d.length === 9 && d.startsWith('5')) d = '971' + d;
  return d.length >= 8 ? d : '';
}

export function invoiceMessage(invoice, settings) {
  const t = totals(invoice.items, invoice.discount, invoice.vatRate);
  const name = invoice.customer.name || invoice.customer.company;
  return [
    `Hello${name ? ' ' + name : ''},`,
    '',
    `Here is your invoice ${invoice.number} from ${settings.companyName}.`,
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
  return `https://wa.me/${n}?text=${encodeURIComponent(invoiceMessage(invoice, settings))}`;
}
