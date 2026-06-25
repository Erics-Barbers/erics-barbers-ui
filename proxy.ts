import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type JwtPayload = {
  exp?: number;
  sub?: string;
  email?: string;
  tokenType?: string;
};

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
  refreshMaxAgeSeconds: number;
};

type RouteSurface = 'customer' | 'staff';

const protectedRoutePrefixes = [
  '/my-account',
  '/bookings',
  '/customer/my-account',
  '/customer/bookings',
  '/admin',
  '/barber',
  '/dashboard',
  '/staff',
  '/account',
  '/profile',
  '/settings',
] as const;

const staffRoutePrefixes = [
  '/availability',
  '/bookings',
  '/calendar',
  '/customers',
  '/dashboard',
  '/login',
  '/settings',
] as const;

const publicCustomerRoutePrefixes = [
  '/bookings',
  '/email-verify',
  '/information',
  '/login',
  '/my-account',
  '/privacy-policy',
  '/register',
  '/services',
  '/terms-of-service',
  '/verify-email',
] as const;

function pathStartsWithPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function getConfiguredHostname(url: string | undefined): string | null {
  if (!url) return null;

  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function getHostname(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? '';

  return host.split(':')[0]?.toLowerCase() ?? '';
}

function isStaffHostname(hostname: string): boolean {
  const configuredStaffHostnames = [
    getConfiguredHostname(process.env.NEXT_PUBLIC_STAFF_SITE_URL),
    getConfiguredHostname(process.env.NEXT_PUBLIC_TEST_STAFF_SITE_URL),
  ].filter(Boolean);

  return (
    configuredStaffHostnames.includes(hostname) ||
    hostname.startsWith('staff.') ||
    hostname.startsWith('test-staff.') ||
    hostname === 'staff.localhost' ||
    hostname === 'test-staff.localhost'
  );
}

function getRouteSurface(request: NextRequest): RouteSurface {
  return isStaffHostname(getHostname(request)) ? 'staff' : 'customer';
}

function isProtectedRoute(
  pathname: string,
  surface: RouteSurface,
): boolean {
  if (surface === 'staff') {
    return (
      pathname === '/' ||
      staffRoutePrefixes.some((prefix) => pathStartsWithPrefix(pathname, prefix))
    );
  }

  return protectedRoutePrefixes.some((prefix) =>
    pathStartsWithPrefix(pathname, prefix),
  );
}

function isLoginRoute(pathname: string): boolean {
  return (
    pathStartsWithPrefix(pathname, '/login') ||
    pathStartsWithPrefix(pathname, '/customer/login') ||
    pathStartsWithPrefix(pathname, '/staff/login')
  );
}

function isStaffRoute(pathname: string): boolean {
  return pathStartsWithPrefix(pathname, '/staff');
}

function isStaffLoginRoute(pathname: string, surface: RouteSurface): boolean {
  return (
    pathStartsWithPrefix(pathname, '/staff/login') ||
    (surface === 'staff' && pathStartsWithPrefix(pathname, '/login'))
  );
}

function isStaffPublicRoute(pathname: string): boolean {
  return (
    pathname === '/' ||
    staffRoutePrefixes.some((prefix) => pathStartsWithPrefix(pathname, prefix))
  );
}

function isPublicCustomerRoute(pathname: string): boolean {
  return (
    pathname === '/' ||
    publicCustomerRoutePrefixes.some((prefix) =>
      pathStartsWithPrefix(pathname, prefix),
    )
  );
}

function createCustomerRewriteUrl(request: NextRequest): URL {
  const url = request.nextUrl.clone();
  url.pathname =
    request.nextUrl.pathname === '/'
      ? '/customer'
      : `/customer${request.nextUrl.pathname}`;
  return url;
}

function createStaffRewriteUrl(request: NextRequest): URL {
  const url = request.nextUrl.clone();
  url.pathname =
    request.nextUrl.pathname === '/'
      ? '/staff'
      : `/staff${request.nextUrl.pathname}`;
  return url;
}

function getAuthenticatedLoginTarget(
  pathname: string,
  surface: RouteSurface,
): string {
  if (surface === 'staff') return '/dashboard';
  return isStaffRoute(pathname) ? '/staff/dashboard' : '/my-account';
}

function getUnauthenticatedLoginTarget(
  pathname: string,
  surface: RouteSurface,
): string {
  if (surface === 'staff') return '/login';
  return isStaffRoute(pathname) ? '/staff/login' : '/login';
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get('accessToken')?.value;
}

function getRefreshToken(request: NextRequest): string | undefined {
  return request.cookies.get('refreshToken')?.value;
}

function createRedirectUrl(
  request: NextRequest,
  targetPath: string,
  nextPath?: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = targetPath;

  if (nextPath) {
    url.searchParams.set('next', nextPath);
  } else {
    url.searchParams.delete('next');
  }

  return url;
}

function isExpired(exp?: number): boolean {
  if (!exp) return true;
  return exp * 1000 <= Date.now();
}

function redirectTo(
  request: NextRequest,
  targetPath: string,
  nextPath?: string,
): NextResponse {
  return NextResponse.redirect(
    createRedirectUrl(request, targetPath, nextPath),
  );
}

function clearAuthCookies(res: NextResponse): NextResponse {
  res.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
  res.cookies.set('refreshToken', '', { path: '/', maxAge: 0 });
  return res;
}

function redirectToAndClearTokens(
  request: NextRequest,
  targetPath: string,
  nextPath?: string,
): NextResponse {
  const res = redirectTo(request, targetPath, nextPath);
  return clearAuthCookies(res);
}

async function refreshAccessToken(
  request: NextRequest,
): Promise<RefreshResult | null> {
  const refreshToken = getRefreshToken(request);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!refreshToken || !apiBaseUrl) {
    return null;
  }

  const apiRes = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      Cookie: `refreshToken=${refreshToken}`,
    },
  });

  if (!apiRes.ok) {
    return null;
  }

  const data = (await apiRes.json().catch(() => null)) as {
    accessToken?: string;
    refreshToken?: string;
    refreshMaxAgeSeconds?: number;
  } | null;

  if (
    !data?.accessToken ||
    !data.refreshToken ||
    typeof data.refreshMaxAgeSeconds !== 'number'
  ) {
    return null;
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    refreshMaxAgeSeconds: data.refreshMaxAgeSeconds,
  };
}

