import { cookies } from 'next/headers';
import { POST as login } from '../app/api/auth/login/route';
import { POST as logout } from '../app/api/auth/logout/route';
import { POST as requestPasswordReset } from '../app/api/auth/reset-password-email/route';
import { POST as resetPassword } from '../app/api/auth/reset-password/route';
import {
  GET as profile,
  PUT as updateProfile,
} from '../app/api/auth/profile/route';
import { POST as verifyMfa } from '../app/api/auth/verify-mfa/route';
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

function createJwt(payload: Record<string, unknown>): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url',
  );
  return `header.${encodedPayload}.signature`;
}

const mockedCookies = jest.mocked(cookies);
const mockedFetch = jest.fn();

describe('auth route handlers', () => {
  const originalFetch = global.fetch;
  const originalApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalStaffSiteUrl = process.env.NEXT_PUBLIC_STAFF_SITE_URL;
  const originalTestStaffSiteUrl =
    process.env.NEXT_PUBLIC_TEST_STAFF_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.test';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://ui.example.test';
    process.env.NEXT_PUBLIC_STAFF_SITE_URL = 'https://staff.example.test';
    process.env.NEXT_PUBLIC_TEST_STAFF_SITE_URL =
      'https://test-staff.example.test';
    global.fetch = mockedFetch;
    mockedFetch.mockReset();
    mockedCookies.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBaseUrl;
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    process.env.NEXT_PUBLIC_STAFF_SITE_URL = originalStaffSiteUrl;
    process.env.NEXT_PUBLIC_TEST_STAFF_SITE_URL =
      originalTestStaffSiteUrl;
  });

  it('refreshes and retries profile when the access token is rejected', async () => {
    const cookieStore = createCookieStore({
      accessToken: 'old-access-token',
      refreshToken: 'old-refresh-token',
    });
    mockedCookies.mockResolvedValue(cookieStore as never);

    mockedFetch
      .mockResolvedValueOnce(
        jsonResponse({ message: 'expired' }, { status: 401 }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          refreshMaxAgeSeconds: 43_200,
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
    expect(setCookie).toContain('Max-Age=43200');
  });

  it('clears both auth cookies when profile refresh fails', async () => {
    const cookieStore = createCookieStore({
      accessToken: 'old-access-token',
      refreshToken: 'old-refresh-token',
    });
    mockedCookies.mockResolvedValue(cookieStore as never);

    mockedFetch
      .mockResolvedValueOnce(
        jsonResponse({ message: 'expired' }, { status: 401 }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ message: 'invalid' }, { status: 401 }),
      );

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

  it('updates profile through the BFF with the access token', async () => {
    mockedCookies.mockResolvedValue(
      createCookieStore({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }) as never,
    );
    mockedFetch.mockResolvedValue(
      jsonResponse({
        id: 'user-1',
        name: 'Updated Name',
        email: 'test@example.com',
        isEmailVerified: true,
      }),
    );

    const res = await updateProfile(
      new Request('https://ui.example.test/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://ui.example.test',
        },
        body: JSON.stringify({ name: 'Updated Name' }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      id: 'user-1',
      name: 'Updated Name',
      email: 'test@example.com',
      isEmailVerified: true,
    });
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://api.example.test/auth/profile',
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Updated Name' }),
      },
    );
  });

  it('refreshes and retries profile update when the access token is rejected', async () => {
    mockedCookies.mockResolvedValue(
      createCookieStore({
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
      }) as never,
    );

    mockedFetch
      .mockResolvedValueOnce(
        jsonResponse({ message: 'expired' }, { status: 401 }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          refreshMaxAgeSeconds: 604_800,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'user-1',
          name: 'Updated Name',
          email: 'test@example.com',
          isEmailVerified: true,
        }),
      );

    const res = await updateProfile(
      new Request('https://ui.example.test/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://ui.example.test',
          'User-Agent': 'jest-agent',
        },
        body: JSON.stringify({ name: 'Updated Name' }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      id: 'user-1',
      name: 'Updated Name',
      email: 'test@example.com',
      isEmailVerified: true,
    });
    expect(mockedFetch).toHaveBeenNthCalledWith(
      1,
      'https://api.example.test/auth/profile',
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer old-access-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Updated Name' }),
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
        method: 'PUT',
        headers: {
          Authorization: 'Bearer new-access-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Updated Name' }),
      },
    );

    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('accessToken=new-access-token');
    expect(setCookie).toContain('refreshToken=new-refresh-token');
    expect(setCookie).toContain('Max-Age=604800');
  });

  it('sets auth cookies after login succeeds using the API refresh lifetime', async () => {
    const cookieStore = createCookieStore();
    mockedCookies.mockResolvedValue(cookieStore as never);
    mockedFetch.mockResolvedValue(
      jsonResponse({
        accessToken: createJwt({
          role: 'CUSTOMER',
          tokenType: 'access',
        }),
        refreshToken: 'refresh-token',
        refreshMaxAgeSeconds: 43_200,
      }),
    );

    const res = await login(
      new Request('https://ui.example.test/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://ui.example.test',
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'Password1',
          rememberMe: false,
        }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: 'Logged in',
      redirectTo: '/my-account',
      role: 'CUSTOMER',
    });
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://api.example.test/auth/login',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'Password1',
          rememberMe: false,
        }),
      }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      'accessToken',
      createJwt({
        role: 'CUSTOMER',
        tokenType: 'access',
      }),
      expect.objectContaining({ maxAge: 60 * 15 }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({ maxAge: 43_200 }),
    );
  });

  it('returns the staff dashboard URL after barber login on the customer domain', async () => {
    const cookieStore = createCookieStore();
    const accessToken = createJwt({
      role: 'BARBER',
      tokenType: 'access',
    });

    mockedCookies.mockResolvedValue(cookieStore as never);
    mockedFetch.mockResolvedValue(
      jsonResponse({
        accessToken,
        refreshToken: 'refresh-token',
        refreshMaxAgeSeconds: 43_200,
      }),
    );

    const res = await login(
      new Request('https://ui.example.test/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://ui.example.test',
        },
        body: JSON.stringify({
          email: 'barber@example.com',
          password: 'Password1',
        }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: 'Logged in',
      redirectTo: 'https://staff.example.test/dashboard',
      role: 'BARBER',
    });
  });

  it('returns a clean staff dashboard path after admin login on the staff domain', async () => {
    const cookieStore = createCookieStore();
    const accessToken = createJwt({
      role: 'ADMIN',
      tokenType: 'access',
    });

    mockedCookies.mockResolvedValue(cookieStore as never);
    mockedFetch.mockResolvedValue(
      jsonResponse({
        accessToken,
        refreshToken: 'refresh-token',
        refreshMaxAgeSeconds: 43_200,
      }),
    );

    const res = await login(
      new Request('https://staff.example.test/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Host: 'staff.example.test',
          Origin: 'https://staff.example.test',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'Password1',
        }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: 'Logged in',
      redirectTo: '/dashboard',
      role: 'ADMIN',
    });
  });

  it('logs out locally even when the API logout call rejects', async () => {
    const cookieStore = createCookieStore({
      refreshToken: 'refresh-token',
    });
    mockedCookies.mockResolvedValue(cookieStore as never);
    mockedFetch.mockResolvedValue(
      jsonResponse({ message: 'unauthorized' }, { status: 401 }),
    );

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

  it('requests a staff password reset email through the BFF', async () => {
    mockedFetch.mockResolvedValue(
      jsonResponse({
        message: 'Password reset link sent to email if it exists',
      }),
    );

    const res = await requestPasswordReset(
      new Request('https://staff.example.test/api/auth/reset-password-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://staff.example.test',
        },
        body: JSON.stringify({
          email: 'barber@example.com',
          surface: 'STAFF',
        }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: 'Password reset link sent to email if it exists',
    });
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://api.example.test/auth/reset-password-email',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'barber@example.com',
          surface: 'STAFF',
        }),
      },
    );
  });

  it('forwards password reset submissions through the BFF', async () => {
    mockedFetch.mockResolvedValue(
      jsonResponse({ message: 'Password reset successfully' }),
    );

    const res = await resetPassword(
      new Request('https://ui.example.test/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://ui.example.test',
        },
        body: JSON.stringify({
          token: 'password-reset-token',
          newPassword: 'NewPassword1',
        }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: 'Password reset successfully',
    });
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://api.example.test/auth/reset-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'password-reset-token',
          newPassword: 'NewPassword1',
        }),
      },
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

  it('returns MFA_REQUIRED without setting cookies when login requires MFA', async () => {
    const cookieStore = createCookieStore();
    mockedCookies.mockResolvedValue(cookieStore as never);
    mockedFetch.mockResolvedValue(
      jsonResponse({
        message: 'MFA required',
        code: 'MFA_REQUIRED',
        mfaRequired: true,
        challengeId: 'challenge-id',
        mfaMethod: 'EMAIL',
      }),
    );

    const res = await login(
      new Request('https://ui.example.test/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://ui.example.test',
        },
        body: JSON.stringify({
          email: 'mfa@example.com',
          password: 'Password1',
        }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: 'MFA required',
      code: 'MFA_REQUIRED',
      mfaRequired: true,
      challengeId: 'challenge-id',
      mfaMethod: 'EMAIL',
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it('sets auth cookies after MFA verification succeeds', async () => {
    const cookieStore = createCookieStore();
    mockedCookies.mockResolvedValue(cookieStore as never);
    const accessToken = createJwt({
      role: 'CUSTOMER',
      tokenType: 'access',
    });
    mockedFetch.mockResolvedValue(
      jsonResponse({
        accessToken,
        refreshToken: 'refresh-token',
        refreshMaxAgeSeconds: 604_800,
      }),
    );

    const res = await verifyMfa(
      new Request('https://ui.example.test/api/auth/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://ui.example.test',
        },
        body: JSON.stringify({
          challengeId: 'challenge-id',
          code: '123456',
        }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: 'Logged in',
      redirectTo: '/my-account',
      role: 'CUSTOMER',
    });
    expect(cookieStore.set).toHaveBeenCalledWith(
      'accessToken',
      accessToken,
      expect.objectContaining({ maxAge: 60 * 15 }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({ maxAge: 604_800 }),
    );
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
