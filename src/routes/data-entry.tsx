import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import {
  useData, BRANDS, CATEGORIES, SIZES, PAYMENT_MODES, EXPENSE_CATEGORIES, PRICE_REASONS,
  type InvoiceItem,
} from "@/lib/data-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/data-entry")({
  head: () => ({ meta: [{ title: "Data Entry — PaintIQ" }] }),
  component: DataEntryPage,
});

const TABS = ["Stock In", "Sales", "Purchase Invoice", "Expenses", "Price Update"] as const;
type Tab = (typeof TABS)[number];

const todayISO = () => new Date().toISOString().slice(0, 10);
const id = () => Math.random().toString(36).slice(2, 10);

const inputBase =
  "w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]";
const labelBase = "block text-[13px] font-medium text-foreground mb-1.5";

function Req() { return <span className="text-destructive ml-0.5">*</span>; }

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelBase}>{label}{required && <Req />}</label>
      {children}
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </div>
  );
}

function DataEntryPage() {
  const [tab, setTab] = useState<Tab>("Stock In");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Entry Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Feed inventory, sales, purchases and expenses.</p>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5">
            Staff use this page to feed all shop data.
          </span>
        </p>
      </div>

      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px]",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Stock In" && <StockInForm onSaved={setLastSaved} />}
      {tab === "Sales" && <SalesForm onSaved={setLastSaved} />}
      {tab === "Purchase Invoice" && <InvoiceForm onSaved={setLastSaved} />}
      {tab === "Expenses" && <ExpenseForm onSaved={setLastSaved} />}
      {tab === "Price Update" && <PriceForm onSaved={setLastSaved} />}

      {lastSaved && (
        <div className="text-xs text-muted-foreground">Last saved: {lastSaved}</div>
      )}
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldCls = (k: string) => cn(inputBase, errors[k] ? "border-destructive" : "border-border");
  return { errors, setErrors, fieldCls };
}

function SubmitBtn({ loading, label = "Save Entry" }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 min-h-[44px]"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}

function ClearBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm hover:bg-secondary min-h-[44px]"
    >
      Clear Form
    </button>
  );
}

