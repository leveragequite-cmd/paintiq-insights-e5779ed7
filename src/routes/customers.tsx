import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useData } from "@/lib/data-store";
import { EmptyState } from "@/components/empty-state";
import { Users } from "lucide-react";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — PaintIQ" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const { state } = useData();

  const customers = useMemo(() => {
    const map: Record<string, { name: string; purchases: number; lifetime: number; last: string }> = {};
    state.salesEntries.forEach((s) => {
      if (!map[s.customer]) map[s.customer] = { name: s.customer, purchases: 0, lifetime: 0, last: s.date };
      map[s.customer].purchases += 1;
      map[s.customer].lifetime += s.total;
      if (s.date > map[s.customer].last) map[s.customer].last = s.date;
    });
    return Object.values(map).sort((a, b) => b.lifetime - a.lifetime);
  }, [state.salesEntries]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Contractor, designer and retail buyer relationships.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Total Customers", v: customers.length.toString() },
          { l: "Transactions", v: state.salesEntries.length.toString() },
          { l: "Total Revenue", v: customers.length > 0 ? "₹" + customers.reduce((s, c) => s + c.lifetime, 0).toLocaleString("en-IN") : "—" },
          { l: "Avg LTV", v: customers.length > 0 ? "₹" + Math.round(customers.reduce((s, c) => s + c.lifetime, 0) / customers.length).toLocaleString("en-IN") : "—" },
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
        {customers.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Users} title="No customers yet" subtitle="Customers will appear here as you log sales." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium text-right">Purchases</th>
                  <th className="px-5 py-3 font-medium text-right">Lifetime Value</th>
                  <th className="px-5 py-3 font-medium">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.name} className="border-b border-border/60 hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{c.name}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.purchases}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-primary font-medium">₹{c.lifetime.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
