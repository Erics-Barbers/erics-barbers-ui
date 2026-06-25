import { StaffPageShell, StaffPanel } from '../_components/staff-page-shell';

const blocks = [
  'Monday 09:00-17:30',
  'Tuesday 09:00-17:30',
  'Thursday 10:00-19:00',
  'Saturday 09:00-16:00',
];

export default function StaffAvailability() {
  return (
    <StaffPageShell
      description="Set working hours, breaks, and unavailable periods before exposing live booking slots."
      title="Availability"
    >
      <StaffPanel title="Working blocks">
        <ul className="grid gap-3 md:grid-cols-2">
          {blocks.map((block) => (
            <li
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300"
              key={block}
            >
              {block}
            </li>
          ))}
        </ul>
      </StaffPanel>
    </StaffPageShell>
  );
}
