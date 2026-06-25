import { StaffPageShell, StaffPanel } from '../_components/staff-page-shell';

const bookings = [
  ['09:30', 'Marcus Lee', 'Skin fade', 'Confirmed'],
  ['10:15', 'Adam Patel', 'Beard trim', 'Confirmed'],
  ['11:00', 'Daniel Smith', 'Full service', 'Needs note'],
];

export default function StaffBookings() {
  return (
    <StaffPageShell
      description="View assigned bookings, appointment details, and booking statuses for the working day."
      title="Bookings"
    >
      <StaffPanel title="Today">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Service</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-zinc-300">
              {bookings.map(([time, customer, service, status]) => (
                <tr key={`${time}-${customer}`}>
                  <td className="py-3">{time}</td>
                  <td className="py-3">{customer}</td>
                  <td className="py-3">{service}</td>
                  <td className="py-3">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StaffPanel>
    </StaffPageShell>
  );
}
