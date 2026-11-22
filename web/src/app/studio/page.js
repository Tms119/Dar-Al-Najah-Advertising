'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import MockupStudio from '@/components/studio/MockupStudio';
import { WhatsAppIcon } from '@/components/icons';
import { waLink } from '@/data/site';

const STORAGE_KEY = 'dn-studio-code';

const readSaved = () => { try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; } };
const save = (code) => { try { code ? localStorage.setItem(STORAGE_KEY, code) : localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ } };

export default function StudioPage() {
  const [code, setCode] = useState(null); // null until the saved code has been read
  const [entry, setEntry] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // ?code=XXXX links log straight in; otherwise reuse the code saved on this device
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('code');
    if (fromUrl) {
      save(fromUrl); // saved first, so a repeated run of this effect still finds it
      window.history.replaceState(null, '', window.location.pathname);
    }
    setCode(readSaved()); // eslint-disable-line react-hooks/set-state-in-effect -- reads browser-only storage once
  }, []);

  const pass = useQuery(api.mockups.checkPass, code ? { code } : 'skip');

  // remember a working code on this device; forget one that stopped working
  useEffect(() => { if (pass) save(code); else if (pass === null) save(''); }, [pass, code]);

  const signOut = () => { save(''); setCode(''); setEntry(''); setSubmitted(false); };
  const onSubmit = (e) => { e.preventDefault(); setSubmitted(true); setCode(entry.trim()); };

  const signedIn = code && pass;
  const checking = code && pass === undefined;
  const invalid = submitted && code && pass === null;

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
            <MockupStudio code={code} pass={pass} />
          </>
        ) : (
          <form className="a-card st-gate" onSubmit={onSubmit}>
            <span className="st-gate-ic" aria-hidden="true">✦</span>
            <h1>Mockup Studio</h1>
            <p className="a-muted">Enter the access code you received from Dar Al Najah to start creating mockups.</p>
            <label className="a-field">
              <span>Access code</span>
              <input className="a-input st-code" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="XXXX-XXXX-XX" autoCapitalize="characters" autoComplete="off" spellCheck={false} required />
            </label>
            {invalid && <p className="a-error" role="alert">That code isn&apos;t valid or has been switched off.</p>}
            <button className="a-btn a-btn-primary a-btn-block" disabled={checking || code === null}>{checking ? 'Checking…' : 'Enter studio'}</button>
            <a className="st-ask" href={waLink('Hi Dar Al Najah! I would like access to the Mockup Studio.')} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={16} /> No code? Ask us on WhatsApp
            </a>
          </form>
        )}
      </main>

      <footer className="st-foot">
        <span>© {new Date().getFullYear()} Dar Al Najah Advertising</span>
        <span className="f-credit">Designed &amp; built by <b>PEERBROS</b> x <b>Themeszoo</b></span>
      </footer>
    </>
  );
}
