import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { useData } from "@/lib/data-store";
import { EmptyState } from "@/components/empty-state";
import { useMemo } from "react";

export const Route = createFileRoute("/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers — PaintIQ" }] }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const { state } = useData();

  const suppliers = useMemo(() => {
    const map: Record<string, { name: string; orders: number; spend: number }> = {};
    state.stockEntries.forEach((e) => {
      if (!map[e.supplier]) map[e.supplier] = { name: e.supplier, orders: 0, spend: 0 };
      map[e.supplier].orders += 1;
      map[e.supplier].spend += e.qty * e.buyPrice;
    });
    return Object.values(map);
  }, [state.stockEntries]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage relationships with your distributor and wholesale network.</p>
      </div>

      {suppliers.length === 0 ? (
        <div className="surface-card p-5">
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            subtitle="Suppliers will appear here once you log stock-in entries against them."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.name} className="surface-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.orders} order{s.orders === 1 ? "" : "s"}</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Total spend</span>
                <span className="text-sm font-medium text-primary">₹{s.spend.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
