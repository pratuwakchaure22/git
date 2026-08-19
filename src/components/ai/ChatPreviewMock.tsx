import { Bot, User, Sparkles, ArrowUp } from "lucide-react";
import { Badge } from "@/components/common/Badge";

const exchange = [
  {
    role: "user" as const,
    text: "What has Alex built that involves retrieval or RAG systems?",
  },
  {
    role: "assistant" as const,
    text: "Two things stand out: the Retrieval Eval Harness — an open-source benchmarking framework for RAG pipelines — and a research paper on calibrated recall metrics submitted this year. Want the details on either one?",
  },
  {
    role: "user" as const,
    text: "The eval harness — is it something I could actually use?",
  },
];

export function ChatPreviewMock() {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-soft text-indigo">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-ink">Portfolio Assistant</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Preview — not yet live</p>
          </div>
        </div>
        <Badge tone="amber">In development</Badge>
      </div>

      <div className="flex flex-col gap-5 px-6 py-8">
        {exchange.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                msg.role === "user" ? "bg-ink text-paper dark:bg-line-strong" : "bg-indigo-soft text-indigo"
              }`}
            >
              {msg.role === "user" ? <User className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Bot className="h-3.5 w-3.5" strokeWidth={1.75} />}
            </span>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-tr-sm bg-paper text-ink"
                  : "rounded-tl-sm border border-line bg-paper text-ink"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3 opacity-60">
          <span className="flex-1 truncate font-body text-sm text-muted">Ask a question about my work... (coming soon)</span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-line-strong text-paper">
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
          </span>
        </div>
      </div>
    </div>
  );
}
