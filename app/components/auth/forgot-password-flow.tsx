'use client';

import AuthPageShell from '@/app/components/auth/auth-page-shell';
import AuthSubmitButton from '@/app/components/auth/auth-submit-button';
import AuthTextField from '@/app/components/auth/auth-text-field';
import Notification from '@/app/components/notification';
import Link from 'next/link';
import React from 'react';

type PasswordResetSurface = 'CUSTOMER' | 'STAFF';

type ForgotPasswordFlowProps = {
  description: string;
  loginHref: string;
  surface: PasswordResetSurface;
  title: string;
};

export default function ForgotPasswordFlow({
  description,
  loginHref,
  surface,
  title,
}: ForgotPasswordFlowProps) {
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState(false);

  const requestResetLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(false);

    try {
      const res = await fetch('/api/auth/reset-password-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, surface }),
      });

      if (!res.ok) {
        throw new Error(`Password reset email failed with status ${res.status}`);
      }

      setSubmitted(true);
    } catch (e) {
      console.error('Password reset email failed:', e);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthPageShell
        description={description}
        footer={
          <>
            Remembered your password?{' '}
            <Link
              href={loginHref}
              className="font-medium text-zinc-50 underline underline-offset-4"
            >
              Back to login
            </Link>
          </>
        }
        title={title}
      >
        {submitted ? (
          <div className="space-y-5 text-center">
            <p className="text-sm leading-6 text-zinc-300">
              If an account exists for that email, a reset link has been sent.
            </p>
            <Link
              href={loginHref}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-zinc-100 px-4 text-base font-medium text-black hover:bg-zinc-300"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={requestResetLink}>
            <AuthTextField
              autoComplete="email"
              disabled={submitting}
              label="Email"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              value={email}
            />
            <AuthSubmitButton loading={submitting}>
              Send reset link
            </AuthSubmitButton>
          </form>
        )}
      </AuthPageShell>

      <Notification
        message="Password reset request failed. Please try again."
        open={error}
        type="error"
        onClose={() => {
          setError(false);
        }}
      />
    </>
  );
}
