import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Wallet, Truck, Users, LineChart, FileDown, FileSpreadsheet, FileText } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — PaintIQ" }] }),
  component: ReportsPage,
});

const reportTypes = [
  { icon: Boxes, title: "Inventory Report", desc: "Stock levels, aging, dead stock and reorder analysis." },
  { icon: Wallet, title: "Financial Report", desc: "P&L, cash flow, receivables and GST summary." },
  { icon: Truck, title: "Supplier Report", desc: "Supplier performance, price changes and risk scores." },
  { icon: Users, title: "Customer Report", desc: "Top customers, retention, lifetime value and segments." },
  { icon: LineChart, title: "Forecast Report", desc: "90-day projections for revenue, demand and cash." },
];

function ReportsPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate, share and export business reports in seconds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportTypes.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.title} className="surface-card p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.desc}</div>
              </div>
              <button className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Generate Report
              </button>
              <div className="flex gap-2 pt-1">
                <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-secondary"><FileDown className="h-3 w-3" /> PDF</button>
                <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-secondary"><FileSpreadsheet className="h-3 w-3" /> Excel</button>
                <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-secondary"><FileText className="h-3 w-3" /> CSV</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
