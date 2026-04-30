import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJwtPayload(token: string): any | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/my-account')) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    const payload = decodeJwtPayload(token);
    const exp = payload?.exp;

    if (!exp || exp * 1000 <= Date.now()) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', request.nextUrl.pathname);
      const res = NextResponse.redirect(url);
      res.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/my-account/:path*'],
};
