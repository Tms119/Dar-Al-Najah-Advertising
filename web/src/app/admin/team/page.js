'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import { api } from '@convex/_generated/api';

const errText = (e) => (e instanceof ConvexError ? String(e.data) : 'Something went wrong.');

function genPassword() {
  const a = new Uint8Array(12);
  crypto.getRandomValues(a);
  return 'Dn-' + btoa(String.fromCharCode(...a)).replace(/[+/=]/g, '').slice(0, 14);
}

export default function AdminTeam() {
  const team = useQuery(api.team.list);
  const create = useMutation(api.team.create);
  const remove = useMutation(api.team.remove);
  const changePassword = useMutation(api.auth.changePassword);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [pwMsg, setPwMsg] = useState(null);

  const onCreate = async (e) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      await create({ username, password });
      setMsg(`Account "${username.trim().toLowerCase()}" created. Share the username and password with them privately. They can change the password after signing in.`);
      setUsername(''); setPassword('');
    } catch (e2) { setErr(errText(e2)); } finally { setBusy(false); }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    try {
      const r = await changePassword({ currentPassword: cur, newPassword: next, signOutOtherSessions: true });
      if (r.success) { setPwMsg({ ok: true, text: 'Password changed. Other sessions were signed out.' }); setCur(''); setNext(''); return; }
      const e2 = r.userError;
      setPwMsg({ ok: false, text:
        e2.error === 'INVALID_CREDENTIALS' ? 'Current password is incorrect.'
        : e2.error === 'PASSWORD_TOO_SHORT' ? `New password must be at least ${e2.minimumLength} characters.`
        : e2.error === 'PASSWORD_TOO_COMMON' ? 'That password is too common.'
        : e2.error === 'RATE_LIMITED' ? 'Too many attempts. Wait a moment and try again.'
        : 'Could not change password.' });
    } catch (e3) { setPwMsg({ ok: false, text: errText(e3) }); }
  };

  return (
    <>
      <header className="a-head">
        <div>
          <h1>Team</h1>
          <p className="a-muted">This is an internal dashboard with no public sign up. Only admins can add accounts here.</p>
        </div>
      </header>

      <div className="a-grid">
        <div className="a-col">
          <section className="a-card">
            <h2>Staff accounts</h2>
            {team === undefined ? <p className="a-muted">Loading…</p> : (
              <ul className="a-list">
                {team.map((m) => (
                  <li key={m._id}>
                    <div className="a-member">
                      <span className="a-avatar">{m.username[0].toUpperCase()}</span>
                      <div>
                        <b>{m.username}</b>{m.isMe && <span className="a-tag-off">you</span>}
                        <div className="a-muted a-small">Added {new Date(m.created).toLocaleDateString()}</div>
                      </div>
                    </div>
                    {!m.isMe && (
                      <button className="a-btn a-btn-sm a-btn-danger" onClick={() => window.confirm(`Remove "${m.username}"? They will lose access immediately.`) && remove({ userId: m._id }).catch((e2) => setErr(errText(e2)))}>
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="a-col">
          <form className="a-card" onSubmit={onCreate}>
            <h2>Add a staff account</h2>
            <label className="a-field"><span>Username</span>
              <input className="a-input" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. ahmed" autoCapitalize="none" spellCheck={false} autoComplete="off" />
            </label>
            <label className="a-field"><span>Temporary password (min. 10 characters)</span>
              <div className="a-value" style={{ marginBottom: 0 }}>
                <input className="a-input" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                <button type="button" className="a-btn a-btn-sm" onClick={() => setPassword(genPassword())}>Generate</button>
              </div>
            </label>
            {err && <p className="a-error" role="alert">{err}</p>}
            {msg && <p className="a-ok">{msg}</p>}
            <button className="a-btn a-btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
          </form>

          <form className="a-card" onSubmit={onChangePassword}>
            <h2>Change my password</h2>
            <label className="a-field"><span>Current password</span>
              <input className="a-input" type="password" required value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
            </label>
            <label className="a-field"><span>New password (min. 10 characters)</span>
              <input className="a-input" type="password" required minLength={10} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
            </label>
            {pwMsg && <p className={pwMsg.ok ? 'a-ok' : 'a-error'}>{pwMsg.text}</p>}
            <button className="a-btn a-btn-primary">Update password</button>
          </form>
        </div>
      </div>
    </>
  );
}
