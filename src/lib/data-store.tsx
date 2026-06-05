import { createContext, useContext, useReducer, type ReactNode } from "react";

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
};

type Action =
  | { type: "ADD_STOCK"; payload: StockEntry }
  | { type: "ADD_SALE"; payload: SalesEntry }
  | { type: "ADD_INVOICE"; payload: Invoice }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "ADD_PRICE"; payload: PriceChange };

const initialState: State = {
  stockEntries: [],
  salesEntries: [],
  invoices: [],
  expenses: [],
  priceChanges: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_STOCK": return { ...state, stockEntries: [action.payload, ...state.stockEntries] };
    case "ADD_SALE": return { ...state, salesEntries: [action.payload, ...state.salesEntries] };
    case "ADD_INVOICE": return { ...state, invoices: [action.payload, ...state.invoices] };
    case "ADD_EXPENSE": return { ...state, expenses: [action.payload, ...state.expenses] };
    case "ADD_PRICE": return { ...state, priceChanges: [action.payload, ...state.priceChanges] };
    default: return state;
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
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
