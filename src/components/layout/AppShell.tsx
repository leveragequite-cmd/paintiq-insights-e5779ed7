import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Boxes, TrendingUp, ShoppingCart, Wallet, Truck, Users,
  LineChart, Bot, FileText, Settings as SettingsIcon, ClipboardEdit,
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
          "hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-200",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-16 items-center gap-2 px-4 border-b border-border">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm font-bold tracking-tight">PaintIQ</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Paint BI</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60",
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
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 md:px-6">
          <button className="md:hidden rounded-md p-2 hover:bg-accent" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products, suppliers, invoices..."
              className="w-full rounded-md border border-border bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="hidden sm:inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20">
              <Sparkles className="h-4 w-4" /> AI Insight
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Health</span>
              <span className="font-semibold text-primary">82</span>
            </div>
            <button className="relative rounded-md p-2 hover:bg-accent" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              RK
            </div>
          </div>
        </header>
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t border-border bg-sidebar">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px]",
                  active ? "text-primary" : "text-muted-foreground",
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
