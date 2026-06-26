import Link from 'next/link';
import LoginFlow from '@/app/components/auth/login-flow';

export default function StaffLogin() {
  const customerLoginHref = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/login`
    : '/customer/login';
  const forgotPasswordHref = process.env.NEXT_PUBLIC_STAFF_SITE_URL
    ? `${process.env.NEXT_PUBLIC_STAFF_SITE_URL}/forgot-password`
    : '/staff/forgot-password';

  return (
    <LoginFlow
      description="Sign in to view appointments, manage availability, and keep the shop schedule up to date."
      forgotPasswordHref={forgotPasswordHref}
      footer={
        <>
          Customer account?{' '}
          <Link
            href={customerLoginHref}
            className="font-medium text-zinc-50 underline underline-offset-4"
          >
            Use customer login
          </Link>
        </>
      }
      title="Staff login"
    />
  );
}
