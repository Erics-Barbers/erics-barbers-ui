import { notFound } from 'next/navigation';
import { DebugSentryClient } from './debug-sentry-client';

export const dynamic = 'force-dynamic';

export default function DebugSentryPage() {
  if (process.env.SENTRY_DEBUG_ENABLED !== 'true') {
    notFound();
  }

  return <DebugSentryClient />;
}
