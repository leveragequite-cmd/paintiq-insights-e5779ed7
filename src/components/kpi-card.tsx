import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  change?: number;
  icon?: LucideIcon;
  intent?: "positive" | "critical" | "neutral";
};

export function KpiCard({ label, value, change, icon: Icon, intent = "neutral" }: Props) {
  const isUp = (change ?? 0) >= 0;
  const valueClass =
    intent === "positive" ? "text-primary" : intent === "critical" ? "text-destructive" : "text-foreground";
  const trendClass = isUp ? "text-primary" : "text-destructive";

  return (
    <div className="surface-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className={cn("text-2xl font-semibold tracking-tight tabular-nums", valueClass)}>{value}</div>
      {change !== undefined && (
        <div className={cn("flex items-center gap-1 text-xs font-medium", trendClass)}>
          {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          <span>{Math.abs(change).toFixed(1)}%</span>
          <span className="text-muted-foreground font-normal">vs last month</span>
        </div>
      )}
    </div>
  );
}
