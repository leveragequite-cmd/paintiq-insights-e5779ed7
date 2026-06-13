import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Boxes, TrendingUp, ShoppingCart, Wallet, Truck, Users,
  LineChart, Bot, FileText, Settings as SettingsIcon, ClipboardEdit, Wand2,
  Menu, Search, Bell, Sparkles, Activity, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory Intelligence", icon: Boxes },
  { to: "/sales", label: "Sales Analytics", icon: TrendingUp },
  { to: "/procurement", label: "Procurement Center", icon: ShoppingCart },
  { to: "/finance", label: "Finance Intelligence", icon: Wallet },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/data-entry", label: "Data Entry", icon: ClipboardEdit },
  { to: "/ai-import", label: "AI Import", icon: Wand2 },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/forecasting", label: "Forecasting", icon: LineChart },
  { to: "/assistant", label: "AI Business Assistant", icon: Bot },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col clay-sidebar transition-all duration-200 sticky top-2 self-start h-[calc(100vh-16px)]",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-16 items-center gap-2 px-4 border-b border-white/15">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm font-bold tracking-tight text-white">PaintIQ</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60">Paint BI</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto rounded-lg p-1 text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "clay-nav-item flex items-center gap-3 px-3 py-2 text-sm font-medium",
                  active && "active",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 min-w-0 flex-col">
        <header className="sticky top-2 z-20 mx-2 mt-2 flex h-14 items-center gap-3 rounded-2xl bg-white px-4 md:px-6 shadow-[0_8px_20px_rgba(10,123,108,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <button className="md:hidden rounded-lg p-2 hover:bg-accent" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products, suppliers, invoices..."
              className="w-full rounded-full border border-border bg-secondary/60 pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="hidden sm:inline-flex items-center gap-2 clay-action-bar px-3 py-2 text-xs font-semibold">
              <Sparkles className="h-4 w-4" /> AI Insight
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Health</span>
              <span className="font-semibold">—</span>
            </div>
            <button className="relative rounded-full p-2 hover:bg-accent" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              RK
            </div>
          </div>
        </header>
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-2 inset-x-2 z-30 grid grid-cols-5 clay-sidebar !m-0 py-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "clay-nav-item flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] mx-1",
                  active && "active",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate max-w-[70px]">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
