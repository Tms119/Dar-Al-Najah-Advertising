'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Photo from '@/components/Photo';
import { WhatsAppIcon } from '@/components/icons';
import { waAbout } from '@/data/site';
import { EXHIBITION, EXHIBITION_GROUPS, EXHIBITION_PHOTOS, EXHIBITION_SERVICES } from '@/data/exhibitions';

/* Exhibitions: same header and chips as the category pages, then a gallery of
   example stands and displays (the kinds of jobs the shop takes on; each opens
   full size), what we make, and a WhatsApp CTA. */

const groupName = (id) => EXHIBITION_GROUPS.find((g) => g.id === id)?.name ?? '';

function Lightbox({ photos, index, onClose, onMove }) {
  const p = photos[index];
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    const prev = document.activeElement;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [onClose, onMove]);

  return (
    <div className="ex-lightbox" role="dialog" aria-modal="true" aria-label={p.title} onClick={onClose}>
      <figure className="ex-lb-figure" onClick={(e) => e.stopPropagation()}>
        <div className="ex-lb-frame" style={{ aspectRatio: `${p.width} / ${p.height}`, '--ar': p.width / p.height }}>
          <Photo key={p.src} src={p.src} alt={p.title} fill eager sizes="(max-width: 980px) 100vw, 80vw" className="ex-lb-img" />
        </div>
        <figcaption>
          <strong>{p.title}</strong>
          <span>{groupName(p.group)} · {index + 1} of {photos.length}</span>
          <a className="btn btn-wa ex-lb-ask" href={waAbout(`Hi Dar Al Najah! I'd like a quote for an exhibition display like this: ${p.title}.`, p.src)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={16} /> Ask for one like this
          </a>
        </figcaption>
      </figure>
      <button ref={closeRef} className="ex-lb-btn ex-lb-close" onClick={onClose} aria-label="Close">✕</button>
      {photos.length > 1 && (
        <>
          <button className="ex-lb-btn ex-lb-prev" onClick={(e) => { e.stopPropagation(); onMove(-1); }} aria-label="Previous photo">←</button>
          <button className="ex-lb-btn ex-lb-next" onClick={(e) => { e.stopPropagation(); onMove(1); }} aria-label="Next photo">→</button>
        </>
      )}
    </div>
  );
}

export default function ExhibitionsView() {
  const [group, setGroup] = useState('all');
  const [open, setOpen] = useState(null); // index into `shown`

  const shown = useMemo(
    () => EXHIBITION_PHOTOS.filter((p) => group === 'all' || p.group === group),
    [group],
  );
  const close = useCallback(() => setOpen(null), []);
  const move = useCallback((d) => setOpen((i) => (i === null ? i : (i + d + shown.length) % shown.length)), [shown.length]);

  return (
    <div className="catalog page-pad ex-page" style={{ '--c': EXHIBITION.color, '--t': EXHIBITION.tint }}>
      <div className="container">
        <header className="cat-head" style={{ '--c': EXHIBITION.color }}>
          <span className="eyebrow">Exhibitions & events</span>
          <h1 className="display xl">Exhibition Stands</h1>
          <p className="muted">We take on exhibition booths, pop-up backdrops and event signage for trade shows, malls and launches across Dubai. Here are the kinds of stands and displays we make.</p>
        </header>

        <div className="group-chips">
          <button className={`chip ${group === 'all' ? 'is-active' : ''}`} onClick={() => setGroup('all')}>All examples</button>
          {EXHIBITION_GROUPS.map((g) => (
            <button key={g.id} className={`chip ${group === g.id ? 'is-active' : ''}`} onClick={() => setGroup(g.id)}>{g.name}</button>
          ))}
        </div>

        <p className="result-count">{shown.length} example{shown.length === 1 ? '' : 's'}. Tap one to see it full size.</p>

        <div className="ex-gallery" key={group}>
          {shown.map((p, i) => (
            <button key={p.src} className="ex-item" data-reveal style={{ '--d': `${(i % 3) * 70}ms` }} onClick={() => setOpen(i)}>
              <span className="ex-media">
                <Photo src={p.src} alt={p.title} fill eager={i < 3} sizes="(max-width: 640px) 100vw, (max-width: 1180px) 50vw, 33vw" className="ex-img" />
                <span className="p-cta">View <b>↗</b></span>
              </span>
              <span className="ex-cap">
                <strong>{p.title}</strong>
                <span>{groupName(p.group)}</span>
              </span>
            </button>
          ))}
        </div>

        <section className="ex-services">
          <div className="section-head" data-reveal>
            <span className="eyebrow">What we make</span>
            <h2 className="display sm">From one roll-up to a full stand</h2>
          </div>
          <div className="pdp-info ex-services-grid">
            {EXHIBITION_SERVICES.map(([t, d, path], i) => (
              <div key={t} className="info-card" data-reveal style={{ '--d': `${i * 80}ms` }}>
                <div className="info-top">
                  <span className="info-ic">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
                  </span>
                  <span className="info-n">0{i + 1}</span>
                </div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ex-cta" data-reveal>
          <div>
            <h2 className="display sm">Planning an exhibition?</h2>
            <p>Like one of these? Send us the photo, the event, the stand size and the date. We reply fast with ideas and a quote.</p>
          </div>
          <div className="ex-cta-actions">
            <a className="btn btn-ink btn-wa" href={waAbout("Hi Dar Al Najah! I'm planning an exhibition stand.", '/exhibitions')} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} /> Ask on WhatsApp
            </a>
            <Link href="/products?cat=printing" className="btn btn-ghost">Roll-ups & banners <span className="btn-arrow">→</span></Link>
          </div>
        </section>
      </div>

      {open !== null && shown[open] && <Lightbox photos={shown} index={open} onClose={close} onMove={move} />}
    </div>
  );
}
