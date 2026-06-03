import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { useData } from "@/lib/data-store";

export const Route = createFileRoute("/procurement")({
  head: () => ({ meta: [{ title: "Procurement Center — PaintIQ" }] }),
  component: ProcurementPage,
});

const suppliers = [
  { name: "Sharma Distributors", trend: "down" as const, reliability: 94, marginImpact: 2.1, risk: 12 },
  { name: "Apex Paints Wholesale", trend: "up" as const, reliability: 78, marginImpact: -3.4, risk: 38 },
  { name: "Bharat Color Hub", trend: "down" as const, reliability: 86, marginImpact: 1.2, risk: 22 },
  { name: "Opus Direct", trend: "up" as const, reliability: 70, marginImpact: -1.8, risk: 44 },
];

function ProcurementPage() {
  const { state } = useData();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Procurement Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Supplier intelligence, price monitoring and purchasing decisions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { t: "Switch to Sharma for Berger SKUs", d: "Estimated ₹18,400 monthly margin gain.", tone: "positive" },
          { t: "Renegotiate with Apex", d: "Apex price hikes eroded 3.4% margin this quarter.", tone: "critical" },
          { t: "Bulk order Opus enamel", d: "Bulk discount window opens for 7 days.", tone: "positive" },
        ].map((c, i) => (
          <div key={i} className="surface-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">AI Recommendation</span>
            </div>
            <div className={`text-sm font-semibold ${c.tone === "critical" ? "text-destructive" : "text-primary"}`}>{c.t}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.d}</div>
          </div>
        ))}
      </div>

      <div className="surface-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">Supplier Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-3 font-medium">Supplier</th>
                <th className="px-5 py-3 font-medium">Price Trend</th>
                <th className="px-5 py-3 font-medium text-right">Reliability</th>
                <th className="px-5 py-3 font-medium text-right">Margin Impact</th>
                <th className="px-5 py-3 font-medium text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.name} className="border-b border-border/60 hover:bg-secondary/40">
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.trend === "up" ? "text-destructive" : "text-primary"}`}>
                      {s.trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {s.trend === "up" ? "Rising" : "Falling"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{s.reliability}%</td>
                  <td className={`px-5 py-3 text-right tabular-nums font-medium ${s.marginImpact < 0 ? "text-destructive" : "text-primary"}`}>
                    {s.marginImpact > 0 ? "+" : ""}{s.marginImpact}%
                  </td>
                  <td className={`px-5 py-3 text-right tabular-nums ${s.risk > 30 ? "text-destructive" : "text-muted-foreground"}`}>{s.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-4">Recent Price Changes</h3>
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
        </div>

        <div className="surface-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Purchase History</h3>
          </div>
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
        </div>
      </div>
    </div>
  );
}
