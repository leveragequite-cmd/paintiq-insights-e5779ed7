import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { useData } from "@/lib/data-store";
import { revenueTrend, revenueBreakdown } from "@/lib/mock-data";

export const Route = createFileRoute("/sales")({
  head: () => ({ meta: [{ title: "Sales Analytics — PaintIQ" }] }),
  component: SalesPage,
});

const tooltipStyle = { backgroundColor: "#1E2230", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, color: "#F8FAFC", fontSize: 12 };
const COLORS = ["#00F2FE", "#7DD3FC", "#FF5A5A", "#F59E0B", "#94A3B8"];

function SalesPage() {
  const { state } = useData();
  const totalRev = state.salesEntries.reduce((s, x) => s + x.total, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Revenue, channel mix and conversion trends across your retail flow.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Today's Sales", v: "₹" + totalRev.toLocaleString("en-IN"), c: "+12%" },
          { l: "Avg Ticket Size", v: "₹4,260", c: "+3.4%" },
          { l: "Conversion Rate", v: "62%", c: "+1.2%" },
          { l: "Returns", v: "2.1%", c: "-0.4%" },
        ].map((k) => (
          <div key={k.l} className="surface-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.l}</div>
            <div className="mt-2 text-2xl font-semibold text-primary">{k.v}</div>
            <div className="text-xs text-muted-foreground mt-1">{k.c} vs last week</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="revenue" stroke="#00F2FE" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-4">Revenue by Category</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={revenueBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {revenueBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#12141C" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
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
                {state.salesEntries.slice(0, 8).map((s) => (
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
    </div>
  );
}