function setAuthCookies(res: NextResponse, tokens: RefreshResult) {
  res.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  res.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.refreshMaxAgeSeconds,
  });
}

function continueDomainRequest(
  request: NextRequest,
  surface: RouteSurface,
): NextResponse {
  if (surface === 'staff' && isStaffPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.rewrite(createStaffRewriteUrl(request));
  }

  if (surface === 'customer' && isPublicCustomerRoute(request.nextUrl.pathname)) {
    return NextResponse.rewrite(createCustomerRewriteUrl(request));
  }

  return NextResponse.next();
}

function continueWithTokens(
  request: NextRequest,
  surface: RouteSurface,
  tokens: RefreshResult,
): NextResponse {
  const res = continueDomainRequest(request, surface);
  setAuthCookies(res, tokens);
  return res;
}

function redirectWithTokens(
  request: NextRequest,
  targetPath: string,
  nextPath: string | undefined,
  tokens: RefreshResult,
): NextResponse {
  const res = redirectTo(request, targetPath, nextPath);
  setAuthCookies(res, tokens);
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const surface = getRouteSurface(request);

  if (isLoginRoute(pathname)) {
    const token = getAccessToken(request);

    if (!token) {
      const tokens = await refreshAccessToken(request);

      if (tokens) {
        return redirectWithTokens(
          request,
          getAuthenticatedLoginTarget(pathname, surface),
          pathname,
          tokens,
        );
      }

      return continueDomainRequest(request, surface);
    }

    const payload = decodeJwtPayload(token);

    if (!isExpired(payload?.exp)) {
      return redirectTo(
        request,
        getAuthenticatedLoginTarget(pathname, surface),
        pathname,
      );
    }

    const tokens = await refreshAccessToken(request);
    if (tokens) {
      return redirectWithTokens(
        request,
        getAuthenticatedLoginTarget(pathname, surface),
        pathname,
        tokens,
      );
    }

    return clearAuthCookies(continueDomainRequest(request, surface));
  }

  if (isProtectedRoute(pathname, surface)) {
    const token = getAccessToken(request);

    if (!token) {
      const tokens = await refreshAccessToken(request);

      if (tokens) {
        return continueWithTokens(request, surface, tokens);
      }

      return redirectToAndClearTokens(
        request,
        getUnauthenticatedLoginTarget(pathname, surface),
        pathname,
      );
    }

    const payload = decodeJwtPayload(token);
    if (isExpired(payload?.exp)) {
      const tokens = await refreshAccessToken(request);

      if (tokens) {
        return continueWithTokens(request, surface, tokens);
      }

      return redirectToAndClearTokens(
        request,
        getUnauthenticatedLoginTarget(pathname, surface),
        request.nextUrl.pathname,
      );
    }
  }

  if (isStaffLoginRoute(pathname, surface)) {
    return continueDomainRequest(request, surface);
  }

  return continueDomainRequest(request, surface);
}

export const config = {
  matcher: [
    '/',
    '/customer/:path*',
    '/my-account/:path*',
    '/bookings/:path*',
    '/email-verify/:path*',
    '/information/:path*',
    '/privacy-policy/:path*',
    '/register/:path*',
    '/services/:path*',
    '/terms-of-service/:path*',
    '/verify-email/:path*',
    '/admin/:path*',
    '/availability/:path*',
    '/barber/:path*',
    '/calendar/:path*',
    '/customers/:path*',
    '/dashboard/:path*',
    '/staff/:path*',
    '/account/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
  ],
};
