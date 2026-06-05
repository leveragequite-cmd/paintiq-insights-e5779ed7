import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — PaintIQ" }] }),
  component: SettingsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-6 space-y-5">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="space-y-4">{children}</div>
      <div className="pt-2 border-t border-border flex justify-end">
        <button
          onClick={() => toast.success(`${title} saved successfully`)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]";

function Toggle({ defaultChecked = false, label }: { defaultChecked?: boolean; label: string }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className="flex w-full items-center justify-between rounded-md border border-border bg-background px-4 py-3 text-sm"
    >
      <span>{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition ${on ? "bg-primary" : "bg-secondary"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage shop profile, integrations and notifications.</p>
      </div>

      <Section title="Shop Profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Shop Name"><input className={inputCls} defaultValue="Krishna Paint House" /></Field>
          <Field label="GSTIN"><input className={inputCls} defaultValue="27ABCDE1234F1Z5" /></Field>
          <Field label="Owner"><input className={inputCls} defaultValue="Ravi Kumar" /></Field>
          <Field label="Phone"><input className={inputCls} defaultValue="+91 98201 33445" /></Field>
          <Field label="Address">
            <textarea className={inputCls} rows={2} defaultValue="Shop 14, Market Road, Pune 411001" />
          </Field>
          <Field label="Currency">
            <select className={inputCls} defaultValue="INR">
              <option>INR</option><option>USD</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="API Configuration">
        <Field label="API Endpoint"><input className={inputCls} defaultValue="https://api.paintiq.app/v1" /></Field>
        <Field label="API Key"><input className={inputCls} type="password" defaultValue="••••••••••••••••" /></Field>
        <Field label="Webhook URL"><input className={inputCls} placeholder="https://..." /></Field>
      </Section>

      <Section title="Notification Preferences">
        <Toggle defaultChecked label="Low stock alerts" />
        <Toggle defaultChecked label="Price change notifications" />
        <Toggle label="Daily sales summary email" />
        <Toggle defaultChecked label="Overdue payment reminders" />
      </Section>

      <Section title="User Management">
        <div className="space-y-2">
          {[
            { name: "Ravi Kumar", role: "Owner" },
            { name: "Anjali Sharma", role: "Counter Staff" },
            { name: "Suresh Patil", role: "Inventory Manager" },
          ].map((u) => (
            <div key={u.name} className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3 text-sm">
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.role}</div>
              </div>
              <button className="text-xs text-primary hover:underline">Edit</button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
