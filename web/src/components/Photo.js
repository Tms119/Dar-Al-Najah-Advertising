'use client';

import Image from 'next/image';
import { useState } from 'react';

/* next/image with a loading state: a shimmering skeleton sits behind the
   photo until it has loaded, then the photo fades in. Use it inside a
   positioned box with `fill`, like the plain Image it wraps. Off-screen
   photos lazy-load (the default); pass `eager` for photos that are on screen
   at first paint, so the browser fetches them first. */
export default function Photo({ alt, className = '', eager = false, onLoad, ...props }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <span className="ph-skel" aria-hidden="true" />}
      <Image
        {...props}
        alt={alt}
        {...(eager ? { loading: 'eager', fetchPriority: 'high' } : null)}
        className={`ph-img ${loaded ? 'is-loaded' : ''} ${className}`}
        onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
        onError={() => setLoaded(true)}
      />
    </>
  );
}
