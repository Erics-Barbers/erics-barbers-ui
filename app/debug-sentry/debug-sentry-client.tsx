'use client';

import { useState } from 'react';

export function DebugSentryClient() {
  const [serverStatus, setServerStatus] = useState<string>();

  function triggerBrowserError() {
    throw new Error('Sentry browser test error');
  }

  async function triggerServerError() {
    setServerStatus('Sending server error...');
    const response = await fetch('/api/debug-sentry', {
      cache: 'no-store',
    });

    setServerStatus(
      response.ok
        ? 'The server unexpectedly returned successfully.'
        : 'Server error sent. Check Sentry for the event.',
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-6 py-16 text-zinc-950 dark:text-zinc-50">
      <h1 className="text-3xl font-semibold">Sentry diagnostics</h1>
      <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
        Trigger one error at a time, then confirm its stack trace in Sentry.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          className="h-11 border border-zinc-950 bg-zinc-950 px-5 font-medium text-white hover:bg-zinc-800 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          onClick={triggerBrowserError}
          type="button"
        >
          Trigger browser error
        </button>
        <button
          className="h-11 border border-zinc-300 px-5 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          onClick={triggerServerError}
          type="button"
        >
          Trigger server error
        </button>
      </div>

      {serverStatus ? (
        <p
          className="mt-4 text-sm text-zinc-600 dark:text-zinc-300"
          role="status"
        >
          {serverStatus}
        </p>
      ) : null}
    </main>
  );
}
