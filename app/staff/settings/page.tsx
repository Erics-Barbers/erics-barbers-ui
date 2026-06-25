import { StaffPageShell, StaffPanel } from '../_components/staff-page-shell';

export default function StaffSettings() {
  return (
    <StaffPageShell
      description="Manage staff profile preferences, notification settings, and barber account details."
      title="Settings"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <StaffPanel title="Profile">
          <dl className="flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-zinc-500">Display name</dt>
              <dd className="mt-1 text-zinc-200">Staff member</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Role</dt>
              <dd className="mt-1 text-zinc-200">Barber</dd>
            </div>
          </dl>
        </StaffPanel>

        <StaffPanel title="Notifications">
          <p className="text-sm leading-6 text-zinc-400">
            Appointment reminders, schedule changes, and cancellation alerts
            can be configured here once notification preferences are modelled.
          </p>
        </StaffPanel>
      </div>
    </StaffPageShell>
  );
}
