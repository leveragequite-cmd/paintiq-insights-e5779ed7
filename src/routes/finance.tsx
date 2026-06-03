import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { useData } from "@/lib/data-store";
import { expensesByMonth, gstRows, profitabilityTrend, revenueBreakdown } from "@/lib/mock-data";

export const Route = createFileRoute("/finance")({
  head: () => ({ meta: [{ title: "Finance Intelligence — PaintIQ" }] }),
  component: FinancePage,
});

const tooltipStyle = { backgroundColor: "#1E2230", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, color: "#F8FAFC", fontSize: 12 };
const COLORS = ["#00F2FE", "#7DD3FC", "#FF5A5A", "#F59E0B", "#94A3B8"];

function HealthRing({ score }: { score: number }) {
  const r = 56, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
      <circle
        cx="70" cy="70" r={r} stroke="#00F2FE" strokeWidth="10" fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="76" textAnchor="middle" fill="#F8FAFC" fontSize="28" fontWeight="700">{score}</text>
    </svg>
  );
}

function FinancePage() {
  const { state } = useData();
  const expenseTotal = state.expenses.reduce((s, x) => s + x.amount, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Cash, receivables, GST and profitability — all in one view.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        <div className="surface-card p-5 flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Financial Health Score</div>
          <HealthRing score={82} />
          <div className="text-xs text-primary mt-1 font-medium">Strong</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { l: "Accounts Receivable", v: "₹3,84,200", c: "12 invoices pending" },
            { l: "Accounts Payable", v: "₹2,18,500", c: "5 due this week", tone: "critical" },
            { l: "Cash Position", v: "₹6,42,800", c: "+₹84k vs last month", tone: "positive" },
          ].map((p, i) => (
            <div key={i} className="surface-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.l}</div>
              <div className={`mt-2 text-2xl font-semibold ${p.tone === "critical" ? "text-destructive" : p.tone === "positive" ? "text-primary" : "text-foreground"}`}>
                {p.v}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{p.c}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-4">Revenue Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={revenueBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {revenueBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#12141C" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-4">Expense Tracking</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={expensesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                <Bar dataKey="rent" stackId="a" fill="#00F2FE" />
                <Bar dataKey="salary" stackId="a" fill="#7DD3FC" />
                <Bar dataKey="utilities" stackId="a" fill="#F59E0B" />
                <Bar dataKey="transport" stackId="a" fill="#FF5A5A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Profitability Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={profitabilityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                <Line type="monotone" dataKey="gross" name="Gross Margin %" stroke="#00F2FE" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="net" name="Net Margin %" stroke="#7DD3FC" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">GST Tracking</h3>
            <span className="text-xs text-muted-foreground">Expenses logged this period: ₹{expenseTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-medium">Month</th>
                  <th className="px-5 py-3 font-medium text-right">Taxable Value</th>
                  <th className="px-5 py-3 font-medium text-right">GST Collected</th>
                  <th className="px-5 py-3 font-medium text-right">GST Paid</th>
                  <th className="px-5 py-3 font-medium text-right">Net Liability</th>
                </tr>
              </thead>
              <tbody>
                {gstRows.map((r) => (
                  <tr key={r.month} className="border-b border-border/60">
                    <td className="px-5 py-3 font-medium">{r.month}</td>
                    <td className="px-5 py-3 text-right tabular-nums">₹{r.taxable.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-right tabular-nums">₹{r.collected.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-right tabular-nums">₹{r.paid.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-primary font-medium">₹{r.net.toLocaleString("en-IN")}</td>
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
