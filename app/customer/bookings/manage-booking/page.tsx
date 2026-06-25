import Link from 'next/link';

export default function ManageBooking() {
  return (
    <main className="flex flex-1 items-center justify-center bg-black px-4 py-12 text-zinc-50 sm:px-6">
      <section className="w-full max-w-xl rounded-2xl border border-white/15 bg-zinc-950 p-6 sm:p-8">
        <p className="text-sm font-medium uppercase text-zinc-500">
          Booking management
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          Manage an existing booking
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
          Booking management is in progress. Once enabled, this page will let
          customers review or change their appointments.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/bookings/new-booking"
            className="flex h-12 items-center justify-center rounded-full bg-zinc-50 px-6 text-base font-medium text-black transition-colors hover:bg-zinc-300"
          >
            Create Booking
          </Link>
          <Link
            href="/bookings"
            className="flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-base font-medium text-zinc-50 transition-colors hover:bg-white/10"
          >
            Back to Bookings
          </Link>
        </div>
      </section>
    </main>
  );
}
