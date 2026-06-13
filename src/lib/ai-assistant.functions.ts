import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { geminiChatCompletion } from "./ai-gemini.server";

type BusinessAssistantInput = {
  query: string;
  stockEntries: Array<Record<string, unknown>>;
  salesEntries: Array<Record<string, unknown>>;
  expenses: Array<Record<string, unknown>>;
};

const MAX_ENTRIES = 30;

function summarizeEntries(label: string, entries: Array<Record<string, unknown>>) {
  if (entries.length === 0) return `${label}: none`;
  return `${label} (${entries.length} total): ${JSON.stringify(entries.slice(-MAX_ENTRIES), null, 2)}`;
}

export const askBusinessAssistant = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      query: z.string().min(1),
      stockEntries: z.array(z.record(z.any())),
      salesEntries: z.array(z.record(z.any())),
      expenses: z.array(z.record(z.any())),
    }),
  )
  .handler(async ({ data }) => {
    const totalRecords = data.stockEntries.length + data.salesEntries.length + data.expenses.length;
    if (totalRecords === 0) {
      return {
        answer:
          "I don't have any business data yet. Please import stock, sales, or expense records before asking analytical questions.",
      };
    }

    const systemPrompt = `You are PaintIQ AI, a business analyst for a paint retail shop. Use only the provided business data to answer the user's question. Do not invent numbers, analysis, or conclusions that are not present in the data. If the data is missing or not sufficient to answer, say you cannot answer from the available data.`;

    const payloadData = [
      summarizeEntries("stockEntries", data.stockEntries),
      summarizeEntries("salesEntries", data.salesEntries),
      summarizeEntries("expenses", data.expenses),
    ].join("\n\n");

    const userPrompt = `User question: ${data.query}\n\nProvided data:\n${payloadData}\n\nAnswer the question using only the data above. If the data is insufficient, say that you cannot answer from the available data.`;

    const json = await geminiChatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const answer = json.choices?.[0]?.message?.content?.trim();
    return {
      answer: typeof answer === "string" && answer.length > 0
        ? answer
        : "I couldn't parse an answer from the AI response.",
    };
  });
