import {
  StaffMetric,
  StaffPageShell,
  StaffPanel,
} from '../_components/staff-page-shell';
import {
  formatBookingTime,
  splitTodaysBookings,
  type BarberBooking,
} from '../_lib/bookings';
import { getBarberBookings } from '../_lib/sample-bookings';

function StatusBadge({ status }: { status: BarberBooking['status'] }) {
  const styles: Record<BarberBooking['status'], string> = {
    PENDING: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    CONFIRMED: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    CANCELLED: 'border-zinc-400/30 bg-zinc-400/10 text-zinc-400',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function BookingRow({
  booking,
  hint,
}: {
  booking: BarberBooking;
  hint?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="w-14 shrink-0 font-mono text-sm text-zinc-300">
          {formatBookingTime(booking.startTime)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">
            {booking.customerName ?? 'Walk-in'}
          </p>
          <p className="truncate text-xs text-zinc-500">
            {booking.service?.name ?? 'Service TBC'}
            {hint ? ` · ${hint}` : ''}
          </p>
        </div>
      </div>
      <StatusBadge status={booking.status} />
    </li>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-2 text-sm text-zinc-500">{message}</p>;
}

export default function StaffDashboard() {
  const now = new Date();
  const { outstanding, upcoming, todaysTotal, nextAppointment } =
    splitTodaysBookings(getBarberBookings(now), now);

  return (
    <StaffPageShell
      description="A quick operational view of today's outstanding and upcoming bookings."
      title="Dashboard"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StaffMetric label="Today's bookings" value={String(todaysTotal)} />
        <StaffMetric label="Outstanding" value={String(outstanding.length)} />
        <StaffMetric
          label="Next appointment"
          value={
            nextAppointment
              ? formatBookingTime(nextAppointment.startTime)
              : '—'
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <StaffPanel title="Outstanding">
          <p className="-mt-2 mb-3 text-xs text-zinc-500">
            In progress, overdue, or awaiting confirmation.
          </p>
          {outstanding.length > 0 ? (
            <ul className="flex flex-col divide-y divide-white/10">
              {outstanding.map((booking) => (
                <BookingRow
                  booking={booking}
                  hint={
                    booking.status === 'PENDING' ? 'Needs confirmation' : 'Due'
                  }
                  key={booking.id}
                />
              ))}
            </ul>
          ) : (
            <EmptyState message="Nothing outstanding right now." />
          )}
        </StaffPanel>

        <StaffPanel title="Upcoming today">
          <p className="-mt-2 mb-3 text-xs text-zinc-500">
            Confirmed appointments still to come.
          </p>
          {upcoming.length > 0 ? (
            <ul className="flex flex-col divide-y divide-white/10">
              {upcoming.map((booking) => (
                <BookingRow booking={booking} key={booking.id} />
              ))}
            </ul>
          ) : (
            <EmptyState message="No more appointments today." />
          )}
        </StaffPanel>
      </div>
    </StaffPageShell>
  );
}
