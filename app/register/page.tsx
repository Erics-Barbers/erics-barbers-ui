'use client';

import Link from 'next/link';
import RegisterForm from './form';
import React from 'react';
import Notification from '@/app/components/notification';
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
    <div className="flex flex-1 flex-col py-16 items-center bg-black">
      <h1 className="text-4xl font-bold mb-8">Register Your Account</h1>
      <RegisterForm submitting={submitting} onRegister={registerUser} />
      <span className="mt-4 text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-500">
          Login here
        </Link>
      </span>
      <p>
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>

      <Notification
        message={`Registration failed: ${errorMessage}`}
        open={error}
        type="error"
        onClose={() => {
          setError(false);
        }}
      />
    </div>
  );
}
