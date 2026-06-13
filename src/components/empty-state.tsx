import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon = Inbox, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}
