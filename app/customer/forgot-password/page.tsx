import ForgotPasswordFlow from '@/app/components/auth/forgot-password-flow';

export default function ForgotPassword() {
  return (
    <ForgotPasswordFlow
      description="Enter the email for your customer account and we will send a password reset link."
      loginHref="/login"
      surface="CUSTOMER"
      title="Reset your password"
    />
  );
}
