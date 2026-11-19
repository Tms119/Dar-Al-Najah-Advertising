import { convexAuthNextjsProxy, nextjsProxyRedirect } from '@/lib/convexAuth';

// Guards the admin area only. Public pages never run this.
export default convexAuthNextjsProxy(async (request, { isAuthenticated }) => {
  const { pathname } = request.nextUrl;
  const isSignIn = pathname === '/admin/signin';
  const authed = await isAuthenticated();
  if (!isSignIn && !authed) return nextjsProxyRedirect(request, '/admin/signin');
  if (isSignIn && authed) return nextjsProxyRedirect(request, '/admin');
});

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
