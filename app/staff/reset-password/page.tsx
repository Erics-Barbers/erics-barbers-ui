import ResetPasswordFlow from '@/app/components/auth/reset-password-flow';
import { Suspense } from 'react';

export default function StaffResetPassword() {
  const loginHref = process.env.NEXT_PUBLIC_STAFF_SITE_URL
    ? `${process.env.NEXT_PUBLIC_STAFF_SITE_URL}/login`
    : '/staff/login';

  return (
    <Suspense>
      <ResetPasswordFlow
        description="Choose a new password for your staff account."
        loginHref={loginHref}
        title="Set a staff password"
      />
    </Suspense>
  );
}
