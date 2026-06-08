import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type JwtPayload = {
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get('accessToken')?.value;
}

function createRedirectUrl(
  request: NextRequest,
  targetPath: string,
  nextPath?: string
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
  nextPath?: string
): NextResponse {
  return NextResponse.redirect(createRedirectUrl(request, targetPath, nextPath));
}

function redirectToAndClearToken(
  request: NextRequest,
  targetPath: string,
  nextPath?: string
): NextResponse {
  const res = redirectTo(request, targetPath, nextPath);
  res.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
  return res;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login')) {
    const token = getAccessToken(request);

    if (token) {
      return redirectTo(request, '/my-account', pathname);
    }
  }

  if (pathname.startsWith('/my-account')) {
    const token = getAccessToken(request);

    if (!token) {
      return redirectTo(request, '/login', pathname);
    }

    const payload = decodeJwtPayload(token);
    if (isExpired(payload?.exp)) {
      return redirectToAndClearToken(request, '/login', request.nextUrl.pathname);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/my-account/:path*', '/login'],
};
