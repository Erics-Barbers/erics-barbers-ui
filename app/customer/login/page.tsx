import Link from 'next/link';
import LoginFlow from '@/app/components/auth/login-flow';

export default function Login() {
  return (
    <LoginFlow
      description="Manage your bookings and keep your appointment details in one place."
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
      title="Log in to your account"
    />
  );
}
