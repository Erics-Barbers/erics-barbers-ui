import Link from 'next/link';
import { Divider } from '@mui/material';
import { Kaushan_Script } from 'next/font/google';

const kaushan = Kaushan_Script({
  variable: '--font-kaushan',
  subsets: ['latin'],
  weight: ['400'],
});

export default function Home() {
  return (
    <section className="flex flex-1 justify-center items-center flex-col py-16 gap-y-6 bg-white dark:bg-black">
      <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
        <h1
          className={`max-w-xs lg:text-6xl md:text-4xl sm:text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 ${kaushan.className}`}
        >
          Eric&apos;s Barbers
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Looking to track your bookings? Sign up or login here.
        </p>
      </div>

      <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
        <Link
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-39.5"
          href="/booking"
        >
          Make a Booking
        </Link>
        <Link
          className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-39.5"
          href="/register"
        >
          Sign Up
        </Link>
      </div>
    </section>
  );
}
