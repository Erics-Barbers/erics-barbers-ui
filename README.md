# Eric's Barbers Web App

The Next.js customer, staff, and administration web client for Eric's Barbers. The application uses host-aware routing and a browser backend-for-frontend (BFF) for authentication.

This repository remains the production web experience alongside the separate React Native customer app. Responsive web support does not make this repository the mobile application's codebase.

## Current capabilities

- customer registration, email verification, login, email MFA, password recovery, profile, and logout
- HttpOnly access/refresh cookie handling through Next.js route handlers
- public services, barbers, availability, guest booking, and booking-management foundations
- authenticated customer booking-management foundations
- staff interface foundations, with some operational workflows still backed by sample/static data
- generated OpenAPI client and model types

## Technology

- Next.js 16 and React 19
- TypeScript
- Material UI and Tailwind CSS
- Jest and Testing Library
- OpenAPI-generated API code

## Architecture boundary

Browser authentication calls local Next.js routes under `/api/auth/*`. Those route handlers communicate with NestJS and own browser HttpOnly cookies, refresh retries, same-origin checks, and logout cleanup. Browser auth code must not bypass this boundary by calling NestJS auth endpoints directly.

The React Native app has a separate native authentication contract and communicates directly with NestJS. Business rules remain shared and are enforced by the API.

## Prerequisites

- Node.js 22
- npm
- a running Eric's Barbers API for integrated flows

## Install and run

```bash
npm install
npm run dev
```

The local customer site is normally available at [http://localhost:3000](http://localhost:3000).

## Important commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Regenerate the API client and build the application. |
| `npm run lint` | Run ESLint. |
| `npm run test` | Run the test suite. |
| `npm run generate:api-client` | Generate client code from `api/api-spec.json`. |

The canonical contract belongs to the API repository at `openapi/openapi.json`. The web copy must be synchronized from that artifact rather than edited independently.

## Structure

```text
app/                 routes, UI, and Next.js BFF route handlers
api/api-spec.json    synchronized copy of the API-owned OpenAPI contract
api/generated/       generated API client
api/repositories/    web data-access wrappers
test/                focused web and BFF tests
proxy.ts             host routing, route protection, and refresh behavior
```

See [authentication notes](docs/authentication.md) for the implemented browser flow and the central [architecture documentation](https://github.com/Erics-Barbers/erics-barbers-docs) for shared requirements, roadmaps, and ADRs.
