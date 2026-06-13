'use client';

import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function MyAccount() {
  const [submitting, setSubmitting] = React.useState(false);
  const router = useRouter();

  const logoutUser = async () => {
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!res.ok) {
        console.error(`Logout failed with status ${res.status}`);
      }
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setSubmitting(false);
      router.replace('/');
    }
  };

  return (
    <div>
      <h1>My Account</h1>
      <Button loading={submitting} onClick={logoutUser}>
        Logout
      </Button>
    </div>
  );
}
