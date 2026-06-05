import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Sparkles, Boxes } from "lucide-react";
import { useData } from "@/lib/data-store";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory Intelligence — PaintIQ" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { state } = useData();

  const stock = useMemo(() => {
    const map: Record<string, { product: string; brand: string; category: string; qty: number }> = {};
    state.stockEntries.forEach((e) => {
      const key = `${e.product}__${e.brand}__${e.size}`;
      if (!map[key]) map[key] = { product: `${e.product} ${e.size}`, brand: e.brand, category: e.category, qty: 0 };
      map[key].qty += e.qty;
    });
    state.salesEntries.forEach((s) => {
      const key = `${s.product}__${s.brand}__${s.size}`;
      if (map[key]) map[key].qty -= s.qty;
    });
    return Object.values(map);
  }, [state]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Live stock health, aging and AI-driven reorder suggestions.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <div className="surface-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Stock Overview</h3>
          </div>
          {stock.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Boxes} title="No stock recorded" subtitle="Add stock-in entries from the Data Entry Center to see live inventory." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Brand</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium text-right">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((r, i) => (
                    <tr key={i} className="border-b border-border/60 hover:bg-secondary/40">
                      <td className="px-5 py-3 font-medium">{r.product}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.brand}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.category}</td>
                      <td className={`px-5 py-3 text-right tabular-nums ${r.qty <= 0 ? "text-destructive" : ""}`}>{r.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="surface-card p-5 space-y-3 h-fit">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">AI Recommendations</h3>
          </div>
          <div className="text-xs text-muted-foreground">
            Reorder and dead-stock insights will appear here once enough movement data is available.
          </div>
        </aside>
      </div>
    </div>
  );
}
