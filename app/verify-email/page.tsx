'use client';

import { Button } from '@mui/material';
import React from 'react';

export default function VerifyEmail() {
  const RESEND_INTERVAL = 60;
  const [timer, setTimer] = React.useState(RESEND_INTERVAL);
  const [email, setEmail] = React.useState('');
  const [isRunning, setIsRunning] = React.useState(true);

  React.useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const resendVerificationEmail = async () => {
    if (!email) return;

    try {
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error(`Resend failed with status ${res.status}`);
      }

      setTimer(RESEND_INTERVAL);
      setIsRunning(true);
    } catch (error) {
      console.error('Resend verification email failed:', error);
    }
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timer]);

  return (
    <main className="flex flex-1 items-center justify-center bg-black px-4 py-12 text-zinc-50 sm:px-6">
      <section className="w-full max-w-xl rounded-2xl border border-white/15 bg-zinc-950 p-6 text-center sm:p-8">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Verify your email
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400 sm:text-base">
          A verification link has been sent to your email address. Check your
          inbox and follow the link to finish setting up your account.
        </p>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Did not receive it? Check your spam folder or resend the verification
          email.
        </p>
        <div className="mx-auto mt-6 max-w-sm">
          <Button
            disabled={isRunning || !email}
            onClick={resendVerificationEmail}
            sx={{
              backgroundColor: '#ededed',
              borderRadius: '9999px',
              boxShadow: 'none',
              color: '#000',
              fontSize: '1rem',
              fontWeight: 500,
              height: 48,
              paddingInline: 3,
              textTransform: 'none',
              width: '100%',
              '&:hover': {
                backgroundColor: '#d4d4d8',
                boxShadow: 'none',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(237, 237, 237, 0.55)',
                color: 'rgba(0, 0, 0, 0.55)',
              },
            }}
            variant="contained"
          >
            Resend Email {isRunning && `(Wait ${timer}s)`}
          </Button>
        </div>
      </section>
    </main>
  );
}
