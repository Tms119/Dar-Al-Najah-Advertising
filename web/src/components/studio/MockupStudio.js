'use client';

import { useEffect, useRef, useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { DownloadIcon } from '@/components/icons';
import { waLink } from '@/data/site';
import { saveFile } from '@/lib/download';
import { errorMessage } from '@/lib/errors';

const QUICK = ['T shirt', 'Hoodie', 'Cap', 'Mug', 'Tote bag', 'Business card', 'Notebook', 'Pen', 'Water bottle', 'Roll up banner'];
const PLACEMENTS = [['auto', 'Best spot'], ['front', 'Centre front'], ['chest', 'Left chest'], ['back', 'Back'], ['wrap', 'All over']];
const STYLES = [['studio', 'Studio'], ['lifestyle', 'Lifestyle'], ['flatlay', 'Flat lay']];
const ASPECTS = [['square', 'Square'], ['portrait', 'Portrait'], ['landscape', 'Landscape']];
const MAX_SIDE = 512; // the image model accepts reference images up to 512px

/** Shrinks an image to 512px. Logos keep PNG and get a contrasting backdrop
    (light logos on dark, dark logos on white) so transparent areas stay clear. */
async function prepareImage(file, kind) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > 15 * 1024 * 1024) throw new Error('That image is over 15 MB. Please use a smaller one.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Could not read that image.')); i.src = url; });
    const w0 = img.naturalWidth || 512, h0 = img.naturalHeight || 512;
    const s = Math.min(1, MAX_SIDE / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * s)), h = Math.max(1, Math.round(h0 * s));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    let bg = '#ffffff';
    if (kind === 'logo') {
      g.drawImage(img, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data;
      let lum = 0, n = 0;
      for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 128) { lum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; n++; }
      if (n && lum / n > 215) bg = '#1f1f1f';
      g.clearRect(0, 0, w, h);
    }
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.drawImage(img, 0, 0, w, h);
    const type = kind === 'logo' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((res) => c.toBlob(res, type, 0.9));
    return { bytes: await blob.arrayBuffer(), type, preview: URL.createObjectURL(blob), name: file.name };
  } finally { URL.revokeObjectURL(url); }
}

