'use client';

import Link from 'next/link';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function EmailVerifyInner() {
  const [verifying, setVerifying] = React.useState(true);
  const [verified, setVerified] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const verifyEmail = React.useCallback(async () => {
    if (!token) {
      setError('No token provided.');
      setVerifying(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Email verification failed.');
      }

      setVerified(true);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Email verification failed.',
      );
    } finally {
      setVerifying(false);
    }
  }, [token]);

  React.useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  let content;
  if (verifying) {
    content = (
      <>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Verifying your email
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400 sm:text-base">
          This should only take a moment.
        </p>
      </>
    );
  } else if (verified) {
    content = (
      <>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Email verified
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400 sm:text-base">
          Your account is ready. You can manage your profile or continue to
          booking.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            className="flex h-12 items-center justify-center rounded-full bg-zinc-50 px-6 text-base font-medium text-black transition-colors hover:bg-zinc-300"
            href="/my-account"
          >
            My Account
          </Link>
          <Link
            className="flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-base font-medium text-zinc-50 transition-colors hover:bg-white/10"
            href="/bookings"
          >
            Book Now
          </Link>
        </div>
      </>
    );
  } else if (error) {
    content = (
      <>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Verification failed
        </h1>
        <p className="mt-4 text-sm leading-6 text-red-300">{error}</p>
        <Link
          className="mt-6 flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-base font-medium text-zinc-50 transition-colors hover:bg-white/10"
          href="/verify-email"
        >
          Resend verification email
        </Link>
      </>
    );
  } else {
    content = (
      <p className="text-sm leading-6 text-zinc-400">
        Unable to determine verification status.
      </p>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-black px-4 py-12 text-zinc-50 sm:px-6">
      <section className="w-full max-w-xl rounded-2xl border border-white/15 bg-zinc-950 p-6 text-center sm:p-8">
        {content}
      </section>
    </main>
  );
}

export default function EmailVerify() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center bg-black px-4 py-12 text-zinc-50 sm:px-6">
          <section className="w-full max-w-xl rounded-2xl border border-white/15 bg-zinc-950 p-6 text-center sm:p-8">
            Loading...
          </section>
        </main>
      }
    >
      <EmailVerifyInner />
    </Suspense>
  );
}
