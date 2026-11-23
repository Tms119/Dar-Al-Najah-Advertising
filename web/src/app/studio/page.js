'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import MockupStudio from '@/components/studio/MockupStudio';
import { WhatsAppIcon } from '@/components/icons';
import { waLink } from '@/data/site';

// the session key (not the access code) is what this device remembers
const STORAGE_KEY = 'dn-studio-session';

const readSaved = () => { try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; } };
const save = (token) => { try { token ? localStorage.setItem(STORAGE_KEY, token) : localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ } };

/** Exchanges an access code for a session key through the website server. */
async function signIn(code) {
  const res = await fetch('/api/studio/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data.token;
}

export default function StudioPage() {
  const [token, setToken] = useState(null); // null until the saved session has been read
  const [entry, setEntry] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const endSession = useMutation(api.mockups.endSession);

  const start = async (code) => {
    setBusy(true); setError(null);
    try { const t = await signIn(code); save(t); setToken(t); setEntry(''); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  // a ?code=XXXX link signs straight in; otherwise reuse this device's session
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('code');
    if (fromUrl) window.history.replaceState(null, '', window.location.pathname);
    setToken(readSaved()); // eslint-disable-line react-hooks/set-state-in-effect -- reads browser-only storage once
    if (fromUrl) start(fromUrl);
  }, []);

  const pass = useQuery(api.mockups.session, token ? { token } : 'skip');

  // forget a session that has ended (pass switched off, deleted or expired)
  useEffect(() => { if (pass === null) { save(''); setToken(''); } }, [pass]); // eslint-disable-line react-hooks/set-state-in-effect -- syncs with server state

  const signOut = () => { if (token) endSession({ token }).catch(() => {}); save(''); setToken(''); setEntry(''); setError(null); };
  const onSubmit = (e) => { e.preventDefault(); if (entry.trim()) start(entry.trim()); };

  const signedIn = token && pass;
  const checking = busy || (token && pass === undefined);

  return (
    <>
      <header className="st-top">
        <a href="/studio" className="st-brand">
          <Image src="/brand/mark-144.webp" alt="" width={40} height={38} priority />
          <span><b>Mockup Studio</b><small>by Dar Al Najah Advertising</small></span>
        </a>
        {signedIn && (
          <div className="st-who">
            <span>{pass.label}</span>
            <button className="a-btn a-btn-sm" onClick={signOut}>Sign out</button>
          </div>
        )}
      </header>

      <main className="st-main">
        {signedIn ? (
          <>
            <div className="st-intro">
              <h1>See your logo on the product</h1>
              <p className="a-muted">Drop a product and your logo or text, choose the look, and generate a realistic print mockup.</p>
            </div>
            <MockupStudio token={token} pass={pass} />
          </>
        ) : (
          <form className="a-card st-gate" onSubmit={onSubmit}>
            <span className="st-gate-ic" aria-hidden="true">✦</span>
            <h1>Mockup Studio</h1>
            <p className="a-muted">Enter the access code you received from Dar Al Najah to start creating mockups.</p>
            <label className="a-field">
              <span>Access code</span>
              <input className="a-input st-code" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="XXXX-XXXX-XX" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={20} required />
            </label>
            {error && <p className="a-error" role="alert">{error}</p>}
            <button className="a-btn a-btn-primary a-btn-block" disabled={checking || token === null}>{checking ? 'Checking…' : 'Enter studio'}</button>
            <a className="st-ask" href={waLink('Hi Dar Al Najah! I would like access to the Mockup Studio.')} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={16} /> No code? Ask us on WhatsApp
            </a>
          </form>
        )}
      </main>

      <footer className="st-foot">
        <span>© {new Date().getFullYear()} Dar Al Najah Advertising</span>
      </footer>
    </>
  );
}
