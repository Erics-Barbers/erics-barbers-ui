'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Barber = {
  id: string;
  displayName: string;
  phone?: string;
};

type Service = {
  id: string;
  name: string;
  description: string;
  pricePence: number;
  durationMinutes: number;
};

type AvailabilitySlot = {
  startTime: string;
  endTime: string;
  label: string;
  hour: string;
};

type AvailabilityHour = {
  hour: string;
  slots: AvailabilitySlot[];
};

type AvailabilityResponse = {
  hours: AvailabilityHour[];
  slots: AvailabilitySlot[];
};

type CreatedBooking = {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  barber?: Barber;
  service?: Service;
};

type CreateBookingResponse = {
  booking?: CreatedBooking;
  message?: string;
};

type Notice = {
  message: string;
  type: 'error' | 'success';
};

type BookingDraft = {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  selectedBarberId: string;
  selectedDate: string;
  selectedServiceId: string;
  selectedSlotStartTime?: string;
};

const BOOKING_DRAFT_KEY = 'pendingBookingDraft';
const today = new Date().toISOString().slice(0, 10);

function formatPrice(pricePence: number) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'GBP',
    style: 'currency',
  }).format(pricePence / 100);
}

function formatBookingTime(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function readJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!res.ok) {
    throw new Error(data.message ?? 'Request failed');
  }

  return data;
}

