import { forwardApiRequest } from '../../../../_utils/api-proxy';
import { rejectCrossSiteRequest } from '../../../../auth/_utils/reject-cross-site-request';

type RouteContext = {
  params: Promise<{ reference: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const crossSiteResponse = rejectCrossSiteRequest(req);
  if (crossSiteResponse) return crossSiteResponse;

  const { reference } = await context.params;
  return forwardApiRequest(
    req,
    `/booking/reference/${encodeURIComponent(reference)}/cancel`,
    {
      method: 'PATCH',
      requireAuth: false,
    },
  );
}
