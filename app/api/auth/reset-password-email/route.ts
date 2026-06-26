import { NextResponse } from 'next/server';
import { rejectCrossSiteRequest } from '../_utils/reject-cross-site-request';

type PasswordResetSurface = 'CUSTOMER' | 'STAFF';

type ResetPasswordEmailBody = {
  email?: unknown;
  surface?: unknown;
};

function normalizeSurface(surface: unknown): PasswordResetSurface {
  return surface === 'STAFF' ? 'STAFF' : 'CUSTOMER';
}

export async function POST(req: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(req);
  if (crossSiteResponse) return crossSiteResponse;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: 'API base URL is not configured' },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as ResetPasswordEmailBody;

  const apiRes = await fetch(`${apiBaseUrl}/auth/reset-password-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: body.email,
      surface: normalizeSurface(body.surface),
    }),
  });

  if (!apiRes.ok) {
    const err = (await apiRes.json().catch(() => ({}))) as unknown;
    return NextResponse.json(err, { status: apiRes.status });
  }

  return NextResponse.json(
    { message: 'Password reset link sent to email if it exists' },
    { status: 200 },
  );
}
