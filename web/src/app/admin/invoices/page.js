'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { aed, fmtDate, todayMs, STATUS_LABEL } from '@/lib/invoice';
import { buildInvoicePdf, waLinkFor } from '@/components/admin/downloadInvoice';
import { DownloadIcon } from '@/components/icons';
import { saveFile } from '@/lib/download';
import { errorMessage } from '@/lib/errors';
import { waNumber } from '@/lib/whatsapp';

const TABS = [null, 'draft', 'issued', 'overdue', 'paid', 'void'];
const TAB_LABEL = { ...STATUS_LABEL, overdue: 'Overdue' };
const COLS = [
  { key: 'number', label: 'Invoice' },
  { key: 'customer', label: 'Customer' },
  { key: 'issueDate', label: 'Issued' },
  { key: 'dueDate', label: 'Due' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
];
const STATUS_ORDER = { overdue: 0, issued: 1, draft: 2, paid: 3, void: 4 };
const custKey = (i) => (i.customerName || '').trim().toLowerCase();

const Ic = ({ d }) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const IC = {
  wa: <><path d="M4.5 19.5l1.2-3.6A7.6 7.6 0 1 1 8.6 18.6z" /><path d="M9.3 9.2c.3 2.4 2.1 4.3 4.6 4.8l.9-1.1 1.8.8-.4 1.5c-3.6.2-7.2-3.3-7-7l1.5-.4.8 1.8z" /></>,
  paid: <><path d="M5 12.5l4.2 4.2L19 7" /></>,
};

export default function AdminInvoices() {
  const [status, setStatus] = useState(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 'desc' });
  const [customer, setCustomer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [busy, setBusy] = useState(null); // `${id}:${action}`
  const [msg, setMsg] = useState(null);
  const all = useQuery(api.invoices.list, { status: null });
  const settings = useQuery(api.invoices.getSettings);
  const convex = useConvex();
  const setInvoiceStatus = useMutation(api.invoices.setStatus);

  const today = todayMs();
  const isLate = (i) => i.status === 'issued' && i.dueDate != null && i.dueDate < today;
  const shownStatus = (i) => (isLate(i) ? 'overdue' : i.status);

  const list = useMemo(() => {
    const rows = (all ?? [])
      .filter((i) => !customer || custKey(i) === customer)
      .filter((i) => !status || (status === 'overdue' ? isLate(i) : i.status === status))
      .filter((i) => !q || `${i.number} ${i.customerName}`.toLowerCase().includes(q.toLowerCase()));
    if (!sort.key) return rows;
    const val = {
      number: (i) => i.number,
      customer: (i) => custKey(i),
      issueDate: (i) => i.issueDate,
      dueDate: (i) => i.dueDate ?? i.issueDate,
      total: (i) => i.total,
      status: (i) => STATUS_ORDER[shownStatus(i)],
    }[sort.key];
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = val(a), y = val(b);
      return (typeof x === 'string' ? x.localeCompare(y) : x - y) * dir;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, status, q, sort, customer, today]);

  const outstanding = (all ?? []).filter((i) => i.status === 'issued');
  const overdue = outstanding.filter(isLate);
  const monthStart = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1);
  const paidMonth = (all ?? []).filter((i) => i.status === 'paid' && i.issueDate >= monthStart);
  const sum = (rows) => rows.reduce((a, i) => a + i.total, 0);

  // click a column: first direction, then the other, then back to newest first
  const onSort = (key) => setSort((s) => {
    const first = ['customer', 'number', 'status'].includes(key) ? 'asc' : 'desc';
    if (s.key !== key) return { key, dir: first };
    if (s.dir === first) return { key, dir: first === 'asc' ? 'desc' : 'asc' };
    return { key: null, dir: 'desc' };
  });

  /* ---------- quick actions ---------- */
  const fullInvoice = async (id) => {
    const inv = await convex.query(api.invoices.get, { id });
    if (!inv) throw new Error('Invoice not found');
    return inv;
  };
  const run = async (row, action, fn) => {
    setBusy(`${row._id}:${action}`); setMsg(null);
    try { await fn(); } catch (e) { setMsg({ err: true, text: errorMessage(e) }); } finally { setBusy(null); }
  };
  const onDownload = (row) => run(row, 'pdf', async () => {
    saveFile(await buildInvoicePdf(await fullInvoice(row._id), settings));
  });
  const onWhatsApp = (row) => {
    const win = window.open('', '_blank'); // opened now so pop-up blockers allow it
    run(row, 'wa', async () => {
      try {
        if (row.status === 'draft') await setInvoiceStatus({ id: row._id, status: 'issued' });
        const inv = await fullInvoice(row._id);
        const url = waLinkFor(inv, settings);
        if (win) win.location.href = url; else window.location.href = url;
        saveFile(await buildInvoicePdf(inv, settings));
        setMsg({ text: `WhatsApp opened for ${row.phone}. The PDF was downloaded: attach it in the chat.` });
      } catch (e) { win?.close(); throw e; }
    });
  };
  const onPaid = (row) => run(row, 'paid', async () => {
    await setInvoiceStatus({ id: row._id, status: 'paid' });
    setMsg({ text: `${row.number} marked as paid.`, undo: row._id });
  });
  const undoPaid = (id) => run({ _id: id }, 'undo', async () => {
    await setInvoiceStatus({ id, status: 'issued' });
    setMsg(null);
  });

  /* ---------- customer history ---------- */
  const custRows = customer ? (all ?? []).filter((i) => custKey(i) === customer) : [];
  const custName = custRows[0]?.customerName;
  const custOwed = custRows.filter((i) => i.status === 'issued');
  const custPaid = custRows.filter((i) => i.status === 'paid');
  const custPhone = custRows.find((i) => waNumber(i.phone))?.phone;

  return (
    <>
      <header className="a-head">
        <div>
          <h1>Invoices</h1>
          <p className="a-muted">Create invoices from catalogue products or custom lines, then download them as PDF.</p>
        </div>
        <div className="a-head-actions">
          <button className="a-btn" onClick={() => setShowSettings(!showSettings)}>{showSettings ? 'Close details' : 'Invoice details'}</button>
          <Link href="/admin/invoices/new" className="a-btn a-btn-primary">+ New invoice</Link>
        </div>
      </header>

      {showSettings && <SettingsForm onDone={() => setShowSettings(false)} />}

      {customer ? (
        <div className="a-card inv-cust">
          <div className="inv-cust-head">
            <div>
              <span className="inv-cust-label">Customer</span>
              <h2>{custName || 'No name'}</h2>
              {custPhone && <span className="a-muted a-small">{custPhone}</span>}
            </div>
            <button className="a-btn" onClick={() => setCustomer(null)}>✕ All customers</button>
          </div>
          <div className="inv-cust-stats">
            <div><span>Invoices</span><b>{custRows.length}</b></div>
            <div><span>Total billed</span><b>{aed(sum(custRows.filter((i) => i.status !== 'void' && i.status !== 'draft')))}</b></div>
            <div><span>Owes</span><b className={custOwed.some(isLate) ? 'is-warn' : ''}>{aed(sum(custOwed))}</b></div>
            <div><span>Paid</span><b>{aed(sum(custPaid))}</b></div>
          </div>
        </div>
      ) : (
        <div className="a-stats inv-stats">
          <div className="a-stat"><span>Outstanding</span><b>{all ? aed(sum(outstanding)) : '…'}</b><small className="a-muted">{outstanding.length} unpaid</small></div>
          <button className={`a-stat inv-stat-btn ${overdue.length ? 'is-alert' : ''}`} onClick={() => setStatus('overdue')} disabled={!overdue.length}>
            <span>Overdue</span><b>{all ? aed(sum(overdue)) : '…'}</b><small className={overdue.length ? 'is-warn' : 'a-muted'}>{overdue.length ? `${overdue.length} past due, view →` : 'Nothing overdue'}</small>
          </button>
          <div className="a-stat"><span>Paid this month</span><b>{all ? aed(sum(paidMonth)) : '…'}</b><small className="a-muted">{paidMonth.length} invoices</small></div>
        </div>
      )}

      <div className="a-toolbar">
        <div className="a-tabs" style={{ marginBottom: 0 }}>
          {TABS.map((s) => (
            <button key={s ?? 'all'} className={`a-tab ${status === s ? 'is-active' : ''} ${s === 'overdue' && overdue.length ? 'is-alert' : ''}`} onClick={() => setStatus(s)}>
              {s ? TAB_LABEL[s] : 'All'}{s === 'overdue' && overdue.length ? <i className="inv-tab-n">{overdue.length}</i> : null}
            </button>
          ))}
        </div>
        <input className="a-input" placeholder="Search number or customer…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="a-input inv-sort-select" aria-label="Sort by" value={sort.key ? `${sort.key}:${sort.dir}` : ''} onChange={(e) => {
          const [key, dir] = e.target.value.split(':'); setSort(key ? { key, dir } : { key: null, dir: 'desc' });
        }}>
          <option value="">Newest first</option>
          <option value="dueDate:asc">Due soonest</option>
          <option value="total:desc">Highest total</option>
          <option value="total:asc">Lowest total</option>
          <option value="customer:asc">Customer A to Z</option>
          <option value="status:asc">Status</option>
        </select>
      </div>

      {msg && (
        <p className={`${msg.err ? 'a-error' : 'a-ok'} inv-list-msg`} role="status">
          {msg.text}
          {msg.undo && <button className="inv-undo" onClick={() => undoPaid(msg.undo)}>Undo</button>}
          <button className="inv-msg-x" onClick={() => setMsg(null)} aria-label="Dismiss">✕</button>
        </p>
      )}

      <div className="a-card a-table-wrap">
        {all === undefined ? <p className="a-muted" style={{ padding: 20 }}>Loading…</p> : list.length === 0 ? (
          <div className="inv-empty">
            <p>{all.length ? (status === 'overdue' ? 'Nothing overdue. Nice.' : 'No invoices match.') : 'No invoices yet.'}</p>
            {!all.length && <Link href="/admin/invoices/new" className="a-btn a-btn-primary">Create your first invoice</Link>}
          </div>
        ) : (
          <table className="a-table inv-table">
            <thead>
              <tr>
                {COLS.map((c) => {
                  const on = sort.key === c.key;
                  return (
                    <th key={c.key} aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                      <button className={`inv-th ${on ? 'is-on' : ''}`} onClick={() => onSort(c.key)}>
                        {c.label}<i aria-hidden="true">{on ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</i>
                      </button>
                    </th>
                  );
                })}
                <th className="inv-th-actions"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => {
                const late = isLate(i);
                const st = shownStatus(i);
                const hasWa = !!waNumber(i.phone);
                const b = (a) => busy === `${i._id}:${a}`;
                return (
                  <tr key={i._id} className={`inv-row-link ${i.status === 'void' ? 'is-off' : ''} ${late ? 'is-late' : ''}`}>
                    {/* the link stretches over the whole row (see .inv-num-link::after) */}
                    <td><Link href={`/admin/invoices/${i._id}`} className="inv-num-link" aria-label={`Open invoice ${i.number}, ${i.customerName || 'no name'}, ${aed(i.total)}`}>{i.number}</Link></td>
                    <td>
                      {i.customerName
                        ? <button className="inv-cust-link" onClick={() => { setCustomer(custKey(i)); setStatus(null); setQ(''); }} title={`All invoices for ${i.customerName}`}>{i.customerName}</button>
                        : <span className="a-muted">No name</span>}
                    </td>
                    <td>{fmtDate(i.issueDate)}</td>
                    <td className={late ? 'is-warn' : ''}>{i.dueDate ? fmtDate(i.dueDate) : 'On receipt'}{late ? ` · ${Math.round((today - i.dueDate) / 86400000)}d late` : ''}</td>
                    <td><b>{aed(i.total)}</b></td>
                    <td><span className={`inv-badge st-${st}`}>{TAB_LABEL[st]}</span></td>
                    <td className="inv-qa">
                      <div className="inv-qa-btns">
                        <button className="inv-qa-btn" onClick={() => onDownload(i)} disabled={!settings || b('pdf')} title="Download PDF" aria-label={`Download ${i.number} as PDF`}>
                          {b('pdf') ? <span className="inv-spin" /> : <DownloadIcon />}
                        </button>
                        {i.status !== 'void' && (
                          <button className="inv-qa-btn is-wa" onClick={() => onWhatsApp(i)} disabled={!settings || !hasWa || b('wa')}
                            title={hasWa ? `Send on WhatsApp to ${i.phone}` : 'No phone number on this invoice'} aria-label={`Send ${i.number} on WhatsApp`}>
                            {b('wa') ? <span className="inv-spin" /> : <Ic d={IC.wa} />}
                          </button>
                        )}
                        {i.status === 'issued' && (
                          <button className="inv-qa-btn is-paid" onClick={() => onPaid(i)} disabled={b('paid')} title="Mark as paid" aria-label={`Mark ${i.number} as paid`}>
                            {b('paid') ? <span className="inv-spin" /> : <Ic d={IC.paid} />}<span className="inv-qa-txt">Paid</span>
                          </button>
                        )}
                      </div>
                      <span className="inv-chev" aria-hidden="true">›</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function SettingsForm({ onDone }) {
  const settings = useQuery(api.invoices.getSettings);
  const save = useMutation(api.invoices.saveSettings);
  const [f, setF] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const v = f ?? settings;
  if (!v) return <div className="a-card"><p className="a-muted">Loading…</p></div>;
  const set = (key, val) => setF({ ...v, [key]: val });

  const onSubmit = async (e) => {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      const { _id, _creationTime, ...rest } = v;
      await save({ ...rest, defaultDueDays: Number(rest.defaultDueDays) });
      onDone();
    } catch (e2) { setErr(errorMessage(e2, 'Could not save.')); } finally { setBusy(false); }
  };

  return (
    <form className="a-card inv-settings" onSubmit={onSubmit}>
      <h2>Invoice details</h2>
      <p className="a-muted a-small">Printed on every invoice. Add your TRN to issue tax invoices.</p>
      <div className="a-row2">
        <label className="a-field"><span>Company name</span><input className="a-input" value={v.companyName} onChange={(e) => set('companyName', e.target.value)} maxLength={120} /></label>
        <label className="a-field"><span>TRN (tax registration number)</span><input className="a-input" value={v.trn} onChange={(e) => set('trn', e.target.value)} maxLength={30} inputMode="numeric" /></label>
        <label className="a-field"><span>Phone</span><input className="a-input" value={v.phone} onChange={(e) => set('phone', e.target.value)} maxLength={60} /></label>
        <label className="a-field"><span>Email</span><input className="a-input" value={v.email} onChange={(e) => set('email', e.target.value)} maxLength={200} /></label>
      </div>
      <label className="a-field"><span>Address</span><textarea className="a-input" rows={2} value={v.address} onChange={(e) => set('address', e.target.value)} maxLength={400} /></label>
      <label className="a-field"><span>Bank / payment details</span><textarea className="a-input" rows={3} value={v.bankDetails} onChange={(e) => set('bankDetails', e.target.value)} maxLength={600} placeholder="Bank name, account name, IBAN" /></label>
      <div className="a-row2">
        <label className="a-field"><span>Payment terms</span><input className="a-input" value={v.terms} onChange={(e) => set('terms', e.target.value)} maxLength={600} /></label>
        <label className="a-field"><span>Default days until due</span><input className="a-input" type="number" min="0" max="365" value={v.defaultDueDays} onChange={(e) => set('defaultDueDays', e.target.value)} /></label>
      </div>
      {err && <p className="a-error">{err}</p>}
      <div className="a-actions">
        <button type="button" className="a-btn" onClick={onDone}>Cancel</button>
        <button className="a-btn a-btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save details'}</button>
      </div>
    </form>
  );
}
