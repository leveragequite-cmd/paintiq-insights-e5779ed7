import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, ImageIcon, Sparkles, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { extractDataFromFile } from "@/lib/ai-import.functions";
import { useData, type StockEntry, type SalesEntry, type Expense } from "@/lib/data-store";

export const Route = createFileRoute("/ai-import")({
  head: () => ({ meta: [{ title: "AI Import — PaintIQ" }] }),
  component: AiImportPage,
});

type Kind = "stock" | "sales" | "expenses";

const kindLabels: Record<Kind, string> = {
  stock: "Stock In (purchases)",
  sales: "Sales",
  expenses: "Expenses",
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      resolve(result.split(",")[1] || "");
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

async function readExcelAsText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const parts: string[] = [];
  wb.SheetNames.forEach((name) => {
    const sheet = wb.Sheets[name];
    parts.push(`# Sheet: ${name}\n` + XLSX.utils.sheet_to_csv(sheet));
  });
  return parts.join("\n\n");
}

function AiImportPage() {
  const { dispatch } = useData();
  const extract = useServerFn(extractDataFromFile);
  const [kind, setKind] = useState<Kind>("stock");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<any[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isImage = file?.type.startsWith("image/");
  const isExcel = file?.name.match(/\.(xlsx|xls|csv)$/i);

  const onPick = (f: File | null) => {
    setFile(f);
    setRows(null);
  };

  const onAnalyze = async () => {
    if (!file) return;
    if (!isImage && !isExcel) {
      toast.error("Upload an Excel/CSV file or an image.");
      return;
    }
    setBusy(true);
    setRows(null);
    try {
      let payload;
      if (isExcel) {
        const text = await readExcelAsText(file);
        payload = { kind, source: "excel" as const, text };
      } else {
        const imageBase64 = await readFileAsBase64(file);
        payload = { kind, source: "image" as const, imageBase64, imageMimeType: file.type };
      }
      const res = await extract({ data: payload });
      if (!res.rows || res.rows.length === 0) {
        toast.error("AI could not find any rows. Try a clearer file.");
      } else {
        setRows(res.rows);
        toast.success(`Extracted ${res.rows.length} row${res.rows.length === 1 ? "" : "s"}.`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Extraction failed");
    } finally {
      setBusy(false);
    }
  };

  const onImport = () => {
    if (!rows) return;
    const id = () => crypto.randomUUID();
    let count = 0;
    rows.forEach((r) => {
      try {
        if (kind === "stock") {
          const entry: StockEntry = {
            id: id(),
            date: r.date || new Date().toISOString().slice(0, 10),
            product: String(r.product || ""),
            brand: String(r.brand || ""),
            category: String(r.category || "Other"),
            size: String(r.size || ""),
            qty: Number(r.qty) || 0,
            buyPrice: Number(r.buyPrice) || 0,
            supplier: String(r.supplier || ""),
            invoiceNo: String(r.invoiceNo || ""),
          };
          dispatch({ type: "ADD_STOCK", payload: entry });
        } else if (kind === "sales") {
          const entry: SalesEntry = {
            id: id(),
            date: r.date || new Date().toISOString().slice(0, 10),
            customer: String(r.customer || "Walk-in Customer"),
            product: String(r.product || ""),
            brand: String(r.brand || ""),
            category: String(r.category || "Other"),
            size: String(r.size || ""),
            qty: Number(r.qty) || 0,
            sellPrice: Number(r.sellPrice) || 0,
            discount: Number(r.discount) || 0,
            paymentMode: String(r.paymentMode || "Cash"),
            total: Number(r.total) || (Number(r.qty) || 0) * (Number(r.sellPrice) || 0),
          };
          dispatch({ type: "ADD_SALE", payload: entry });
        } else {
          const entry: Expense = {
            id: id(),
            date: r.date || new Date().toISOString().slice(0, 10),
            category: String(r.category || "Miscellaneous"),
            description: String(r.description || ""),
            amount: Number(r.amount) || 0,
            paidBy: String(r.paidBy || "Cash"),
          };
          dispatch({ type: "ADD_EXPENSE", payload: entry });
        }
        count++;
      } catch {
        /* skip bad row */
      }
    });
    toast.success(`Imported ${count} ${kind} record${count === 1 ? "" : "s"}.`);
    setRows(null);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Import</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload an Excel sheet or a photo (invoice, stock list, bill). AI will read it and turn it into records.
        </p>
      </div>

      <div className="surface-card p-5 space-y-5">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">What are you importing?</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(Object.keys(kindLabels) as Kind[]).map((k) => (
              <button
                key={k}
                onClick={() => { setKind(k); setRows(null); }}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  kind === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {kindLabels[k]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">File</label>
          <div className="mt-2 rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-primary/40 transition">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv,image/*"
              onChange={(e) => onPick(e.target.files?.[0] || null)}
              className="hidden"
              id="ai-file"
            />
            <label htmlFor="ai-file" className="cursor-pointer flex flex-col items-center gap-2">
              {file ? (
                <>
                  {isImage ? <ImageIcon className="h-8 w-8 text-primary" /> : <FileSpreadsheet className="h-8 w-8 text-primary" />}
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · click to change</div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm font-medium">Click to upload</div>
                  <div className="text-xs text-muted-foreground">Excel (.xlsx, .xls, .csv) or image (.jpg, .png)</div>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAnalyze}
            disabled={!file || busy}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "AI is reading…" : "Analyze with AI"}
          </button>
          {rows && (
            <span className="text-xs text-muted-foreground">{rows.length} row{rows.length === 1 ? "" : "s"} ready</span>
          )}
        </div>
      </div>

      {rows && rows.length > 0 && (
        <div className="surface-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold">Preview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Review the extracted rows before importing.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRows(null)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
              >
                <X className="h-3 w-3" /> Discard
              </button>
              <button
                onClick={onImport}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Check className="h-3 w-3" /> Import all
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  {columns.map((c) => (
                    <th key={c} className="px-4 py-2 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-border/60">
                    {columns.map((c) => (
                      <td key={c} className="px-4 py-2 text-foreground/90">
                        {typeof r[c] === "number" ? r[c].toLocaleString("en-IN") : String(r[c] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
