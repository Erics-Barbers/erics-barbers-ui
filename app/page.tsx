import Link from 'next/link';
import { Kaushan_Script } from 'next/font/google';

const kaushan = Kaushan_Script({
  variable: '--font-kaushan',
  subsets: ['latin'],
  weight: ['400'],
});

export default function Home() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-16 text-center text-black dark:bg-black dark:text-zinc-50 sm:px-6">
      <div className="flex w-full max-w-3xl flex-col items-center gap-6">
        <h1
          className={`text-5xl font-semibold leading-tight text-black dark:text-zinc-50 sm:text-6xl lg:text-7xl ${kaushan.className}`}
        >
          Eric&apos;s Barbers
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300 sm:text-xl">
          Fresh cuts in Luton. Book your next trim at Eric&apos;s Barbers.
        </p>

        <dl className="grid w-full max-w-2xl grid-cols-1 gap-3 rounded-2xl border border-black/10 px-4 py-4 text-sm text-zinc-700 dark:border-white/15 dark:text-zinc-300 sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-black dark:text-zinc-50">
              Location
            </dt>
            <dd>Luton</dd>
          </div>
          <div>
            <dt className="font-semibold text-black dark:text-zinc-50">
              Booking
            </dt>
            <dd>Online appointments</dd>
          </div>
          <div>
            <dt className="font-semibold text-black dark:text-zinc-50">
              Services
            </dt>
            <dd>Cuts, fades and trims</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex w-full max-w-md flex-col gap-4 text-base font-medium sm:flex-row sm:justify-center">
        <Link
          className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] sm:w-auto"
          href="/bookings"
        >
          Book Now
        </Link>
        <Link
          className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/10 px-6 transition-colors hover:border-transparent hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10 sm:w-auto"
          href="/services"
        >
          View Services
        </Link>
      </div>
    </section>
  );
}
