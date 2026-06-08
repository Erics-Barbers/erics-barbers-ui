'use client';

import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';
import Notification from '@/app/components/notification';

export default function MyAccount() {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(false);
  const router = useRouter();

  const logoutUser = async () => {
    setSubmitting(true);
    setError(false);

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!res.ok) {
        await res.json().catch(() => null);
        throw new Error(`Logout failed with status ${res.status}`);
      }

      router.push('/login');
    } catch (e) {
      console.error('Logout failed:', e);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>My Account</h1>
      <Button loading={submitting} onClick={logoutUser}>
        Logout
      </Button>

      <Notification
        message="Something went wrong."
        open={error}
        type="error"
        onClose={() => {
          setError(false);
        }}
      />
    </div>
  );
}
