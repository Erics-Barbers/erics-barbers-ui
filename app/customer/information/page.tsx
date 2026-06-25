const openingHours = [
  { day: 'Monday - Friday', time: '09:00 - 19:00' },
  { day: 'Saturday', time: '09:00 - 19:00' },
  { day: 'Sunday', time: 'Closed' },
];

export default function Information() {
  return (
    <main className="flex flex-1 bg-black px-4 py-12 text-zinc-50 sm:px-6 lg:px-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Visit Eric&apos;s Barbers
          </h1>
          <p className="mt-3 text-base leading-7 text-zinc-400">
            Find our opening hours, contact details, and location before your
            next appointment.
          </p>
        </header>

        <section className="rounded-2xl border border-white/15 bg-zinc-950 p-5 sm:p-6">
          <h2 className="text-2xl font-semibold">Opening hours</h2>
          <dl className="mt-5 divide-y divide-white/10">
            {openingHours.map((item) => (
              <div
                className="flex items-center justify-between gap-4 py-4"
                key={item.day}
              >
                <dt className="text-zinc-300">{item.day}</dt>
                <dd className="text-right font-medium text-zinc-50">
                  {item.time}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/15 bg-zinc-950 p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">Contact</h2>
            <dl className="mt-5 flex flex-col gap-4 text-sm">
              <div>
                <dt className="text-zinc-500">Name</dt>
                <dd className="mt-1 text-base text-zinc-100">Eric</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="mt-1 break-all text-base text-zinc-100">
                  <a
                    href="mailto:eric@example.com"
                    className="underline underline-offset-4 hover:text-white"
                  >
                    eric@example.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Phone</dt>
                <dd className="mt-1 text-base text-zinc-100">
                  <a
                    href="tel:+447704548662"
                    className="underline underline-offset-4 hover:text-white"
                  >
                    +44 7704 548662
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-white/15 bg-zinc-950 p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">Location</h2>
            <address className="mt-5 not-italic leading-7 text-zinc-300">
              277A Dunstable Road
              <br />
              Maidenhall
              <br />
              Luton
              <br />
              United Kingdom, LU4 8BS
            </address>
            <a
              href="https://maps.app.goo.gl/AzbZFsA3cZB4Qfow7"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-zinc-50 px-6 text-base font-medium text-black transition-colors hover:bg-zinc-300 sm:w-fit"
            >
              View on Google Maps
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
