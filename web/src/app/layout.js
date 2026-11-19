import { Bricolage_Grotesque, Inter_Tight } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import WhatsAppFab from '@/components/WhatsAppFab';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', axes: ['wdth', 'opsz'] });
const body = Inter_Tight({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: 'Dar Al Najah Advertising — Printing, Embroidery & Gifts in Dubai',
  description: 'Business cards, flyers, roll-ups, packaging, embroidery, corporate gifts and photo studio services in Dubai. Same-day printing available.',
};

export const viewport = { themeColor: '#F6F2EC' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFab />
        <RevealObserver />
      </body>
    </html>
  );
}
