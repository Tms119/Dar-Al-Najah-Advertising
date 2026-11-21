/* Invoice helpers shared by the editor, the on-screen preview and the PDF.
   Totals mirror convex/invoices.ts (the server recomputes on save). */

export const round2 = (n) => Math.round(n * 100) / 100;

export function totals(items, discount = 0, vatRate = 5) {
  const subtotal = round2(items.reduce((a, i) => a + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0));
  const taxable = Math.max(0, round2(subtotal - (Number(discount) || 0)));
  const vat = round2((taxable * vatRate) / 100);
  return { subtotal, taxable, vat, total: round2(taxable + vat) };
}

export const aed = (n) =>
  'AED ' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const num = (n) => (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

/* dates are stored as UTC midnight milliseconds */
export const toInput = (ms) => (ms == null ? '' : new Date(ms).toISOString().slice(0, 10));
export const fromInput = (s) => (s ? Date.parse(s + 'T00:00:00Z') : null);
export const todayMs = () => fromInput(new Date().toISOString().slice(0, 10));
export const addDays = (ms, d) => ms + d * 86400000;
export const fmtDate = (ms) =>
  ms == null ? '' : new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const STATUS_LABEL = { draft: 'Draft', issued: 'Issued', paid: 'Paid', void: 'Void' };
