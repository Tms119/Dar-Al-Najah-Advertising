'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '@convex/_generated/api';
import Logo from '@/components/Logo';

const NAV = [
  ['/admin', 'Overview', '◎'],
  ['/admin/products', 'Products', '▦'],
  ['/admin/menu', 'Menu & categories', '☰'],
  ['/admin/quotes', 'Quote requests', '✉'],
  ['/admin/team', 'Team', '◉'],
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  if (pathname === '/admin/signin') return children;
  return <Guarded pathname={pathname}>{children}</Guarded>;
}

function Guarded({ pathname, children }) {
  const me = useQuery(api.users.me);
  const { signOut } = useAuthActions();
  const router = useRouter();

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
          <p className="a-muted">You&apos;re signed in as <b>{me.username}</b>, but this account isn&apos;t on the admin list yet. Ask the site owner to add it, then reload.</p>
          <button className="a-btn" onClick={doSignOut}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="a-app">
      <aside className="a-side">
        <Logo />
        <nav>
          {NAV.map(([href, label, ic]) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`a-nav ${active ? 'is-active' : ''}`}>
                <span className="a-nav-ic">{ic}</span>{label}
              </Link>
            );
          })}
        </nav>
        <div className="a-side-foot">
          <a href="/" target="_blank" rel="noreferrer" className="a-nav">↗ View website</a>
          <div className="a-user">
            <span className="a-avatar">{me.username?.[0]?.toUpperCase()}</span>
            <span>{me.username}</span>
          </div>
          <button className="a-btn a-btn-sm" onClick={doSignOut}>Sign out</button>
        </div>
      </aside>
      <div className="a-main">{children}</div>
    </div>
  );
}
