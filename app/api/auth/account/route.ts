import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rejectCrossSiteRequest } from '../_utils/reject-cross-site-request';

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
  refreshMaxAgeSeconds?: number;
};

function clearAuthCookies(res: NextResponse): NextResponse {
  res.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
  res.cookies.set('refreshToken', '', { path: '/', maxAge: 0 });
  return res;
}

function isAuthFailure(res: Response): boolean {
  return res.status === 401 || res.status === 403;
}

async function deleteAccount(apiBaseUrl: string, accessToken: string) {
  return fetch(`${apiBaseUrl}/auth/account`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function refreshAccessToken(
  apiBaseUrl: string,
  refreshToken: string | undefined,
  userAgent: string | null,
): Promise<RefreshResult | null> {
  if (!refreshToken) return null;

  const apiRes = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      Cookie: `refreshToken=${refreshToken}`,
      ...(userAgent ? { 'User-Agent': userAgent } : {}),
    },
  });

  if (!apiRes.ok) return null;

  const data = (await apiRes.json().catch(() => null)) as {
    accessToken?: string;
    refreshToken?: string;
    refreshMaxAgeSeconds?: number;
  } | null;

  if (!data?.accessToken || !data.refreshToken) return null;

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    refreshMaxAgeSeconds: data.refreshMaxAgeSeconds,
  };
}

export async function DELETE(req: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(req);
  if (crossSiteResponse) return crossSiteResponse;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: 'API base URL is not configured' },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;
  const userAgent = req.headers.get('user-agent');

  if (accessToken) {
    const apiRes = await deleteAccount(apiBaseUrl, accessToken);

    if (!isAuthFailure(apiRes)) {
      return clearAuthCookies(
        NextResponse.json(
          { message: 'Account deleted successfully' },
          { status: apiRes.status },
        ),
      );
    }
  }

  const tokens = await refreshAccessToken(apiBaseUrl, refreshToken, userAgent);

  if (!tokens) {
    const res = NextResponse.json(
      { message: accessToken ? 'Session expired' : 'Not authenticated' },
      { status: 401 },
    );

    return accessToken || refreshToken ? clearAuthCookies(res) : res;
  }

  const retryRes = await deleteAccount(apiBaseUrl, tokens.accessToken);

  if (isAuthFailure(retryRes)) {
    return clearAuthCookies(
      NextResponse.json({ message: 'Session expired' }, { status: 401 }),
    );
  }

  return clearAuthCookies(
    NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: retryRes.status },
    ),
  );
}
