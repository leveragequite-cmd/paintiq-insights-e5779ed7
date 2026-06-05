import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-store";
import { EmptyState } from "@/components/empty-state";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/finance")({
  head: () => ({ meta: [{ title: "Finance Intelligence — PaintIQ" }] }),
  component: FinancePage,
});

function FinancePage() {
  const { state } = useData();
  const expenseTotal = state.expenses.reduce((s, x) => s + x.amount, 0);
  const revenue = state.salesEntries.reduce((s, x) => s + x.total, 0);
  const payables = state.invoices.filter((i) => i.status !== "Paid").reduce((s, x) => s + x.grandTotal, 0);

  const hasData = state.salesEntries.length > 0 || state.expenses.length > 0 || state.invoices.length > 0;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Cash, receivables, GST and profitability — all in one view.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { l: "Revenue Logged", v: revenue > 0 ? "₹" + revenue.toLocaleString("en-IN") : "—" },
          { l: "Accounts Payable", v: payables > 0 ? "₹" + payables.toLocaleString("en-IN") : "—", tone: payables > 0 ? "critical" : undefined },
          { l: "Expenses Logged", v: expenseTotal > 0 ? "₹" + expenseTotal.toLocaleString("en-IN") : "—" },
        ].map((p, i) => (
          <div key={i} className="surface-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.l}</div>
            <div className={`mt-2 text-2xl font-semibold ${p.tone === "critical" ? "text-destructive" : "text-foreground"}`}>
              {p.v}
            </div>
          </div>
        ))}
      </div>

      {!hasData && (
        <div className="surface-card p-5">
          <EmptyState
            icon={Wallet}
            title="No financial data yet"
            subtitle="Sales, invoices and expenses entered in the Data Entry Center will populate this view."
          />
        </div>
      )}
    </div>
  );
}
