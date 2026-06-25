import Link from 'next/link';
import AuthPageShell from '@/app/components/auth/auth-page-shell';

export default function StaffLogin() {
  return (
    <AuthPageShell
      description="Sign in to view appointments, manage availability, and keep the shop schedule up to date."
      footer={
        <>
          Customer account?{' '}
          <Link
            href="/login"
            className="font-medium text-zinc-50 underline underline-offset-4"
          >
            Use customer login
          </Link>
        </>
      }
      title="Staff login"
    >
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <p className="text-sm leading-6 text-zinc-400">
          Staff authentication will reuse the existing login flow once role
          redirects are wired. Barber and admin users should land on the staff
          dashboard after signing in.
        </p>
        <Link
          href="/login"
          className="mt-5 flex h-11 items-center justify-center rounded-full bg-zinc-50 px-5 text-sm font-medium text-black transition-colors hover:bg-zinc-300"
        >
          Continue to login
        </Link>
      </div>
    </AuthPageShell>
  );
}
