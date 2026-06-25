import Link from 'next/link';

const isBookingEnabled = process.env.NEXT_PUBLIC_BOOKING_ENABLED === 'true';

function BookingCard({
  cta,
  description,
  href,
  primary = false,
  title,
}: {
  cta: string;
  description: string;
  href: string;
  primary?: boolean;
  title: string;
}) {
  return (
    <section className="flex flex-col rounded-2xl border border-white/15 bg-zinc-950 p-6">
      <h2 className="text-2xl font-semibold text-zinc-50">{title}</h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-zinc-400">
        {description}
      </p>
      <Link
        href={href}
        className={
          primary
            ? 'mt-6 flex h-12 items-center justify-center rounded-full bg-zinc-50 px-6 text-base font-medium text-black transition-colors hover:bg-zinc-300'
            : 'mt-6 flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-base font-medium text-zinc-50 transition-colors hover:bg-white/10'
        }
      >
        {cta}
      </Link>
    </section>
  );
}

export default function Bookings() {
  if (!isBookingEnabled) {
    return (
      <main className="flex flex-1 items-center justify-center bg-black px-4 py-12 text-zinc-50 sm:px-6">
        <section className="w-full max-w-xl rounded-2xl border border-white/15 bg-zinc-950 p-6 text-center sm:p-8">
          <h1 className="text-3xl font-semibold">Bookings Coming Soon</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
            The booking feature is currently in development. Please check back
            later.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-1 bg-black px-4 py-12 text-zinc-50 sm:px-6 lg:px-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold sm:text-4xl">Bookings</h1>
          <p className="mt-3 text-base leading-7 text-zinc-400">
            Book a new appointment or manage an existing one.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <BookingCard
            cta="Start booking"
            description="Choose a service and reserve a time that works for you."
            href="/bookings/new-booking"
            primary
            title="Create a new booking"
          />
          <BookingCard
            cta="Manage booking"
            description="Review, amend, or cancel an appointment you already made."
            href="/bookings/manage-booking"
            title="Manage an existing booking"
          />
        </div>
      </div>
    </main>
  );
}
