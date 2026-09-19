'use client';

import AuthPageShell from '@/app/components/auth/auth-page-shell';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type EmailVerifyView = {
  actions?: React.ReactNode;
  description: string;
  title: string;
};

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

  let view: EmailVerifyView;
  if (verifying) {
    view = {
      title: 'Verifying your email',
      description: 'This should only take a moment.',
    };
  } else if (verified) {
    view = {
      title: 'Email verified',
      description:
        'Your account is ready. Any previous bookings made with this email will appear in your account.',
      actions: (
        <div className="mx-auto flex max-w-sm flex-col gap-3">
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-50 px-6 text-base font-medium text-black transition-colors hover:bg-zinc-300"
            href="/my-account"
          >
            My Account
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-white/20 px-6 text-base font-medium text-zinc-50 transition-colors hover:bg-white/10"
            href="/bookings"
          >
            Book Now
          </Link>
        </div>
      ),
    };
  } else if (error) {
    view = {
      title: 'Verification failed',
      description: error,
      actions: (
        <Link
          className="mx-auto flex h-12 w-full max-w-sm items-center justify-center rounded-full border border-white/20 px-6 text-base font-medium text-zinc-50 transition-colors hover:bg-white/10"
          href="/verify-email"
        >
          Resend verification email
        </Link>
      ),
    };
  } else {
    view = {
      title: 'Verification status unavailable',
      description: 'Unable to determine verification status.',
    };
  }

  return (
    <AuthPageShell
      description={view.description}
      footer={null}
      title={view.title}
    >
      {view.actions}
    </AuthPageShell>
  );
}

export default function EmailVerify() {
  return (
    <Suspense
      fallback={
        <AuthPageShell
          description="This should only take a moment."
          footer={null}
          title="Verifying your email"
        >
          {null}
        </AuthPageShell>
      }
    >
      <EmailVerifyInner />
    </Suspense>
  );
}
