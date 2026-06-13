import { createServerFn } from "@tanstack/react-start";

type ExtractInput = {
  kind: "stock" | "sales" | "expenses";
  source: "excel" | "image";
  text?: string;
  imageBase64?: string;
  imageMimeType?: string;
};

const SCHEMAS: Record<ExtractInput["kind"], string> = {
  stock: `Array of objects with fields:
- date (YYYY-MM-DD)
- product (string)
- brand (string)
- category (one of: Exterior Paint, Interior Paint, Primer, Enamel/Gloss, Distemper, Hardware, Accessories, Other)
- size (e.g. 1L, 4L, 10L, 20L)
- qty (number, units received)
- buyPrice (number, per-unit cost in INR)
- supplier (string)
- invoiceNo (string, optional, default empty)`,
  sales: `Array of objects with fields:
- date (YYYY-MM-DD)
- customer (string; "Walk-in Customer" if unknown)
- product (string)
- brand (string)
- category (Interior Paint / Exterior Paint / Primer / Enamel/Gloss / Distemper / Hardware / Accessories / Other)
- size (e.g. 1L, 4L, 10L, 20L)
- qty (number)
- sellPrice (number, per-unit INR)
- discount (number, percentage 0-100)
- paymentMode (Cash / UPI / Credit / Cheque)
- total (number, final INR amount)`,
  expenses: `Array of objects with fields:
- date (YYYY-MM-DD)
- category (Rent / Electricity / Staff Salary / Transport / Packaging / Marketing / Maintenance / Miscellaneous)
- description (string)
- amount (number, INR)
- paidBy (string; Cash / UPI / Bank Transfer / Cheque)`,
};

export const extractDataFromFile = createServerFn({ method: "POST" })
  .inputValidator((data: ExtractInput) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const schema = SCHEMAS[data.kind];
    const today = new Date().toISOString().slice(0, 10);

    const prompt = `You are an OCR + structured-data extraction engine for a paint retail shop.
Extract ${data.kind} records from the provided content.
Return ONLY valid JSON in the shape: { "rows": [...] }.
${schema}
Rules:
- Use today's date (${today}) if no date is visible.
- Convert all currency to plain numbers (no symbols, no commas).
- Skip header rows and totals/summary rows.
- If a field is missing, infer a sensible default (empty string for text, 0 for number).
- Do NOT wrap in markdown code fences.`;

    // Build Gemini parts
    const parts: any[] = [];

    if (data.source === "excel" && data.text) {
      parts.push({ text: prompt + `\n\nHere is the spreadsheet content:\n\n${data.text.slice(0, 60000)}` });
    } else if (data.source === "image" && data.imageBase64) {
      parts.push({ text: prompt + "\n\nExtract the data from this image." });
      parts.push({
        inline_data: {
          mime_type: data.imageMimeType || "image/png",
          data: data.imageBase64,
        },
      });
    } else {
      throw new Error("No content supplied");
    }

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    if (!resp.ok) {
      const txt = await resp.text();
      if (resp.status === 429) throw new Error("Rate limit hit. Please try again in a minute.");
      if (resp.status === 403) throw new Error("Invalid Gemini API key. Check your GEMINI_API_KEY.");
      throw new Error(`Gemini API error (${resp.status}): ${txt.slice(0, 300)}`);
    }

    const json = await resp.json();
    const rawText: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let parsed: { rows?: any[] } = {};
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      const m = rawText.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    return { rows: Array.isArray(parsed.rows) ? parsed.rows : [] };
  });
