import ForgotPasswordFlow from '@/app/components/auth/forgot-password-flow';

export default function StaffForgotPassword() {
  const loginHref = process.env.NEXT_PUBLIC_STAFF_SITE_URL
    ? `${process.env.NEXT_PUBLIC_STAFF_SITE_URL}/login`
    : '/staff/login';

  return (
    <ForgotPasswordFlow
      description="Enter the email for your staff account and we will send a staff password reset link."
      loginHref={loginHref}
      surface="STAFF"
      title="Reset staff password"
    />
  );
}
