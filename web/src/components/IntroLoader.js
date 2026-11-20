'use client';

import { useEffect, useRef } from 'react';

/* First-visit loader (two26-style). The animation is pure CSS, so it plays
   even before JS loads; this component only takes it out of the layout once
   it has finished. Skipped entirely via [data-no-intro] (see boot script). */
export default function IntroLoader({ word }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const done = () => { el.style.display = 'none'; };
    if (document.documentElement.hasAttribute('data-no-intro')) return done();
    const onEnd = (e) => { if (e.animationName === 'introOut') done(); };
    el.addEventListener('animationend', onEnd);
    const t = setTimeout(done, 3000); // safety net
    return () => { el.removeEventListener('animationend', onEnd); clearTimeout(t); };
  }, []);

  return (
    <div className="intro" aria-hidden="true" ref={ref}>
      <div className="intro-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark-144.webp" alt="" width={92} height={87} className="intro-mark" fetchPriority="high" />
        <div className="intro-word">
          {[...word].map((c, i) => (
            <span key={i} style={{ '--i': i }}>{c === ' ' ? ' ' : c}</span>
          ))}
        </div>
        <div className="intro-sub">Advertising · Printing</div>
      </div>
      <div className="intro-bar" />
    </div>
  );
}
