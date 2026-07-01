'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';

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

type Booking = {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  barberId?: string;
  serviceId?: string;
  barber?: Barber | null;
  service?: Service | null;
};

type BookingMutationResponse = {
  booking?: Booking;
  message?: string;
};

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  isEmailVerified: boolean;
};

type Notice = {
  message: string;
  type: 'error' | 'success';
};

type Confirmation = {
  booking: Booking;
  type: 'cancelled' | 'updated';
};

const SHOP_TIME_ZONE = 'Europe/London';
const today = toDateInputValue(new Date());
const earliestBookingDate = addDays(today, 1);
const latestBookingDate = addCalendarMonths(today, 1);

function toDateInputValue(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const partValue = (type: string) =>
    parts.find((part) => part.type === type)?.value;

  return `${partValue('year')}-${partValue('month')}-${partValue('day')}`;
}

function addDays(date: string, days: number) {
  const [year, month, day] = parseDate(date);

  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

function addCalendarMonths(date: string, monthsToAdd: number) {
  const [year, month, day] = parseDate(date);
  const targetMonthIndex = month - 1 + monthsToAdd;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  const targetMonth = normalizedMonthIndex + 1;
  const targetDay = Math.min(day, getDaysInMonth(targetYear, targetMonth));

  return [
    targetYear,
    String(targetMonth).padStart(2, '0'),
    String(targetDay).padStart(2, '0'),
  ].join('-');
}

function getDaysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isDateInBookingWindow(date: string) {
  return date >= earliestBookingDate && date <= latestBookingDate;
}

function getRescheduleDate(date: string) {
  const bookingDate = getDateInputValue(date);

  return isDateInBookingWindow(bookingDate) ? bookingDate : earliestBookingDate;
}

function parseDate(date: string) {
  return date.split('-').map(Number) as [number, number, number];
}

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

function getDateInputValue(date: string) {
  return toDateInputValue(new Date(date));
}

function getStatusLabel(status: string) {
  return status.toLowerCase().replace(/_/g, ' ');
}

function isFutureBooking(booking: Booking) {
  return new Date(booking.startTime).getTime() > Date.now();
}

function getChangeDisabledReason(booking: Booking | null) {
  if (!booking) return 'No booking selected.';
  if (booking.status === 'CANCELLED') {
    return 'Cancelled bookings cannot be changed online.';
  }
  if (!isFutureBooking(booking))
    return 'Past bookings cannot be changed online.';
  if (getDateInputValue(booking.startTime) <= today) {
    return 'Bookings for today must be rescheduled or cancelled by contacting the shop.';
  }

  return null;
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

export function ManageBookingFlow() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [guestReference, setGuestReference] = useState('');
  const [isLookingUpReference, setIsLookingUpReference] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleBarberId, setRescheduleBarberId] = useState('');
  const [rescheduleServiceId, setRescheduleServiceId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(earliestBookingDate);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(
    null,
  );

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId],
  );
  const changeDisabledReason = getChangeDisabledReason(selectedBooking);
  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status !== 'CANCELLED' && isFutureBooking(booking),
      ),
    [bookings],
  );
  const otherBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === 'CANCELLED' || !isFutureBooking(booking),
      ),
    [bookings],
  );
  const selectedRescheduleBarber = useMemo(
    () => barbers.find((barber) => barber.id === rescheduleBarberId),
    [barbers, rescheduleBarberId],
  );
  const selectedRescheduleService = useMemo(
    () => services.find((service) => service.id === rescheduleServiceId),
    [services, rescheduleServiceId],
  );
  const isGuestManagement = authRequired && !profile;

  useEffect(() => {
    let active = true;

    async function loadManagementData() {
      setIsLoading(true);
      setNotice(null);

      try {
        const [profileRes, bookingsRes, barbersRes, servicesRes] =
          await Promise.all([
            fetch('/api/auth/profile', { cache: 'no-store' }),
            fetch('/api/bookings', { cache: 'no-store' }),
            fetch('/api/barbers', { cache: 'no-store' }),
            fetch('/api/services', { cache: 'no-store' }),
          ]);

        if (profileRes.status === 401 || bookingsRes.status === 401) {
          const [barberData, serviceData] = await Promise.all([
            readJson<Barber[]>(barbersRes),
            readJson<Service[]>(servicesRes),
          ]);

          if (!active) return;
          setAuthRequired(true);
          setBookings([]);
          setBarbers(barberData);
          setServices(serviceData);
          return;
        }

        const [profileData, bookingData, barberData, serviceData] =
          await Promise.all([
            readJson<UserProfile>(profileRes),
            readJson<Booking[]>(bookingsRes),
            readJson<Barber[]>(barbersRes),
            readJson<Service[]>(servicesRes),
          ]);

        if (!active) return;

        setProfile(profileData);
        setBookings(bookingData);
        setBarbers(barberData);
        setServices(serviceData);
        setAuthRequired(false);
        setSelectedBookingId((current) => current || bookingData[0]?.id || '');
      } catch (error) {
        if (!active) return;
        setNotice({
          message:
            error instanceof Error
              ? error.message
              : 'Could not load your bookings.',
          type: 'error',
        });
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadManagementData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBooking || !isRescheduling) return;

    setRescheduleBarberId(
      selectedBooking.barberId || selectedBooking.barber?.id || '',
    );
    setRescheduleServiceId(
      selectedBooking.serviceId || selectedBooking.service?.id || '',
    );
    setRescheduleDate(getRescheduleDate(selectedBooking.startTime));
    setSelectedSlot(null);
    setAvailability(null);
  }, [isRescheduling, selectedBooking]);

  useEffect(() => {
    let active = true;

    async function loadSlots() {
      if (!isRescheduling || !rescheduleBarberId || !rescheduleDate) {
        setAvailability(null);
        return;
      }

      if (!isDateInBookingWindow(rescheduleDate)) {
        setAvailability(null);
        setSelectedSlot(null);
        return;
      }

      setIsLoadingSlots(true);
      setSelectedSlot(null);

      try {
        const params = new URLSearchParams({ date: rescheduleDate });
        if (rescheduleServiceId) {
          params.set('serviceId', rescheduleServiceId);
        }

        const res = await fetch(
          `/api/barbers/${rescheduleBarberId}/availability/slots?${params.toString()}`,
        );
        const data = await readJson<AvailabilityResponse>(res);

        if (!active) return;
        setAvailability(data);
      } catch (error) {
        if (!active) return;
        setAvailability(null);
        setNotice({
          message:
            error instanceof Error
              ? error.message
              : 'Could not load available times.',
          type: 'error',
        });
      } finally {
        if (active) setIsLoadingSlots(false);
      }
    }

    loadSlots();

    return () => {
      active = false;
    };
  }, [isRescheduling, rescheduleBarberId, rescheduleDate, rescheduleServiceId]);

  function replaceBooking(updatedBooking: Booking) {
    setBookings((current) =>
      current.some((booking) => booking.id === updatedBooking.id)
        ? current.map((booking) =>
            booking.id === updatedBooking.id ? updatedBooking : booking,
          )
        : [updatedBooking],
    );
    setSelectedBookingId(updatedBooking.id);
  }

  async function lookupGuestBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const reference = guestReference.trim();
    if (!reference) return;

    setIsLookingUpReference(true);
    setNotice(null);
    setConfirmation(null);

    try {
      const res = await fetch('/api/bookings/reference/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const data = await readJson<BookingMutationResponse>(res);

      if (!data.booking) {
        throw new Error('Booking not found');
      }

      setBookings([data.booking]);
      setSelectedBookingId(data.booking.id);
      setIsRescheduling(false);
      setShowCancelConfirm(false);
      setNotice(null);
    } catch (error) {
      setBookings([]);
      setSelectedBookingId('');
      setNotice({
        message:
          error instanceof Error
            ? error.message
            : 'Could not find that booking.',
        type: 'error',
      });
    } finally {
      setIsLookingUpReference(false);
    }
  }

  async function cancelBooking() {
    if (!selectedBooking) return;

    setIsCancelling(true);
    setNotice(null);

    try {
      const cancelUrl = isGuestManagement
        ? `/api/bookings/reference/${encodeURIComponent(selectedBooking.id)}/cancel`
        : `/api/bookings/${selectedBooking.id}/cancel`;
      const res = await fetch(cancelUrl, { method: 'PATCH' });
      const data = await readJson<BookingMutationResponse>(res);
      const updatedBooking = data.booking ?? {
        ...selectedBooking,
        status: 'CANCELLED',
      };

      replaceBooking(updatedBooking);
      setShowCancelConfirm(false);
      setIsRescheduling(false);
      setConfirmation({ booking: updatedBooking, type: 'cancelled' });
    } catch (error) {
      setNotice({
        message:
          error instanceof Error ? error.message : 'Could not cancel booking.',
        type: 'error',
      });
    } finally {
      setIsCancelling(false);
    }
  }

  async function updateBooking() {
    if (
      !selectedBooking ||
      !rescheduleBarberId ||
      !rescheduleServiceId ||
      !selectedSlot
    ) {
      return;
    }

    setIsUpdating(true);
    setNotice(null);

    try {
      const updateUrl = isGuestManagement
        ? `/api/bookings/reference/${encodeURIComponent(selectedBooking.id)}`
        : `/api/bookings/${selectedBooking.id}`;
      const res = await fetch(updateUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDate: selectedSlot.startTime,
          barberId: rescheduleBarberId,
          serviceId: rescheduleServiceId,
        }),
      });
      const data = await readJson<BookingMutationResponse>(res);
      const updatedBooking =
        data.booking ??
        ({
          ...selectedBooking,
          barber: selectedRescheduleBarber ?? selectedBooking.barber,
          barberId: rescheduleBarberId,
          endTime: selectedSlot.endTime,
          service: selectedRescheduleService ?? selectedBooking.service,
          serviceId: rescheduleServiceId,
          startTime: selectedSlot.startTime,
        } satisfies Booking);

      replaceBooking(updatedBooking);
      setIsRescheduling(false);
      setConfirmation({ booking: updatedBooking, type: 'updated' });
    } catch (error) {
      setNotice({
        message:
          error instanceof Error ? error.message : 'Could not update booking.',
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  if (authRequired && !selectedBooking && !confirmation) {
    return (
      <main className="flex flex-1 items-center justify-center bg-black px-4 py-12 text-zinc-50 sm:px-6">
        <section className="w-full max-w-xl rounded-lg border border-white/15 bg-zinc-950 p-6 sm:p-8">
          <p className="text-sm font-medium uppercase text-zinc-500">
            Booking management
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Manage a guest booking
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Enter the booking reference from your confirmation to view, change,
            or cancel your appointment.
          </p>
          <form className="mt-6 grid gap-3" onSubmit={lookupGuestBooking}>
            <label className="block text-sm font-medium text-zinc-300">
              Booking reference
              <input
                className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-zinc-50 outline-none focus:border-zinc-50"
                onChange={(event) => setGuestReference(event.target.value)}
                placeholder="93f86393-7e60-4f2e-bf22-ef9f95d6e071"
                type="text"
                value={guestReference}
              />
            </label>
            <button
              className="h-11 rounded-full bg-zinc-50 px-5 text-sm font-medium text-black transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              disabled={!guestReference.trim() || isLookingUpReference}
              type="submit"
            >
              {isLookingUpReference ? 'Finding booking' : 'View booking'}
            </button>
          </form>
          {notice ? (
            <div className="mt-5 rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
              {notice.message}
            </div>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-medium text-zinc-50 transition-colors hover:bg-white/10"
              href={`/login?next=${encodeURIComponent('/bookings/manage-booking')}`}
            >
              Sign in instead
            </Link>
            <Link
              className="flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-medium text-zinc-50 transition-colors hover:bg-white/10"
              href="/bookings/new-booking"
            >
              Create booking
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (confirmation) {
    return (
      <main className="flex flex-1 bg-black px-4 py-10 text-zinc-50 sm:px-6 lg:px-24">
        <section className="mx-auto w-full max-w-3xl rounded-lg border border-emerald-400/30 bg-zinc-950 p-6 sm:p-8">
          <p className="text-sm font-medium uppercase text-emerald-300">
            Confirmed
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            {confirmation.type === 'cancelled'
              ? 'Booking cancelled'
              : 'Booking updated'}
          </h1>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <BookingDetailRows booking={confirmation.booking} />
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-50 px-5 text-sm font-medium text-black transition-colors hover:bg-zinc-300"
              onClick={() => setConfirmation(null)}
              type="button"
            >
              Back to bookings
            </button>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-medium text-zinc-50 transition-colors hover:bg-white/10"
              href="/bookings/new-booking"
            >
              Create another booking
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-1 bg-black px-4 py-10 text-zinc-50 sm:px-6 lg:px-24">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="h-fit rounded-lg border border-white/15 bg-zinc-950 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase text-zinc-500">
                Bookings
              </p>
              <h1 className="mt-2 text-2xl font-semibold">Manage bookings</h1>
            </div>
            {isLoading ? (
              <span className="text-sm text-zinc-500">Loading</span>
            ) : null}
          </div>
          {profile ? (
            <p className="mt-3 break-words text-sm text-zinc-400">
              Signed in as {profile.email}
            </p>
          ) : isGuestManagement ? (
            <p className="mt-3 text-sm text-zinc-400">
              Managing by booking reference
            </p>
          ) : null}

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

          {!isLoading && bookings.length === 0 ? (
            <div className="mt-6 rounded-lg border border-white/15 bg-black p-4">
              <p className="text-sm text-zinc-300">No bookings found.</p>
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-zinc-50 px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-300"
                href="/bookings/new-booking"
              >
                Create booking
              </Link>
            </div>
          ) : null}

          <div className="mt-6 grid gap-5">
            {isGuestManagement ? (
              <BookingList
                bookings={bookings}
                emptyLabel="No booking selected."
                onSelect={(booking) => {
                  setSelectedBookingId(booking.id);
                  setIsRescheduling(false);
                  setShowCancelConfirm(false);
                  setConfirmation(null);
                }}
                selectedBookingId={selectedBookingId}
                title="Reference result"
              />
            ) : (
              <>
                <BookingList
                  bookings={activeBookings}
                  emptyLabel="No upcoming bookings."
                  onSelect={(booking) => {
                    setSelectedBookingId(booking.id);
                    setIsRescheduling(false);
                    setShowCancelConfirm(false);
                    setConfirmation(null);
                  }}
                  selectedBookingId={selectedBookingId}
                  title="Upcoming"
                />
                <BookingList
                  bookings={otherBookings}
                  emptyLabel="No past or cancelled bookings."
                  onSelect={(booking) => {
                    setSelectedBookingId(booking.id);
                    setIsRescheduling(false);
                    setShowCancelConfirm(false);
                    setConfirmation(null);
                  }}
                  selectedBookingId={selectedBookingId}
                  title="Past and cancelled"
                />
              </>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-white/15 bg-zinc-950 p-5 sm:p-6">
          {selectedBooking ? (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase text-zinc-500">
                    Booking details
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {selectedBooking.service?.name ?? 'Selected service'}
                  </h2>
                </div>
                <StatusBadge status={selectedBooking.status} />
              </div>

              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <BookingDetailRows booking={selectedBooking} />
              </dl>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-50 px-5 text-sm font-medium text-black transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                  disabled={Boolean(changeDisabledReason)}
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setIsRescheduling(true);
                  }}
                  type="button"
                >
                  Reschedule
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center rounded-full border border-red-300/40 px-5 text-sm font-medium text-red-100 transition-colors hover:bg-red-950/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-zinc-600"
                  disabled={Boolean(changeDisabledReason)}
                  onClick={() => {
                    setIsRescheduling(false);
                    setShowCancelConfirm(true);
                  }}
                  type="button"
                >
                  Cancel booking
                </button>
              </div>

              {changeDisabledReason ? (
                <p className="mt-4 text-sm text-zinc-500">
                  {changeDisabledReason}
                </p>
              ) : null}

              {showCancelConfirm ? (
                <div className="mt-6 rounded-lg border border-red-300/30 bg-red-950/20 p-4">
                  <p className="text-sm font-medium text-red-100">
                    Cancel this booking?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-red-100/70">
                    This will remove the appointment from your upcoming
                    bookings.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      className="inline-flex h-10 items-center justify-center rounded-full bg-red-200 px-4 text-sm font-medium text-red-950 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                      disabled={isCancelling}
                      onClick={cancelBooking}
                      type="button"
                    >
                      {isCancelling ? 'Cancelling' : 'Confirm cancellation'}
                    </button>
                    <button
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-medium text-zinc-50 transition-colors hover:bg-white/10"
                      onClick={() => setShowCancelConfirm(false)}
                      type="button"
                    >
                      Keep booking
                    </button>
                  </div>
                </div>
              ) : null}

              {isRescheduling ? (
                <div className="mt-6 rounded-lg border border-white/15 bg-black p-4">
                  <h3 className="text-lg font-semibold">Reschedule booking</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Online reschedules are available from tomorrow up to one
                    month ahead.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-zinc-300">
                      Barber
                      <select
                        className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-zinc-50 outline-none focus:border-zinc-50"
                        onChange={(event) =>
                          setRescheduleBarberId(event.target.value)
                        }
                        value={rescheduleBarberId}
                      >
                        <option value="">Select barber</option>
                        {barbers.map((barber) => (
                          <option key={barber.id} value={barber.id}>
                            {barber.displayName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-zinc-300">
                      Date
                      <input
                        className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-zinc-50 outline-none focus:border-zinc-50"
                        max={latestBookingDate}
                        min={earliestBookingDate}
                        onChange={(event) =>
                          setRescheduleDate(event.target.value)
                        }
                        type="date"
                        value={rescheduleDate}
                      />
                    </label>
                    <label className="block text-sm font-medium text-zinc-300 sm:col-span-2">
                      Service
                      <select
                        className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-zinc-50 outline-none focus:border-zinc-50"
                        onChange={(event) =>
                          setRescheduleServiceId(event.target.value)
                        }
                        value={rescheduleServiceId}
                      >
                        <option value="">Select service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {formatPrice(service.pricePence)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

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
                    {availability && availability.slots.length === 0 ? (
                      <p className="text-sm text-zinc-400">
                        No slots are available for this day.
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <button
                      className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-50 px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                      disabled={
                        !rescheduleBarberId ||
                        !rescheduleServiceId ||
                        !isDateInBookingWindow(rescheduleDate) ||
                        !selectedSlot ||
                        isUpdating
                      }
                      onClick={updateBooking}
                      type="button"
                    >
                      {isUpdating ? 'Updating' : 'Confirm update'}
                    </button>
                    <button
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-medium text-zinc-50 transition-colors hover:bg-white/10"
                      onClick={() => setIsRescheduling(false)}
                      type="button"
                    >
                      Do nothing
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center text-center">
              <div>
                <h2 className="text-2xl font-semibold">No booking selected</h2>
                <p className="mt-3 text-sm text-zinc-400">
                  Select a booking to view its details.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function BookingList({
  bookings,
  emptyLabel,
  onSelect,
  selectedBookingId,
  title,
}: {
  bookings: Booking[];
  emptyLabel: string;
  onSelect: (booking: Booking) => void;
  selectedBookingId: string;
  title: string;
}) {
  return (
    <section>
      <h2 className="text-sm font-medium uppercase text-zinc-500">{title}</h2>
      <div className="mt-3 grid gap-2">
        {bookings.length === 0 ? (
          <p className="text-sm text-zinc-500">{emptyLabel}</p>
        ) : null}
        {bookings.map((booking) => (
          <button
            className={
              selectedBookingId === booking.id
                ? 'rounded-lg border border-zinc-50 bg-zinc-50 px-4 py-3 text-left text-black'
                : 'rounded-lg border border-white/15 bg-black px-4 py-3 text-left text-zinc-100 transition-colors hover:bg-white/10'
            }
            key={booking.id}
            onClick={() => onSelect(booking)}
            type="button"
          >
            <span className="block text-sm font-medium">
              {booking.service?.name ?? 'Booking'}
            </span>
            <span className="mt-1 block text-xs opacity-70">
              {formatBookingTime(booking.startTime)}
            </span>
            <span className="mt-1 block text-xs opacity-70">
              {booking.barber?.displayName ?? 'Selected barber'}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function BookingDetailRows({ booking }: { booking: Booking }) {
  return (
    <>
      <div>
        <dt className="text-zinc-500">Barber</dt>
        <dd className="mt-1 text-base text-zinc-100">
          {booking.barber?.displayName ?? 'Selected barber'}
        </dd>
      </div>
      <div>
        <dt className="text-zinc-500">Service</dt>
        <dd className="mt-1 text-base text-zinc-100">
          {booking.service?.name ?? 'Selected service'}
        </dd>
      </div>
      <div>
        <dt className="text-zinc-500">Price</dt>
        <dd className="mt-1 text-base text-zinc-100">
          {booking.service?.pricePence != null
            ? formatPrice(booking.service.pricePence)
            : 'Selected price'}
        </dd>
      </div>
      <div>
        <dt className="text-zinc-500">Time</dt>
        <dd className="mt-1 text-base text-zinc-100">
          {formatBookingTime(booking.startTime)}
        </dd>
      </div>
      <div>
        <dt className="text-zinc-500">Status</dt>
        <dd className="mt-1 text-base capitalize text-zinc-100">
          {getStatusLabel(booking.status)}
        </dd>
      </div>
      <div>
        <dt className="text-zinc-500">Customer</dt>
        <dd className="mt-1 text-base text-zinc-100">
          {booking.customerName ?? 'Account customer'}
        </dd>
      </div>
      <div>
        <dt className="text-zinc-500">Reference</dt>
        <dd className="mt-1 break-all text-base text-zinc-100">{booking.id}</dd>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isCancelled = status === 'CANCELLED';

  return (
    <span
      className={
        isCancelled
          ? 'inline-flex h-8 items-center rounded-full border border-red-300/40 px-3 text-xs font-medium capitalize text-red-100'
          : 'inline-flex h-8 items-center rounded-full border border-emerald-300/40 px-3 text-xs font-medium capitalize text-emerald-100'
      }
    >
      {getStatusLabel(status)}
    </span>
  );
}
