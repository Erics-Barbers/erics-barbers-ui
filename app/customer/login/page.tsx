'use client';

import AuthPageShell from '@/app/components/auth/auth-page-shell';
import AuthSubmitButton from '@/app/components/auth/auth-submit-button';
import AuthTextField from '@/app/components/auth/auth-text-field';
import Notification from '@/app/components/notification';
import Link from 'next/link';
import LoginForm from './form';
import React from 'react';
import { useRouter } from 'next/navigation';

type LoginErrorResponse = {
  code?: string;
};

type LoginMfaRequiredResponse = {
  code?: string;
  challengeId?: string;
  mfaMethod?: string;
};

type MfaChallenge = {
  challengeId: string;
  method: string;
};

const DEFAULT_LOGIN_ERROR =
  'We could not sign you in with those details. Check your email and password, or reset your password if you are unsure.';
const RATE_LIMIT_LOGIN_ERROR =
  'Too many sign-in attempts. Wait a minute, then try again.';
const SERVICE_LOGIN_ERROR =
  'We could not reach sign-in right now. Try again shortly.';
const MFA_VERIFICATION_ERROR =
  'That verification code did not work or has expired. Check the latest email and try again.';

class UserFacingAuthError extends Error {}

function getLoginErrorMessage(status: number) {
  if (status === 429) return RATE_LIMIT_LOGIN_ERROR;
  if (status >= 500) return SERVICE_LOGIN_ERROR;
  return DEFAULT_LOGIN_ERROR;
}

function getUserFacingErrorMessage(error: unknown, fallback: string) {
  return error instanceof UserFacingAuthError ? error.message : fallback;
}

export default function Login() {
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [mfaChallenge, setMfaChallenge] = React.useState<MfaChallenge | null>(
    null,
  );
  const [mfaCode, setMfaCode] = React.useState('');
  const router = useRouter();

  const loginUser = async (email: string, password: string) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res
          .json()
          .catch(() => null)) as LoginErrorResponse | null;

        if (data?.code === 'EMAIL_NOT_VERIFIED') {
          localStorage.setItem('userEmail', email);
          router.push('/verify-email');
          return;
        }

        throw new UserFacingAuthError(getLoginErrorMessage(res.status));
      }

      const data = (await res
        .json()
        .catch(() => null)) as LoginMfaRequiredResponse | null;

      if (data?.code === 'MFA_REQUIRED' && data.challengeId && data.mfaMethod) {
        setMfaChallenge({
          challengeId: data.challengeId,
          method: data.mfaMethod,
        });
        return;
      }

      router.push('/my-account');
    } catch (e) {
      console.error('Login failed:', e);
      setErrorMessage(getUserFacingErrorMessage(e, SERVICE_LOGIN_ERROR));
    } finally {
      setSubmitting(false);
    }
  };

  const verifyMfa = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mfaChallenge) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: mfaChallenge.challengeId,
          code: mfaCode,
        }),
      });

      if (!res.ok) {
        throw new UserFacingAuthError(MFA_VERIFICATION_ERROR);
      }

      router.push('/my-account');
    } catch (e) {
      console.error('MFA verification failed:', e);
      setErrorMessage(getUserFacingErrorMessage(e, MFA_VERIFICATION_ERROR));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthPageShell
        description="Manage your bookings and keep your appointment details in one place."
        footer={
          <>
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-zinc-50 underline underline-offset-4"
            >
              Register here
            </Link>
          </>
        }
        title="Log in to your account"
      >
        {mfaChallenge ? (
          <form className="flex flex-col gap-4" onSubmit={verifyMfa}>
            <p className="text-sm leading-6 text-zinc-400">
              Enter the verification code for your {mfaChallenge.method}{' '}
              authentication.
            </p>
            <AuthTextField
              autoComplete="one-time-code"
              disabled={submitting}
              inputProps={{ inputMode: 'numeric', maxLength: 6 }}
              label="Verification code"
              onChange={(e) => setMfaCode(e.target.value)}
              type="text"
              value={mfaCode}
            />
            <AuthSubmitButton loading={submitting}>Verify code</AuthSubmitButton>
          </form>
        ) : (
          <LoginForm submitting={submitting} onLogin={loginUser} />
        )}
      </AuthPageShell>

      <Notification
        message={errorMessage ?? ''}
        open={Boolean(errorMessage)}
        type="error"
        onClose={() => {
          setErrorMessage(null);
        }}
      />
    </>
  );
}
