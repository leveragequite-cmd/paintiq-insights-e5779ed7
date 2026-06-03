import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import { IndianRupee, TrendingUp, Boxes, AlertTriangle, Wallet, RefreshCcw, Percent, Activity } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { useData } from "@/lib/data-store";
import {
  revenueTrend, monthlyProfit, inventoryMovement, fastSlowProducts,
  supplierPerformance, cashFlowProjection,
} from "@/lib/mock-data";

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

  const totals = useMemo(() => {
    const revenue = state.salesEntries.reduce((s, x) => s + x.total, 0) + 4_820_000;
    const grossProfit = Math.round(revenue * 0.28);
    const inventoryValue = state.stockEntries.reduce((s, x) => s + x.qty * x.buyPrice, 0) + 1_240_000;
    const deadStock = Math.round(inventoryValue * 0.08);
    const cashFlow = 312_000;
    return { revenue, grossProfit, inventoryValue, deadStock, cashFlow };
  }, [state]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time business intelligence for your paint retail operations.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Revenue" value={fmtINR(totals.revenue)} change={12.4} intent="positive" icon={IndianRupee} />
        <KpiCard label="Gross Profit" value={fmtINR(totals.grossProfit)} change={8.2} intent="positive" icon={TrendingUp} />
        <KpiCard label="Inventory Value" value={fmtINR(totals.inventoryValue)} change={-2.1} icon={Boxes} />
        <KpiCard label="Dead Stock Value" value={fmtINR(totals.deadStock)} change={5.7} intent="critical" icon={AlertTriangle} />
        <KpiCard label="Cash Flow" value={fmtINR(totals.cashFlow)} change={14.0} intent="positive" icon={Wallet} />
        <KpiCard label="Inventory Turnover" value="6.4x" change={3.1} intent="positive" icon={RefreshCcw} />
        <KpiCard label="Profit Margin" value="27.8%" change={1.4} intent="positive" icon={Percent} />
        <KpiCard label="Monthly Growth" value="9.2%" change={-0.6} intent="critical" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Revenue Trends" subtitle="Last 12 months">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtINR(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#00F2FE" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Profit" subtitle="Gross profit by month">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyProfit}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtINR(v)} />
              <Bar dataKey="profit" fill="#00F2FE" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Inventory Movement" subtitle="Inflow vs outflow (units)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={inventoryMovement}>
              <defs>
                <linearGradient id="inflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F2FE" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00F2FE" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="inflow" stroke="#00F2FE" fill="url(#inflow)" strokeWidth={2} />
              <Area type="monotone" dataKey="outflow" stroke="#94A3B8" fill="url(#outflow)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fast vs Slow Moving" subtitle="Units sold last 90 days">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fastSlowProducts} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#94A3B8" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={120} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {fastSlowProducts.map((p, i) => (
                  <Bar key={i} fill={p.type === "fast" ? "#00F2FE" : "#FF5A5A"} dataKey="value" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Supplier Performance" subtitle="Top 2 suppliers">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={supplierPerformance}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" stroke="#94A3B8" fontSize={11} />
              <PolarRadiusAxis stroke="#94A3B8" fontSize={10} />
              <Radar name="Sharma Distributors" dataKey="A" stroke="#00F2FE" fill="#00F2FE" fillOpacity={0.3} />
              <Radar name="Apex Wholesale" dataKey="B" stroke="#FF5A5A" fill="#FF5A5A" fillOpacity={0.2} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cash Flow Projection" subtitle="Actual + 3-month forecast">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashFlowProjection}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtINR(v)} />
              <Line type="monotone" dataKey="actual" stroke="#00F2FE" strokeWidth={2.5} dot={false} connectNulls />
              <Line type="monotone" dataKey="forecast" stroke="#00F2FE" strokeWidth={2.5} strokeDasharray="6 4" dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
