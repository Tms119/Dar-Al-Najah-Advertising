import { waLink } from '@/data/site';
import { WhatsAppIcon } from './icons';

export default function WhatsAppFab() {
  return (
    <a className="wa-fab" href={waLink('Hi Dar Al Najah! I need help with a print order.')} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <WhatsAppIcon size={26} />
      <span>Chat with us</span>
    </a>
  );
}
