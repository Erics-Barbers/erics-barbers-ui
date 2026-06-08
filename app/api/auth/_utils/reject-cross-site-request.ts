import { NextResponse } from 'next/server';

export function rejectCrossSiteRequest(req: Request): NextResponse | null {
  const requestOrigin = new URL(req.url).origin;
  const origin = req.headers.get('origin');

  if (origin && origin !== requestOrigin) {
    return NextResponse.json(
      { message: 'Invalid request origin' },
      { status: 403 },
    );
  }

  const fetchSite = req.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') {
    return NextResponse.json(
      { message: 'Cross-site auth requests are not allowed' },
      { status: 403 },
    );
  }

  return null;
}
