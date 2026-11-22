/*!
 * Dar Al Najah Advertising
 * Designed & built by PEERBROS x Themeszoo
 */
import { Suspense } from 'react';
import { Bricolage_Grotesque, Inter_Tight } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { ConvexAuthNextjsServerProvider } from '@/lib/convexAuth';
import IntroLoader from '@/components/IntroLoader';
import { SITE_URL } from '@/data/site';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', axes: ['wdth', 'opsz'], display: 'swap' });
const body = Inter_Tight({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Dar Al Najah Advertising | Printing, Embroidery & Gifts in Dubai',
    template: '%s | Dar Al Najah Advertising',
  },
  description: 'Business cards, flyers, roll up banners, packaging, embroidery, corporate gifts and photo studio services in Dubai. Same day printing available.',
  applicationName: 'Dar Al Najah Advertising',
  authors: [{ name: 'PEERBROS x Themeszoo' }],
  creator: 'PEERBROS x Themeszoo',
  openGraph: {
    type: 'website',
    siteName: 'Dar Al Najah Advertising',
    locale: 'en_AE',
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
};

export const viewport = { themeColor: '#F6F2EC', width: 'device-width', initialScale: 1 };

/* Runs before first paint:
   - data-lite: low-end device / data-saver / reduced motion → lighter effects
   - data-no-intro: skip the loader on repeat views this session, in admin/studio, or for reduced motion */
const bootScript = `(function(){var d=document.documentElement;try{var n=navigator,rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(rm||(n.hardwareConcurrency&&n.hardwareConcurrency<=4)||(n.deviceMemory&&n.deviceMemory<=4)||(n.connection&&n.connection.saveData))d.setAttribute('data-lite','');
if(rm||/^\/(admin|studio)/.test(location.pathname)||sessionStorage.getItem('dn-intro'))d.setAttribute('data-no-intro','');else sessionStorage.setItem('dn-intro','1');
}catch(e){d.setAttribute('data-no-intro','')}})();`;

const WORD = 'Dar Al Najah';

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* must run synchronously before first paint (next/script would defer it) */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <IntroLoader word={WORD} />

        <Suspense>
          <ConvexAuthNextjsServerProvider>{children}</ConvexAuthNextjsServerProvider>
        </Suspense>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