function RecentTable({ title, columns, rows }: { title: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold">{title}</h3></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              {columns.map((c) => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">No entries yet</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="border-b border-border/60">
                {r.map((c, j) => <td key={j} className="px-4 py-2.5 text-sm">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- STOCK IN ---------------- */

function StockInForm({ onSaved }: { onSaved: (s: string) => void }) {
  const { state, dispatch } = useData();
  const { errors, setErrors, fieldCls } = useFormErrors();
  const [loading, setLoading] = useState(false);

  const initial = { date: todayISO(), product: "", brand: "Berger", category: "Interior Paint", size: "4L", qty: "", buyPrice: "", supplier: "", invoiceNo: "", notes: "" };
  const [form, setForm] = useState(initial);
  const productList = useMemo(() => Array.from(new Set(state.stockEntries.map((s) => s.product))), [state.stockEntries]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.date) err.date = "Required";
    if (!form.product.trim()) err.product = "Required";
    if (!form.qty || +form.qty < 1) err.qty = "Min 1";
    if (!form.buyPrice || +form.buyPrice <= 0) err.buyPrice = "Required";
    if (!form.supplier.trim()) err.supplier = "Required";
    if (!form.invoiceNo.trim()) err.invoiceNo = "Required";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    setTimeout(() => {
      dispatch({ type: "ADD_STOCK", payload: { id: id(), date: form.date, product: form.product.trim(), brand: form.brand, category: form.category, size: form.size, qty: +form.qty, buyPrice: +form.buyPrice, supplier: form.supplier.trim(), invoiceNo: form.invoiceNo.trim(), notes: form.notes } });
      setLoading(false);
      toast.success("Entry saved successfully");
      onSaved(new Date().toLocaleString("en-IN"));
      setForm(initial);
      setErrors({});
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <form onSubmit={submit} className="surface-card p-6 space-y-4">
        <h3 className="text-base font-semibold">New Stock Entry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Date" required error={errors.date}>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={fieldCls("date")} />
          </Field>
          <Field label="Product Name" required error={errors.product}>
            <input list="stock-products" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="e.g. Royale Luxury 4L" className={fieldCls("product")} />
            <datalist id="stock-products">{productList.map((p) => <option key={p} value={p} />)}</datalist>
          </Field>
          <Field label="Brand" required>
            <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={fieldCls("brand")}>
              {BRANDS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Category" required>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={fieldCls("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Size / Volume" required>
            <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className={fieldCls("size")}>
              {SIZES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Quantity Received" required error={errors.qty}>
            <input type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} className={fieldCls("qty")} />
          </Field>
          <Field label="Unit Buy Price (₹)" required error={errors.buyPrice}>
            <input type="number" min={0} value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: e.target.value })} className={fieldCls("buyPrice")} />
          </Field>
          <Field label="Supplier Name" required error={errors.supplier}>
            <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className={fieldCls("supplier")} />
          </Field>
          <Field label="Invoice Number" required error={errors.invoiceNo}>
            <input value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} className={fieldCls("invoiceNo")} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Notes">
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={fieldCls("notes")} />
            </Field>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <SubmitBtn loading={loading} />
          <ClearBtn onClick={() => { setForm(initial); setErrors({}); }} />
        </div>
      </form>

      <RecentTable
        title="Recent Stock Entries"
        columns={["Date", "Product", "Brand", "Qty", "Buy Price", "Supplier", "Invoice No."]}
        rows={state.stockEntries.slice(0, 10).map((s) => [s.date, s.product, s.brand, s.qty, `₹${s.buyPrice.toLocaleString("en-IN")}`, s.supplier, s.invoiceNo])}
      />
    </div>
  );
}

/* ---------------- SALES ---------------- */

function SalesForm({ onSaved }: { onSaved: (s: string) => void }) {
  const { state, dispatch } = useData();
  const { errors, setErrors, fieldCls } = useFormErrors();
  const [loading, setLoading] = useState(false);

  const initial = { date: todayISO(), customer: "Walk-in Customer", product: "", brand: "Asian Paints", category: "Interior Paint", size: "4L", qty: "", sellPrice: "", discount: "0", paymentMode: "Cash", notes: "" };
  const [form, setForm] = useState(initial);

  const subtotal = (+form.qty || 0) * (+form.sellPrice || 0);
  const discountAmt = subtotal * ((+form.discount || 0) / 100);
  const total = subtotal - discountAmt;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.date) err.date = "Required";
    if (!form.product.trim()) err.product = "Required";
    if (!form.qty || +form.qty < 1) err.qty = "Min 1";
    if (!form.sellPrice || +form.sellPrice <= 0) err.sellPrice = "Required";
    if (+form.discount < 0 || +form.discount > 100) err.discount = "0–100";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    setTimeout(() => {
      dispatch({ type: "ADD_SALE", payload: { id: id(), date: form.date, customer: form.customer || "Walk-in Customer", product: form.product.trim(), brand: form.brand, category: form.category, size: form.size, qty: +form.qty, sellPrice: +form.sellPrice, discount: +form.discount, paymentMode: form.paymentMode, total, notes: form.notes } });
      setLoading(false);
      toast.success("Entry saved successfully");
      onSaved(new Date().toLocaleString("en-IN"));
      setForm(initial);
      setErrors({});
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <form onSubmit={submit} className="surface-card p-6 space-y-4">
          <h3 className="text-base font-semibold">New Sales Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Date" required error={errors.date}><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={fieldCls("date")} /></Field>
            <Field label="Customer Name"><input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} className={fieldCls("customer")} /></Field>
            <Field label="Payment Mode" required>
              <select value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className={fieldCls("pay")}>{PAYMENT_MODES.map((p) => <option key={p}>{p}</option>)}</select>
            </Field>
            <Field label="Product Name" required error={errors.product}><input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className={fieldCls("product")} /></Field>
            <Field label="Brand" required>
              <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={fieldCls("brand")}>{BRANDS.map((b) => <option key={b}>{b}</option>)}</select>
            </Field>
            <Field label="Category" required>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={fieldCls("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            </Field>
            <Field label="Size / Volume" required>
              <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className={fieldCls("size")}>{SIZES.map((s) => <option key={s}>{s}</option>)}</select>
            </Field>
            <Field label="Quantity Sold" required error={errors.qty}><input type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} className={fieldCls("qty")} /></Field>
            <Field label="Unit Sell Price (₹)" required error={errors.sellPrice}><input type="number" min={0} value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: e.target.value })} className={fieldCls("sellPrice")} /></Field>
            <Field label="Discount (%)" error={errors.discount}><input type="number" min={0} max={100} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className={fieldCls("discount")} /></Field>
            <div className="sm:col-span-2 lg:col-span-3"><Field label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={fieldCls("notes")} /></Field></div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <SubmitBtn loading={loading} />
            <ClearBtn onClick={() => { setForm(initial); setErrors({}); }} />
          </div>
        </form>

        <div className="surface-card p-5 space-y-3 h-fit">
          <h3 className="text-sm font-semibold">Live Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="tabular-nums text-destructive">−₹{discountAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
            <div className="flex justify-between pt-3 border-t border-border"><span className="font-medium">Total</span><span className="font-semibold text-primary tabular-nums">₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
          </div>
        </div>
      </div>

      <RecentTable
        title="Recent Sales"
        columns={["Date", "Customer", "Product", "Qty", "Sell Price", "Total", "Payment"]}
        rows={state.salesEntries.slice(0, 10).map((s) => [s.date, s.customer, s.product, s.qty, `₹${s.sellPrice.toLocaleString("en-IN")}`, `₹${s.total.toLocaleString("en-IN")}`, s.paymentMode])}
      />
    </div>
  );
}

