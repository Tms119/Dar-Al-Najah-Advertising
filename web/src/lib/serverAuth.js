import { setupConvexAuthServer } from '@convex-dev/auth/ssr';
import { api } from '@convex/_generated/api';

// Auth handlers mounted under app/auth/*. Only the functions listed in
// `signIn` may create a session; the refresh token lives in an httpOnly cookie.
export const auth = setupConvexAuthServer({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
  refreshSession: api.auth.refreshSession,
  signOut: api.auth.signOut,
  // sign-in only — there is no public sign-up (accounts are created in Admin → Team)
  signIn: [api.auth.signInWithUsernamePassword],
  cookieOptions: { secure: process.env.NODE_ENV === 'production' },
});
