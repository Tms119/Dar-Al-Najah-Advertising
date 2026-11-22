const isDev = process.env.NODE_ENV !== 'production';

// Content Security Policy: only this site, Convex (data + uploaded images)
// and Vercel's preview toolbar may load resources.
// `admin` additionally lets the invoice PDF engine load its WebAssembly
// (data: URL) and run in a background worker (blob: URL). The public site
// keeps the stricter policy.
const buildCsp = ({ admin }) => [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${admin ? " 'wasm-unsafe-eval'" : ''}${isDev ? " 'unsafe-eval'" : ''} https://vercel.live https://va.vercel-scripts.com`,
  ...(admin ? ["worker-src 'self' blob:"] : []),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.convex.cloud https://*.convex.site https://vercel.com https://vercel.live",
  "font-src 'self' data: https://vercel.live",
  `connect-src 'self'${admin ? ' data: blob:' : ''} https://va.vercel-scripts.com https://*.convex.cloud wss://*.convex.cloud https://*.convex.site https://vercel.live wss://ws-us3.pusher.com`,
  "frame-src https://vercel.live",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const commonHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    // product & category photos uploaded through the admin (Convex file storage)
    remotePatterns: [{ protocol: 'https', hostname: '*.convex.cloud' }],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      { source: '/:path*', headers: commonHeaders },
      // everything except /admin gets the strict policy (one CSP header per page)
      { source: '/((?!admin(?:/|$)).*)', headers: [{ key: 'Content-Security-Policy', value: buildCsp({ admin: false }) }] },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: buildCsp({ admin: true }) },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      { source: '/studio/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
  // The Mockup Studio is its own site: point a subdomain such as
  // studio.daralnajahadv.com at this project and its home page is the studio.
  async rewrites() {
    return {
      beforeFiles: [{ source: '/', has: [{ type: 'host', value: 'studio\\..+' }], destination: '/studio' }],
    };
  },
};

export default nextConfig;
