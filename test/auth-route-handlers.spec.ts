import { cookies } from 'next/headers';
import { POST as login } from '../app/api/auth/login/route';
import { POST as logout } from '../app/api/auth/logout/route';
import { GET as profile } from '../app/api/auth/profile/route';
import { rejectCrossSiteRequest } from '../app/api/auth/_utils/reject-cross-site-request';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

type CookieValue = {
  value: string;
};

function createCookieStore(initialCookies: Record<string, string> = {}) {
  const values = new Map(Object.entries(initialCookies));

  return {
    get: jest.fn((name: string): CookieValue | undefined => {
      const value = values.get(name);
      return value ? { value } : undefined;
    }),
    set: jest.fn(),
  };
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

const mockedCookies = jest.mocked(cookies);
const mockedFetch = jest.fn();

describe('auth route handlers', () => {
  const originalFetch = global.fetch;
  const originalApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.test';
    global.fetch = mockedFetch;
    mockedFetch.mockReset();
    mockedCookies.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBaseUrl;
  });

  it('refreshes and retries profile when the access token is rejected', async () => {
    const cookieStore = createCookieStore({
      accessToken: 'old-access-token',
      refreshToken: 'old-refresh-token',
    });
    mockedCookies.mockResolvedValue(cookieStore as never);

    mockedFetch
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, { status: 401 }))
      .mockResolvedValueOnce(
        jsonResponse({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ id: 'user-1' }));

    const res = await profile(
      new Request('https://ui.example.test/api/auth/profile', {
        headers: { 'User-Agent': 'jest-agent' },
      }),
    );

    await expect(res.json()).resolves.toEqual({ id: 'user-1' });
    expect(res.status).toBe(200);
    expect(mockedFetch).toHaveBeenNthCalledWith(
      1,
      'https://api.example.test/auth/profile',
      {
        headers: { Authorization: 'Bearer old-access-token' },
      },
    );
    expect(mockedFetch).toHaveBeenNthCalledWith(
      2,
      'https://api.example.test/auth/refresh',
      {
        method: 'POST',
        headers: {
          Cookie: 'refreshToken=old-refresh-token',
          'User-Agent': 'jest-agent',
        },
      },
    );
    expect(mockedFetch).toHaveBeenNthCalledWith(
      3,
      'https://api.example.test/auth/profile',
      {
        headers: { Authorization: 'Bearer new-access-token' },
      },
    );

    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('accessToken=new-access-token');
    expect(setCookie).toContain('refreshToken=new-refresh-token');
  });

  it('clears both auth cookies when profile refresh fails', async () => {
    const cookieStore = createCookieStore({
      accessToken: 'old-access-token',
      refreshToken: 'old-refresh-token',
    });
    mockedCookies.mockResolvedValue(cookieStore as never);

    mockedFetch
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'invalid' }, { status: 401 }));

    const res = await profile(
      new Request('https://ui.example.test/api/auth/profile'),
    );

    await expect(res.json()).resolves.toEqual({ message: 'Session expired' });
    expect(res.status).toBe(401);

    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('accessToken=');
    expect(setCookie).toContain('refreshToken=');
    expect(setCookie).toContain('Max-Age=0');
  });

  it('logs out locally even when the API logout call rejects', async () => {
    const cookieStore = createCookieStore({
      refreshToken: 'refresh-token',
    });
    mockedCookies.mockResolvedValue(cookieStore as never);
    mockedFetch.mockResolvedValue(jsonResponse({ message: 'unauthorized' }, { status: 401 }));

    const res = await logout(
      new Request('https://ui.example.test/api/auth/logout', {
        method: 'POST',
        headers: { Origin: 'https://ui.example.test' },
      }),
    );

    await expect(res.json()).resolves.toEqual({ message: 'Logged out' });
    expect(res.status).toBe(200);
    expect(cookieStore.set).toHaveBeenCalledWith(
      'accessToken',
      '',
      expect.objectContaining({ maxAge: 0 }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      'refreshToken',
      '',
      expect.objectContaining({ maxAge: 0 }),
    );
  });

  it('returns a stable code when login fails because email is unverified', async () => {
    mockedCookies.mockResolvedValue(createCookieStore() as never);
    mockedFetch.mockResolvedValue(
      jsonResponse({ message: 'Email not verified' }, { status: 401 }),
    );

    const res = await login(
      new Request('https://ui.example.test/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://ui.example.test',
        },
        body: JSON.stringify({
          email: 'unverified@example.com',
          password: 'Password1',
        }),
      }),
    );

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({
      message: 'Email not verified',
      code: 'EMAIL_NOT_VERIFIED',
    });
  });

  it('rejects cross-site auth requests', async () => {
    const res = rejectCrossSiteRequest(
      new Request('https://ui.example.test/api/auth/login', {
        method: 'POST',
        headers: { Origin: 'https://evil.example.test' },
      }),
    );

    expect(res).not.toBeNull();
    expect(res?.status).toBe(403);
    await expect(res?.json()).resolves.toEqual({
      message: 'Invalid request origin',
    });
  });
});
