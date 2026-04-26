'use client';

import AuthRepository from '@/api/repositories/auth-repository';
import { Button } from '@mui/material';
import React from 'react';

export default function VerifyEmail() {
  const RESEND_INTERVAL = 60;
  const [timer, setTimer] = React.useState(RESEND_INTERVAL);
  const [email, setEmail] = React.useState('');
  const [isRunning, setIsRunning] = React.useState(true);
  const authRepository = new AuthRepository();

  React.useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const resendVerificationEmail = async () => {
    try {
      await authRepository.resendVerificationEmail(email);
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
    <div className="flex flex-1 flex-col py-16 gap-y-4 items-center bg-black">
      <h1 className="text-4xl font-bold mb-8 text-white">Verify Your Email</h1>
      <p className="text-lg text-white">
        A verification link has been sent to your email address. Please check
        your inbox and click on the link to verify your account.
      </p>
      <p className="text-lg text-white">
        Didn&apos;t receive the email? Check your spam folder or resend the
        verification email.
      </p>
      <Button
        variant="contained"
        color="primary"
        onClick={resendVerificationEmail}
        disabled={isRunning}
        style={{ backgroundColor: '#fff', color: '#222', borderRadius: 12 }}
      >
        Resend Verification Email {isRunning && `(Wait ${timer} seconds)`}
      </Button>
    </div>
  );
}
