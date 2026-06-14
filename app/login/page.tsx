'use client';

import Link from 'next/link';
import LoginForm from './form';
import React from 'react';
import { useRouter } from 'next/navigation';
import Notification from '@/app/components/notification';
import { Button, TextField } from '@mui/material';

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

export default function Login() {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [mfaChallenge, setMfaChallenge] = React.useState<MfaChallenge | null>(
    null,
  );
  const [mfaCode, setMfaCode] = React.useState('');
  const router = useRouter();

  const loginUser = async (email: string, password: string) => {
    setSubmitting(true);
    setError(false);

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

        throw new Error(`Login failed with status ${res.status}`);
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

      router.push('/my-account');
    } catch (e) {
      console.error('MFA verification failed:', e);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col py-16 items-center bg-black">
      <h1 className="text-4xl font-bold mb-8">Login to Your Account</h1>
      {mfaChallenge ? (
        <form onSubmit={verifyMfa}>
          <div className="flex flex-col gap-4 mx-auto mt-10">
            <TextField
              label="Verification code"
              type="text"
              variant="outlined"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              inputProps={{ inputMode: 'numeric', maxLength: 6 }}
              InputProps={{
                style: { backgroundColor: '#fff3cd', borderRadius: 12 },
              }}
              InputLabelProps={{
                shrink: true,
                style: { color: '#fff', position: 'static' },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              loading={submitting}
            >
              Verify
            </Button>
          </div>
        </form>
      ) : (
        <LoginForm submitting={submitting} onLogin={loginUser} />
      )}
      <span className="mt-4 text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-500">
          Register here
        </Link>
      </span>

      <Notification
        message="Login failed. Please try again."
        open={error}
        type="error"
        onClose={() => {
          setError(false);
        }}
      />
    </div>
  );
}
