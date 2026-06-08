import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type JwtPayload = {
  exp?: number;
  sub?: string;
  email?: string;
  tokenType?: string;
};

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
): Promise<string | null> {
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
  } | null;

  return data?.accessToken ?? null;
}

function continueWithAccessToken(accessToken: string): NextResponse {
  const res = NextResponse.next();

  res.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  return res;
}

function redirectWithAccessToken(
  request: NextRequest,
  targetPath: string,
  nextPath: string | undefined,
  accessToken: string,
): NextResponse {
  const res = redirectTo(request, targetPath, nextPath);

  res.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login')) {
    const token = getAccessToken(request);

    if (!token) {
      const accessToken = await refreshAccessToken(request);

      if (accessToken) {
        return redirectWithAccessToken(
          request,
          '/my-account',
          pathname,
          accessToken,
        );
      }

      return NextResponse.next();
    }

    const payload = decodeJwtPayload(token);

    if (!isExpired(payload?.exp)) {
      return redirectTo(request, '/my-account', pathname);
    }

    const accessToken = await refreshAccessToken(request);
    if (accessToken) {
      return redirectWithAccessToken(
        request,
        '/my-account',
        pathname,
        accessToken,
      );
    }

    return clearAuthCookies(NextResponse.next());
  }

  if (pathname.startsWith('/my-account')) {
    const token = getAccessToken(request);

    if (!token) {
      const accessToken = await refreshAccessToken(request);

      if (accessToken) {
        return continueWithAccessToken(accessToken);
      }

      return redirectToAndClearTokens(request, '/login', pathname);
    }

    const payload = decodeJwtPayload(token);
    if (isExpired(payload?.exp)) {
      const accessToken = await refreshAccessToken(request);

      if (accessToken) {
        return continueWithAccessToken(accessToken);
      }

      return redirectToAndClearTokens(
        request,
        '/login',
        request.nextUrl.pathname,
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/my-account/:path*', '/login'],
};
