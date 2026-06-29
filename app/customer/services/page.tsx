import Link from 'next/link';
import { headers } from 'next/headers';

type Service = {
  id: string;
  name: string;
  description: string;
  pricePence: number;
};

function formatPrice(pricePence: number) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'GBP',
    style: 'currency',
  }).format(pricePence / 100);
}

async function getServices() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http';

  if (!host) return [];

  const res = await fetch(`${protocol}://${host}/api/services`, {
    cache: 'no-store',
  });

  if (!res.ok) return [];

  return (await res.json()) as Service[];
}

function PriceList({
  description,
  services,
  title,
}: {
  description: string;
  services: Service[];
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-white/15 bg-zinc-950 p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-zinc-50">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      <div className="divide-y divide-white/10">
        {services.map((service) => (
          <div
            className="flex items-center justify-between gap-4 py-4"
            key={`${title}-${service.id}`}
          >
            <span>
              <span className="block text-zinc-100">{service.name}</span>
              <span className="mt-1 block text-sm text-zinc-500">
                {service.description}
              </span>
            </span>
            <span className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-sm font-medium text-zinc-50">
              {formatPrice(service.pricePence)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function Services() {
  const services = await getServices();

  return (
    <main className="flex flex-1 bg-black px-4 py-12 text-zinc-50 sm:px-6 lg:px-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Services and prices
          </h1>
          <p className="mt-3 text-base leading-7 text-zinc-400">
            Choose a service before booking, or use the prices below as a quick
            guide before you visit.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <PriceList
            description="Best when you want a confirmed time slot."
            services={services}
            title="Appointments"
          />
          <PriceList
            description="Available around the day's booked appointments."
            services={services}
            title="Walk-ins"
          />
        </div>

        {services.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Services are temporarily unavailable.
          </p>
        ) : null}

        <Link
          className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-50 px-6 text-base font-medium text-black transition-colors hover:bg-zinc-300 sm:w-fit"
          href="/bookings"
        >
          Book Now
        </Link>
      </div>
    </main>
  );
}