/* ---------------- INVOICE ---------------- */

function InvoiceForm({ onSaved }: { onSaved: (s: string) => void }) {
  const { state, dispatch } = useData();
  const { errors, setErrors, fieldCls } = useFormErrors();
  const [loading, setLoading] = useState(false);

  const blankItem = (): InvoiceItem => ({ product: "", brand: "Berger", category: "Interior Paint", size: "4L", qty: 1, unitCost: 0 });
  const initial = { date: todayISO(), invoiceNo: "", supplier: "", dueDate: "", status: "Pending" as const, notes: "" };
  const [form, setForm] = useState(initial);
  const [items, setItems] = useState<InvoiceItem[]>([blankItem()]);

  const grand = items.reduce((s, it) => s + it.qty * it.unitCost, 0);

  const updateItem = (i: number, patch: Partial<InvoiceItem>) =>
    setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.date) err.date = "Required";
    if (!form.invoiceNo.trim()) err.invoiceNo = "Required";
    if (!form.supplier.trim()) err.supplier = "Required";
    if (!form.dueDate) err.dueDate = "Required";
    if (items.some((it) => !it.product.trim() || it.qty < 1 || it.unitCost <= 0)) err.items = "Fill all items";
    setErrors(err);
    if (Object.keys(err).length) { toast.error("Please complete all required fields"); return; }
    setLoading(true);
    setTimeout(() => {
      dispatch({ type: "ADD_INVOICE", payload: { id: id(), ...form, items, grandTotal: grand } });
      setLoading(false);
      toast.success("Entry saved successfully");
      onSaved(new Date().toLocaleString("en-IN"));
      setForm(initial); setItems([blankItem()]); setErrors({});
    }, 800);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="surface-card p-6 space-y-5">
        <h3 className="text-base font-semibold">New Purchase Invoice</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Invoice Date" required error={errors.date}><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={fieldCls("date")} /></Field>
          <Field label="Invoice Number" required error={errors.invoiceNo}><input value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} className={fieldCls("invoiceNo")} /></Field>
          <Field label="Supplier Name" required error={errors.supplier}><input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className={fieldCls("supplier")} /></Field>
          <Field label="Payment Due Date" required error={errors.dueDate}><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={fieldCls("dueDate")} /></Field>
          <Field label="Payment Status" required>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })} className={fieldCls("status")}>
              <option>Paid</option><option>Pending</option><option>Partial</option>
            </select>
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Line Items {errors.items && <span className="text-destructive text-xs ml-2">{errors.items}</span>}</div>
            <button type="button" onClick={() => setItems([...items, blankItem()])} className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
              <Plus className="h-3 w-3" /> Add Item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((it, i) => {
              const total = it.qty * it.unitCost;
              return (
                <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3 grid grid-cols-2 md:grid-cols-12 gap-2 items-end">
                  <div className="md:col-span-3"><label className="text-xs text-muted-foreground">Product</label><input value={it.product} onChange={(e) => updateItem(i, { product: e.target.value })} className={cn(inputBase, "border-border min-h-[40px]")} /></div>
                  <div className="md:col-span-2"><label className="text-xs text-muted-foreground">Brand</label><select value={it.brand} onChange={(e) => updateItem(i, { brand: e.target.value })} className={cn(inputBase, "border-border min-h-[40px]")}>{BRANDS.map((b) => <option key={b}>{b}</option>)}</select></div>
                  <div className="md:col-span-2"><label className="text-xs text-muted-foreground">Category</label><select value={it.category} onChange={(e) => updateItem(i, { category: e.target.value })} className={cn(inputBase, "border-border min-h-[40px]")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
                  <div className="md:col-span-1"><label className="text-xs text-muted-foreground">Size</label><select value={it.size} onChange={(e) => updateItem(i, { size: e.target.value })} className={cn(inputBase, "border-border min-h-[40px]")}>{SIZES.map((s) => <option key={s}>{s}</option>)}</select></div>
                  <div className="md:col-span-1"><label className="text-xs text-muted-foreground">Qty</label><input type="number" min={1} value={it.qty} onChange={(e) => updateItem(i, { qty: +e.target.value })} className={cn(inputBase, "border-border min-h-[40px]")} /></div>
                  <div className="md:col-span-2"><label className="text-xs text-muted-foreground">Unit Cost (₹)</label><input type="number" min={0} value={it.unitCost} onChange={(e) => updateItem(i, { unitCost: +e.target.value })} className={cn(inputBase, "border-border min-h-[40px]")} /></div>
                  <div className="md:col-span-1 flex items-center justify-between gap-1">
                    <div className="text-sm font-medium text-primary tabular-nums">₹{total.toLocaleString("en-IN")}</div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems(items.filter((_, k) => k !== i))} className="ml-1 rounded-md p-1 text-muted-foreground hover:text-destructive" aria-label="Remove">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end items-center gap-3 pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Grand Total</span>
            <span className="text-xl font-bold text-primary tabular-nums">₹{grand.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <Field label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={fieldCls("notes")} /></Field>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <SubmitBtn loading={loading} label="Save Invoice" />
          <ClearBtn onClick={() => { setForm(initial); setItems([blankItem()]); setErrors({}); }} />
        </div>
      </form>

      <div className="surface-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold">Recent Invoices</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Invoice No.</th><th className="px-4 py-3 font-medium">Supplier</th><th className="px-4 py-3 font-medium text-right">Items</th><th className="px-4 py-3 font-medium text-right">Grand Total</th><th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No invoices yet</td></tr>
              ) : state.invoices.slice(0, 10).map((inv) => (
                <tr key={inv.id} className="border-b border-border/60">
                  <td className="px-4 py-2.5">{inv.date}</td>
                  <td className="px-4 py-2.5 font-medium">{inv.invoiceNo}</td>
                  <td className="px-4 py-2.5">{inv.supplier}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{inv.items.length}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-primary">₹{inv.grandTotal.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      inv.status === "Paid" ? "bg-primary/15 text-primary border-primary/30" : inv.status === "Partial" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-destructive/15 text-destructive border-destructive/30",
                    )}>{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- EXPENSES ---------------- */

function ExpenseForm({ onSaved }: { onSaved: (s: string) => void }) {
  const { state, dispatch } = useData();
  const { errors, setErrors, fieldCls } = useFormErrors();
  const [loading, setLoading] = useState(false);
  const initial = { date: todayISO(), category: "Rent", description: "", amount: "", paidBy: "Cash", receiptNo: "", notes: "" };
  const [form, setForm] = useState(initial);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.date) err.date = "Required";
    if (!form.description.trim()) err.description = "Required";
    if (!form.amount || +form.amount <= 0) err.amount = "Required";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    setTimeout(() => {
      dispatch({ type: "ADD_EXPENSE", payload: { id: id(), date: form.date, category: form.category, description: form.description.trim(), amount: +form.amount, paidBy: form.paidBy, receiptNo: form.receiptNo, notes: form.notes } });
      setLoading(false);
      toast.success("Entry saved successfully");
      onSaved(new Date().toLocaleString("en-IN"));
      setForm(initial); setErrors({});
    }, 800);
  };

  const monthTotal = useMemo(() => {
    const now = new Date();
    return state.expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, x) => s + x.amount, 0);
  }, [state.expenses]);

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="surface-card p-6 space-y-4">
        <h3 className="text-base font-semibold">New Expense</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Date" required error={errors.date}><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={fieldCls("date")} /></Field>
          <Field label="Expense Category" required>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={fieldCls("category")}>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Paid By" required>
            <select value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })} className={fieldCls("paidBy")}><option>Cash</option><option>Bank Transfer</option><option>UPI</option></select>
          </Field>
          <div className="lg:col-span-2"><Field label="Description" required error={errors.description}><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={fieldCls("description")} /></Field></div>
          <Field label="Amount (₹)" required error={errors.amount}><input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={fieldCls("amount")} /></Field>
          <Field label="Receipt Number"><input value={form.receiptNo} onChange={(e) => setForm({ ...form, receiptNo: e.target.value })} className={fieldCls("receiptNo")} /></Field>
          <div className="sm:col-span-2 lg:col-span-3"><Field label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={fieldCls("notes")} /></Field></div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <SubmitBtn loading={loading} />
          <ClearBtn onClick={() => { setForm(initial); setErrors({}); }} />
        </div>
      </form>

      <div className="surface-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Expenses</h3>
          <span className="text-xs text-muted-foreground">This month total: <span className="text-primary font-semibold">₹{monthTotal.toLocaleString("en-IN")}</span></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium text-right">Amount</th><th className="px-4 py-3 font-medium">Paid By</th>
              </tr>
            </thead>
            <tbody>
              {state.expenses.slice(0, 10).map((e) => (
                <tr key={e.id} className="border-b border-border/60">
                  <td className="px-4 py-2.5">{e.date}</td>
                  <td className="px-4 py-2.5">{e.category}</td>
                  <td className="px-4 py-2.5">{e.description}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-destructive">₹{e.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{e.paidBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PRICE UPDATE ---------------- */

function PriceForm({ onSaved }: { onSaved: (s: string) => void }) {
  const { state, dispatch } = useData();
  const { errors, setErrors, fieldCls } = useFormErrors();
  const [loading, setLoading] = useState(false);
  const initial = { date: todayISO(), product: "", brand: "Berger", oldBuy: "", newBuy: "", oldSell: "", newSell: "", reason: "Supplier Hike", effectiveFrom: todayISO(), notes: "" };
  const [form, setForm] = useState(initial);

  const oldBuy = +form.oldBuy || 0, newBuy = +form.newBuy || 0, oldSell = +form.oldSell || 0, newSell = +form.newSell || 0;
  const buyChange = newBuy - oldBuy;
  const marginBefore = oldSell ? ((oldSell - oldBuy) / oldSell) * 100 : 0;
  const marginAfter = newSell ? ((newSell - newBuy) / newSell) * 100 : 0;
  const marginImpact = marginAfter - marginBefore;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.date) err.date = "Required";
    if (!form.product.trim()) err.product = "Required";
    if (!form.oldBuy) err.oldBuy = "Required";
    if (!form.newBuy) err.newBuy = "Required";
    if (!form.oldSell) err.oldSell = "Required";
    if (!form.newSell) err.newSell = "Required";
    if (!form.effectiveFrom) err.effectiveFrom = "Required";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    setTimeout(() => {
      dispatch({ type: "ADD_PRICE", payload: { id: id(), date: form.date, product: form.product.trim(), brand: form.brand, oldBuy, newBuy, oldSell, newSell, reason: form.reason, effectiveFrom: form.effectiveFrom, notes: form.notes } });
      setLoading(false);
      toast.success("Entry saved successfully");
      onSaved(new Date().toLocaleString("en-IN"));
      setForm(initial); setErrors({});
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <form onSubmit={submit} className="surface-card p-6 space-y-4">
          <h3 className="text-base font-semibold">New Price Update</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Date of Change" required error={errors.date}><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={fieldCls("date")} /></Field>
            <Field label="Product Name" required error={errors.product}><input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className={fieldCls("product")} /></Field>
            <Field label="Brand" required><select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={fieldCls("brand")}>{BRANDS.map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Old Buy Price (₹)" required error={errors.oldBuy}><input type="number" min={0} value={form.oldBuy} onChange={(e) => setForm({ ...form, oldBuy: e.target.value })} className={fieldCls("oldBuy")} /></Field>
            <Field label="New Buy Price (₹)" required error={errors.newBuy}><input type="number" min={0} value={form.newBuy} onChange={(e) => setForm({ ...form, newBuy: e.target.value })} className={fieldCls("newBuy")} /></Field>
            <div />
            <Field label="Old Sell Price (₹)" required error={errors.oldSell}><input type="number" min={0} value={form.oldSell} onChange={(e) => setForm({ ...form, oldSell: e.target.value })} className={fieldCls("oldSell")} /></Field>
            <Field label="New Sell Price (₹)" required error={errors.newSell}><input type="number" min={0} value={form.newSell} onChange={(e) => setForm({ ...form, newSell: e.target.value })} className={fieldCls("newSell")} /></Field>
            <div />
            <Field label="Reason" required><select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={fieldCls("reason")}>{PRICE_REASONS.map((r) => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Effective From" required error={errors.effectiveFrom}><input type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} className={fieldCls("effectiveFrom")} /></Field>
            <div className="sm:col-span-2 lg:col-span-3"><Field label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={fieldCls("notes")} /></Field></div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <SubmitBtn loading={loading} />
            <ClearBtn onClick={() => { setForm(initial); setErrors({}); }} />
          </div>
        </form>

        <div className="surface-card p-5 space-y-3 h-fit">
          <h3 className="text-sm font-semibold">Impact Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Buy Price Change</span>
              <span className={cn("inline-flex items-center gap-1 font-semibold tabular-nums", buyChange > 0 ? "text-destructive" : buyChange < 0 ? "text-primary" : "")}>
                {buyChange > 0 ? <ArrowUp className="h-3 w-3" /> : buyChange < 0 ? <ArrowDown className="h-3 w-3" /> : null}
                ₹{Math.abs(buyChange).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Margin Before</span><span className="tabular-nums">{marginBefore.toFixed(1)}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Margin After</span><span className="tabular-nums">{marginAfter.toFixed(1)}%</span></div>
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="font-medium">Margin Impact</span>
              <span className={cn("font-semibold tabular-nums", marginImpact < 0 ? "text-destructive" : "text-primary")}>
                {marginImpact >= 0 ? "+" : ""}{marginImpact.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold">Price Change History</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Brand</th><th className="px-4 py-3 font-medium text-right">Old Buy</th><th className="px-4 py-3 font-medium text-right">New Buy</th><th className="px-4 py-3 font-medium text-right">Change</th><th className="px-4 py-3 font-medium text-right">Old Margin</th><th className="px-4 py-3 font-medium text-right">New Margin</th>
              </tr>
            </thead>
            <tbody>
              {state.priceChanges.slice(0, 10).map((p) => {
                const ch = p.newBuy - p.oldBuy;
                const mb = ((p.oldSell - p.oldBuy) / p.oldSell) * 100;
                const ma = ((p.newSell - p.newBuy) / p.newSell) * 100;
                return (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="px-4 py-2.5">{p.date}</td>
                    <td className="px-4 py-2.5">{p.product}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.brand}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">₹{p.oldBuy}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">₹{p.newBuy}</td>
                    <td className={cn("px-4 py-2.5 text-right tabular-nums font-medium", ch > 0 ? "text-destructive" : "text-primary")}>{ch > 0 ? "+" : ""}₹{ch}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{mb.toFixed(1)}%</td>
                    <td className={cn("px-4 py-2.5 text-right tabular-nums", ma < mb ? "text-destructive" : "text-primary")}>{ma.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
