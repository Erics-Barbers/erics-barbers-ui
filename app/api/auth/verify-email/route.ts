import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { rejectCrossSiteRequest } from '../_utils/reject-cross-site-request';

type VerifyEmailResponse = {
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
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!apiRes.ok) {
    const err = await apiRes.json().catch(() => ({}));
    return NextResponse.json(err, { status: apiRes.status });
  }

  const data = (await apiRes.json()) as VerifyEmailResponse;

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

  return NextResponse.json(
    { message: 'Email verified successfully' },
    { status: 200 },
  );
}
