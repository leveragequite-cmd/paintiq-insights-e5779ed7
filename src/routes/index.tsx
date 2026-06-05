import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { IndianRupee, TrendingUp, Boxes, AlertTriangle, Wallet, RefreshCcw, Percent, Activity, Inbox } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { EmptyState } from "@/components/empty-state";
import { useData } from "@/lib/data-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — PaintIQ" },
      { name: "description", content: "Executive paint retail KPIs, revenue, inventory and cash flow at a glance." },
    ],
  }),
  component: Dashboard,
});

const fmtINR = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const tooltipStyle = {
  backgroundColor: "#1E2230",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12,
  color: "#F8FAFC",
  fontSize: 12,
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}

function Dashboard() {
  const { state } = useData();

  const { revenue, grossProfit, inventoryValue, salesByMonth, hasData } = useMemo(() => {
    const revenue = state.salesEntries.reduce((s, x) => s + x.total, 0);
    const cogs = state.stockEntries.reduce((s, x) => s + x.qty * x.buyPrice, 0);
    const grossProfit = Math.max(revenue - cogs, 0);
    const inventoryValue = cogs;

    const byMonth: Record<string, number> = {};
    state.salesEntries.forEach((s) => {
      const m = s.date.slice(0, 7);
      byMonth[m] = (byMonth[m] || 0) + s.total;
    });
    const salesByMonth = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, revenue: value, profit: Math.round(value * 0.28) }));

    return {
      revenue,
      grossProfit,
      inventoryValue,
      salesByMonth,
      hasData: state.salesEntries.length > 0 || state.stockEntries.length > 0,
    };
  }, [state]);

  const margin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) + "%" : "—";

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time business intelligence for your paint retail operations.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Revenue" value={revenue > 0 ? fmtINR(revenue) : "—"} icon={IndianRupee} intent={revenue > 0 ? "positive" : "neutral"} />
        <KpiCard label="Gross Profit" value={grossProfit > 0 ? fmtINR(grossProfit) : "—"} icon={TrendingUp} intent={grossProfit > 0 ? "positive" : "neutral"} />
        <KpiCard label="Inventory Value" value={inventoryValue > 0 ? fmtINR(inventoryValue) : "—"} icon={Boxes} />
        <KpiCard label="Dead Stock Value" value="—" icon={AlertTriangle} />
        <KpiCard label="Cash Flow" value="—" icon={Wallet} />
        <KpiCard label="Inventory Turnover" value="—" icon={RefreshCcw} />
        <KpiCard label="Profit Margin" value={margin} icon={Percent} intent={revenue > 0 ? "positive" : "neutral"} />
        <KpiCard label="Monthly Growth" value="—" icon={Activity} />
      </div>

      {!hasData ? (
        <div className="surface-card p-5">
          <EmptyState
            icon={Inbox}
            title="No business data yet"
            subtitle="Add stock, sales and expenses from the Data Entry Center to see your dashboard come alive."
            action={
              <Link
                to="/data-entry"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to Data Entry
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Revenue Trends" subtitle="By month">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtINR(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#00F2FE" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly Profit" subtitle="Estimated by month">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtINR(v)} />
                <Bar dataKey="profit" fill="#00F2FE" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
