import { StaffPageShell, StaffPanel } from '../_components/staff-page-shell';

const customers = ['Marcus Lee', 'Adam Patel', 'Daniel Smith', 'Ryan Ahmed'];

export default function StaffCustomers() {
  return (
    <StaffPageShell
      description="Look up customers attached to appointments and review useful visit context."
      title="Customers"
    >
      <StaffPanel title="Recent customers">
        <ul className="grid gap-3 md:grid-cols-2">
          {customers.map((customer) => (
            <li
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300"
              key={customer}
            >
              {customer}
            </li>
          ))}
        </ul>
      </StaffPanel>
    </StaffPageShell>
  );
}
