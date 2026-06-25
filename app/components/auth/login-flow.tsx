'use client';

import AuthPageShell from '@/app/components/auth/auth-page-shell';
import AuthSubmitButton from '@/app/components/auth/auth-submit-button';
import AuthTextField from '@/app/components/auth/auth-text-field';
import LoginForm from '@/app/components/auth/login-form';
import Notification from '@/app/components/notification';
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

type LoginSuccessResponse = {
  redirectTo?: string;
};

type MfaChallenge = {
  challengeId: string;
  method: string;
};

type LoginFlowProps = {
  description: string;
  footer: React.ReactNode;
  title: string;
};

export default function LoginFlow({
  description,
  footer,
  title,
}: LoginFlowProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [mfaChallenge, setMfaChallenge] = React.useState<MfaChallenge | null>(
    null,
  );
  const [mfaCode, setMfaCode] = React.useState('');
  const router = useRouter();

  const navigateTo = React.useCallback(
    (target: string) => {
      if (/^https?:\/\//i.test(target)) {
        window.location.assign(target);
        return;
      }

      router.push(target);
    },
    [router],
  );

  const loginUser = async (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => {
    setSubmitting(true);
    setError(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!res.ok) {
        const data = (await res
          .json()
          .catch(() => null)) as LoginErrorResponse | null;

        if (data?.code === 'EMAIL_NOT_VERIFIED') {
          localStorage.setItem('userEmail', email);
          navigateTo('/verify-email');
          return;
        }

        throw new Error(`Login failed with status ${res.status}`);
      }

      const data = (await res.json().catch(() => null)) as
        | (LoginMfaRequiredResponse & LoginSuccessResponse)
        | null;

      if (data?.code === 'MFA_REQUIRED' && data.challengeId && data.mfaMethod) {
        setMfaChallenge({
          challengeId: data.challengeId,
          method: data.mfaMethod,
        });
        return;
      }

      navigateTo(data?.redirectTo ?? '/my-account');
    } catch (e) {
      console.error('Login failed:', e);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const verifyMfa = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mfaChallenge) return;

    setSubmitting(true);
    setError(false);

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
        throw new Error(`MFA verification failed with status ${res.status}`);
      }

      const data = (await res
        .json()
        .catch(() => null)) as LoginSuccessResponse | null;

      navigateTo(data?.redirectTo ?? '/my-account');
    } catch (e) {
      console.error('MFA verification failed:', e);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthPageShell description={description} footer={footer} title={title}>
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
        message="Login failed. Please try again."
        open={error}
        type="error"
        onClose={() => {
          setError(false);
        }}
      />
    </>
  );
}
