import { forwardApiRequest } from '../../_utils/api-proxy';
import { rejectCrossSiteRequest } from '../../auth/_utils/reject-cross-site-request';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;
  return forwardApiRequest(req, `/booking/${encodeURIComponent(id)}`);
}

export async function PATCH(req: Request, context: RouteContext) {
  const crossSiteResponse = rejectCrossSiteRequest(req);
  if (crossSiteResponse) return crossSiteResponse;

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  return forwardApiRequest(req, `/booking/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
  });
}
