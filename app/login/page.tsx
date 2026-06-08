'use client';

import Link from 'next/link';
import LoginForm from './form';
import React from 'react';
import { useRouter } from 'next/navigation';
import Notification from '@/app/components/notification';

export default function Login() {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(false);
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
        await res.json().catch(() => null);
        throw new Error(`Login failed with status ${res.status}`);
      }

      router.push('/my-account');
    } catch (e) {
      console.error('Login failed:', e);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col py-16 items-center bg-black">
      <h1 className="text-4xl font-bold mb-8">Login to Your Account</h1>
      <LoginForm submitting={submitting} onLogin={loginUser} />
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
