'use client';

import { useEffect } from 'react';

/* Marks [data-reveal] elements with data-shown as they scroll into view.
   Uses an attribute (not className) so React re-renders never undo it,
   and a MutationObserver so elements added later (filters, routes) animate too. */
export default function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.setAttribute('data-shown', ''); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    const scan = () => document.querySelectorAll('[data-reveal]:not([data-shown])').forEach((el) => io.observe(el));

    // wait a tick so hydration settles before we touch the DOM
    const t = setTimeout(scan, 60);
    let raf = 0;
    const mo = new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { clearTimeout(t); cancelAnimationFrame(raf); mo.disconnect(); io.disconnect(); };
  }, []);
  return null;
}
