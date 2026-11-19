import { Suspense } from 'react';
import { Bricolage_Grotesque, Inter_Tight } from 'next/font/google';
import { ConvexAuthNextjsServerProvider } from '@/lib/convexAuth';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', axes: ['wdth', 'opsz'] });
const body = Inter_Tight({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Dar Al Najah Advertising — Printing, Embroidery & Gifts in Dubai',
  description: 'Business cards, flyers, roll-ups, packaging, embroidery, corporate gifts and photo studio services in Dubai. Same-day printing available.',
};

export const viewport = { themeColor: '#F6F2EC' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable}`}>
      <body>
        <Suspense>
          <ConvexAuthNextjsServerProvider>{children}</ConvexAuthNextjsServerProvider>
        </Suspense>
      </body>
    </html>
  );
}
