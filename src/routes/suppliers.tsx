import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Truck } from "lucide-react";
import { useData } from "@/lib/data-store";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers — PaintIQ" }] }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const { state } = useData();

  const suppliers = useMemo(() => {
    const map = new Map<string, { name: string; brands: Set<string>; orders: number; spend: number }>();
    state.stockEntries.forEach((s) => {
      if (!s.supplier) return;
      const entry = map.get(s.supplier) ?? { name: s.supplier, brands: new Set<string>(), orders: 0, spend: 0 };
      if (s.brand) entry.brands.add(s.brand);
      entry.orders += 1;
      entry.spend += s.qty * s.buyPrice;
      map.set(s.supplier, entry);
    });
    state.invoices.forEach((inv) => {
      if (!inv.supplier) return;
      const entry = map.get(inv.supplier) ?? { name: inv.supplier, brands: new Set<string>(), orders: 0, spend: 0 };
      inv.items.forEach((it) => it.brand && entry.brands.add(it.brand));
      entry.orders += 1;
      entry.spend += inv.grandTotal;
      map.set(inv.supplier, entry);
    });
    return Array.from(map.values());
  }, [state.stockEntries, state.invoices]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
        <p className="text-sm text-muted-foreground mt-1">Derived from your stock entries and purchase invoices.</p>
      </div>

      {suppliers.length === 0 ? (
        <EmptyState title="No suppliers yet" description="Add stock entries or purchase invoices to populate this list." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.name} className="surface-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{Array.from(s.brands).join(", ") || "—"}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                <span className="text-muted-foreground">{s.orders} orders</span>
                <span className="text-primary font-medium">₹{s.spend.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
