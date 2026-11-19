'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignInWithUsernamePassword, useSignUpWithUsernamePassword } from '@convex-dev/auth/methods/username-password/react';
import { api } from '@convex/_generated/api';
import Logo from '@/components/Logo';

function describe(userError) {
  switch (userError.error) {
    case 'USER_NOT_FOUND': return 'No account with that username.';
    case 'INVALID_CREDENTIALS': return 'Incorrect username or password.';
    case 'USERNAME_TAKEN': return 'That username is already taken.';
    case 'USERNAME_TOO_SHORT': return 'Username is too short.';
    case 'USERNAME_TOO_LONG': return 'Username is too long.';
    case 'USERNAME_HAS_INVALID_CHARACTERS': return 'Username can only use letters, numbers, dots, dashes and underscores.';
    case 'USERNAME_HAS_SURROUNDING_WHITESPACE': return "Username can't start or end with a space.";
    case 'PASSWORD_TOO_SHORT': return `Password must be at least ${userError.minimumLength} characters.`;
    case 'PASSWORD_TOO_LONG': return `Password must be at most ${userError.maximumLength} characters.`;
    case 'PASSWORD_TOO_COMMON': return 'That password is too common — pick something less guessable.';
    case 'PASSWORD_HAS_SURROUNDING_WHITESPACE': return "Password can't start or end with a space.";
    case 'RATE_LIMITED': return `Too many attempts. Try again in ${Math.ceil(userError.retryAfterMs / 1000)} seconds.`;
    case 'OTHER_ERROR':
      console.error('Auth failed:', userError.cause);
      return 'Something went wrong. Please try again.';
    default: return `Error: ${userError.error}`;
  }
}

export default function AdminSignIn() {
  const router = useRouter();
  const { signIn, pending: p1 } = useSignInWithUsernamePassword(api.auth);
  const { signUp, pending: p2 } = useSignUpWithUsernamePassword(api.auth);
  const [mode, setMode] = useState('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const pending = p1 || p2;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = mode === 'signin' ? await signIn({ username, password }) : await signUp({ username, password });
    if (result.status === 'complete') { router.replace('/admin'); router.refresh(); return; }
    setError(describe(result.userError));
  };

  return (
    <div className="a-auth">
      <form className="a-auth-card" onSubmit={onSubmit}>
        <Logo />
        <h1>{mode === 'signin' ? 'Admin sign in' : 'Create admin account'}</h1>
        {mode === 'signup' && (
          <p className="a-muted">Only usernames on the approved admin list get access. Ask the site owner to add yours.</p>
        )}
        <label className="a-field">
          <span>Username</span>
          <input className="a-input" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required disabled={pending} />
        </label>
        <label className="a-field">
          <span>Password</span>
          <input className="a-input" id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required disabled={pending} />
        </label>
        {error && <p className="a-error" role="alert">{error}</p>}
        <button className="a-btn a-btn-primary a-btn-block" disabled={pending}>
          {pending ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
        <button type="button" className="a-link" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}>
          {mode === 'signin' ? 'First time? Create an account' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
