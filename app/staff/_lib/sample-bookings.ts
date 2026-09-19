import type { BarberBooking } from './bookings';

const BOOKING_MINUTES = 30;

function at(now: Date, offsetMinutes: number): { start: string; end: string } {
  const start = new Date(now.getTime() + offsetMinutes * 60_000);
  const end = new Date(start.getTime() + BOOKING_MINUTES * 60_000);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Placeholder barber booking source.
 *
 * Returns sample appointments anchored around "now" so the dashboard can
 * demonstrate the outstanding/upcoming split at any time of day. Replace this
 * with a fetch to the barber-scoped bookings BFF route once the API exposes a
 * barber booking list (see ADR 0018).
 */
export function getBarberBookings(now: Date = new Date()): BarberBooking[] {
  const earlier = at(now, -75);
  const inProgress = at(now, -10);
  const soon = at(now, 35);
  const later = at(now, 120);
  const endOfDay = at(now, 240);

  return [
    {
      id: 'sample-1',
      status: 'CONFIRMED',
      startTime: earlier.start,
      endTime: earlier.end,
      customerName: 'Marcus Lee',
      customerPhone: '07700 900123',
      service: { name: 'Skin fade', durationMinutes: 30 },
    },
    {
      id: 'sample-2',
      status: 'CONFIRMED',
      startTime: inProgress.start,
      endTime: inProgress.end,
      customerName: 'Adam Patel',
      customerPhone: '07700 900456',
      service: { name: 'Beard trim', durationMinutes: 30 },
    },
    {
      id: 'sample-3',
      status: 'PENDING',
      startTime: soon.start,
      endTime: soon.end,
      customerName: 'Daniel Smith',
      customerPhone: '07700 900789',
      service: { name: 'Haircut', durationMinutes: 30 },
    },
    {
      id: 'sample-4',
      status: 'CONFIRMED',
      startTime: later.start,
      endTime: later.end,
      customerName: 'Josh Wright',
      customerPhone: '07700 900222',
      service: { name: 'Haircut with skin fade', durationMinutes: 30 },
    },
    {
      id: 'sample-5',
      status: 'CONFIRMED',
      startTime: endOfDay.start,
      endTime: endOfDay.end,
      customerName: 'Ethan Brown',
      customerPhone: '07700 900333',
      service: { name: 'Beard trim', durationMinutes: 30 },
    },
  ];
}
