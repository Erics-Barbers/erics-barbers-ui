'use client';

import AuthPageShell from '@/app/components/auth/auth-page-shell';
import Notification from '@/app/components/notification';
import Link from 'next/link';
import RegisterForm from './form';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  const registerUser = async (email: string, password: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Registration failed.');
      }

      localStorage.setItem('userEmail', email);
      router.push('/verify-email');
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Registration failed.',
      );
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthPageShell
        description="Create an account to book faster and keep track of your appointments."
        footer={
          <>
            <p>
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-zinc-50 underline underline-offset-4"
              >
                Log in here
              </Link>
            </p>
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              By signing up, you agree to our{' '}
              <Link
                href="/terms-of-service"
                className="underline underline-offset-4"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </>
        }
        title="Create your account"
      >
        <RegisterForm submitting={submitting} onRegister={registerUser} />
      </AuthPageShell>

      <Notification
        message={`Registration failed: ${errorMessage}`}
        open={error}
        type="error"
        onClose={() => {
          setError(false);
        }}
      />
    </>
  );
}
