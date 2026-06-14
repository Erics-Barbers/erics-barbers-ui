import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rejectCrossSiteRequest } from '../_utils/reject-cross-site-request';

type VerifyMfaResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function POST(req: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(req);
  if (crossSiteResponse) return crossSiteResponse;

  const body = await req.json();
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === 'production';

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-mfa`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers.get('User-Agent') ?? '',
      },
      body: JSON.stringify(body),
    },
  );

  if (!apiRes.ok) {
    const err = (await apiRes.json().catch(() => ({}))) as unknown;
    return NextResponse.json(err, { status: apiRes.status });
  }

  const data = (await apiRes.json()) as VerifyMfaResponse;

  cookieStore.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  cookieStore.set('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ message: 'Logged in' }, { status: 200 });
}
