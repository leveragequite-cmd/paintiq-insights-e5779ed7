import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — PaintIQ" }] }),
  component: CustomersPage,
});

const customers = [
  { name: "Mehta Constructions", type: "Contractor", purchases: 42, lifetime: 1284000, last: "2 days ago" },
  { name: "Patel Interiors", type: "Designer", purchases: 28, lifetime: 642000, last: "5 days ago" },
  { name: "Singh Painters", type: "Painter", purchases: 64, lifetime: 982000, last: "1 day ago" },
  { name: "Rao Builders", type: "Contractor", purchases: 18, lifetime: 1860000, last: "2 weeks ago" },
  { name: "Walk-in Customers", type: "Retail", purchases: 412, lifetime: 1248000, last: "Today" },
];

function CustomersPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Contractor, designer and retail buyer relationships.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Total Customers", v: "184" },
          { l: "Active This Month", v: "62" },
          { l: "Avg LTV", v: "₹4.2L" },
          { l: "Repeat Rate", v: "68%" },
        ].map((k) => (
          <div key={k.l} className="surface-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.l}</div>
            <div className="mt-2 text-2xl font-semibold text-primary">{k.v}</div>
          </div>
        ))}
      </div>

      <div className="surface-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">Top Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium text-right">Purchases</th>
                <th className="px-5 py-3 font-medium text-right">Lifetime Value</th>
                <th className="px-5 py-3 font-medium">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.name} className="border-b border-border/60 hover:bg-secondary/40">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.type}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{c.purchases}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-primary font-medium">₹{c.lifetime.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
