import ResetPasswordFlow from '@/app/components/auth/reset-password-flow';
import { Suspense } from 'react';

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordFlow
        description="Choose a new password for your customer account."
        loginHref="/login"
        title="Set a new password"
      />
    </Suspense>
  );
}
