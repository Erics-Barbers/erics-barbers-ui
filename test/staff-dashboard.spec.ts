import {
  formatBookingTime,
  splitTodaysBookings,
  type BarberBooking,
} from '../app/staff/_lib/bookings';
import { getBarberBookings } from '../app/staff/_lib/sample-bookings';

// 13:00 on 2026-07-03 in Europe/London (BST, UTC+1).
const NOW = new Date('2026-07-03T12:00:00.000Z');

function offset(minutes: number): string {
  return new Date(NOW.getTime() + minutes * 60_000).toISOString();
}

function booking(
  overrides: Partial<BarberBooking> & { id: string; startTime: string },
): BarberBooking {
  return {
    status: 'CONFIRMED',
    endTime: new Date(
      new Date(overrides.startTime).getTime() + 30 * 60_000,
    ).toISOString(),
    ...overrides,
  };
}

describe('splitTodaysBookings', () => {
  it('classifies confirmed appointments by whether their start time has passed', () => {
    const overdue = booking({ id: 'overdue', startTime: offset(-60) });
    const inProgress = booking({ id: 'in-progress', startTime: offset(-5) });
    const upcoming = booking({ id: 'upcoming', startTime: offset(60) });

    const result = splitTodaysBookings(
      [upcoming, overdue, inProgress],
      NOW,
    );

    expect(result.outstanding.map((b) => b.id)).toEqual([
      'overdue',
      'in-progress',
    ]);
    expect(result.upcoming.map((b) => b.id)).toEqual(['upcoming']);
  });

  it('treats a booking starting exactly now as outstanding', () => {
    const atNow = booking({ id: 'at-now', startTime: offset(0) });

    const result = splitTodaysBookings([atNow], NOW);

    expect(result.outstanding.map((b) => b.id)).toEqual(['at-now']);
    expect(result.upcoming).toEqual([]);
  });

  it('always treats PENDING bookings as outstanding, even when in the future', () => {
    const pendingFuture = booking({
      id: 'pending',
      status: 'PENDING',
      startTime: offset(90),
    });

    const result = splitTodaysBookings([pendingFuture], NOW);

    expect(result.outstanding.map((b) => b.id)).toEqual(['pending']);
    expect(result.upcoming).toEqual([]);
  });

  it('excludes cancelled bookings from every bucket and the total', () => {
    const cancelledPast = booking({
      id: 'cancelled-past',
      status: 'CANCELLED',
      startTime: offset(-30),
    });
    const cancelledFuture = booking({
      id: 'cancelled-future',
      status: 'CANCELLED',
      startTime: offset(30),
    });
    const active = booking({ id: 'active', startTime: offset(45) });

    const result = splitTodaysBookings(
      [cancelledPast, cancelledFuture, active],
      NOW,
    );

    expect(result.todaysTotal).toBe(1);
    expect(result.outstanding).toEqual([]);
    expect(result.upcoming.map((b) => b.id)).toEqual(['active']);
  });

  it('excludes bookings that are not on today (shop timezone)', () => {
    const yesterday = booking({ id: 'yesterday', startTime: offset(-24 * 60) });
    const tomorrow = booking({ id: 'tomorrow', startTime: offset(24 * 60) });
    const today = booking({ id: 'today', startTime: offset(30) });

    const result = splitTodaysBookings(
      [yesterday, tomorrow, today],
      NOW,
    );

    expect(result.todaysTotal).toBe(1);
    expect(result.upcoming.map((b) => b.id)).toEqual(['today']);
    expect(result.outstanding).toEqual([]);
  });

  it('sorts each bucket by start time ascending', () => {
    const laterUpcoming = booking({ id: 'later', startTime: offset(120) });
    const soonerUpcoming = booking({ id: 'sooner', startTime: offset(30) });
    const laterOverdue = booking({ id: 'overdue-late', startTime: offset(-15) });
    const earlierOverdue = booking({
      id: 'overdue-early',
      startTime: offset(-90),
    });

    const result = splitTodaysBookings(
      [laterUpcoming, laterOverdue, soonerUpcoming, earlierOverdue],
      NOW,
    );

    expect(result.outstanding.map((b) => b.id)).toEqual([
      'overdue-early',
      'overdue-late',
    ]);
    expect(result.upcoming.map((b) => b.id)).toEqual(['sooner', 'later']);
  });

  it('exposes the earliest upcoming booking as nextAppointment', () => {
    const first = booking({ id: 'first', startTime: offset(20) });
    const second = booking({ id: 'second', startTime: offset(80) });

    const result = splitTodaysBookings([second, first], NOW);

    expect(result.nextAppointment?.id).toBe('first');
  });

  it('returns a null nextAppointment when nothing is upcoming', () => {
    const overdue = booking({ id: 'overdue', startTime: offset(-30) });

    const result = splitTodaysBookings([overdue], NOW);

    expect(result.nextAppointment).toBeNull();
  });

  it('handles an empty booking list', () => {
    const result = splitTodaysBookings([], NOW);

    expect(result).toEqual({
      outstanding: [],
      upcoming: [],
      todaysTotal: 0,
      nextAppointment: null,
    });
  });
});

describe('formatBookingTime', () => {
  it('formats to 24-hour HH:mm in the shop timezone during BST', () => {
    expect(formatBookingTime('2026-07-03T08:15:00.000Z')).toBe('09:15');
  });

  it('formats to 24-hour HH:mm in the shop timezone during GMT', () => {
    expect(formatBookingTime('2026-01-15T09:30:00.000Z')).toBe('09:30');
  });
});

describe('getBarberBookings sample data', () => {
  it('produces both outstanding and upcoming appointments for today', () => {
    const result = splitTodaysBookings(getBarberBookings(NOW), NOW);

    expect(result.todaysTotal).toBeGreaterThan(0);
    expect(result.outstanding.length).toBeGreaterThan(0);
    expect(result.upcoming.length).toBeGreaterThan(0);
    expect(result.todaysTotal).toBe(
      result.outstanding.length + result.upcoming.length,
    );
  });
});
