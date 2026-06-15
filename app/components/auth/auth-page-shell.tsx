import type React from 'react';

type AuthPageShellProps = {
  children: React.ReactNode;
  description: string;
  footer: React.ReactNode;
  title: string;
};

export default function AuthPageShell({
  children,
  description,
  footer,
  title,
}: AuthPageShellProps) {
  return (
    <main className="flex flex-1 items-center justify-center bg-black px-4 py-12 text-zinc-50 sm:px-6 sm:py-16">
      <section className="w-full max-w-md">
        <div className="rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold leading-tight text-zinc-50 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
              {description}
            </p>
          </div>

          {children}
        </div>

        <div className="mt-5 text-center text-sm leading-6 text-zinc-400">
          {footer}
        </div>
      </section>
    </main>
  );
}
