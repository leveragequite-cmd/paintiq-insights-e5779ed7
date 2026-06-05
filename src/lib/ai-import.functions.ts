import { createServerFn } from "@tanstack/react-start";

type ExtractInput = {
  kind: "stock" | "sales" | "expenses";
  // For excel: pre-parsed CSV-ish text. For image: base64 data URL.
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
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const schema = SCHEMAS[data.kind];
    const today = new Date().toISOString().slice(0, 10);

    const systemPrompt = `You are an OCR + structured-data extraction engine for a paint retail shop.
Extract ${data.kind} records from the provided content.
Return ONLY valid JSON in the shape: { "rows": [...] }.
${schema}
Rules:
- Use today's date (${today}) if no date is visible.
- Convert all currency to plain numbers (no symbols, no commas).
- Skip header rows and totals/summary rows.
- If a field is missing, infer a sensible default (empty string for text, 0 for number).
- Do NOT wrap in markdown code fences.`;

    const userContent: any[] = [];
    if (data.source === "excel" && data.text) {
      userContent.push({
        type: "text",
        text: `Here is the spreadsheet content (CSV-like):\n\n${data.text.slice(0, 60000)}`,
      });
    } else if (data.source === "image" && data.imageBase64) {
      userContent.push({ type: "text", text: "Extract the data from this image." });
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${data.imageMimeType || "image/png"};base64,${data.imageBase64}` },
      });
    } else {
      throw new Error("No content supplied");
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      if (resp.status === 429) throw new Error("Rate limit hit. Please try again in a minute.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Add credits in your Lovable workspace.");
      throw new Error(`AI gateway error (${resp.status}): ${txt.slice(0, 300)}`);
    }

    const json = await resp.json();
    const content: string = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { rows?: any[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    return { rows: Array.isArray(parsed.rows) ? parsed.rows : [] };
  });
