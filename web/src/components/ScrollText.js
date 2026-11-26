'use client';

import { useEffect, useRef } from 'react';

/* Big paragraph whose words "ink in" as you scroll (two26-style).
   Words wrapped in *asterisks* get the accent colour; pills pop in at set progress.
   Perf: no React state on scroll — one rAF per frame toggles classes directly,
   and only on the words whose state actually changed. */
export default function ScrollText({ text, pills = [] }) {
  const ref = useRef(null);
  const words = text.split(' ');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll('.sw');
    const pillEls = el.querySelectorAll('.float-pill');
    let lit = -1;
    let raf = 0;
    let visible = false;

    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const next = Math.ceil(p * spans.length * 1.1);
      if (next !== lit) {
        const [from, to, on] = next > lit ? [Math.max(lit, 0), next, true] : [next, lit, false];
        for (let i = from; i < Math.min(to, spans.length); i++) spans[i].classList.toggle('on', on);
        lit = next;
      }
      pills.forEach((pl, i) => pillEls[i]?.classList.toggle('on', p > pl.at));
    };
    const onScroll = () => { if (visible && !raf) raf = requestAnimationFrame(update); };

    // only listen while the block is near the viewport
    // on enter AND exit run one update, so a fast fling past the block still
    // leaves it fully lit (scrolled past) or unlit (not reached yet)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!raf) raf = requestAnimationFrame(update);
    }, { rootMargin: '20% 0px' });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pills]);

  return (
    <div className="scroll-text" ref={ref}>
      {/* screen readers get the plain sentence; the word-by-word reveal is visual only */}
      <p className="sr-only">{words.join(' ').replace(/\*/g, '')}</p>
      <p aria-hidden="true">
        {words.map((w, i) => (
          <span key={i} className={`sw ${w.startsWith('*') ? 'accent' : ''}`}>{w.replace(/\*/g, '')} </span>
        ))}
      </p>
      {pills.map((pl) => (
        <span
          key={pl.label}
          aria-hidden="true"
          className="float-pill"
          style={{ top: pl.top, left: pl.left, background: pl.bg, color: pl.color || '#fff', '--r': `${pl.rot || 0}deg` }}
        >
          {pl.label}
        </span>
      ))}
    </div>
  );
}
