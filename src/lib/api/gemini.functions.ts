import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import * as XLSX from "xlsx";
import { createWorker } from "tesseract.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL ?? "https://gemini.googleapis.com/v1";

export type ParsedDocument = {
  id: string;
  fileName: string;
  sourceType: "excel" | "image" | "unknown";
  classification: string;
  rawText: string;
  summary: string;
  rows: Array<Record<string, unknown>>;
  recommendations: string;
};

function normalizeGeminiText(response: any): string {
  if (!response) return "";
  if (typeof response === "string") return response;
  const candidate = response?.candidates?.[0] ?? response?.output?.[0] ?? response;
  if (!candidate) return "";
  if (typeof candidate === "string") return candidate;

  const content = candidate.content;
  if (Array.isArray(content)) {
    const textChunk = content.find((item: any) => item?.type === "text");
    if (typeof textChunk?.text === "string") return textChunk.text;
    if (typeof content[0]?.text === "string") return content[0].text;
  }

  if (typeof candidate.output_text === "string") return candidate.output_text;
  if (typeof candidate.text === "string") return candidate.text;
  return JSON.stringify(candidate);
}

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in the server environment.");
  }

  const response = await fetch(`${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateMessage?key=${encodeURIComponent(
    GEMINI_API_KEY,
  )}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{
        author: "user",
        content: [{ type: "text", text: prompt }],
      }],
      temperature: 0.1,
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      `Gemini API error: ${json?.error?.message ?? response.statusText ?? "unknown error"}`,
    );
  }
  return normalizeGeminiText(json);
}

function parseExcelBuffer(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, raw: false });
  return workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as Array<Array<string | number | boolean>>;
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Array<Record<string, unknown>>;
    return { sheetName, rawRows, rows };
  });
}

async function extractTextFromImage(buffer: Buffer) {
  const worker = createWorker({ logger: () => undefined });
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const { data } = await worker.recognize(buffer);
  await worker.terminate();
  return data?.text ?? "";
}

export const ingestBusinessDocument = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      fileName: z.string().min(1),
      mimeType: z.string().min(1),
      contentBase64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const buffer = Buffer.from(data.contentBase64, "base64");
    const lowerName = data.fileName.toLowerCase();
    const isExcel = lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls") || data.mimeType.includes("spreadsheet");
    const isImage = data.mimeType.startsWith("image/") || /(png|jpe?g|bmp|tiff|webp)$/i.test(lowerName);

    let rawText = "";
    let rows: Array<Record<string, unknown>> = [];
    let sourceType: ParsedDocument["sourceType"] = "unknown";

    if (isExcel) {
      sourceType = "excel";
      const sheets = parseExcelBuffer(buffer);
      rawText = sheets
        .map((sheet) => {
          const header = sheet.rawRows[0] ? sheet.rawRows[0].join(" | ") : "";
          const body = sheet.rawRows.slice(1).map((row) => row.join(" | ")).join("\n");
          return `Sheet: ${sheet.sheetName}\nHeader: ${header}\n${body}`;
        })
        .join("\n\n");
      rows = sheets.flatMap((sheet) => sheet.rows);
    } else if (isImage) {
      sourceType = "image";
      rawText = await extractTextFromImage(buffer);
    } else {
      rawText = buffer.toString("utf-8");
    }

    const prompt = `You are PaintIQ AI, a retail paint business assistant. Analyze this uploaded file and provide:
1) The best document classification from: Sales, Stock, Purchase Invoice, Expense, Price Update, or Other.
2) A concise summary of the contents.
3) A short list of inferred numeric totals, item counts, and important details.
4) A JSON object with keys: classification, summary, recommendations.

File name: ${data.fileName}
Source type: ${sourceType}

Content:\n${rawText}`;

    const aiResponse = await callGemini(prompt);

    return {
      id: crypto.randomUUID(),
      fileName: data.fileName,
      sourceType,
      classification: aiResponse.match(/classification[:\s]*([A-Za-z \-]+)/i)?.[1]?.trim() ?? "Unknown",
      rawText,
      summary: aiResponse,
      rows,
      recommendations: aiResponse,
    } as ParsedDocument;
  });

export const askGemini = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      query: z.string().min(1),
      context: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = data.context ? `Here is the business context:\n${data.context}\n\n` : "";
    const prompt = `${context}Answer the question below with actionable insight for a paint retail business:

Question: ${data.query}`;

    const answer = await callGemini(prompt);
    return { answer };
  });
