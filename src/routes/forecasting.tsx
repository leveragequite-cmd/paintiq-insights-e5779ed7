import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/empty-state";
import { LineChart } from "lucide-react";

export const Route = createFileRoute("/forecasting")({
  head: () => ({ meta: [{ title: "Forecasting — PaintIQ" }] }),
  component: ForecastingPage,
});

function ForecastingPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forecasting</h1>
          <p className="text-sm text-muted-foreground mt-1">90-day AI projections across demand, revenue, inventory and cash flow.</p>
        </div>
      </div>

      <div className="surface-card p-5">
        <EmptyState
          icon={LineChart}
          title="Not enough data to forecast"
          subtitle="Log sales and stock movement for several weeks to unlock AI-driven projections."
        />
      </div>
    </div>
  );
}
