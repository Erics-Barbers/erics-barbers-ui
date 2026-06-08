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
  } | null;

  if (!data?.accessToken || !data.refreshToken) {
    return null;
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
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
    maxAge: 60 * 60 * 24 * 7,
  });
}

function continueWithTokens(tokens: RefreshResult): NextResponse {
  const res = NextResponse.next();
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

  if (pathname.startsWith('/login')) {
    const token = getAccessToken(request);

    if (!token) {
      const tokens = await refreshAccessToken(request);

      if (tokens) {
        return redirectWithTokens(request, '/my-account', pathname, tokens);
      }

      return NextResponse.next();
    }

    const payload = decodeJwtPayload(token);

    if (!isExpired(payload?.exp)) {
      return redirectTo(request, '/my-account', pathname);
    }

    const tokens = await refreshAccessToken(request);
    if (tokens) {
      return redirectWithTokens(request, '/my-account', pathname, tokens);
    }

    return clearAuthCookies(NextResponse.next());
  }

  if (pathname.startsWith('/my-account')) {
    const token = getAccessToken(request);

    if (!token) {
      const tokens = await refreshAccessToken(request);

      if (tokens) {
        return continueWithTokens(tokens);
      }

      return redirectToAndClearTokens(request, '/login', pathname);
    }

    const payload = decodeJwtPayload(token);
    if (isExpired(payload?.exp)) {
      const tokens = await refreshAccessToken(request);

      if (tokens) {
        return continueWithTokens(tokens);
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
