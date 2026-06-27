import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rejectCrossSiteRequest } from '../_utils/reject-cross-site-request';

type AuthErrorResponse = {
  message?: string | string[];
};

type LoginResponseBody = {
  accessToken: string;
  refreshToken: string;
  refreshMaxAgeSeconds?: number;
};

type LoginMfaRequiredResponseBody = {
  message: string;
  code: 'MFA_REQUIRED';
  mfaRequired: true;
  challengeId: string;
  mfaMethod: string;
};

function isEmailNotVerified(error: AuthErrorResponse): boolean {
  return Array.isArray(error.message)
    ? error.message.includes('Email not verified')
    : error.message === 'Email not verified';
}

export async function POST(req: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(req);
  if (crossSiteResponse) return crossSiteResponse;

  const body = await req.json();
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === 'production';

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!apiRes.ok) {
    const err = (await apiRes.json().catch(() => ({}))) as AuthErrorResponse;
    if (isEmailNotVerified(err)) {
      return NextResponse.json(
        { message: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' },
        { status: 403 },
      );
    }

    return NextResponse.json(err, { status: apiRes.status });
  }

  const data = (await apiRes.json()) as
    | LoginResponseBody
    | LoginMfaRequiredResponseBody;

  if ('mfaRequired' in data) {
    return NextResponse.json(data, { status: 200 });
  }

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
    maxAge: data.refreshMaxAgeSeconds ?? 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ message: 'Logged in' }, { status: 200 });
}
