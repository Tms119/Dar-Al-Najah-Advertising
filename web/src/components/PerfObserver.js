'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/* Pauses looping CSS animations (floaters, marquees, bobbing mocks) while
   their section is off-screen, so the GPU only works on what you can see. */
const SELECTOR = '.hero, .marquee-wrap, .stack-card, .mega';

export default function PerfObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-paused', !e.isIntersecting)),
      { rootMargin: '100px 0px' },
    );
    document.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
