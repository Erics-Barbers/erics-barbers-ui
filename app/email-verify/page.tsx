'use client';

import AuthRepository from '@/api/repositories/auth-repository';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@mui/material';

export default function EmailVerify() {
  const [verifying, setVerifying] = React.useState(true);
  const [verified, setVerified] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const verifyEmail = React.useCallback(async () => {
    if (!token) {
      setError('No token provided.');
      setVerifying(false);
      return;
    }
    const authRepository = new AuthRepository();
    try {
      await authRepository.verifyEmail(token);
      setVerified(true);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Email verification failed.',
      );
    } finally {
      setVerifying(false);
    }
  }, [token]);

  React.useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  let content;
  if (verifying) {
    content = (
      <div className="text-lg text-white">Verifying your email...</div>
    );
  } else if (verified) {
    content = (
      <>
        <h1 className="text-4xl font-bold mb-8 text-white">Your email has been verified successfully!</h1>
        <p className="text-lg text-white mb-6">Setup your mobile number for OTP access and mobile notifications or go ahead and make a booking</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-black font-semibold px-5 transition-colors hover:bg-[#383838] hover:text-white dark:hover:bg-[#ccc] md:w-39.5"
            href="/my-account"
            underline="none"
          >
            Setup mobile number
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-white/20 text-white px-5 transition-colors hover:border-transparent hover:bg-black/10 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-39.5"
            href="/booking"
            underline="none"
          >
            Make a booking
          </Link>
        </div>
      </>
    );
  } else if (error) {
    content = <div className="text-lg text-red-500">Error: {error}</div>;
  } else {
    content = <div className="text-lg text-white">Unknown state.</div>;
  }

  return (
    <div className="flex flex-1 flex-col py-16 gap-y-4 items-center bg-black min-h-screen justify-center">
      {content}
    </div>
  );
}
