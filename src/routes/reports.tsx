import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Wallet, Truck, Users, LineChart, FileDown, FileSpreadsheet, FileText } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — PaintIQ" }] }),
  component: ReportsPage,
});

const reportTypes = [
  { icon: Boxes, title: "Inventory Report", desc: "Stock levels, aging, dead stock and reorder analysis.", last: "2 days ago" },
  { icon: Wallet, title: "Financial Report", desc: "P&L, cash flow, receivables and GST summary.", last: "Yesterday" },
  { icon: Truck, title: "Supplier Report", desc: "Supplier performance, price changes and risk scores.", last: "1 week ago" },
  { icon: Users, title: "Customer Report", desc: "Top customers, retention, lifetime value and segments.", last: "3 days ago" },
  { icon: LineChart, title: "Forecast Report", desc: "90-day projections for revenue, demand and cash.", last: "5 days ago" },
];

const recent = [
  { name: "October Financial Summary", type: "Financial", date: "2 days ago" },
  { name: "Dead Stock Audit Q3", type: "Inventory", date: "5 days ago" },
  { name: "Supplier Price Trends — Sep", type: "Supplier", date: "1 week ago" },
  { name: "Festive Demand Forecast", type: "Forecast", date: "2 weeks ago" },
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
              <div className="text-xs text-muted-foreground">Last generated: {r.last}</div>
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

      <div className="surface-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">Recent Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Generated</th>
                <th className="px-5 py-3 font-medium text-right">Download</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.name} className="border-b border-border/60 hover:bg-secondary/40">
                  <td className="px-5 py-3 font-medium">{r.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.type}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary/40">
                      <FileDown className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
