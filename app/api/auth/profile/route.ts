import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rejectCrossSiteRequest } from '../_utils/reject-cross-site-request';

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
  refreshMaxAgeSeconds: number;
};

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 15,
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

function clearAuthCookies(res: NextResponse): NextResponse {
  res.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
  res.cookies.set('refreshToken', '', { path: '/', maxAge: 0 });
  return res;
}

function setAuthCookies(res: NextResponse, tokens: RefreshResult): NextResponse {
  res.cookies.set(
    'accessToken',
    tokens.accessToken,
    accessTokenCookieOptions,
  );
  res.cookies.set(
    'refreshToken',
    tokens.refreshToken,
    {
      ...refreshTokenCookieOptions,
      maxAge: tokens.refreshMaxAgeSeconds,
    },
  );
  return res;
}

function isAuthFailure(res: Response): boolean {
  return res.status === 401 || res.status === 403;
}

function getApiBaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? null;
}

async function fetchProfile(
  apiBaseUrl: string,
  accessToken: string,
  init?: RequestInit,
) {
  return fetch(`${apiBaseUrl}/auth/profile`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function updateProfile(
  apiBaseUrl: string,
  accessToken: string,
  body: unknown,
) {
  return fetchProfile(apiBaseUrl, accessToken, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function refreshAccessToken(
  apiBaseUrl: string,
  refreshToken: string | undefined,
  userAgent: string | null,
): Promise<RefreshResult | null> {
  if (!refreshToken) {
    return null;
  }

  const apiRes = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      Cookie: `refreshToken=${refreshToken}`,
      ...(userAgent ? { 'User-Agent': userAgent } : {}),
    },
  });

  if (!apiRes.ok) {
    return null;
  }

  const data = (await apiRes.json().catch(() => null)) as {
    accessToken?: string;
    refreshToken?: string;
    refreshMaxAgeSeconds?: number;
  } | null;

  if (
    !data?.accessToken ||
    !data.refreshToken ||
    typeof data.refreshMaxAgeSeconds !== 'number'
  ) {
    return null;
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    refreshMaxAgeSeconds: data.refreshMaxAgeSeconds,
  };
}

async function createProfileResponse(apiRes: Response, tokens?: RefreshResult) {
  const data = await apiRes.json().catch(() => ({}));
  const res = NextResponse.json(data, { status: apiRes.status });

  if (tokens) {
    setAuthCookies(res, tokens);
  }

  return res;
}

function createExpiredSessionResponse() {
  return clearAuthCookies(
    NextResponse.json({ message: 'Session expired' }, { status: 401 }),
  );
}

export async function GET(req: Request) {
  return handleProfileRequest(req);
}

export async function PUT(req: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(req);
  if (crossSiteResponse) return crossSiteResponse;

  const body = await req.json().catch(() => ({}));
  return handleProfileRequest(req, body);
}

async function handleProfileRequest(req: Request, updateBody?: unknown) {
  const apiBaseUrl = getApiBaseUrl();

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
  const isUpdate = updateBody !== undefined;

  if (accessToken) {
    const apiRes = isUpdate
      ? await updateProfile(apiBaseUrl, accessToken, updateBody)
      : await fetchProfile(apiBaseUrl, accessToken);

    if (!isAuthFailure(apiRes)) {
      return createProfileResponse(apiRes);
    }
  }

  const tokens = await refreshAccessToken(apiBaseUrl, refreshToken, userAgent);

  if (!tokens) {
    const res = NextResponse.json(
      { message: accessToken ? 'Session expired' : 'Not authenticated' },
      { status: 401 },
    );

    if (accessToken || refreshToken) {
      return clearAuthCookies(res);
    }

    return res;
  }

  const retryRes = isUpdate
    ? await updateProfile(apiBaseUrl, tokens.accessToken, updateBody)
    : await fetchProfile(apiBaseUrl, tokens.accessToken);

  if (isAuthFailure(retryRes)) {
    return createExpiredSessionResponse();
  }

  return createProfileResponse(retryRes, tokens);
}
