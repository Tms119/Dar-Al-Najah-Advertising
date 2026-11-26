/* Shared inline icons (inherit colour via currentColor). */

export const WhatsAppIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    <path fill="currentColor" d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.2.6 4.4 1.7 6.3L3 29l7.3-1.9c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.1c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-4.3 1.1 1.2-4.2-.3-.4c-1-1.6-1.5-3.5-1.5-5.4 0-5.8 4.7-10.5 10.6-10.5s10.6 4.7 10.6 10.5S21.9 26.1 16 26.1zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1c-.3-.2-1.3-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2s0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5s0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5 1.1 2.9 1.2 3.1 2.1 3.2 5.1 4.5c.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.9-.8 2.1-1.5s.3-1.3.2-1.5c0-.1-.3-.2-.6-.4z" />
  </svg>
);

export const DownloadIcon = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v11M7 10.5l5 5 5-5" /><path d="M5 19.5h14" />
  </svg>
);

/* Social icons, drawn for this site: same weight as the other icons and
   coloured by currentColor, so they follow the pill they sit in. */
export const InstagramIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const FacebookIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path fill="currentColor" d="M13.6 21.5v-7.7h2.6l.4-3.1h-3V8.8c0-.9.3-1.5 1.5-1.5h1.6V4.6a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3.1h2.6v7.7h3.1z" />
  </svg>
);

export const TikTokIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path fill="currentColor" d="M16.6 3h-3.2v12.3a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.5a5.8 5.8 0 1 0 5 5.8V9.1a7.5 7.5 0 0 0 4.4 1.4V7.3c-2.4 0-4.2-1.9-4.4-4.3z" />
  </svg>
);

/** Icon for a social profile by name (see SOCIALS in data/site.js). */
export const SOCIAL_ICONS = { Instagram: InstagramIcon, Facebook: FacebookIcon, TikTok: TikTokIcon };
