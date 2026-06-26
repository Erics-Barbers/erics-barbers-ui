import Link from 'next/link';
import LoginFlow from '@/app/components/auth/login-flow';

export default function Login() {
  return (
    <LoginFlow
      description="Sign in to manage bookings and appointment details."
      forgotPasswordHref="/forgot-password"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-zinc-50 underline underline-offset-4"
          >
            Register here
          </Link>
        </>
      }
      title="Customer login"
    />
  );
}
