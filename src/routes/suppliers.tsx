import { createFileRoute } from "@tanstack/react-router";
import { Truck, Star, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers — PaintIQ" }] }),
  component: SuppliersPage,
});

const suppliers = [
  { name: "Sharma Distributors", brands: "Berger, Opus", contact: "Rajesh Sharma", phone: "+91 98101 22334", email: "rajesh@sharmadist.in", rating: 4.7, orders: 142 },
  { name: "Apex Paints Wholesale", brands: "Asian Paints", contact: "Vikram Mehta", phone: "+91 98212 44556", email: "vikram@apex.in", rating: 3.9, orders: 86 },
  { name: "Bharat Color Hub", brands: "Nerolac, Asian Paints", contact: "Anand Iyer", phone: "+91 90043 99221", email: "anand@bharatcolor.in", rating: 4.3, orders: 64 },
  { name: "Opus Direct", brands: "Opus", contact: "Sunita Rao", phone: "+91 88662 17890", email: "sunita@opusdirect.in", rating: 3.6, orders: 28 },
];

function SuppliersPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage relationships with your distributor and wholesale network.</p>
      </div>

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
                  <div className="text-xs text-muted-foreground">{s.brands}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <Star className="h-3.5 w-3.5 fill-primary" />
                {s.rating}
              </div>
            </div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div className="text-foreground font-medium">{s.contact}</div>
              <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {s.phone}</div>
              <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {s.email}</div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">{s.orders} orders</span>
              <button className="text-xs font-medium text-primary hover:underline">View details →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
