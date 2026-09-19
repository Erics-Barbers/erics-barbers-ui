import { forwardApiRequest } from '../_utils/api-proxy';
import { rejectCrossSiteRequest } from '../auth/_utils/reject-cross-site-request';

export async function GET(req: Request) {
  return forwardApiRequest(req, '/booking');
}

export async function POST(req: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(req);
  if (crossSiteResponse) return crossSiteResponse;

  const body = await req.json().catch(() => ({}));
  const idempotencyKey = req.headers.get('idempotency-key');

  if (!idempotencyKey) {
    return Response.json(
      { message: 'Idempotency-Key header is required' },
      { status: 400 },
    );
  }

  return forwardApiRequest(req, '/booking', {
    body,
    headers: { 'Idempotency-Key': idempotencyKey },
    method: 'POST',
    requireAuth: false,
  });
}
