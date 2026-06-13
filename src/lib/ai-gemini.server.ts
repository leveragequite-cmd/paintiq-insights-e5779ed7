type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function getGeminiModel() {
  return process.env.GEMINI_MODEL || "google/gemini-2.5-flash";
}

export function getGeminiApiUrl() {
  return typeof process !== "undefined" && process.env.GEMINI_API_URL
    ? process.env.GEMINI_API_URL
    : "https://api.labs.google.com/v1/chat/completions";
}

export function getGeminiApiKey() {
  if (typeof process !== "undefined" && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  throw new Error("GEMINI_API_KEY environment variable is not set");
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
    if (response.status === 402) throw new Error("AI credits exhausted.");
    throw new Error(`Gemini API error (${response.status}): ${text.slice(0, 300)}`);
  }
  return response.json();
}
