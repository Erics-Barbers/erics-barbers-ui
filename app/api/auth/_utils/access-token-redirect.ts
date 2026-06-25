type AccessTokenPayload = {
  role?: string;
  tokenType?: string;
};

export type LoginSuccessBody = {
  message: 'Logged in';
  redirectTo: string;
  role?: string;
};

function decodeJwtPayload(token: string): AccessTokenPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );

    return JSON.parse(atob(padded)) as AccessTokenPayload;
  } catch {
    return null;
  }
}

function getConfiguredUrl(url: string | undefined): URL | null {
  if (!url) return null;

  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function getRequestHostname(req: Request): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost ?? req.headers.get('host') ?? '';
  return host.split(':')[0]?.toLowerCase() ?? '';
}

function isStaffHostname(hostname: string): boolean {
  const configuredStaffHostnames = [
    getConfiguredUrl(process.env.NEXT_PUBLIC_STAFF_SITE_URL)?.hostname,
    getConfiguredUrl(process.env.NEXT_PUBLIC_TEST_STAFF_SITE_URL)?.hostname,
  ].filter(Boolean);

  return (
    configuredStaffHostnames.includes(hostname) ||
    hostname.startsWith('staff.') ||
    hostname.startsWith('test-staff.') ||
    hostname === 'staff.localhost' ||
    hostname === 'test-staff.localhost'
  );
}

function withPath(baseUrl: URL | null, path: string): string {
  if (!baseUrl) return path;

  const url = new URL(baseUrl);
  url.pathname = path;
  url.search = '';
  url.hash = '';
  return url.toString();
}

function getRedirectTo(role: string | undefined, req: Request): string {
  const normalizedRole = role?.toUpperCase();
  const requestIsStaffHost = isStaffHostname(getRequestHostname(req));
  const staffUrl = getConfiguredUrl(process.env.NEXT_PUBLIC_STAFF_SITE_URL);
  const customerUrl = getConfiguredUrl(process.env.NEXT_PUBLIC_SITE_URL);

  if (normalizedRole === 'BARBER' || normalizedRole === 'ADMIN') {
    return requestIsStaffHost ? '/dashboard' : withPath(staffUrl, '/dashboard');
  }

  return requestIsStaffHost ? withPath(customerUrl, '/my-account') : '/my-account';
}

export function createLoginSuccessBody(
  accessToken: string,
  req: Request,
): LoginSuccessBody {
  const payload = decodeJwtPayload(accessToken);
  const role = payload?.tokenType === 'access' ? payload.role : undefined;

  return {
    message: 'Logged in',
    redirectTo: getRedirectTo(role, req),
    ...(role ? { role } : {}),
  };
}
