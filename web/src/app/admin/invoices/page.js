'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import { api } from '@convex/_generated/api';
import { aed, fmtDate, todayMs, STATUS_LABEL } from '@/lib/invoice';

const TABS = [null, 'draft', 'issued', 'paid', 'void'];

export default function AdminInvoices() {
  const [status, setStatus] = useState(null);
  const [q, setQ] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const all = useQuery(api.invoices.list, { status: null });

  const list = useMemo(() => (all ?? [])
    .filter((i) => !status || i.status === status)
    .filter((i) => !q || `${i.number} ${i.customerName}`.toLowerCase().includes(q.toLowerCase())), [all, status, q]);

  const today = todayMs();
  const outstanding = (all ?? []).filter((i) => i.status === 'issued');
  const overdue = outstanding.filter((i) => i.dueDate && i.dueDate < today);
  const monthStart = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1);
  const paidMonth = (all ?? []).filter((i) => i.status === 'paid' && i.issueDate >= monthStart);
  const sum = (rows) => rows.reduce((a, i) => a + i.total, 0);

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

      <div className="a-stats inv-stats">
        <div className="a-stat"><span>Outstanding</span><b>{all ? aed(sum(outstanding)) : '…'}</b><small className={overdue.length ? 'is-warn' : 'a-muted'}>{outstanding.length} unpaid{overdue.length ? `, ${overdue.length} overdue` : ''}</small></div>
        <div className="a-stat"><span>Paid this month</span><b>{all ? aed(sum(paidMonth)) : '…'}</b><small className="a-muted">{paidMonth.length} invoices</small></div>
      </div>

      <div className="a-toolbar">
        <div className="a-tabs" style={{ marginBottom: 0 }}>
          {TABS.map((s) => (
            <button key={s ?? 'all'} className={`a-tab ${status === s ? 'is-active' : ''}`} onClick={() => setStatus(s)}>{s ? STATUS_LABEL[s] : 'All'}</button>
          ))}
        </div>
        <input className="a-input" placeholder="Search number or customer…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="a-card a-table-wrap">
        {all === undefined ? <p className="a-muted" style={{ padding: 20 }}>Loading…</p> : list.length === 0 ? (
          <div className="inv-empty">
            <p>{all.length ? 'No invoices match.' : 'No invoices yet.'}</p>
            {!all.length && <Link href="/admin/invoices/new" className="a-btn a-btn-primary">Create your first invoice</Link>}
          </div>
        ) : (
          <table className="a-table inv-table">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Issued</th><th>Due</th><th>Total</th><th>Status</th><th aria-hidden="true" /></tr></thead>
            <tbody>
              {list.map((i) => {
                const late = i.status === 'issued' && i.dueDate && i.dueDate < today;
                return (
                  <tr key={i._id} className={`inv-row-link ${i.status === 'void' ? 'is-off' : ''}`}>
                    {/* the link stretches over the whole row (see .inv-num-link::after) */}
                    <td><Link href={`/admin/invoices/${i._id}`} className="inv-num-link" aria-label={`Open invoice ${i.number}, ${i.customerName || 'no name'}, ${aed(i.total)}`}>{i.number}</Link></td>
                    <td>{i.customerName || <span className="a-muted">No name</span>}</td>
                    <td>{fmtDate(i.issueDate)}</td>
                    <td className={late ? 'is-warn' : ''}>{i.dueDate ? fmtDate(i.dueDate) : 'On receipt'}{late ? ' · overdue' : ''}</td>
                    <td><b>{aed(i.total)}</b></td>
                    <td><span className={`inv-badge st-${i.status}`}>{STATUS_LABEL[i.status]}</span></td>
                    <td className="inv-chev" aria-hidden="true">›</td>
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
    } catch (e2) { setErr(e2 instanceof ConvexError ? String(e2.data) : 'Could not save.'); } finally { setBusy(false); }
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
