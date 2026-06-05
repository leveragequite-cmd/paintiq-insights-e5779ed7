import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Mic, Plus, Sparkles, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "AI Business Assistant — PaintIQ" }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "ai"; text: string };

const suggestions = [
  "Which products are becoming dead stock?",
  "What should I reorder this month?",
  "Why did profit decline last quarter?",
  "Which supplier is hurting my margins most?",
];

const conversations: string[] = [];

const insights: { tone: string; title: string; text: string }[] = [];

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Based on your last 90 days of data, I'd flag 3 SKUs aging past 120 days representing ₹1.1L of working capital. I can draft a clearance plan if you'd like." },
      ]);
    }, 600);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Business Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">Ask PaintIQ AI anything about your shop's performance.</p>
      </div>

      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((i, k) => (
            <div key={k} className="surface-card p-5">
              <div className={`flex items-center gap-2 mb-2 ${i.tone === "critical" ? "text-destructive" : i.tone === "warning" ? "text-amber-400" : "text-primary"}`}>
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">Proactive Insight</span>
              </div>
              <div className="text-sm font-semibold">{i.title}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{i.text}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 h-[calc(100vh-360px)] min-h-[480px]">
        <aside className="surface-card p-4 flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New Chat
          </button>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mt-3 mb-1 px-1">Recent</div>
          <div className="flex-1 overflow-y-auto space-y-0.5">
            {conversations.map((c, i) => (
              <button key={i} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{c}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="surface-card flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-semibold">How can I help you today?</div>
                  <div className="text-xs text-muted-foreground mt-1">Try one of these prompts to get started.</div>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs hover:border-primary/40 hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.text}</div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[80%] space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="flex h-4 w-4 items-center justify-center rounded bg-primary/15 text-primary">
                          <Sparkles className="h-2.5 w-2.5" />
                        </div>
                        <span className="font-medium">PaintIQ AI</span>
                      </div>
                      <div className="rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-sm">{m.text}</div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
          <div className="border-t border-border p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask anything about your shop..."
                className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground" aria-label="Voice">
                <Mic className="h-4 w-4" />
              </button>
              <button onClick={() => send(input)} className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
