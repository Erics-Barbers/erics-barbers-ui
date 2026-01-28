'use client';
import { useState } from 'react';
import { Kaushan_Script } from 'next/font/google';
import Link from 'next/link';

const kaushan = Kaushan_Script({
  variable: '--font-kaushan',
  subsets: ['latin'],
  weight: ['400'],
});

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = (
    <>
      <Link href="/services">
        <span className={`text-2xl text-primary ${kaushan.className}`}>
          Services
        </span>
      </Link>
      <span className={`text-2xl text-primary ${kaushan.className}`}>|</span>
      <Link href="/information">
        <span className={`text-2xl text-primary ${kaushan.className}`}>
          Information
        </span>
      </Link>
      <span className={`text-2xl text-primary ${kaushan.className}`}>|</span>
      <Link href="/bookings">
        <span className={`text-2xl text-primary ${kaushan.className}`}>
          Bookings
        </span>
      </Link>
      <span className={`text-2xl text-primary ${kaushan.className}`}>|</span>
      <Link href="/login">
        <span className={`text-2xl text-primary ${kaushan.className}`}>
          Account
        </span>
      </Link>
    </>
  );

  return (
    <nav className="flex flex-row justify-between h-[10vh] bg-black pt-8 px-40 border-b-4 border-b-white items-center">
      <div className="flex flex-row justify-start pl-8">
        <span
          className={`font-bold sm:text-2xl md:text-3xl lg:text-4xl text-primary tracking-tight ${kaushan.className}`}
        >
          <Link href="/">Eric&apos;s Barbers</Link>
        </span>
      </div>
      {/* Desktop nav links */}
      <div className="hidden md:flex flex-row justify-between gap-4">
        {navLinks}
      </div>
      {/* Mobile menu button */}
      <button
        className="md:hidden text-primary pr-8 focus:outline-none"
        aria-label="Open menu"
        onClick={() => setDrawerOpen(true)}
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
          className="fixed inset-0 z-40 bg-black bg-opacity-60 flex justify-end"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-2/3 max-w-xs h-full bg-white shadow-lg p-6 flex flex-col gap-6 text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="self-end mb-4 text-black"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
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
            <div className="flex flex-col gap-4">{navLinks}</div>
          </div>
        </div>
      )}
    </nav>
  );
}
