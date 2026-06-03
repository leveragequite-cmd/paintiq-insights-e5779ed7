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

const today = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

const initialState: State = {
  stockEntries: [
    { id: "s1", date: today(2), product: "Weathercoat All Guard", brand: "Berger", category: "Exterior Paint", size: "20L", qty: 12, buyPrice: 4200, supplier: "Sharma Distributors", invoiceNo: "INV-2041" },
    { id: "s2", date: today(5), product: "Royale Luxury Emulsion", brand: "Asian Paints", category: "Interior Paint", size: "4L", qty: 24, buyPrice: 1180, supplier: "Apex Paints Wholesale", invoiceNo: "INV-2042" },
    { id: "s3", date: today(9), product: "Impressions Eco Clean", brand: "Nerolac", category: "Interior Paint", size: "10L", qty: 18, buyPrice: 2450, supplier: "Bharat Color Hub", invoiceNo: "INV-2043" },
    { id: "s4", date: today(14), product: "Opus Premium Enamel", brand: "Opus", category: "Enamel/Gloss", size: "1L", qty: 40, buyPrice: 320, supplier: "Sharma Distributors", invoiceNo: "INV-2044" },
  ],
  salesEntries: [
    { id: "sa1", date: today(0), customer: "Walk-in Customer", product: "Royale Luxury Emulsion", brand: "Asian Paints", category: "Interior Paint", size: "4L", qty: 2, sellPrice: 1450, discount: 0, paymentMode: "UPI", total: 2900 },
    { id: "sa2", date: today(1), customer: "Mehta Constructions", product: "Weathercoat All Guard", brand: "Berger", category: "Exterior Paint", size: "20L", qty: 4, sellPrice: 5100, discount: 5, paymentMode: "Credit", total: 19380 },
    { id: "sa3", date: today(2), customer: "Patel Interiors", product: "Impressions Eco Clean", brand: "Nerolac", category: "Interior Paint", size: "10L", qty: 3, sellPrice: 2950, discount: 0, paymentMode: "Cash", total: 8850 },
    { id: "sa4", date: today(3), customer: "Walk-in Customer", product: "Opus Premium Enamel", brand: "Opus", category: "Enamel/Gloss", size: "1L", qty: 6, sellPrice: 420, discount: 0, paymentMode: "Cash", total: 2520 },
    { id: "sa5", date: today(4), customer: "Singh Painters", product: "Royale Luxury Emulsion", brand: "Asian Paints", category: "Interior Paint", size: "4L", qty: 8, sellPrice: 1450, discount: 8, paymentMode: "UPI", total: 10672 },
  ],
  invoices: [
    { id: "i1", date: today(7), invoiceNo: "INV-2042", supplier: "Apex Paints Wholesale", dueDate: today(-23), status: "Pending", items: [{ product: "Royale Luxury Emulsion", brand: "Asian Paints", category: "Interior Paint", size: "4L", qty: 24, unitCost: 1180 }], grandTotal: 28320 },
    { id: "i2", date: today(20), invoiceNo: "INV-2038", supplier: "Bharat Color Hub", dueDate: today(-10), status: "Paid", items: [{ product: "Impressions Eco Clean", brand: "Nerolac", category: "Interior Paint", size: "10L", qty: 18, unitCost: 2450 }], grandTotal: 44100 },
  ],
  expenses: [
    { id: "e1", date: today(3), category: "Rent", description: "Shop rent - October", amount: 45000, paidBy: "Bank Transfer" },
    { id: "e2", date: today(5), category: "Electricity", description: "Monthly electricity bill", amount: 8400, paidBy: "UPI" },
    { id: "e3", date: today(7), category: "Staff Salary", description: "Counter staff salaries", amount: 62000, paidBy: "Bank Transfer" },
    { id: "e4", date: today(12), category: "Transport", description: "Delivery van fuel", amount: 4200, paidBy: "Cash" },
  ],
  priceChanges: [
    { id: "p1", date: today(4), product: "Weathercoat All Guard", brand: "Berger", oldBuy: 4000, newBuy: 4200, oldSell: 5000, newSell: 5100, reason: "Supplier Hike", effectiveFrom: today(3) },
    { id: "p2", date: today(10), product: "Royale Luxury Emulsion", brand: "Asian Paints", oldBuy: 1100, newBuy: 1180, oldSell: 1450, newSell: 1450, reason: "Supplier Hike", effectiveFrom: today(8) },
    { id: "p3", date: today(18), product: "Opus Premium Enamel", brand: "Opus", oldBuy: 340, newBuy: 320, oldSell: 420, newSell: 420, reason: "Bulk Discount", effectiveFrom: today(15) },
  ],
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
