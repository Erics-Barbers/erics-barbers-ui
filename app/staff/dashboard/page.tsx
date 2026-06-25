import {
  StaffMetric,
  StaffPageShell,
  StaffPanel,
} from '../_components/staff-page-shell';

const upcomingAppointments = [
  '09:30 - Skin fade - Marcus Lee',
  '10:15 - Beard trim - Adam Patel',
  '11:00 - Full service - Daniel Smith',
];

export default function StaffDashboard() {
  return (
    <StaffPageShell
      description="A quick operational view of today&apos;s appointments, gaps, and follow-up actions."
      title="Dashboard"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StaffMetric label="Today&apos;s bookings" value="12" />
        <StaffMetric label="Open gaps" value="3" />
        <StaffMetric label="Pending actions" value="2" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <StaffPanel title="Next appointments">
          <ul className="flex flex-col divide-y divide-white/10 text-sm text-zinc-300">
            {upcomingAppointments.map((appointment) => (
              <li className="py-3 first:pt-0 last:pb-0" key={appointment}>
                {appointment}
              </li>
            ))}
          </ul>
        </StaffPanel>

        <StaffPanel title="Shop notes">
          <p className="text-sm leading-6 text-zinc-400">
            Show reminders, late arrivals, customer notes, and operational
            alerts here once staff workflows are connected to the API.
          </p>
        </StaffPanel>
      </div>
    </StaffPageShell>
  );
}
