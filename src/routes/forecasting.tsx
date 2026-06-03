import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, LineChart, Line, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { forecastData } from "@/lib/mock-data";

export const Route = createFileRoute("/forecasting")({
  head: () => ({ meta: [{ title: "Forecasting — PaintIQ" }] }),
  component: ForecastingPage,
});

const tooltipStyle = { backgroundColor: "#1E2230", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, color: "#F8FAFC", fontSize: 12 };

function ForecastChart({ title, data, confidence, unit }: { title: string; data: ReturnType<typeof forecastData>; confidence: number; unit?: string }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {confidence}% confidence
        </span>
      </div>
      <div className="h-56">
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id={`band-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F2FE" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#00F2FE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} />
            <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `${unit === "₹" ? "₹" : ""}${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="upper" stroke="none" fill={`url(#band-${title})`} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#12141C" />
            <Line type="monotone" dataKey="actual" stroke="#00F2FE" strokeWidth={2.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="forecast" stroke="#00F2FE" strokeWidth={2.5} strokeDasharray="6 4" dot={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ForecastingPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forecasting</h1>
          <p className="text-sm text-muted-foreground mt-1">90-day AI projections across demand, revenue, inventory and cash flow.</p>
        </div>
        <div className="flex gap-2">
          <select className="rounded-md border border-border bg-card px-3 py-2 text-sm">
            <option>All Categories</option>
            <option>Interior Paint</option>
            <option>Exterior Paint</option>
            <option>Enamel/Gloss</option>
          </select>
          <select className="rounded-md border border-border bg-card px-3 py-2 text-sm">
            <option>Next 90 days</option>
            <option>Next 30 days</option>
            <option>Next 180 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ForecastChart title="Demand Forecast (units)" data={forecastData(400, 18)} confidence={87} />
        <ForecastChart title="Revenue Forecast" data={forecastData(420000, 22000)} confidence={84} unit="₹" />
        <ForecastChart title="Inventory Level" data={forecastData(1200, -10)} confidence={79} />
        <ForecastChart title="Cash Flow Projection" data={forecastData(300000, 18000)} confidence={82} unit="₹" />
      </div>
    </div>
  );
}
