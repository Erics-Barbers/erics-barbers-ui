'use client';

import AuthPageShell from '@/app/components/auth/auth-page-shell';
import AuthSubmitButton from '@/app/components/auth/auth-submit-button';
import AuthTextField from '@/app/components/auth/auth-text-field';
import Notification from '@/app/components/notification';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';

type ResetPasswordFlowProps = {
  description: string;
  loginHref: string;
  title: string;
};

export default function ResetPasswordFlow({
  description,
  loginHref,
  title,
}: ResetPasswordFlowProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [passwordMismatch, setPasswordMismatch] = React.useState(false);

  const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);

    if (newPassword !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    setPasswordMismatch(false);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok) {
        throw new Error(`Password reset failed with status ${res.status}`);
      }

      setSubmitted(true);
    } catch (e) {
      console.error('Password reset failed:', e);
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
            Ready to sign in?{' '}
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
              Your password has been updated.
            </p>
            <Link
              href={loginHref}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-zinc-100 px-4 text-base font-medium text-black hover:bg-zinc-300"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={resetPassword}>
            {!token ? (
              <p className="text-sm leading-6 text-red-300">
                This reset link is missing a token. Request a new link and try
                again.
              </p>
            ) : null}
            <AuthTextField
              autoComplete="new-password"
              disabled={submitting || !token}
              label="New password"
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              value={newPassword}
            />
            <AuthTextField
              autoComplete="new-password"
              disabled={submitting || !token}
              error={passwordMismatch}
              helperText={passwordMismatch ? 'Passwords do not match' : ' '}
              label="Confirm password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              value={confirmPassword}
            />
            <AuthSubmitButton disabled={!token} loading={submitting}>
              Reset password
            </AuthSubmitButton>
          </form>
        )}
      </AuthPageShell>

      <Notification
        message="Password reset failed. Request a new link and try again."
        open={error}
        type="error"
        onClose={() => {
          setError(false);
        }}
      />
    </>
  );
}
