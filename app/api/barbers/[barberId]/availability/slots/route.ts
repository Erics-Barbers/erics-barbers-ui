import { forwardApiRequest } from '../../../../_utils/api-proxy';

type RouteContext = {
  params: Promise<{ barberId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  const { barberId } = await context.params;
  const requestUrl = new URL(req.url);
  const date = requestUrl.searchParams.get('date');
  const serviceId = requestUrl.searchParams.get('serviceId');
  const params = new URLSearchParams();

  if (date) params.set('date', date);
  if (serviceId) params.set('serviceId', serviceId);

  return forwardApiRequest(
    req,
    `/barbers/${encodeURIComponent(barberId)}/availability/slots?${params.toString()}`,
    { requireAuth: false },
  );
}
