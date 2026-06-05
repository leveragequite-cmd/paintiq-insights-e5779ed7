import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useData } from "@/lib/data-store";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — PaintIQ" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const { state } = useData();

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; purchases: number; lifetime: number; last: string }>();
    state.salesEntries.forEach((s) => {
      const key = s.customer || "Walk-in";
      const entry = map.get(key) ?? { name: key, purchases: 0, lifetime: 0, last: s.date };
      entry.purchases += 1;
      entry.lifetime += s.total;
      if (s.date > entry.last) entry.last = s.date;
      map.set(key, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.lifetime - a.lifetime);
  }, [state.salesEntries]);

  const totalCustomers = customers.length;
  const totalLTV = customers.reduce((sum, c) => sum + c.lifetime, 0);
  const avgLTV = totalCustomers ? Math.round(totalLTV / totalCustomers) : 0;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const activeThisMonth = new Set(state.salesEntries.filter((s) => s.date.startsWith(thisMonth)).map((s) => s.customer || "Walk-in")).size;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Derived from your sales entries.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Total Customers", v: totalCustomers.toString() },
          { l: "Active This Month", v: activeThisMonth.toString() },
          { l: "Avg LTV", v: avgLTV ? `₹${avgLTV.toLocaleString("en-IN")}` : "—" },
          { l: "Total Revenue", v: totalLTV ? `₹${totalLTV.toLocaleString("en-IN")}` : "—" },
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
          <EmptyState title="No customers yet" subtitle="Record sales to populate this list." />
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
