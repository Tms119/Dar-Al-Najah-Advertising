'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignInWithUsernamePassword } from '@convex-dev/auth/methods/username-password/react';
import { api } from '@convex/_generated/api';
import Logo from '@/components/Logo';

function triesLeftNote(n) {
  if (n === 1) return ' One more wrong try locks sign-in for 5 minutes.';
  if (n > 1) return ` ${n} tries left before sign-in is locked.`;
  return '';
}

function describe(userError) {
  switch (userError.error) {
    // same message for unknown user and wrong password: don't reveal which usernames exist
    case 'USER_NOT_FOUND':
    case 'INVALID_CREDENTIALS': return 'Incorrect username or password.' + triesLeftNote(userError.triesLeft);
    case 'RATE_LIMITED': {
      const s = Math.ceil(userError.retryAfterMs / 1000);
      return `Too many wrong attempts. Try again in ${s < 60 ? `${s} seconds` : `${Math.ceil(s / 60)} minute${s > 60 ? 's' : ''}`}.`;
    }
    case 'PASSWORD_TOO_SHORT':
    case 'PASSWORD_TOO_LONG':
    case 'PASSWORD_HAS_SURROUNDING_WHITESPACE': return 'Incorrect username or password.';
    case 'OTHER_ERROR':
      console.error('Sign-in failed:', userError.cause);
      return 'Something went wrong. Please try again.';
    default: return 'Sign in failed. Please try again.';
  }
}

export default function AdminSignIn() {
  const router = useRouter();
  const { signIn, pending } = useSignInWithUsernamePassword(api.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const passwordRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    const result = await signIn({ username: username.trim().toLowerCase(), password });
    if (result.status === 'complete') { router.replace('/admin'); router.refresh(); return; }
    setError(describe(result.userError));
    // ready to retype: Enter sends again without clicking back into the field
    requestAnimationFrame(() => passwordRef.current?.select());
  };

  return (
    <div className="a-auth">
      <form className="a-auth-card" onSubmit={onSubmit}>
        <Logo />
        <h1>Staff sign in</h1>
        <p className="a-muted">Internal dashboard. Accounts are created by an administrator.</p>
        <label className="a-field">
          <span>Username</span>
          <input className="a-input" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} required readOnly={pending} />
        </label>
        <label className="a-field">
          <span>Password</span>
          <input className="a-input" id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required readOnly={pending} ref={passwordRef} />
        </label>
        {error && <p className="a-error" role="alert">{error}</p>}
        <button className="a-btn a-btn-primary a-btn-block" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
