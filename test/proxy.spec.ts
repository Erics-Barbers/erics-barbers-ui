import type { NextRequest } from 'next/server';
import { proxy } from '../proxy';

function createJwt(payload: Record<string, unknown>): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url',
  );
  return `header.${encodedPayload}.signature`;
}

function createProxyRequest(
  pathname: string,
  cookieValues: Record<string, string> = {},
): NextRequest {
  const url = new URL(`https://ui.example.test${pathname}`);

  return {
    cookies: {
      get: jest.fn((name: string) => {
        const value = cookieValues[name];
        return value ? { name, value } : undefined;
      }),
    },
    nextUrl: {
      pathname: url.pathname,
      searchParams: url.searchParams,
      clone: () => new URL(url.toString()),
    },
  } as unknown as NextRequest;
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

const mockedFetch = jest.fn();

describe('auth proxy', () => {
  const originalFetch = global.fetch;
  const originalApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.test';
    global.fetch = mockedFetch;
    mockedFetch.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBaseUrl;
  });

  it('redirects unauthenticated protected routes to login with next path', async () => {
    const res = await proxy(createProxyRequest('/bookings'));

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://ui.example.test/login?next=%2Fbookings',
    );
    expect(res.headers.get('set-cookie')).toContain('accessToken=');
    expect(res.headers.get('set-cookie')).toContain('refreshToken=');
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('refreshes expired access tokens for protected routes', async () => {
    const expiredToken = createJwt({
      exp: Math.floor(Date.now() / 1000) - 60,
      tokenType: 'access',
    });

    mockedFetch.mockResolvedValue(
      jsonResponse({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
    );

    const res = await proxy(
      createProxyRequest('/bookings/new-booking', {
        accessToken: expiredToken,
        refreshToken: 'old-refresh-token',
      }),
    );

    expect(res.headers.get('x-middleware-next')).toBe('1');
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://api.example.test/auth/refresh',
      {
        method: 'POST',
        headers: {
          Cookie: 'refreshToken=old-refresh-token',
        },
      },
    );
    expect(res.headers.get('set-cookie')).toContain(
      'accessToken=new-access-token',
    );
    expect(res.headers.get('set-cookie')).toContain(
      'refreshToken=new-refresh-token',
    );
  });

  it('redirects authenticated users away from login', async () => {
    const validToken = createJwt({
      exp: Math.floor(Date.now() / 1000) + 60,
      tokenType: 'access',
    });

    const res = await proxy(
      createProxyRequest('/login', {
        accessToken: validToken,
      }),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://ui.example.test/my-account?next=%2Flogin',
    );
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('uses the refresh cookie to recover a login visit without an access token', async () => {
    mockedFetch.mockResolvedValue(
      jsonResponse({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
    );

    const res = await proxy(
      createProxyRequest('/login', {
        refreshToken: 'old-refresh-token',
      }),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://ui.example.test/my-account?next=%2Flogin',
    );
    expect(res.headers.get('set-cookie')).toContain(
      'accessToken=new-access-token',
    );
    expect(res.headers.get('set-cookie')).toContain(
      'refreshToken=new-refresh-token',
    );
  });
});
