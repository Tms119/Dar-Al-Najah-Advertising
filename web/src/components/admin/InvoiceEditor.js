'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import InvoicePreview from './InvoicePreview';
import { buildInvoicePdf, waLinkFor } from './downloadInvoice';
import { WhatsAppIcon } from '@/components/icons';
import { saveFile } from '@/lib/download';
import { errorMessage } from '@/lib/errors';
import { waNumber } from '@/lib/whatsapp';
import { aed, addDays, fromInput, todayMs, toInput, totals, STATUS_LABEL } from '@/lib/invoice';

let keySeq = 0;
const k = () => `l${++keySeq}`;
const blankLine = () => ({ key: k(), productId: null, description: '', details: '', quantity: 1, unitPrice: 0 });

export default function InvoiceEditor({ invoice, prefill, settings }) {
  const router = useRouter();
  const save = useMutation(api.invoices.save);
  const setStatus = useMutation(api.invoices.setStatus);
  const remove = useMutation(api.invoices.remove);
  const products = useQuery(api.invoices.productPicker);

  const [f, setF] = useState(() => {
    if (invoice) return { ...invoice, items: invoice.items.map((i) => ({ ...i, key: k() })) };
    const issue = todayMs();
    return {
      status: 'draft',
      issueDate: issue,
      dueDate: addDays(issue, settings.defaultDueDays ?? 7),
      customer: prefill?.customer ?? { name: '', company: '', email: '', phone: '', address: '', trn: '' },
      items: prefill?.items?.length ? prefill.items.map((i) => ({ ...i, description: i.details ? `${i.description} (${i.details})` : i.description, details: '', key: k() })) : [blankLine()],
      discount: 0,
      vatRate: 5,
      notes: '',
      quoteId: prefill?.quoteId ?? null,
    };
  });
  const [dirty, setDirty] = useState(!invoice);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [picker, setPicker] = useState(false);
  const [moreCustomer, setMoreCustomer] = useState(Boolean(invoice?.customer.address || invoice?.customer.trn));
  const [moreNotes, setMoreNotes] = useState(Boolean(invoice?.notes || Number(invoice?.discount)));
  const [q, setQ] = useState('');
  const pickerRef = useRef(null);
  const [saved, setSaved] = useState(invoice ? { id: invoice._id, number: invoice.number } : null);

  const locked = f.status === 'void';
  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setDirty(true); setNotice(null); };
  const setCustomer = (key, v) => set({ customer: { ...f.customer, [key]: v } });
  const setItem = (key, patch) => set({ items: f.items.map((i) => (i.key === key ? { ...i, ...patch } : i)) });
  const t = totals(f.items, f.discount, f.vatRate);

  const shown = useMemo(
    () => (products ?? []).filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 40),
    [products, q],
  );

  const addProduct = (p, tier) => {
    const line = {
      key: k(), productId: p._id, details: '', quantity: 1,
      description: tier ? `${p.name} (${tier.quantity.toLocaleString('en-US')} pcs)` : p.name,
      unitPrice: tier ? tier.price : p.basePrice,
    };
    const onlyEmpty = f.items.length === 1 && !f.items[0].description && !Number(f.items[0].unitPrice);
    set({ items: onlyEmpty ? [line] : [...f.items, line] });
    setPicker(false);
    setQ('');
  };

  const persist = async (status) => {
    const r = await save({
      id: saved?.id ?? null,
      status,
      issueDate: f.issueDate,
      dueDate: f.dueDate,
      customer: f.customer,
      items: f.items.map(({ productId, description, quantity, unitPrice }) => ({
        productId, description, details: '', quantity: Number(quantity), unitPrice: Number(unitPrice),
      })),
      discount: Number(f.discount) || 0,
      vatRate: Number(f.vatRate),
      notes: f.notes,
      quoteId: f.quoteId ?? null,
    });
    setSaved(r);
    setDirty(false);
    setF((x) => ({ ...x, status }));
    if (!invoice) window.history.replaceState(null, '', `/admin/invoices/${r.id}`);
    return r;
  };
  // saves only when needed; returns the invoice as it will appear on the PDF
  const ensureSaved = async (status = f.status) => {
    const r = !saved || dirty || status !== f.status ? await persist(status) : saved;
    return { ...f, status, number: r.number };
  };

  const onSave = async (status) => {
    setError(null); setBusy('save');
    try { await persist(status); setNotice(status === 'issued' && f.status === 'draft' ? 'Invoice issued.' : 'Saved.'); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(null); }
  };

  const onDownload = async () => {
    setError(null); setBusy('pdf');
    try { const inv = await ensureSaved(); saveFile(await buildInvoicePdf(inv, settings)); }
    catch (e) { setError(errorMessage(e, 'Could not create the PDF. Please try again.')); }
    finally { setBusy(null); }
  };

  // WhatsApp goes to the customer's own number: opens that chat with a ready
  // message, and downloads the PDF so it can be attached in the chat.
  const phone = waNumber(f.customer.phone);
  const onWhatsApp = async () => {
    if (!phone) return;
    setError(null);
    const status = f.status === 'draft' ? 'issued' : f.status;
    const win = window.open('', '_blank'); // opened now so pop-up blockers allow it
    setBusy('wa');
    try {
      const inv = await ensureSaved(status);
      const url = waLinkFor(inv, settings);
      if (win) win.location.href = url; else window.location.href = url;
      saveFile(await buildInvoicePdf(inv, settings));
      setNotice(`WhatsApp opened for ${f.customer.phone}. The PDF was downloaded: attach it in the chat.`);
    } catch (e) {
      win?.close();
      setError(errorMessage(e, 'Could not prepare the invoice. Please try again.'));
    } finally { setBusy(null); }
  };

  const onStatus = async (status) => {
    if (status === 'void' && !window.confirm('Void this invoice? It stays in your records but can no longer be edited.')) return;
    setError(null);
    try { await setStatus({ id: saved.id, status }); setF((x) => ({ ...x, status })); setNotice(`Marked as ${STATUS_LABEL[status].toLowerCase()}.`); }
    catch (e) { setError(errorMessage(e)); }
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete draft ${saved.number}? This can't be undone.`)) return;
    try { await remove({ id: saved.id }); router.push('/admin/invoices'); } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <div className="inv-editor">
      <header className="a-head a-head-sticky inv-head">
        <div>
          <Link href="/admin/invoices" className="a-link">← Invoices</Link>
          <h1>{saved ? saved.number : 'New invoice'}<span className={`inv-badge st-${f.status}`}>{STATUS_LABEL[f.status]}</span></h1>
        </div>
        <div className="a-head-actions inv-actions">
          {saved && !dirty && <button className="a-btn inv-print" onClick={() => window.print()}>Print</button>}
          <button className="a-btn" onClick={onDownload} disabled={!!busy}>{busy === 'pdf' ? 'Creating…' : 'Download PDF'}</button>
          {!locked && (
            <button
              className="a-btn a-btn-wa"
              onClick={onWhatsApp}
              disabled={!!busy || !phone}
              title={phone ? `Send to ${f.customer.phone} on WhatsApp` : 'Add the customer’s phone number to send on WhatsApp'}
            >
              <WhatsAppIcon size={17} />
              {busy === 'wa' ? 'Preparing…' : phone ? 'WhatsApp' : 'Add phone to use WhatsApp'}
            </button>
          )}
          {!locked && (f.status === 'draft' ? (
            <>
              <button className="a-btn inv-save-draft" onClick={() => onSave('draft')} disabled={!!busy || (!dirty && !!saved)}>Save draft</button>
              <button className="a-btn a-btn-primary" onClick={() => onSave('issued')} disabled={!!busy}>{busy === 'save' ? 'Saving…' : 'Issue'}</button>
            </>
          ) : (
            dirty && <button className="a-btn a-btn-primary" onClick={() => onSave(f.status)} disabled={!!busy}>{busy === 'save' ? 'Saving…' : 'Save'}</button>
          ))}
        </div>
      </header>

      {error && <p className="a-error" role="alert">{error}</p>}
      {notice && <p className="a-ok">{notice}</p>}
      {saved && dirty && !locked && <p className="a-muted a-small inv-dirty">Unsaved changes. Download and WhatsApp save them first.</p>}

      <div className="inv-grid">
        <div className="inv-form">
          <fieldset disabled={locked} className="inv-fieldset">
            <section className="a-card">
              <h2>Customer</h2>
              <div className="a-row2">
                <label className="a-field"><span>Name</span><input className="a-input" value={f.customer.name} onChange={(e) => setCustomer('name', e.target.value)} maxLength={120} /></label>
                <label className="a-field"><span>Company (optional)</span><input className="a-input" value={f.customer.company} onChange={(e) => setCustomer('company', e.target.value)} maxLength={160} /></label>
                <label className="a-field"><span>Phone</span><input className="a-input" type="tel" value={f.customer.phone} onChange={(e) => setCustomer('phone', e.target.value)} maxLength={60} /></label>
                <label className="a-field"><span>Email</span><input className="a-input" type="email" value={f.customer.email} onChange={(e) => setCustomer('email', e.target.value)} maxLength={200} /></label>
              </div>
              {moreCustomer ? (
                <div className="a-row2">
                  <label className="a-field"><span>Address</span><input className="a-input" value={f.customer.address} onChange={(e) => setCustomer('address', e.target.value)} maxLength={400} /></label>
                  <label className="a-field"><span>Customer TRN</span><input className="a-input" value={f.customer.trn} onChange={(e) => setCustomer('trn', e.target.value)} maxLength={30} inputMode="numeric" /></label>
                </div>
              ) : (
                <button type="button" className="a-link" onClick={() => setMoreCustomer(true)}>+ Address or TRN</button>
              )}
            </section>

            <section className="a-card">
              <div className="a-card-head">
                <h2>Items</h2>
                <div className="a-actions">
                  <button type="button" className="a-btn a-btn-sm" onClick={() => { setPicker(!picker); setTimeout(() => pickerRef.current?.focus(), 0); }}>+ Product</button>
                  <button type="button" className="a-btn a-btn-sm" onClick={() => set({ items: [...f.items, blankLine()] })}>+ Custom</button>
                </div>
              </div>

              {picker && (
                <div className="inv-picker">
                  <input ref={pickerRef} className="a-input" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
                  <ul>
                    {products === undefined && <li className="a-muted">Loading…</li>}
                    {shown.map((p) => (
                      <li key={p._id}>
                        <div className="inv-picker-name"><b>{p.name}</b>{!p.isActive && <span className="a-tag-off">hidden</span>}</div>
                        <div className="inv-picker-tiers">
                          {p.tiers.length ? p.tiers.map((tier) => (
                            <button type="button" key={tier.quantity} className="chip-btn" onClick={() => addProduct(p, tier)}>
                              {tier.quantity.toLocaleString('en-US')} pcs · {aed(tier.price)}
                            </button>
                          )) : (
                            <button type="button" className="chip-btn" onClick={() => addProduct(p, null)}>{aed(p.basePrice)}</button>
                          )}
                        </div>
                      </li>
                    ))}
                    {products && shown.length === 0 && <li className="a-muted">No products match.</li>}
                  </ul>
                </div>
              )}

              <div className="inv-lines">
                <div className="inv-row inv-row-head" aria-hidden="true"><span>Item</span><span>Qty</span><span>Price (AED)</span><span>Amount</span><span /></div>
                {f.items.map((i) => (
                  <div key={i.key} className="inv-row">
                    <input className="a-input" placeholder="Description" value={i.description} onChange={(e) => setItem(i.key, { description: e.target.value })} maxLength={200} aria-label="Description" />
                    <input className="a-input" type="number" min="0" step="any" inputMode="decimal" value={i.quantity} onChange={(e) => setItem(i.key, { quantity: e.target.value })} aria-label="Quantity" />
                    <input className="a-input" type="number" min="0" step="0.01" inputMode="decimal" value={i.unitPrice} onChange={(e) => setItem(i.key, { unitPrice: e.target.value })} aria-label="Price in AED" />
                    <b className="inv-row-amt">{aed((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0))}</b>
                    <button type="button" className="a-btn a-btn-xs a-btn-ghost a-btn-danger" onClick={() => set({ items: f.items.filter((x) => x.key !== i.key) })} disabled={f.items.length === 1} aria-label="Remove item">✕</button>
                  </div>
                ))}
              </div>

              <div className="inv-sum">
                <label className="inv-vat">
                  <input type="checkbox" checked={f.vatRate === 5} onChange={(e) => set({ vatRate: e.target.checked ? 5 : 0 })} /> Add 5% VAT
                </label>
                <dl className="inv-sum-totals">
                  {f.vatRate > 0 && <div><dt>VAT 5%</dt><dd>{aed(t.vat)}</dd></div>}
                  {Number(f.discount) > 0 && <div><dt>Discount</dt><dd>{aed(-f.discount)}</dd></div>}
                  <div className="is-total"><dt>Total</dt><dd>{aed(t.total)}</dd></div>
                </dl>
              </div>
            </section>

            <section className="a-card">
              <div className="a-row2">
                <label className="a-field"><span>Date</span><input className="a-input" type="date" value={toInput(f.issueDate)} onChange={(e) => set({ issueDate: fromInput(e.target.value) ?? f.issueDate })} /></label>
                <label className="a-field"><span>Due date</span><input className="a-input" type="date" value={toInput(f.dueDate)} onChange={(e) => set({ dueDate: fromInput(e.target.value) })} /></label>
              </div>
              {moreNotes ? (
                <div className="a-row2">
                  <label className="a-field"><span>Discount (AED)</span><input className="a-input" type="number" min="0" step="0.01" inputMode="decimal" value={f.discount} onChange={(e) => set({ discount: e.target.value })} /></label>
                  <label className="a-field"><span>Note on invoice</span><input className="a-input" value={f.notes} onChange={(e) => set({ notes: e.target.value })} maxLength={300} placeholder="Optional" /></label>
                </div>
              ) : (
                <button type="button" className="a-link" onClick={() => setMoreNotes(true)}>+ Discount or note</button>
              )}
            </section>
          </fieldset>

          {saved && (
            <div className="inv-status-row">
              {f.status === 'issued' && <button className="a-btn" onClick={() => onStatus('paid')}>Mark as paid</button>}
              {f.status === 'paid' && <button className="a-btn" onClick={() => onStatus('issued')}>Mark as unpaid</button>}
              {(f.status === 'issued' || f.status === 'paid') && <button className="a-btn a-btn-ghost a-btn-danger" onClick={() => onStatus('void')}>Void</button>}
              {f.status === 'draft' && <button className="a-btn a-btn-ghost a-btn-danger" onClick={onDelete}>Delete draft</button>}
              {f.status === 'void' && <p className="a-muted a-small">Void invoices are kept for your records and can&apos;t be edited.</p>}
            </div>
          )}
        </div>

        <div className="inv-preview-col">
          <InvoicePreview invoice={{ ...f, number: saved?.number ?? '' }} settings={settings} />
        </div>
      </div>
    </div>
  );
}
