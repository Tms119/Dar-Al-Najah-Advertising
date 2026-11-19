'use client';

import { useEffect, useRef, useState } from 'react';

/* Big paragraph whose words "ink in" as you scroll (two26-style).
   Words wrapped in *asterisks* get the accent colour; pills float in at set progress. */
export default function ScrollText({ text, pills = [] }) {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      setP(Math.max(0, Math.min(1, prog)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  const lit = p * words.length * 1.1;

  return (
    <div className="scroll-text" ref={ref}>
      <p>
        {words.map((w, i) => {
          const accent = w.startsWith('*');
          const clean = w.replace(/\*/g, '');
          const on = i < lit;
          return (
            <span key={i} className={`sw ${on ? 'on' : ''} ${accent ? 'accent' : ''}`}>
              {clean}{' '}
            </span>
          );
        })}
      </p>
      {pills.map((pl, i) => (
        <span
          key={pl.label}
          className={`float-pill ${p > pl.at ? 'on' : ''}`}
          style={{ top: pl.top, left: pl.left, background: pl.bg, color: pl.color || '#fff', '--r': `${pl.rot || 0}deg` }}
        >
          {pl.label}
        </span>
      ))}
    </div>
  );
}
