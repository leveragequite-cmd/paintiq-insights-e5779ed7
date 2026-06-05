import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useData } from "@/lib/data-store";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory Intelligence — PaintIQ" }] }),
  component: InventoryPage,
});

type Status = "In Stock" | "Low Stock" | "Out of Stock";

const statusStyles: Record<Status, string> = {
  "In Stock": "bg-primary/15 text-primary border-primary/30",
  "Low Stock": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Out of Stock": "bg-destructive/15 text-destructive border-destructive/30",
};

function InventoryPage() {
  const { state } = useData();

  const rows = useMemo(() => {
    const key = (p: string, b: string, s: string) => `${p}|${b}|${s}`;
    const map = new Map<string, { product: string; brand: string; category: string; size: string; qty: number }>();
    state.stockEntries.forEach((e) => {
      const k = key(e.product, e.brand, e.size);
      const cur = map.get(k) ?? { product: e.product, brand: e.brand, category: e.category, size: e.size, qty: 0 };
      cur.qty += e.qty;
      map.set(k, cur);
    });
    state.salesEntries.forEach((s) => {
      const k = key(s.product, s.brand, s.size);
      const cur = map.get(k);
      if (cur) cur.qty -= s.qty;
    });
    return Array.from(map.values()).map((r) => {
      const status: Status = r.qty <= 0 ? "Out of Stock" : r.qty < 10 ? "Low Stock" : "In Stock";
      return { ...r, status };
    });
  }, [state.stockEntries, state.salesEntries]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Live stock derived from your stock and sales entries.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <div className="surface-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold">Stock Overview</h3>
            </div>
            {rows.length === 0 ? (
              <EmptyState title="No stock yet" subtitle="Add stock entries to see inventory here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium">Brand</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Size</th>
                      <th className="px-5 py-3 font-medium text-right">Qty</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-border/60 hover:bg-secondary/40">
                        <td className="px-5 py-3 font-medium">{r.product}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.brand}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.category}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.size}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{r.qty}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[r.status]}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <aside className="surface-card p-5 space-y-3 h-fit">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">AI Recommendations</h3>
          </div>
          <div className="text-xs text-muted-foreground">
            Recommendations will appear here once enough stock and sales history is recorded.
          </div>
        </aside>
      </div>
    </div>
  );
}