function DropZone({ label, hint, value, onFile, onClear, busy }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const pick = (f) => f && onFile(f);
  return (
    <div
      className={`mk-drop ${over ? 'is-over' : ''} ${value ? 'has-file' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
    >
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.preview} alt="" />
          <div className="mk-drop-meta">
            <b>{value.name}</b>
            <span>
              <button type="button" className="mk-link" onClick={() => input.current?.click()}>Replace</button>
              <button type="button" className="mk-link is-danger" onClick={onClear}>Remove</button>
            </span>
          </div>
        </>
      ) : (
        <button type="button" className="mk-drop-btn" onClick={() => input.current?.click()} disabled={busy}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-9 9" /></svg>
          <b>{busy ? 'Reading…' : label}</b>
          <span>{hint}</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

const Seg = ({ value, options, onChange, label }) => (
  <div className="mk-seg" role="radiogroup" aria-label={label}>
    {options.map(([v, l]) => (
      <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? 'is-on' : ''} onClick={() => onChange(v)}>{l}</button>
    ))}
  </div>
);

/** The studio itself. `code` is the visitor's access code, `pass` its status
    from mockups.checkPass ({ label, used, limit, remaining }). */
export default function MockupStudio({ code, pass }) {
  const gallery = useQuery(api.mockups.passMockups, { code });
  const generate = useAction(api.mockups.generate);

  const [object, setObject] = useState(null);
  const [objectText, setObjectText] = useState('');
  const [logo, setLogo] = useState(null);
  const [text, setText] = useState('');
  const [placement, setPlacement] = useState('auto');
  const [style, setStyle] = useState('studio');
  const [aspect, setAspect] = useState('square');
  const [extra, setExtra] = useState('');
  const [reading, setReading] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!busy) return;
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(id);
  }, [busy]);

  const onFile = (kind) => async (file) => {
    setError(null); setReading(kind);
    try {
      const prepared = await prepareImage(file, kind);
      (kind === 'logo' ? setLogo : setObject)((old) => { if (old) URL.revokeObjectURL(old.preview); return prepared; });
    } catch (e) { setError(e.message); } finally { setReading(null); }
  };

  const hasObject = !!object || !!objectText.trim();
  const hasMark = !!logo || !!text.trim();
  const left = pass.remaining;
  const ready = hasObject && hasMark && !busy && left > 0;

  const onGenerate = async () => {
    if (!ready) return;
    setError(null); setBusy(true); setElapsed(0);
    try {
      const r = await generate({
        code,
        objectImage: object?.bytes ?? null,
        objectImageType: object?.type ?? '',
        objectText: object ? '' : objectText,
        logoImage: logo?.bytes ?? null,
        logoImageType: logo?.type ?? '',
        text, placement, style, aspect, extra,
      });
      setResult({ ...r, aspect });
    } catch (e) {
      setError(errorMessage(e));
    } finally { setBusy(false); }
  };

  const download = async (url, name) => {
    try {
      const blob = await (await fetch(url)).blob();
      const ext = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png';
      saveFile(new File([blob], `${name}.${ext}`, { type: blob.type }));
    } catch { setError('Could not download the image.'); }
  };
  const fileName = (m) => `mockup ${(m.text || m.objectLabel || 'design').replace(/[^\w ]+/g, '').trim().slice(0, 40)}`.trim();

  return (
    <>
      <div className="mk-grid">
        <form className="mk-form" onSubmit={(e) => { e.preventDefault(); onGenerate(); }}>
          <section className="a-card mk-step">
            <div className="mk-step-head"><i>1</i><h2>Product</h2></div>
            <DropZone label="Drop a product photo" hint="or click to choose. PNG, JPG or WebP" value={object} busy={reading === 'object'} onFile={onFile('object')} onClear={() => setObject(null)} />
            {!object && (
              <>
                <p className="mk-or"><span>or describe it</span></p>
                <input className="a-input" value={objectText} onChange={(e) => setObjectText(e.target.value)} maxLength={80} placeholder="e.g. black hoodie, white ceramic mug" />
                <div className="mk-chips">
                  {QUICK.map((q) => (
                    <button key={q} type="button" className={`mk-chip ${objectText.toLowerCase() === q.toLowerCase() ? 'is-on' : ''}`} onClick={() => setObjectText(q)}>{q}</button>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="a-card mk-step">
            <div className="mk-step-head"><i>2</i><h2>Logo and text</h2><span className="a-muted a-small">one or both</span></div>
            <DropZone label="Drop your logo" hint="PNG with a transparent background works best" value={logo} busy={reading === 'logo'} onFile={onFile('logo')} onClear={() => setLogo(null)} />
            <label className="a-field" style={{ marginTop: 12, marginBottom: 0 }}>
              <span>Text to print</span>
              <input className="a-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={60} placeholder="e.g. Gulf Events 2026" />
            </label>
          </section>

          <section className="a-card mk-step">
            <div className="mk-step-head"><i>3</i><h2>Look</h2></div>
            <div className="mk-opt"><span>Placement</span><Seg label="Placement" value={placement} options={PLACEMENTS} onChange={setPlacement} /></div>
            <div className="mk-opt"><span>Scene</span><Seg label="Scene" value={style} options={STYLES} onChange={setStyle} /></div>
            <div className="mk-opt"><span>Shape</span><Seg label="Shape" value={aspect} options={ASPECTS} onChange={setAspect} /></div>
            <label className="a-field" style={{ marginBottom: 0 }}>
              <span>Extra instructions <em className="a-muted">(optional)</em></span>
              <textarea className="a-input" rows={3} value={extra} onChange={(e) => setExtra(e.target.value)} maxLength={400} placeholder="e.g. navy fabric, gold foil print, on a wooden desk" />
            </label>
          </section>

          {error && <p className="a-error" role="alert">{error}</p>}
          <div className="mk-go">
            <button className="a-btn a-btn-primary mk-go-btn" disabled={!ready}>
              {busy ? <><span className="inv-spin" /> Generating… {elapsed}s</> : <>✦ Generate mockup</>}
            </button>
            <span className={`st-left ${left === 0 ? 'is-out' : ''}`}>{left} of {pass.limit} generations left</span>
            {!busy && left > 0 && (!hasObject || !hasMark) && (
              <span className="a-muted a-small">{!hasObject ? 'Add a product photo or describe the product.' : 'Add a logo or some text.'}</span>
            )}
          </div>
          {left === 0 && (
            <p className="st-out">
              You&apos;ve used all your generations. Want more, or ready to print one of these?{' '}
              <a href={waLink(`Hi Dar Al Najah! I used the Mockup Studio (${pass.label}) and would like to talk about printing.`)} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>.
            </p>
          )}
        </form>

        <aside className="mk-result-col">
          <div className={`a-card mk-result is-${result?.aspect ?? aspect}`}>
            {busy ? (
              <div className="mk-loading"><div className="mk-shimmer" /><p>Creating your mockup. This usually takes 5 to 20 seconds.</p></div>
            ) : result?.url ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.url} alt="Generated mockup" />
                <div className="mk-result-actions">
                  <button className="a-btn a-btn-primary" onClick={() => download(result.url, fileName({ text, objectLabel: objectText }))}>Download</button>
                  <button className="a-btn" onClick={onGenerate} disabled={!ready}>{left > 0 ? `Try again (${left} left)` : 'No generations left'}</button>
                </div>
              </>
            ) : (
              <div className="mk-empty">
                <span aria-hidden="true">✦</span>
                <p>Your mockup will appear here.</p>
                <small className="a-muted">You have {pass.limit} generations. Each one comes out a little different.</small>
              </div>
            )}
          </div>
        </aside>
      </div>

      {gallery?.length > 0 && (
        <section className="mk-gallery">
          <div className="a-card-head"><h2>Your mockups</h2></div>
          <div className="mk-gallery-grid">
            {gallery.map((m) => (
              <figure key={m._id} className="mk-tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.url && <img src={m.url} alt={`Mockup: ${m.objectLabel}${m.text ? `, ${m.text}` : ''}`} loading="lazy" onClick={() => setResult({ id: m._id, url: m.url, aspect: m.aspect })} />}
                <figcaption>
                  <span>{m.text || (m.hadLogo ? 'Logo' : '')}<small>{m.objectLabel}</small></span>
                  <span className="mk-tile-actions">
                    <button className="inv-qa-btn" onClick={() => download(m.url, fileName(m))} title="Download" aria-label="Download mockup"><DownloadIcon size={16} /></button>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
