import { forwardApiRequest } from '../_utils/api-proxy';

export async function GET(req: Request) {
  return forwardApiRequest(req, '/services', { requireAuth: false });
}
