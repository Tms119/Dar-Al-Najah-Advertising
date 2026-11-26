'use client';

import { usePathname } from 'next/navigation';
import { waAbout, waLink } from '@/data/site';
import { WhatsAppIcon } from './icons';

const TEXT = 'Hi Dar Al Najah! I need help with a print order.';

/* Floating chat button. Away from the home page, the message carries the
   page the visitor is on, so staff know what they were looking at. */
export default function WhatsAppFab() {
  const pathname = usePathname();
  const href = pathname && pathname !== '/' ? waAbout(TEXT, pathname) : waLink(TEXT);
  return (
    <a className="wa-fab" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <WhatsAppIcon size={26} />
      <span>Chat with us</span>
    </a>
  );
}
