/* On-screen invoice, same short layout as the PDF. Also what gets printed. */
import { aed, fmtDate, num, totals } from '@/lib/invoice';

export default function InvoicePreview({ invoice, settings }) {
  const t = totals(invoice.items, invoice.discount, invoice.vatRate);
  const c = invoice.customer;
  const contact = [settings.phone, settings.email].filter(Boolean).join(' · ');
  return (
    <article className="inv-doc" aria-label="Invoice preview">
      <header className="inv-doc-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-1200.webp" alt={settings.companyName} className="inv-doc-logo" />
        <div className="inv-doc-title">
          <h2>{invoice.vatRate > 0 && settings.trn ? 'Tax invoice' : 'Invoice'}</h2>
          <span className="inv-doc-pill">{invoice.number || 'Number on save'}</span>
          <span className="a-muted">Date {fmtDate(invoice.issueDate)}{invoice.dueDate ? ` · Due ${fmtDate(invoice.dueDate)}` : ''}</span>
          {(invoice.status === 'paid' || invoice.status === 'void') && <b className={`inv-stamp st-${invoice.status}`}>{invoice.status.toUpperCase()}</b>}
        </div>
      </header>

      <div className="inv-doc-bill">
        <small>Bill to</small>
        <b>{c.company || c.name || <span className="a-muted">Customer</span>}</b>
        {c.company && c.name && <span>{c.name}</span>}
        {(c.phone || c.email) && <span>{[c.phone, c.email].filter(Boolean).join(' · ')}</span>}
        {c.address && <span>{c.address}</span>}
        {c.trn && <span>TRN {c.trn}</span>}
      </div>

      <table className="inv-doc-table">
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
        <tbody>
          {invoice.items.length === 0 && <tr><td colSpan={4} className="a-muted">No items yet</td></tr>}
          {invoice.items.map((i, n) => (
            <tr key={i.key ?? n}>
              <td>{i.description || <span className="a-muted">Item</span>}</td>
              <td>{num(i.quantity)}</td>
              <td>{aed(i.unitPrice)}</td>
              <td>{aed((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-doc-totals">
        <div><span>Subtotal</span><span>{aed(t.subtotal)}</span></div>
        {Number(invoice.discount) > 0 && <div><span>Discount</span><span>{aed(-invoice.discount)}</span></div>}
        {invoice.vatRate > 0 && <div><span>VAT {invoice.vatRate}%</span><span>{aed(t.vat)}</span></div>}
        <div className="inv-doc-grand"><span>Total</span><span>{aed(t.total)}</span></div>
      </div>

      {invoice.notes && <p className="inv-doc-notes">{invoice.notes}</p>}

      <footer className="inv-doc-foot">
        <b>{settings.companyName}{settings.trn ? ` · TRN ${settings.trn}` : ''}</b>
        {settings.address && <span>{settings.address}</span>}
        {contact && <span>{contact}</span>}
        {settings.bankDetails && <span className="inv-doc-gap">{settings.bankDetails}</span>}
        {settings.terms && <span className="inv-doc-gap">{settings.terms}</span>}
      </footer>
    </article>
  );
}
