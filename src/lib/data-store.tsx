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

export type DocumentImport = {
  id: string;
  fileName: string;
  sourceType: "excel" | "image" | "unknown";
  classification: string;
  summary: string;
  recommendations: string;
  rows: Array<Record<string, unknown>>;
};

type State = {
  stockEntries: StockEntry[];
  salesEntries: SalesEntry[];
  invoices: Invoice[];
  expenses: Expense[];
  priceChanges: PriceChange[];
  importedDocuments: DocumentImport[];
};

type Action =
  | { type: "ADD_STOCK"; payload: StockEntry }
  | { type: "ADD_SALE"; payload: SalesEntry }
  | { type: "ADD_INVOICE"; payload: Invoice }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "ADD_PRICE"; payload: PriceChange }
  | { type: "ADD_DOCUMENT_IMPORT"; payload: DocumentImport };

const today = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

const initialState: State = {
  stockEntries: [],
  salesEntries: [],
  invoices: [],
  expenses: [],
  priceChanges: [],
  importedDocuments: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_STOCK": return { ...state, stockEntries: [action.payload, ...state.stockEntries] };
    case "ADD_SALE": return { ...state, salesEntries: [action.payload, ...state.salesEntries] };
    case "ADD_INVOICE": return { ...state, invoices: [action.payload, ...state.invoices] };
    case "ADD_EXPENSE": return { ...state, expenses: [action.payload, ...state.expenses] };
    case "ADD_PRICE": return { ...state, priceChanges: [action.payload, ...state.priceChanges] };
    case "ADD_DOCUMENT_IMPORT": return { ...state, importedDocuments: [action.payload, ...state.importedDocuments] };
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

// Constants moved to src/lib/constants.ts to avoid fast-refresh warnings
