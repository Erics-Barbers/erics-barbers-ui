import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.SENTRY_DEBUG_ENABLED !== 'true') {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  throw new Error('Sentry server test error');
}
