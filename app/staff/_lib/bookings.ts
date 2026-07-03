export const SHOP_TIME_ZONE = 'Europe/London';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type BarberBooking = {
  id: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  customerName?: string;
  customerPhone?: string;
  service?: {
    name: string;
    durationMinutes?: number;
  } | null;
};

export type TodaysBookings = {
  outstanding: BarberBooking[];
  upcoming: BarberBooking[];
  todaysTotal: number;
  nextAppointment: BarberBooking | null;
};

function shopDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function isToday(iso: string, now: Date): boolean {
  return shopDateKey(new Date(iso)) === shopDateKey(now);
}

/**
 * An appointment is "outstanding" when it still needs the barber's attention:
 * it is pending confirmation, or it is confirmed and its start time has already
 * passed (in progress or waiting to be wrapped up). Cancelled bookings never
 * appear. Everything else confirmed later today counts as "upcoming".
 */
export function splitTodaysBookings(
  bookings: BarberBooking[],
  now: Date = new Date(),
): TodaysBookings {
  const nowMs = now.getTime();
  const todays = bookings
    .filter((booking) => booking.status !== 'CANCELLED')
    .filter((booking) => isToday(booking.startTime, now))
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

  const outstanding: BarberBooking[] = [];
  const upcoming: BarberBooking[] = [];

  for (const booking of todays) {
    const startMs = new Date(booking.startTime).getTime();
    const isOverdue = startMs <= nowMs;

    if (booking.status === 'PENDING' || isOverdue) {
      outstanding.push(booking);
    } else {
      upcoming.push(booking);
    }
  }

  return {
    outstanding,
    upcoming,
    todaysTotal: todays.length,
    nextAppointment: upcoming[0] ?? null,
  };
}

export function formatBookingTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: SHOP_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}
