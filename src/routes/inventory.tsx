import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, X, Check } from "lucide-react";
import { useData } from "@/lib/data-store";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory Intelligence — PaintIQ" }] }),
  component: InventoryPage,
});

type Status = "In Stock" | "Low Stock" | "Out of Stock" | "Dead Stock";

const seedStock = [
  { product: "Royale Luxury Emulsion", brand: "Asian Paints", category: "Interior Paint", qty: 48, reorder: 20, status: "In Stock" as Status, age: 24 },
  { product: "Weathercoat All Guard 20L", brand: "Berger", category: "Exterior Paint", qty: 14, reorder: 15, status: "Low Stock" as Status, age: 45 },
  { product: "Impressions Eco Clean", brand: "Nerolac", category: "Interior Paint", qty: 32, reorder: 18, status: "In Stock" as Status, age: 18 },
  { product: "Opus Premium Enamel 1L", brand: "Opus", category: "Enamel/Gloss", qty: 6, reorder: 25, status: "Low Stock" as Status, age: 72 },
  { product: "Berger Primer 4L", brand: "Berger", category: "Primer", qty: 0, reorder: 12, status: "Out of Stock" as Status, age: 110 },
  { product: "Distemper White 20L", brand: "Asian Paints", category: "Distemper", qty: 4, reorder: 10, status: "Dead Stock" as Status, age: 145 },
  { product: "Apex Ultima 10L", brand: "Asian Paints", category: "Exterior Paint", qty: 22, reorder: 12, status: "In Stock" as Status, age: 33 },
  { product: "Nerolac Beauty Smooth 4L", brand: "Nerolac", category: "Interior Paint", qty: 38, reorder: 20, status: "In Stock" as Status, age: 12 },
];

const statusStyles: Record<Status, string> = {
  "In Stock": "bg-primary/15 text-primary border-primary/30",
  "Low Stock": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Out of Stock": "bg-destructive/15 text-destructive border-destructive/30",
  "Dead Stock": "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
};

const recommendations = [
  { title: "Stock out risk: Opus Premium Enamel 1L", detail: "Likely to stock out in 9 days based on current velocity.", tone: "critical" as const },
  { title: "₹1.2L tied in slow-moving distemper", detail: "Distemper White 20L hasn't moved in 145 days — consider a clearance.", tone: "warning" as const },
  { title: "Reorder Weathercoat 20L", detail: "Suggested order qty: 24 units from Sharma Distributors.", tone: "positive" as const },
];

function InventoryPage() {
  useData();
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Live stock health, aging and AI-driven reorder suggestions.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <div className="surface-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold">Stock Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Brand</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium text-right">Qty</th>
                    <th className="px-5 py-3 font-medium text-right">Reorder</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {seedStock.map((r, i) => (
                    <tr key={i} className="border-b border-border/60 hover:bg-secondary/40">
                      <td className="px-5 py-3 font-medium">{r.product}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.brand}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.category}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{r.qty}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">{r.reorder}</td>
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
          </div>

          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold mb-4">Stock Aging Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "0–30 days", value: "₹8.2L", count: 64, tone: "text-primary" },
                { label: "31–60 days", value: "₹3.4L", count: 38, tone: "text-foreground" },
                { label: "61–90 days", value: "₹1.8L", count: 21, tone: "text-amber-400" },
                { label: "90+ days", value: "₹1.1L", count: 12, tone: "text-destructive" },
              ].map((b) => (
                <div key={b.label} className="rounded-xl border border-border bg-secondary/40 p-4">
                  <div className="text-xs text-muted-foreground">{b.label}</div>
                  <div className={`mt-1 text-xl font-semibold ${b.tone}`}>{b.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{b.count} SKUs</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="surface-card p-5 space-y-3 h-fit">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">AI Recommendations</h3>
          </div>
          {recommendations.map((r, i) => (
            <div key={i} className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
              <div>
                <div className={`text-sm font-medium ${r.tone === "critical" ? "text-destructive" : r.tone === "warning" ? "text-amber-400" : "text-primary"}`}>
                  {r.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.detail}</div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                  <Check className="h-3 w-3" /> Act
                </button>
                <button className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
