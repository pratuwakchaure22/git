import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, CheckCircle, XCircle, MessageSquare, Plus, Trash2 } from "lucide-react";
import { suggestedPrompts } from "@/data/mockAI";
import type { AIMessage, AIConversation } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ msg }: { msg: AIMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm",
          isUser ? "bg-gradient-to-tr from-[#4F7CFF] to-[#9B4DFF] text-white" : "bg-[#1B1B28] border border-[#2A2A3A] text-[#4F7CFF]"
        )}
      >
        {isUser ? "PK" : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("flex max-w-xl flex-col gap-1", isUser && "items-end")}>
        {/* Action card */}
        {msg.actionCard && (
          <div
            className="mb-2 w-full max-w-sm rounded-2xl border border-[#4F7CFF]/40 bg-[#1B1B28] p-4 shadow-lg shadow-black/20"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#4F7CFF]" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#4F7CFF]">
                Action Required — {msg.actionCard.title}
              </span>
            </div>
            <p className="text-xs font-medium text-[#F4F4F7]">
              {msg.actionCard.description}
            </p>
            <div className="mt-3 space-y-1.5">
              {Object.entries(msg.actionCard.data).map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-2">
                  <span className="w-20 flex-shrink-0 font-mono text-[10px] uppercase text-[#9A9AA8]">
                    {k}
                  </span>
                  <span className="text-xs text-[#F4F4F7]">{String(v)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl bg-[#4F7CFF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#3b66e0]"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Confirm
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl border border-[#2A2A3A] bg-[#20202E] px-3.5 py-1.5 text-xs font-medium text-[#9A9AA8] transition-colors hover:text-[#F4F4F7]"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Message text */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-xs leading-relaxed border shadow-md",
            isUser
              ? "rounded-tr-xs bg-[#4F7CFF] text-white border-transparent"
              : "rounded-tl-xs bg-[#1B1B28] text-[#F4F4F7] border-[#2A2A3A]"
          )}
          style={{
            whiteSpace: "pre-wrap",
          }}
        >
          {/* Render basic markdown bold */}
          {msg.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </div>
        <span className="font-mono text-[10px] text-[#9A9AA8] px-1">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const { user } = useAuth();

  const getWelcomeMessages = useCallback((): AIMessage[] => [
    {
      id: "welcome",
      role: "assistant",
      content: `Hello ${user?.name || "there"} 👋 I'm your personal AI assistant powered by GPT-4o mini. I can help you manage tasks, find documents, set reminders, and answer questions about your workspace. What would you like to do today?`,
      timestamp: new Date().toISOString(),
    },
  ], [user?.name]);

  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeId, setActiveId] = useState<string>("new");
  const [messages, setMessages] = useState<AIMessage[]>(() => getWelcomeMessages());
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [profileRole, setProfileRole] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Fetch conversations from Supabase
  useEffect(() => {
    if (!user) return;
    fetchConversations();
    // Inline profile fetch to satisfy react-hooks/exhaustive-deps
    supabase
      .from("profiles")
      .select("role_title, location")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfileRole(data.role_title || "");
          setProfileLocation(data.location || "");
        }
      });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchConversations() {
    const { data } = await supabase
      .from("ai_conversations")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (data) {
      // Build skeleton conversations (messages loaded on demand)
      const convos: AIConversation[] = data.map((c: any) => ({
        id: c.id,
        title: c.title,
        messages: [],
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
      setConversations(convos);
    }
  }

  async function loadConversation(id: string) {
    setActiveId(id);
    setError("");
    const { data } = await supabase
      .from("ai_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (data) {
      const msgs: AIMessage[] = data.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.created_at,
      }));
      setMessages(msgs.length > 0 ? msgs : getWelcomeMessages());
    }
  }

  async function deleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    await supabase.from("ai_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      startNewConversation();
    }
  }

  function startNewConversation() {
    setActiveId("new");
    setMessages(getWelcomeMessages());
    setError("");
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return;
    setInput("");
    setError("");

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setIsTyping(true);

    try {
      // Build history from current messages (excluding welcome)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          conversationId: activeId === "new" ? null : activeId,
          history,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const { reply, conversationId: newConvoId } = await res.json();

      const assistantMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((m) => [...m, assistantMsg]);

      // If this was a new conversation, update state and refresh sidebar
      if (activeId === "new" && newConvoId) {
        setActiveId(newConvoId);
        fetchConversations();
      }
    } catch (err: any) {
      console.error("AI error:", err);
      setError(err.message || "Failed to get a response. Please try again.");
      const errMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please check your connection and try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }
  return (
    <div className="flex h-[calc(100vh-6.5rem)] overflow-hidden rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] shadow-2xl">
      {/* Left: conversation history */}
      <aside
        className="hidden w-56 flex-shrink-0 flex-col md:flex border-r border-[#2A2A3A]"
        style={{ backgroundColor: "#171824" }}
      >
        <div className="flex h-14 items-center justify-between border-b border-[#2A2A3A] px-4">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#9A9AA8]">
            Conversations
          </span>
          <button
            type="button"
            onClick={startNewConversation}
            className="flex items-center gap-1 rounded-lg bg-[#4F7CFF] px-2.5 py-1 font-mono text-[10px] font-semibold text-white shadow-sm transition-all hover:bg-[#3b66e0]"
          >
            <Plus className="h-3 w-3" />
            New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 dash-scroll">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer",
                activeId === conv.id
                  ? "bg-[#4F7CFF]/15 text-[#4F7CFF] font-semibold border-l-2 border-[#4F7CFF]"
                  : "text-[#9A9AA8] hover:bg-[#1B1B28] hover:text-[#F4F4F7]"
              )}
              onClick={() => loadConversation(conv.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
              <button
                type="button"
                onClick={(e) => deleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#9A9AA8] hover:text-[#FF5C6C] transition-opacity"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {conversations.length === 0 && (
            <p className="px-3 py-2 font-mono text-[10px] text-[#9A9AA8]">
              No previous conversations
            </p>
          )}
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#0F1018]">
        {/* Header */}
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#2A2A3A] bg-[#171824] px-5">
          <div className="flex items-center gap-2.5">
            <Bot className="h-4 w-4 text-[#4F7CFF]" />
            <span className="font-display text-sm font-semibold text-[#F4F4F7]">
              AI Assistant
            </span>
            <span className="rounded-md border border-[#4F7CFF]/40 bg-[#4F7CFF]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#4F7CFF]">
              GPT-4o mini
            </span>
          </div>
          {error && (
            <span className="font-mono text-xs text-[#FF5C6C]">
              {error}
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 dash-scroll">
          {/* Suggested prompts (only on new/empty) */}
          {messages.length <= 1 && (
            <div className="mx-auto max-w-xl my-4">
              <p className="mb-3 text-center font-mono text-xs text-[#9A9AA8]">
                Suggested prompts
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => sendMessage(p)}
                    className="rounded-xl border border-[#2A2A3A] bg-[#1B1B28] p-3 text-left text-xs text-[#9A9AA8] transition-all hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7] hover:-translate-y-0.5 shadow-md"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1B1B28] border border-[#2A2A3A] text-[#4F7CFF]">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] px-4 py-3 shadow-md">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4F7CFF]"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-[#2A2A3A] bg-[#171824] p-4">
          <div className="flex items-end gap-2.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your personal assistant... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-4 py-3 text-xs text-[#F4F4F7] placeholder:text-[#9A9AA8]/60 outline-none transition-all focus:border-[#4F7CFF]"
              style={{ maxHeight: "8rem" }}
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#4F7CFF] text-white shadow-md transition-all hover:bg-[#3b66e0] disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 font-mono text-[10px] text-[#9A9AA8]">
            Responses powered by OpenAI via Supabase Edge Function · Context-aware of workspace data
          </p>
        </div>
      </div>

      {/* Right: profile panel */}
      <aside
        className="hidden w-60 flex-shrink-0 flex-col items-center justify-start p-5 border-l border-[#2A2A3A] lg:flex"
        style={{ backgroundColor: "#171824" }}
      >
        <div className="flex flex-col items-center text-center gap-4 w-full">
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] shadow-md">
            <img
              src={user?.avatarUrl || "/avatar.png"}
              alt={user?.name || "User"}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-display text-3xl font-semibold text-white/10 select-none">
              {user?.initials || "PK"}
            </div>
          </div>
          <div>
            <h3 className="font-display text-xs font-bold text-[#F4F4F7]">
              {user?.name || "User"}
            </h3>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#4F7CFF]">
              {profileRole || "Software Engineer"}
            </p>
            <p className="mt-1 text-[11px] text-[#9A9AA8]">
              {profileLocation || ""}
            </p>
          </div>
          <div className="w-full border-t border-[#2A2A3A] my-1" />
          <div className="w-full text-left space-y-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9A9AA8]">Active Session</p>
              <p className="text-xs font-medium text-[#F4F4F7]">Personal Dashboard</p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9A9AA8]">AI Model</p>
              <p className="text-xs font-semibold text-[#4F7CFF]">GPT-4o mini</p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9A9AA8]">Conversations</p>
              <p className="text-xs font-medium text-[#F4F4F7]">{conversations.length} saved</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
