'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignInWithUsernamePassword } from '@convex-dev/auth/methods/username-password/react';
import { api } from '@convex/_generated/api';
import Logo from '@/components/Logo';

function describe(userError) {
  switch (userError.error) {
    // same message for unknown user and wrong password: don't reveal which usernames exist
    case 'USER_NOT_FOUND':
    case 'INVALID_CREDENTIALS': return 'Incorrect username or password.';
    case 'RATE_LIMITED': return `Too many attempts. Try again in ${Math.ceil(userError.retryAfterMs / 1000)} seconds.`;
    case 'PASSWORD_TOO_SHORT':
    case 'PASSWORD_TOO_LONG':
    case 'PASSWORD_HAS_SURROUNDING_WHITESPACE': return 'Incorrect username or password.';
    case 'OTHER_ERROR':
      console.error('Sign-in failed:', userError.cause);
      return 'Something went wrong. Please try again.';
    default: return 'Sign-in failed. Please try again.';
  }
}

export default function AdminSignIn() {
  const router = useRouter();
  const { signIn, pending } = useSignInWithUsernamePassword(api.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await signIn({ username: username.trim().toLowerCase(), password });
    if (result.status === 'complete') { router.replace('/admin'); router.refresh(); return; }
    setError(describe(result.userError));
  };

  return (
    <div className="a-auth">
      <form className="a-auth-card" onSubmit={onSubmit}>
        <Logo />
        <h1>Staff sign in</h1>
        <p className="a-muted">Internal dashboard. Accounts are created by an administrator.</p>
        <label className="a-field">
          <span>Username</span>
          <input className="a-input" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} required disabled={pending} />
        </label>
        <label className="a-field">
          <span>Password</span>
          <input className="a-input" id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required disabled={pending} />
        </label>
        {error && <p className="a-error" role="alert">{error}</p>}
        <button className="a-btn a-btn-primary a-btn-block" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
