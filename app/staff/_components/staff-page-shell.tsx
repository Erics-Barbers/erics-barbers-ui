import Link from 'next/link';
import type { ReactNode } from 'react';

const staffLinks = [
  { href: '/staff/dashboard', label: 'Dashboard' },
  { href: '/staff/calendar', label: 'Calendar' },
  { href: '/staff/bookings', label: 'Bookings' },
  { href: '/staff/availability', label: 'Availability' },
  { href: '/staff/customers', label: 'Customers' },
  { href: '/staff/settings', label: 'Settings' },
];

export function StaffPageShell({
  children,
  description,
  eyebrow = 'Staff',
  title,
}: {
  children: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <main className="flex flex-1 bg-neutral-950 text-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 md:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
              {description}
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1">
            {staffLinks.map((link) => (
              <Link
                className="whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}

export function StaffMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-50">{value}</p>
    </section>
  );
}

export function StaffPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <h2 className="text-xl font-semibold text-zinc-50">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
