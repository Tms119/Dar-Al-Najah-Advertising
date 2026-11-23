'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import Toggle from '@/components/admin/Toggle';
import { DownloadIcon } from '@/components/icons';
import { saveFile } from '@/lib/download';
import { errorMessage } from '@/lib/errors';

/* Admin side of the Mockup Studio: issue access passes (3 generations each)
   and see everything customers have generated. The studio itself is the
   standalone site at /studio. */
export default function StudioAccess() {
  const status = useQuery(api.mockups.status);
  const passes = useQuery(api.mockups.listPasses);
  const gallery = useQuery(api.mockups.list);
  const createPass = useMutation(api.mockups.createPass);
  const setActive = useMutation(api.mockups.setPassActive);
  const resetPass = useMutation(api.mockups.resetPass);
  const deletePass = useMutation(api.mockups.deletePass);
  const removeMockup = useMutation(api.mockups.remove);

  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [copied, setCopied] = useState(null);

  // full address of the studio, shown once the page is in the browser
  const [studioHome, setStudioHome] = useState('');
  useEffect(() => { setStudioHome(`${window.location.origin}/studio`); }, []); // eslint-disable-line react-hooks/set-state-in-effect -- browser-only value

  const studioUrl = (code) => `${window.location.origin}/studio?code=${encodeURIComponent(code)}`;
  const run = async (fn) => { setMsg(null); try { await fn(); } catch (e) { setMsg({ err: true, text: errorMessage(e) }); } };

  const onCreate = (e) => {
    e.preventDefault();
    setBusy(true);
    run(async () => {
      const r = await createPass({ label });
      setLabel('');
      setMsg({ text: `Pass created for ${label.trim()}: ${r.code}. Copy the link and send it to them.` });
    }).finally(() => setBusy(false));
  };

  const copy = async (what, value) => {
    try { await navigator.clipboard.writeText(value); setCopied(what); setTimeout(() => setCopied(null), 1600); }
    catch { setMsg({ err: true, text: 'Could not copy. Select the code and copy it manually.' }); }
  };

  const download = async (url, name) => {
    try {
      const blob = await (await fetch(url)).blob();
      saveFile(new File([blob], `${name}.${blob.type === 'image/jpeg' ? 'jpg' : 'png'}`, { type: blob.type }));
    } catch { setMsg({ err: true, text: 'Could not download the image.' }); }
  };

  return (
    <>
      <header className="a-head">
        <div>
          <h1>Studio access</h1>
          <p className="a-muted">The Mockup Studio is a separate site. Give a customer a pass and they get 3 mockup generations.</p>
        </div>
      </header>

      <section className="a-card sa-link">
        <div>
          <span className="sa-link-label">Studio website</span>
          <a href="/studio" target="_blank" rel="noreferrer" className="sa-link-url">{studioHome || '/studio'}</a>
          <p className="a-muted a-small">Customers open this and enter their access code, or use the personal link from Copy link below.</p>
        </div>
        <div className="a-actions">
          <button type="button" className="a-btn" onClick={() => copy('studio-home', studioHome)}>{copied === 'studio-home' ? 'Copied ✓' : 'Copy'}</button>
          <a href="/studio" target="_blank" rel="noreferrer" className="a-btn a-btn-primary">Open studio ↗</a>
        </div>
      </section>

      {status && !status.connected && (
        <div className="a-card mk-setup">
          <b>The image service isn&apos;t connected yet.</b>
          <p className="a-muted a-small">Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in the Convex dashboard (Settings, Environment variables).</p>
        </div>
      )}

      <form className="a-card sa-create" onSubmit={onCreate}>
        <label className="a-field" style={{ margin: 0, flex: 1 }}>
          <span>New pass for</span>
          <input className="a-input" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} placeholder="Customer or company name" required />
        </label>
        <button className="a-btn a-btn-primary" disabled={busy}>{busy ? 'Creating…' : '+ Create pass'}</button>
      </form>
      {msg && <p className={msg.err ? 'a-error' : 'a-ok'} role="status">{msg.text}</p>}

      <div className="a-card a-table-wrap">
        {passes === undefined ? <p className="a-muted">Loading…</p> : passes.length === 0 ? (
          <p className="a-muted">No passes yet. Create one above and send the link to your customer.</p>
        ) : (
          <table className="a-table sa-table">
            <thead><tr><th>For</th><th>Code</th><th>Used</th><th>Active</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {passes.map((p) => (
                <tr key={p._id} className={p.isActive ? '' : 'is-off'}>
                  <td><b>{p.label}</b><div className="a-muted a-small">{new Date(p._creationTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div></td>
                  <td><code className="sa-code">{p.code}</code></td>
                  <td><span className={`sa-used ${p.used >= p.limit ? 'is-out' : ''}`}>{p.used} / {p.limit}</span></td>
                  <td><Toggle checked={p.isActive} onChange={(v) => run(() => setActive({ id: p._id, isActive: v }))} label={`Pass for ${p.label} active`} /></td>
                  <td className="a-actions">
                    <button className="a-btn a-btn-sm" onClick={() => copy(`link-${p._id}`, studioUrl(p.code))}>{copied === `link-${p._id}` ? 'Copied ✓' : 'Copy link'}</button>
                    <button className="a-btn a-btn-sm a-btn-ghost" onClick={() => copy(`code-${p._id}`, p.code)}>{copied === `code-${p._id}` ? 'Copied ✓' : 'Copy code'}</button>
                    {p.used > 0 && <button className="a-btn a-btn-sm a-btn-ghost" onClick={() => window.confirm(`Give ${p.label} a fresh ${p.limit} generations?`) && run(() => resetPass({ id: p._id }))}>Top up</button>}
                    <button className="a-btn a-btn-sm a-btn-danger" onClick={() => window.confirm(`Delete the pass for ${p.label} and its mockups? This can't be undone.`) && run(() => deletePass({ id: p._id }))} aria-label="Delete pass">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <section className="mk-gallery">
        <div className="a-card-head"><h2>Generated mockups</h2>{gallery?.length ? <span className="a-muted a-small">{gallery.length} latest</span> : null}</div>
        {gallery === undefined ? <p className="a-muted">Loading…</p> : gallery.length === 0 ? (
          <p className="a-muted a-small">Mockups made in the studio appear here.</p>
        ) : (
          <div className="mk-gallery-grid">
            {gallery.map((m) => (
              <figure key={m._id} className="mk-tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.url && <img src={m.url} alt={`Mockup: ${m.objectLabel}`} loading="lazy" />}
                <figcaption>
                  <span>{m.passLabel}<small>{m.text || (m.hadLogo ? 'Logo' : '')} · {m.objectLabel}</small></span>
                  <span className="mk-tile-actions">
                    <button className="inv-qa-btn" onClick={() => download(m.url, `mockup ${m.passLabel}`)} title="Download" aria-label="Download mockup"><DownloadIcon size={16} /></button>
                    <button className="inv-qa-btn mk-del" onClick={() => window.confirm('Delete this mockup?') && run(() => removeMockup({ id: m._id }))} title="Delete" aria-label="Delete mockup">✕</button>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
