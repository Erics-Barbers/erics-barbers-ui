import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
  refreshMaxAgeSeconds?: number;
};

type ForwardOptions = {
  body?: unknown;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  requireAuth?: boolean;
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
  maxAge: 60 * 60 * 24 * 7,
};

function isAuthFailure(res: Response) {
  return res.status === 401 || res.status === 403;
}

function clearAuthCookies(res: NextResponse) {
  res.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
  res.cookies.set('refreshToken', '', { path: '/', maxAge: 0 });
  return res;
}

function setAuthCookies(res: NextResponse, tokens: RefreshResult) {
  res.cookies.set('accessToken', tokens.accessToken, accessTokenCookieOptions);
  res.cookies.set('refreshToken', tokens.refreshToken, {
    ...refreshTokenCookieOptions,
    maxAge: tokens.refreshMaxAgeSeconds ?? refreshTokenCookieOptions.maxAge,
  });
  return res;
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

async function createProxyResponse(apiRes: Response, tokens?: RefreshResult) {
  const contentType = apiRes.headers.get('content-type');
  const body = await apiRes.text();
  const res = new NextResponse(body || null, {
    status: apiRes.status,
    headers: contentType ? { 'Content-Type': contentType } : undefined,
  });

  return tokens ? setAuthCookies(res, tokens) : res;
}

async function callApi(
  apiBaseUrl: string,
  apiPath: string,
  accessToken: string | undefined,
  options: ForwardOptions,
) {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${apiBaseUrl}${apiPath}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

export async function forwardApiRequest(
  req: Request,
  apiPath: string,
  options: ForwardOptions = {},
) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const requireAuth = options.requireAuth ?? true;

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

  const apiRes = await callApi(apiBaseUrl, apiPath, accessToken, options);

  if (!requireAuth || !isAuthFailure(apiRes)) {
    return createProxyResponse(apiRes);
  }

  const tokens = await refreshAccessToken(apiBaseUrl, refreshToken, userAgent);

  if (!tokens) {
    const res = NextResponse.json(
      { message: accessToken ? 'Session expired' : 'Not authenticated' },
      { status: 401 },
    );

    return accessToken || refreshToken ? clearAuthCookies(res) : res;
  }

  const retryRes = await callApi(
    apiBaseUrl,
    apiPath,
    tokens.accessToken,
    options,
  );

  if (isAuthFailure(retryRes)) {
    return clearAuthCookies(
      NextResponse.json({ message: 'Session expired' }, { status: 401 }),
    );
  }

  return createProxyResponse(retryRes, tokens);
}