export function BookingFlow() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(
    null,
  );
  const [createdBooking, setCreatedBooking] = useState<CreatedBooking | null>(
    null,
  );
  const [notice, setNotice] = useState<Notice | null>(null);
  const [accountExistsForEmail, setAccountExistsForEmail] = useState(false);
  const [dismissedAccountPromptEmail, setDismissedAccountPromptEmail] =
    useState('');
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restoredSlotStartTime, setRestoredSlotStartTime] = useState<
    string | null
  >(null);

  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber.id === selectedBarberId),
    [barbers, selectedBarberId],
  );
  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId),
    [services, selectedServiceId],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      setIsLoadingInitialData(true);
      setNotice(null);

      try {
        const [barbersRes, servicesRes] = await Promise.all([
          fetch('/api/barbers'),
          fetch('/api/services'),
        ]);
        const [barberData, serviceData] = await Promise.all([
          readJson<Barber[]>(barbersRes),
          readJson<Service[]>(servicesRes),
        ]);

        if (!isMounted) return;

        setBarbers(barberData);
        setServices(serviceData);
      } catch (error) {
        if (!isMounted) return;
        setNotice({
          message:
            error instanceof Error
              ? error.message
              : 'Could not load booking data.',
          type: 'error',
        });
      } finally {
        if (isMounted) setIsLoadingInitialData(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const draft = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (!draft) return;

    try {
      const parsed = JSON.parse(draft) as Partial<BookingDraft>;

      setCustomerEmail(parsed.customerEmail ?? '');
      setCustomerName(parsed.customerName ?? '');
      setCustomerPhone(parsed.customerPhone ?? '');
      setSelectedBarberId(parsed.selectedBarberId ?? '');
      setSelectedDate(parsed.selectedDate ?? today);
      setSelectedServiceId(parsed.selectedServiceId ?? '');
      setRestoredSlotStartTime(parsed.selectedSlotStartTime ?? null);
      sessionStorage.removeItem(BOOKING_DRAFT_KEY);
    } catch {
      sessionStorage.removeItem(BOOKING_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSlots() {
      if (!selectedBarberId || !selectedDate) {
        setAvailability(null);
        return;
      }

      setIsLoadingSlots(true);
      setSelectedSlot(null);

      try {
        const params = new URLSearchParams({ date: selectedDate });
        const res = await fetch(
          `/api/barbers/${selectedBarberId}/availability/slots?${params.toString()}`,
        );
        const data = await readJson<AvailabilityResponse>(res);

        if (!isMounted) return;

        setAvailability(data);

        if (restoredSlotStartTime) {
          const restoredSlot = data.slots.find(
            (slot) => slot.startTime === restoredSlotStartTime,
          );

          if (restoredSlot) {
            setSelectedSlot(restoredSlot);
          }

          setRestoredSlotStartTime(null);
        }
      } catch (error) {
        if (!isMounted) return;
        setAvailability(null);
        setNotice({
          message:
            error instanceof Error
              ? error.message
              : 'Could not load available times.',
          type: 'error',
        });
      } finally {
        if (isMounted) setIsLoadingSlots(false);
      }
    }

    loadSlots();

    return () => {
      isMounted = false;
    };
  }, [restoredSlotStartTime, selectedBarberId, selectedDate]);

  async function checkAccountForEmail() {
    const normalizedEmail = customerEmail.trim().toLowerCase();

    setAccountExistsForEmail(false);

    if (
      !normalizedEmail ||
      !isValidEmail(normalizedEmail) ||
      dismissedAccountPromptEmail === normalizedEmail
    ) {
      return;
    }

    setIsCheckingAccount(true);

    try {
      const res = await fetch('/api/auth/account-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await readJson<{ exists?: boolean }>(res);

      setAccountExistsForEmail(Boolean(data.exists));
    } catch {
      setAccountExistsForEmail(false);
    } finally {
      setIsCheckingAccount(false);
    }
  }

  function saveDraftForLogin() {
    const draft: BookingDraft = {
      customerEmail,
      customerName,
      customerPhone,
      selectedBarberId,
      selectedDate,
      selectedServiceId,
      selectedSlotStartTime: selectedSlot?.startTime,
    };

    sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
  }

  async function createBooking() {
    if (!selectedBarberId || !selectedSlot || !selectedServiceId) return;

    setIsSubmitting(true);
    setNotice(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDate: selectedSlot.startTime,
          barberId: selectedBarberId,
          customerEmail,
          customerName,
          customerPhone,
          serviceId: selectedServiceId,
        }),
      });
      const data = await readJson<CreateBookingResponse>(res);

      if (data.booking) {
        setCreatedBooking(data.booking);
      }

      setNotice({
        message: data.message ?? 'Booking created.',
        type: 'success',
      });
    } catch (error) {
      setNotice({
        message:
          error instanceof Error ? error.message : 'Could not create booking.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdBooking) {
    return (
      <main className="flex flex-1 bg-black px-4 py-10 text-zinc-50 sm:px-6 lg:px-24">
        <section className="mx-auto w-full max-w-3xl rounded-2xl border border-emerald-400/30 bg-zinc-950 p-6 sm:p-8">
          <p className="text-sm font-medium uppercase text-emerald-300">
            Confirmed
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Booking created</h1>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Barber</dt>
              <dd className="mt-1 text-base text-zinc-100">
                {createdBooking.barber?.displayName ??
                  selectedBarber?.displayName ??
                  'Selected barber'}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Service</dt>
              <dd className="mt-1 text-base text-zinc-100">
                {createdBooking.service?.name ??
                  selectedService?.name ??
                  'Selected service'}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Customer</dt>
              <dd className="mt-1 text-base text-zinc-100">
                {createdBooking.customerName || customerName}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="mt-1 text-base text-zinc-100">
                {createdBooking.customerEmail || customerEmail}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Time</dt>
              <dd className="mt-1 text-base text-zinc-100">
                {formatBookingTime(createdBooking.startTime)}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Status</dt>
              <dd className="mt-1 text-base text-zinc-100">
                {createdBooking.status}
              </dd>
            </div>
          </dl>
          <a
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-zinc-50 px-5 text-sm font-medium text-black transition-colors hover:bg-zinc-300"
            href="/bookings/manage-booking"
          >
            View bookings
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-1 bg-black px-4 py-10 text-zinc-50 sm:px-6 lg:px-24">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-white/15 bg-zinc-950 p-5 sm:p-6">
          <p className="text-sm font-medium uppercase text-zinc-500">Booking</p>
          <h1 className="mt-3 text-3xl font-semibold">Create a booking</h1>

          {notice ? (
            <div
              className={
                notice.type === 'error'
                  ? 'mt-5 rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100'
                  : 'mt-5 rounded-lg border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100'
              }
            >
              {notice.message}
            </div>
          ) : null}

          <div className="mt-8 grid gap-8">
            <section>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">1. Pick a barber</h2>
                {isLoadingInitialData ? (
                  <span className="text-sm text-zinc-500">Loading</span>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {barbers.map((barber) => (
                  <button
                    className={
                      selectedBarberId === barber.id
                        ? 'rounded-lg border border-zinc-50 bg-zinc-50 px-4 py-4 text-left text-black'
                        : 'rounded-lg border border-white/15 bg-black px-4 py-4 text-left text-zinc-100 transition-colors hover:bg-white/10'
                    }
                    key={barber.id}
                    onClick={() => setSelectedBarberId(barber.id)}
                    type="button"
                  >
                    <span className="block font-medium">
                      {barber.displayName}
                    </span>
                    {barber.phone ? (
                      <span className="mt-1 block text-sm opacity-70">
                        {barber.phone}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              {!isLoadingInitialData && barbers.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-400">
                  No barbers are available in the local data yet.
                </p>
              ) : null}
            </section>

            <section className={!selectedBarberId ? 'opacity-50' : undefined}>
              <h2 className="text-xl font-semibold">2. Choose date and time</h2>
              <label className="mt-4 block text-sm font-medium text-zinc-300">
                Date
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-zinc-50 outline-none focus:border-zinc-50 sm:w-56"
                  disabled={!selectedBarberId}
                  min={today}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  type="date"
                  value={selectedDate}
                />
              </label>

              <div className="mt-5 grid gap-4">
                {isLoadingSlots ? (
                  <p className="text-sm text-zinc-400">
                    Loading available times.
                  </p>
                ) : null}
                {availability?.hours.map((hour) => (
                  <div
                    className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)]"
                    key={hour.hour}
                  >
                    <div className="pt-2 text-sm font-medium text-zinc-500">
                      {hour.hour}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hour.slots.map((slot) => (
                        <button
                          className={
                            selectedSlot?.startTime === slot.startTime
                              ? 'h-10 rounded-full bg-zinc-50 px-4 text-sm font-medium text-black'
                              : 'h-10 rounded-full border border-white/15 px-4 text-sm font-medium text-zinc-50 transition-colors hover:bg-white/10'
                          }
                          key={slot.startTime}
                          onClick={() => setSelectedSlot(slot)}
                          type="button"
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {selectedBarberId &&
                !isLoadingSlots &&
                availability &&
                availability.slots.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    No slots are available for this day.
                  </p>
                ) : null}
              </div>
            </section>

            <section className={!selectedSlot ? 'opacity-50' : undefined}>
              <h2 className="text-xl font-semibold">3. Select a service</h2>
              <div className="mt-4 grid gap-3">
                {services.map((service) => (
                  <button
                    className={
                      selectedServiceId === service.id
                        ? 'rounded-lg border border-zinc-50 bg-zinc-50 px-4 py-4 text-left text-black'
                        : 'rounded-lg border border-white/15 bg-black px-4 py-4 text-left text-zinc-100 transition-colors hover:bg-white/10'
                    }
                    disabled={!selectedSlot}
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    type="button"
                  >
                    <span className="flex items-center justify-between gap-4">
                      <span className="font-medium">{service.name}</span>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatPrice(service.pricePence)}
                      </span>
                    </span>
                    <span className="mt-2 block text-sm opacity-70">
                      {service.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className={!selectedServiceId ? 'opacity-50' : undefined}>
              <h2 className="text-xl font-semibold">4. Contact details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Name
                  <input
                    className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-zinc-50 outline-none focus:border-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedServiceId}
                    onChange={(event) => setCustomerName(event.target.value)}
                    type="text"
                    value={customerName}
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-300">
                  Email
                  <input
                    className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-zinc-50 outline-none focus:border-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedServiceId}
                    onChange={(event) => {
                      setCustomerEmail(event.target.value);
                      setAccountExistsForEmail(false);
                    }}
                    onBlur={checkAccountForEmail}
                    type="email"
                    value={customerEmail}
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-300 sm:col-span-2">
                  Phone
                  <input
                    className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-zinc-50 outline-none focus:border-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedServiceId}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    type="tel"
                    value={customerPhone}
                  />
                </label>
              </div>
              {isCheckingAccount ? (
                <p className="mt-3 text-xs text-zinc-500">
                  Checking account status.
                </p>
              ) : null}
              {accountExistsForEmail ? (
                <div className="mt-4 rounded-lg border border-white/15 bg-black px-4 py-3 text-sm text-zinc-300">
                  <p>
                    This email may already have an account. Sign in to save this
                    booking to your account and track it more easily.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-50 px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-300"
                      href={`/login?next=${encodeURIComponent('/bookings/new-booking')}`}
                      onClick={saveDraftForLogin}
                    >
                      Sign in
                    </Link>
                    <button
                      className="inline-flex h-9 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-medium text-zinc-50 transition-colors hover:bg-white/10"
                      onClick={() => {
                        setDismissedAccountPromptEmail(
                          customerEmail.trim().toLowerCase(),
                        );
                        setAccountExistsForEmail(false);
                      }}
                      type="button"
                    >
                      Continue as guest
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-white/15 bg-zinc-950 p-5">
          <h2 className="text-lg font-semibold">Summary</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-zinc-500">Barber</dt>
              <dd className="mt-1 text-zinc-100">
                {selectedBarber?.displayName ?? 'Not selected'}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Time</dt>
              <dd className="mt-1 text-zinc-100">
                {selectedSlot
                  ? formatBookingTime(selectedSlot.startTime)
                  : 'Not selected'}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Service</dt>
              <dd className="mt-1 text-zinc-100">
                {selectedService?.name ?? 'Not selected'}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Customer</dt>
              <dd className="mt-1 text-zinc-100">
                {customerName || 'Not entered'}
              </dd>
            </div>
          </dl>
          <button
            className="mt-6 h-11 w-full rounded-full bg-zinc-50 px-5 text-sm font-medium text-black transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            disabled={
              !selectedBarberId ||
              !selectedSlot ||
              !selectedServiceId ||
              !customerName.trim() ||
              !customerEmail.trim() ||
              !customerPhone.trim() ||
              isSubmitting
            }
            onClick={createBooking}
            type="button"
          >
            {isSubmitting ? 'Creating booking' : 'Confirm booking'}
          </button>
          <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
            Want to track bookings more easily?{' '}
            <Link
              className="font-medium text-zinc-300 underline underline-offset-4 transition-colors hover:text-zinc-50"
              href="/register"
            >
              Create an account
            </Link>
            .
          </p>
        </aside>
      </div>
    </main>
  );
}
