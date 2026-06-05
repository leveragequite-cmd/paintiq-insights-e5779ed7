import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Truck } from "lucide-react";
import { useData } from "@/lib/data-store";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/procurement")({
  head: () => ({ meta: [{ title: "Procurement Center — PaintIQ" }] }),
  component: ProcurementPage,
});

function ProcurementPage() {
  const { state } = useData();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Procurement Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Supplier intelligence, price monitoring and purchasing decisions.</p>
      </div>

      <div className="surface-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">AI Recommendations</span>
        </div>
        <div className="text-sm text-muted-foreground">
          AI procurement insights will appear here once you log enough stock-in entries and price changes to detect patterns.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-4">Recent Price Changes</h3>
          {state.priceChanges.length === 0 ? (
            <EmptyState icon={Sparkles} title="No price changes logged" subtitle="Track supplier price movement from the Data Entry Center." />
          ) : (
            <div className="space-y-3">
              {state.priceChanges.map((p) => {
                const delta = p.newBuy - p.oldBuy;
                const marginErosion = ((p.newSell - p.newBuy) / p.newSell - (p.oldSell - p.oldBuy) / p.oldSell) * 100;
                return (
                  <div key={p.id} className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{p.product}</div>
                        <div className="text-xs text-muted-foreground">{p.brand} · {p.reason}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${delta > 0 ? "text-destructive" : "text-primary"}`}>
                          {delta > 0 ? "+" : ""}₹{delta}
                        </div>
                        <div className={`text-xs ${marginErosion < 0 ? "text-destructive" : "text-primary"}`}>
                          Margin {marginErosion >= 0 ? "+" : ""}{marginErosion.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="surface-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Purchase History</h3>
          </div>
          {state.stockEntries.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Truck} title="No purchases recorded" subtitle="Log stock-in entries to see purchase history." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Supplier</th>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium text-right">Qty</th>
                    <th className="px-5 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {state.stockEntries.map((e) => (
                    <tr key={e.id} className="border-b border-border/60">
                      <td className="px-5 py-3 text-muted-foreground">{e.date}</td>
                      <td className="px-5 py-3">{e.supplier}</td>
                      <td className="px-5 py-3 truncate max-w-[160px]">{e.product}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{e.qty}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-primary">₹{(e.qty * e.buyPrice).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
