'use client';
import { useState } from 'react';
import { Kaushan_Script } from 'next/font/google';
import Link from 'next/link';

const kaushan = Kaushan_Script({
  variable: '--font-kaushan',
  subsets: ['latin'],
  weight: ['400'],
});

const links = [
  { href: '/services', label: 'Services' },
  { href: '/information', label: 'Information' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/login', label: 'Account' },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <nav className="flex h-20 items-center justify-between border-b-2 border-b-white bg-black px-4 sm:px-8 lg:px-24">
      <div className="flex min-w-0 flex-row justify-start">
        <span
          className={`truncate text-3xl font-bold text-zinc-50 sm:text-4xl ${kaushan.className}`}
        >
          <Link href="/">Eric&apos;s Barbers</Link>
        </span>
      </div>
      {/* Desktop nav links */}
      <div className="hidden flex-row items-center gap-6 md:flex">
        {links.map((link) => (
          <Link
            className="text-sm font-medium text-zinc-200 transition-colors hover:text-white"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
      {/* Mobile menu button */}
      <button
        className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-50 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70 md:hidden"
        aria-label="Open menu"
        onClick={() => setDrawerOpen(true)}
        type="button"
      >
        <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 6h14M3 10h14M3 14h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/60"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="flex h-full w-72 max-w-[85vw] flex-col gap-6 bg-white p-6 text-black shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mb-4 flex h-10 w-10 items-center justify-center self-end rounded-full text-black transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/30"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
              type="button"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  className="text-lg font-medium text-zinc-900 transition-colors hover:text-black"
                  href={link.href}
                  key={link.href}
                  onClick={() => setDrawerOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
