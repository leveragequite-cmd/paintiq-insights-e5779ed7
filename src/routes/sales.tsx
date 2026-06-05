import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useData } from "@/lib/data-store";
import { EmptyState } from "@/components/empty-state";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/sales")({
  head: () => ({ meta: [{ title: "Sales Analytics — PaintIQ" }] }),
  component: SalesPage,
});

const tooltipStyle = { backgroundColor: "#1E2230", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, color: "#F8FAFC", fontSize: 12 };

function SalesPage() {
  const { state } = useData();
  const totalRev = state.salesEntries.reduce((s, x) => s + x.total, 0);
  const avgTicket = state.salesEntries.length > 0 ? totalRev / state.salesEntries.length : 0;

  const byDay = useMemo(() => {
    const m: Record<string, number> = {};
    state.salesEntries.forEach((s) => {
      m[s.date] = (m[s.date] || 0) + s.total;
    });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
  }, [state.salesEntries]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Revenue, channel mix and conversion trends across your retail flow.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Total Sales", v: totalRev > 0 ? "₹" + totalRev.toLocaleString("en-IN") : "—" },
          { l: "Avg Ticket Size", v: avgTicket > 0 ? "₹" + Math.round(avgTicket).toLocaleString("en-IN") : "—" },
          { l: "Transactions", v: state.salesEntries.length.toString() },
          { l: "Returns", v: "—" },
        ].map((k) => (
          <div key={k.l} className="surface-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.l}</div>
            <div className="mt-2 text-2xl font-semibold text-primary">{k.v}</div>
          </div>
        ))}
      </div>

      {state.salesEntries.length === 0 ? (
        <div className="surface-card p-5">
          <EmptyState
            icon={ShoppingCart}
            title="No sales recorded yet"
            subtitle="Log a sale in the Data Entry Center to populate analytics."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold mb-4">Revenue by Day</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke="#00F2FE" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold mb-4">Recent Sales</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-3 px-2 font-medium">Date</th>
                    <th className="py-3 px-2 font-medium">Customer</th>
                    <th className="py-3 px-2 font-medium">Product</th>
                    <th className="py-3 px-2 font-medium text-right">Qty</th>
                    <th className="py-3 px-2 font-medium text-right">Total</th>
                    <th className="py-3 px-2 font-medium">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {state.salesEntries.slice(0, 12).map((s) => (
                    <tr key={s.id} className="border-b border-border/60 hover:bg-secondary/40">
                      <td className="py-3 px-2 text-muted-foreground">{s.date}</td>
                      <td className="py-3 px-2">{s.customer}</td>
                      <td className="py-3 px-2">{s.product}</td>
                      <td className="py-3 px-2 text-right tabular-nums">{s.qty}</td>
                      <td className="py-3 px-2 text-right tabular-nums text-primary font-medium">₹{s.total.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-2 text-muted-foreground">{s.paymentMode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
