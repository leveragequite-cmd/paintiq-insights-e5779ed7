import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "./supabase";

export type StockEntry = {
  id: string;
  date: string;
  product: string;
  brand: string;
  category: string;
  size: string;
  qty: number;
  buyPrice: number;
  supplier: string;
  invoiceNo: string;
  notes?: string;
};

export type SalesEntry = {
  id: string;
  date: string;
  customer: string;
  product: string;
  brand: string;
  category: string;
  size: string;
  qty: number;
  sellPrice: number;
  discount: number;
  paymentMode: string;
  total: number;
  notes?: string;
};

export type InvoiceItem = {
  product: string;
  brand: string;
  category: string;
  size: string;
  qty: number;
  unitCost: number;
};

export type Invoice = {
  id: string;
  date: string;
  invoiceNo: string;
  supplier: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Partial";
  items: InvoiceItem[];
  grandTotal: number;
  notes?: string;
};

export type Expense = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paidBy: string;
  receiptNo?: string;
  notes?: string;
};

export type PriceChange = {
  id: string;
  date: string;
  product: string;
  brand: string;
  oldBuy: number;
  newBuy: number;
  oldSell: number;
  newSell: number;
  reason: string;
  effectiveFrom: string;
  notes?: string;
};

type State = {
  stockEntries: StockEntry[];
  salesEntries: SalesEntry[];
  invoices: Invoice[];
  expenses: Expense[];
  priceChanges: PriceChange[];
  loading: boolean;
};

type Action =
  | { type: "ADD_STOCK"; payload: StockEntry }
  | { type: "ADD_SALE"; payload: SalesEntry }
  | { type: "ADD_INVOICE"; payload: Invoice }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "ADD_PRICE"; payload: PriceChange }
  | { type: "SET_ALL"; payload: Partial<State> }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: State = {
  stockEntries: [],
  salesEntries: [],
  invoices: [],
  expenses: [],
  priceChanges: [],
  loading: true,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_STOCK": return { ...state, stockEntries: [action.payload, ...state.stockEntries] };
    case "ADD_SALE": return { ...state, salesEntries: [action.payload, ...state.salesEntries] };
    case "ADD_INVOICE": return { ...state, invoices: [action.payload, ...state.invoices] };
    case "ADD_EXPENSE": return { ...state, expenses: [action.payload, ...state.expenses] };
    case "ADD_PRICE": return { ...state, priceChanges: [action.payload, ...state.priceChanges] };
    case "SET_ALL": return { ...state, ...action.payload };
    case "SET_LOADING": return { ...state, loading: action.payload };
    default: return state;
  }
}

// ---------- mappers (DB row <-> app type) ----------

function rowToStock(r: any): StockEntry {
  return {
    id: r.id,
    date: (r.created_at ?? "").slice(0, 10),
    product: r.name ?? "",
    brand: r.brand ?? "",
    category: r.category ?? "Other",
    size: "",
    qty: Number(r.quantity ?? 0),
    buyPrice: Number(r.cost_price ?? 0),
    supplier: r.supplier ?? "",
    invoiceNo: "",
  };
}
function stockToRow(s: StockEntry) {
  return {
    id: s.id,
    name: s.product,
    brand: s.brand,
    category: s.category,
    quantity: s.qty,
    unit_price: s.buyPrice,
    cost_price: s.buyPrice,
    supplier: s.supplier,
  };
}

function rowToSale(r: any): SalesEntry {
  const qty = Number(r.quantity ?? 0);
  const unit = Number(r.unit_price ?? 0);
  return {
    id: r.id,
    date: r.sale_date ?? (r.created_at ?? "").slice(0, 10),
    customer: r.customer ?? "Walk-in Customer",
    product: r.product_name ?? "",
    brand: "",
    category: "Other",
    size: "",
    qty,
    sellPrice: unit,
    discount: 0,
    paymentMode: "Cash",
    total: Number(r.total_amount ?? qty * unit),
  };
}
function saleToRow(s: SalesEntry) {
  return {
    id: s.id,
    product_name: s.product,
    quantity: s.qty,
    unit_price: s.sellPrice,
    total_amount: s.total,
    customer: s.customer,
    sale_date: s.date,
  };
}

function rowToExpense(r: any): Expense {
  return {
    id: r.id,
    date: r.expense_date ?? (r.created_at ?? "").slice(0, 10),
    category: r.category ?? "Miscellaneous",
    description: r.description ?? "",
    amount: Number(r.amount ?? 0),
    paidBy: "Cash",
  };
}
function expenseToRow(e: Expense) {
  return {
    id: e.id,
    description: e.description,
    amount: e.amount,
    category: e.category,
    expense_date: e.date,
  };
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [products, sales, expenses] = await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("sales").select("*").order("created_at", { ascending: false }),
          supabase.from("expenses").select("*").order("created_at", { ascending: false }),
        ]);
        if (cancelled) return;
        const err = products.error || sales.error || expenses.error;
        if (err) {
          console.error("Supabase load error:", err);
          toast.error(`Could not load data: ${err.message}`);
        }
        dispatch({
          type: "SET_ALL",
          payload: {
            stockEntries: (products.data ?? []).map(rowToStock),
            salesEntries: (sales.data ?? []).map(rowToSale),
            expenses: (expenses.data ?? []).map(rowToExpense),
            loading: false,
          },
        });
      } catch (e: any) {
        if (!cancelled) {
          toast.error(e?.message || "Failed to connect to database");
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Wrap dispatch to persist writes
  const wrappedDispatch: React.Dispatch<Action> = (action) => {
    dispatch(action);
    (async () => {
      try {
        if (action.type === "ADD_STOCK") {
          const { error } = await supabase.from("products").insert(stockToRow(action.payload));
          if (error) throw error;
        } else if (action.type === "ADD_SALE") {
          const { error } = await supabase.from("sales").insert(saleToRow(action.payload));
          if (error) throw error;
        } else if (action.type === "ADD_EXPENSE") {
          const { error } = await supabase.from("expenses").insert(expenseToRow(action.payload));
          if (error) throw error;
        }
      } catch (e: any) {
        console.error("Supabase write error:", e);
        toast.error(`Saved locally, but cloud sync failed: ${e?.message ?? e}`);
      }
    })();
  };

  return <Ctx.Provider value={{ state, dispatch: wrappedDispatch }}>{children}</Ctx.Provider>;
}

export function useData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export const BRANDS = ["Berger", "Asian Paints", "Nerolac", "Opus", "Other"];
export const CATEGORIES = ["Exterior Paint", "Interior Paint", "Primer", "Enamel/Gloss", "Distemper", "Hardware", "Accessories", "Other"];
export const SIZES = ["1L", "4L", "10L", "20L", "Custom"];
export const PAYMENT_MODES = ["Cash", "UPI", "Credit", "Cheque"];
export const EXPENSE_CATEGORIES = ["Rent", "Electricity", "Staff Salary", "Transport", "Packaging", "Marketing", "Maintenance", "Miscellaneous"];
export const PRICE_REASONS = ["Supplier Hike", "Seasonal Change", "Bulk Discount", "Promotional", "Other"];
