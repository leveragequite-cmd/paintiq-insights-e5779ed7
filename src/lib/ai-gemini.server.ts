type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const DEFAULT_GEMINI_API_URL = "https://api.labs.google.com/v1/chat/completions";
const DEFAULT_GEMINI_API_KEY = "AQ.Ab8RN6IPELtne80P2NfT5ujutEJpFJfaw5_7N_Rmbrt2ReOejw";

export function getGeminiModel() {
  return process.env.GEMINI_MODEL || "google/gemini-2.5-flash";
}

export function getGeminiApiUrl() {
  return typeof process !== "undefined" && process.env.GEMINI_API_URL
    ? process.env.GEMINI_API_URL
    : DEFAULT_GEMINI_API_URL;
}

export function getGeminiApiKey() {
  return typeof process !== "undefined" && process.env.GEMINI_API_KEY
    ? process.env.GEMINI_API_KEY
    : DEFAULT_GEMINI_API_KEY;
}

export async function geminiChatCompletion(messages: ChatMessage[]) {
  const apiKey = getGeminiApiKey();
  const url = getGeminiApiUrl();
  const model = getGeminiModel();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 429) throw new Error("Rate limit hit. Please try again in a minute.");
    if (response.status === 402) throw new Error("AI credits exhausted. Add credits in your Gemini workspace or gateway.");
    throw new Error(`Gemini API error (${response.status}): ${text.slice(0, 300)}`);
  }

  return response.json();
}
