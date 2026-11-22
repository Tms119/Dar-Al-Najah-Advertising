'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '@convex/_generated/api';
import Logo from '@/components/Logo';

/* Simple consistent line icons (24px grid, 1.8 stroke) */
const Icon = ({ name }) => {
  const p = {
    overview: <><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></>,
    products: <><path d="M12 2.8 20.5 7.4v9.2L12 21.2 3.5 16.6V7.4z" /><path d="M3.8 7.6 12 12l8.2-4.4M12 12v9" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h10" /></>,
    quotes: <><path d="M4 5h16v11H8.5L4 20z" /><path d="M8 9.5h8M8 12.5h5" /></>,
    invoices: <><path d="M6 2.8h9l4 4v14.4l-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5-2.5-1.5L6 21.2z" /><path d="M9 10h6M9 13.5h6M9 7h3" /></>,
    mockups: <><path d="M12 3.5l1.6 4.2 4.4 1.6-4.4 1.6L12 15.1l-1.6-4.2L6 9.3l4.4-1.6z" /><path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /><path d="M5.5 15.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L3.5 17.5l1.4-.6z" /></>,
    team: <><circle cx="9" cy="8" r="3.2" /><path d="M3 19.5c.6-3.3 3-5.3 6-5.3s5.4 2 6 5.3" /><circle cx="17" cy="9" r="2.4" /><path d="M16.5 14.3c2.3.2 4 1.9 4.5 4.7" /></>,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
    logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 16l-4-4 4-4M6 12h10" /></>,
    open: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  }[name];
  return <svg className="a-ic" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p}</svg>;
};

const GROUPS = [
  { label: 'Shop', items: [
    { href: '/admin', label: 'Overview', icon: 'overview' },
    { href: '/admin/products', label: 'Products', icon: 'products' },
    { href: '/admin/menu', label: 'Menu & categories', short: 'Menu', icon: 'menu' },
  ] },
  { label: 'Sales', items: [
    { href: '/admin/quotes', label: 'Quote requests', short: 'Quotes', icon: 'quotes', count: 'newQuotes' },
    { href: '/admin/invoices', label: 'Invoices', icon: 'invoices', count: 'unpaidInvoices' },
    { href: '/admin/mockups', label: 'Mockup studio', short: 'Mockups', icon: 'mockups' },
  ] },
  { label: 'Settings', items: [
    { href: '/admin/team', label: 'Team', icon: 'team' },
  ] },
];
const ALL = GROUPS.flatMap((g) => g.items);
const isActive = (href, pathname) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

export default function AdminShell({ children }) {
  const pathname = usePathname();
  if (pathname === '/admin/signin') return children;
  return <Guarded pathname={pathname}>{children}</Guarded>;
}

function Guarded({ pathname, children }) {
  const me = useQuery(api.users.me);
  const counts = useQuery(api.admin.overview, me?.isAdmin ? {} : 'skip');
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const doSignOut = async () => { await signOut(); router.replace('/admin/signin'); router.refresh(); };

  if (me === undefined) return <div className="a-loading">Loading…</div>;
  if (me === null) {
    return <div className="a-auth"><div className="a-auth-card"><p>Your session has ended.</p><Link className="a-btn a-btn-primary" href="/admin/signin">Sign in</Link></div></div>;
  }
  if (!me.isAdmin) {
    return (
      <div className="a-auth">
        <div className="a-auth-card">
          <Logo />
          <h1>Waiting for access</h1>
          <p className="a-muted">You&apos;re signed in as <b>{me.username}</b>, but this account isn&apos;t an admin. Ask the owner to add it under Team.</p>
          <button className="a-btn" onClick={doSignOut}>Sign out</button>
        </div>
      </div>
    );
  }

  const current = ALL.find((i) => isActive(i.href, pathname));
  const badge = (item) => (item.count && counts?.[item.count] ? counts[item.count] : 0);

  const navList = (variant) => (
    <nav className={`a-nav-list ${variant}`} aria-label="Admin">
      {GROUPS.map((g) => (
        <div key={g.label} className="a-nav-group">
          <span className="a-nav-group-label">{g.label}</span>
          {g.items.map((item) => {
            const n = badge(item);
            const active = isActive(item.href, pathname);
            return (
              <Link key={item.href} href={item.href} className={`a-nav ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined} title={item.label}>
                <Icon name={item.icon} />
                <span className="a-nav-label">{item.label}</span>
                <span className="a-nav-short">{item.short ?? item.label}</span>
                {n > 0 && <span className="a-count" aria-label={`${n} new`}>{n > 99 ? '99+' : n}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const userBlock = (
    <div className="a-side-foot">
      <a href="/" target="_blank" rel="noreferrer" className="a-nav a-nav-quiet" title="View website">
        <Icon name="external" /><span className="a-nav-label">View website</span><span className="a-nav-short">Site</span>
      </a>
      <div className="a-user">
        <span className="a-avatar" aria-hidden="true">{me.username?.[0]?.toUpperCase()}</span>
        <span className="a-user-name">{me.username}</span>
        <button className="a-icon-btn" onClick={doSignOut} title="Sign out" aria-label="Sign out"><Icon name="logout" /></button>
      </div>
    </div>
  );

  return (
    <div className="a-app">
      {/* desktop sidebar / tablet rail */}
      <aside className="a-side">
        <div className="a-side-logo"><Logo /></div>
        {navList('is-side')}
        {userBlock}
      </aside>

      {/* phone top bar + drawer */}
      <header className="a-topbar">
        <Logo />
        <span className="a-topbar-title">{current?.short ?? current?.label ?? 'Admin'}</span>
        <button className="a-icon-btn a-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
          <Icon name="open" />
          {(counts?.newQuotes || 0) + (counts?.unpaidInvoices || 0) > 0 && <i className="a-dot" aria-hidden="true" />}
        </button>
      </header>
      <div className={`a-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <button className="a-drawer-scrim" onClick={() => setOpen(false)} aria-label="Close menu" tabIndex={open ? 0 : -1} />
        <div className="a-drawer-panel" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="a-drawer-head">
            <Logo />
            <button className="a-icon-btn" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="close" /></button>
          </div>
          {navList('is-drawer')}
          {userBlock}
        </div>
      </div>

      <div className="a-main">{children}</div>
    </div>
  );
}
