import { StaffPageShell, StaffPanel } from '../_components/staff-page-shell';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StaffCalendar() {
  return (
    <StaffPageShell
      description="Review the working week and jump into appointment blocks that need attention."
      title="Calendar"
    >
      <StaffPanel title="Week view">
        <div className="grid gap-3 md:grid-cols-6">
          {days.map((day, index) => (
            <section
              className="min-h-36 rounded-xl border border-white/10 bg-black p-3"
              key={day}
            >
              <h2 className="text-sm font-semibold text-zinc-100">{day}</h2>
              <p className="mt-3 text-sm text-zinc-500">
                {index % 2 === 0 ? '4 bookings' : '2 bookings'}
              </p>
            </section>
          ))}
        </div>
      </StaffPanel>
    </StaffPageShell>
  );
}
