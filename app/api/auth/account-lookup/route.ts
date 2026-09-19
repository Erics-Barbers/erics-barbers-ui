import { NextResponse } from 'next/server';
import { rejectCrossSiteRequest } from '../_utils/reject-cross-site-request';

export async function POST(req: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(req);
  if (crossSiteResponse) return crossSiteResponse;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: 'API base URL is not configured' },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const apiRes = await fetch(`${apiBaseUrl}/auth/account-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await apiRes.json().catch(() => ({}));

  return NextResponse.json(data, { status: apiRes.status });
}
