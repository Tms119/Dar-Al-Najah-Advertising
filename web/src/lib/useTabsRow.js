'use client';

import { useEffect, useRef } from 'react';

/* For a sideways-scrolling row of tabs: brings the active tab into view on
   load, and marks the row `is-start` / `is-end` when there's nothing more
   on that side (or it all fits), which removes the fade on that edge. */
export function useTabsRow() {
  const ref = useRef(null);
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    const active = row.querySelector('.is-active');
    if (active) {
      // measured on screen, so padding or negative margins on the row don't matter
      const r = row.getBoundingClientRect();
      const a = active.getBoundingClientRect();
      row.scrollLeft += a.left - r.left - (r.width - a.width) / 2;
    }
    const update = () => {
      row.classList.toggle('is-start', row.scrollLeft <= 4);
      row.classList.toggle('is-end', row.scrollLeft + row.clientWidth >= row.scrollWidth - 4);
    };
    update();
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { row.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return ref;
}
