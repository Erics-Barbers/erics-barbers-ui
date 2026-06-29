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
  hostname = 'ui.example.test',
): NextRequest {
  const url = new URL(`https://${hostname}${pathname}`);

  return {
    cookies: {
      get: jest.fn((name: string) => {
        const value = cookieValues[name];
        return value ? { name, value } : undefined;
      }),
    },
    headers: {
      get: jest.fn((name: string) => {
        if (name.toLowerCase() === 'host') return hostname;
        return null;
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
  const originalStaffSiteUrl = process.env.NEXT_PUBLIC_STAFF_SITE_URL;
  const originalTestStaffSiteUrl = process.env.NEXT_PUBLIC_TEST_STAFF_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.test';
    process.env.NEXT_PUBLIC_STAFF_SITE_URL = 'https://staff.example.test';
    process.env.NEXT_PUBLIC_TEST_STAFF_SITE_URL =
      'https://test-staff.example.test';
    global.fetch = mockedFetch;
    mockedFetch.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBaseUrl;
    process.env.NEXT_PUBLIC_STAFF_SITE_URL = originalStaffSiteUrl;
    process.env.NEXT_PUBLIC_TEST_STAFF_SITE_URL = originalTestStaffSiteUrl;
  });

  it('rewrites unauthenticated customer bookings routes without requiring login', async () => {
    const res = await proxy(createProxyRequest('/bookings'));

    expect(res.headers.get('x-middleware-rewrite')).toBe(
      'https://ui.example.test/customer/bookings',
    );
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('refreshes expired access tokens on public customer bookings routes', async () => {
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

    expect(res.headers.get('x-middleware-rewrite')).toBe(
      'https://ui.example.test/customer/bookings/new-booking',
    );
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

  it('uses the refresh cookie on public customer bookings routes without an access token', async () => {
    mockedFetch.mockResolvedValue(
      jsonResponse({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
    );

    const res = await proxy(
      createProxyRequest('/bookings/new-booking', {
        refreshToken: 'old-refresh-token',
      }),
    );

    expect(res.headers.get('x-middleware-rewrite')).toBe(
      'https://ui.example.test/customer/bookings/new-booking',
    );
    expect(res.headers.get('set-cookie')).toContain(
      'accessToken=new-access-token',
    );
    expect(res.headers.get('set-cookie')).toContain(
      'refreshToken=new-refresh-token',
    );
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
      createProxyRequest('/my-account', {
        accessToken: expiredToken,
        refreshToken: 'old-refresh-token',
      }),
    );

    expect(res.headers.get('x-middleware-rewrite')).toBe(
      'https://ui.example.test/customer/my-account',
    );
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

  it('rewrites public customer routes to the internal customer folder', async () => {
    const res = await proxy(createProxyRequest('/services'));

    expect(res.headers.get('x-middleware-rewrite')).toBe(
      'https://ui.example.test/customer/services',
    );
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('rewrites the public home page to the internal customer home page', async () => {
    const res = await proxy(createProxyRequest('/'));

    expect(res.headers.get('x-middleware-rewrite')).toBe(
      'https://ui.example.test/customer',
    );
    expect(mockedFetch).not.toHaveBeenCalled();
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

  it('redirects unauthenticated staff routes to staff login', async () => {
    const res = await proxy(createProxyRequest('/staff/dashboard'));

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://ui.example.test/staff/login?next=%2Fstaff%2Fdashboard',
    );
    expect(res.headers.get('set-cookie')).toContain('accessToken=');
    expect(res.headers.get('set-cookie')).toContain('refreshToken=');
  });

  it('redirects unauthenticated staff subdomain routes to clean staff login', async () => {
    const res = await proxy(
      createProxyRequest('/dashboard', {}, 'staff.example.test'),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://staff.example.test/login?next=%2Fdashboard',
    );
    expect(res.headers.get('set-cookie')).toContain('accessToken=');
    expect(res.headers.get('set-cookie')).toContain('refreshToken=');
  });

  it('still protects bookings on the staff surface', async () => {
    const res = await proxy(
      createProxyRequest('/bookings', {}, 'staff.example.test'),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://staff.example.test/login?next=%2Fbookings',
    );
    expect(res.headers.get('set-cookie')).toContain('accessToken=');
    expect(res.headers.get('set-cookie')).toContain('refreshToken=');
  });

  it('rewrites staff localhost login to the internal staff login page', async () => {
    const res = await proxy(
      createProxyRequest('/login', {}, 'staff.localhost'),
    );

    expect(res.headers.get('x-middleware-rewrite')).toBe(
      'https://staff.localhost/staff/login',
    );
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('redirects authenticated staff login visits to the staff dashboard', async () => {
    const validToken = createJwt({
      exp: Math.floor(Date.now() / 1000) + 60,
      tokenType: 'access',
    });

    const res = await proxy(
      createProxyRequest('/staff/login', {
        accessToken: validToken,
      }),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://ui.example.test/staff/dashboard?next=%2Fstaff%2Flogin',
    );
  });

  it('redirects authenticated staff subdomain login visits to the clean dashboard path', async () => {
    const validToken = createJwt({
      exp: Math.floor(Date.now() / 1000) + 60,
      tokenType: 'access',
    });

    const res = await proxy(
      createProxyRequest(
        '/login',
        {
          accessToken: validToken,
        },
        'staff.example.test',
      ),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'https://staff.example.test/dashboard?next=%2Flogin',
    );
  });

  it('rewrites authenticated staff subdomain routes to the internal staff folder', async () => {
    const validToken = createJwt({
      exp: Math.floor(Date.now() / 1000) + 60,
      tokenType: 'access',
    });

    const res = await proxy(
      createProxyRequest(
        '/calendar',
        {
          accessToken: validToken,
        },
        'staff.example.test',
      ),
    );

    expect(res.headers.get('x-middleware-rewrite')).toBe(
      'https://staff.example.test/staff/calendar',
    );
  });
});
