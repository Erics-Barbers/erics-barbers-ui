import { forwardApiRequest } from '../../../_utils/api-proxy';
import { rejectCrossSiteRequest } from '../../../auth/_utils/reject-cross-site-request';

export async function POST(req: Request) {
  const crossSiteResponse = rejectCrossSiteRequest(req);
  if (crossSiteResponse) return crossSiteResponse;

  const body = await req.json().catch(() => ({}));
  return forwardApiRequest(req, '/booking/reference/lookup', {
    body,
    method: 'POST',
    requireAuth: false,
  });
}
