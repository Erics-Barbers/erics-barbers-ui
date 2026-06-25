# Authentication

The UI uses a BFF-style auth flow. Browser code calls local Next.js routes under `/api/auth/*`; those route handlers call the NestJS API from the server and manage browser cookies on the UI domain.

Browser components should not call NestJS auth endpoints directly.

## Responsibilities

Next.js owns browser-facing auth behavior:

- set and clear HttpOnly `accessToken` and `refreshToken` cookies
- reject cross-site auth POST requests
- refresh access tokens when possible
- redirect protected pages to `/login`
- keep auth response bodies small so tokens are not exposed to client code unnecessarily

NestJS owns backend auth behavior:

- validate credentials
- issue access and refresh tokens
- store refresh session hashes
- rotate refresh tokens
- verify email/password reset tokens
- enforce API authorization

## Cookies

The BFF stores two cookies:

- `accessToken`: HttpOnly, SameSite=Lax, 15 minute lifetime.
- `refreshToken`: HttpOnly, SameSite=Lax, 12 hour lifetime by default, or 7 days when the user selects "keep me signed in".

Client components should not read these cookies. They are intentionally HttpOnly.

## Login And Email Verification

The browser posts to:

- `POST /api/auth/login`
- `POST /api/auth/verify-email`

The Next.js route handler forwards the request to NestJS, receives `accessToken`, `refreshToken`, and `refreshMaxAgeSeconds`, sets HttpOnly cookies, and returns a small success response to the browser.

The login form sends `rememberMe`. When it is false, the backend issues a shorter refresh session. When it is true, the backend issues the longer "keep me signed in" refresh session. The BFF does not choose this duration itself; it uses `refreshMaxAgeSeconds` from the API response.

If login returns `code: MFA_REQUIRED`, the route handler does not set auth cookies. The login page asks for the email code and then posts to `POST /api/auth/verify-mfa`. Only successful MFA verification sets the `accessToken` and `refreshToken` cookies.

External provider buttons should remain hidden unless:

```text
NEXT_PUBLIC_AUTH_EXTERNAL_PROVIDERS_ENABLED=true
```

No external provider login flow is implemented yet.

## Refresh

When the access token is missing or expired, server-side UI auth code can use the refresh cookie to call NestJS `POST /auth/refresh`.

Refresh returns a rotated token pair. The BFF must set both cookies:

- new `accessToken`
- new `refreshToken` using the returned `refreshMaxAgeSeconds`

The current refresh behavior exists in:

- `proxy.ts` for protected page navigation.
- `app/api/auth/profile/route.ts` for profile read/update BFF calls.

## Profile

The `/my-account` page reads account details from `GET /api/auth/profile`.

The same BFF route supports `PUT /api/auth/profile` for profile updates. At the moment, ordinary profile editing only updates the user's display name. Email is displayed read-only because changing login email safely needs a dedicated verification flow.

## Logout

The browser posts to `POST /api/auth/logout`.

The route handler forwards the refresh token to NestJS when available, but local logout is best-effort and always clears both browser cookies. This means logout still works when the access token is expired or the API returns `401`.

The account page redirects to the homepage after a logout click regardless of the backend logout result. Backend logout is also idempotent, so missing or already-invalid refresh tokens still produce a successful API logout response.

## Protected Routes

The proxy protects these route prefixes:

- `/my-account`
- `/bookings`
- `/admin`
- `/barber`
- `/dashboard`
- `/account`
- `/profile`
- `/settings`

If a future private page is added, add its prefix to `protectedRoutePrefixes` and the proxy matcher in `proxy.ts`.

## Generated API Client

The generated API client can be useful for non-auth backend resources, but auth browser flows should keep using the BFF route handlers.

For auth, generated DTO/model types can be imported where useful, but generated `AuthService` methods should not be used by browser auth flows. Explicit server-side `fetch()` calls are preferred because the BFF has to control cookies, retries, redirects, and local logout behavior.

This is enforced with an ESLint `no-restricted-imports` rule that blocks generated `AuthService` imports from app, proxy, test, and repository code while still allowing generated DTO type imports.

## Tests

Auth route handler and proxy behavior is covered by Jest specs in `test/`:

- profile refresh and retry
- profile update forwarding
- profile cookie clearing on refresh failure
- local logout cookie clearing
- cross-site auth request rejection
- protected route redirects
- proxy refresh behavior
