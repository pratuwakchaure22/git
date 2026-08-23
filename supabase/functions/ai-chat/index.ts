import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Restrict CORS to the configured allowed origin.
// Set ALLOWED_ORIGIN in Supabase Edge Function secrets (e.g. https://yourapp.vercel.app).
// Falls back to a permissive wildcard only when the env var is absent (local dev).
const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth: verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { message, conversationId } = body;

    // Cap history server-side to last 20 messages to prevent token abuse.
    const history: { role: string; content: string }[] =
      Array.isArray(body.history) ? body.history.slice(-20) : [];

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Guard against excessively long single messages (16 KB limit).
    if (message.length > 16_384) {
      return new Response(JSON.stringify({ error: "message too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch context from the user's workspace to ground the AI
    const [tasksRes, deadlinesRes, remindersRes, notesRes] = await Promise.all([
      supabase.from("tasks").select("title, status, priority, due_date").eq("status", "todo").limit(5),
      supabase.from("deadlines").select("title, date, status, priority").eq("status", "upcoming").limit(5),
      supabase.from("reminders").select("title, date, time, status").limit(5),
      supabase.from("notes").select("title, category, updated_at").order("updated_at", { ascending: false }).limit(5),
    ]);

    const contextSections: string[] = [];
    if (tasksRes.data?.length) {
      contextSections.push(
        "Active Tasks:\n" +
          tasksRes.data
            .map((t) => `- ${t.title} [${t.priority}] ${t.due_date ? `due ${t.due_date}` : ""}`)
            .join("\n")
      );
    }
    if (deadlinesRes.data?.length) {
      contextSections.push(
        "Upcoming Deadlines:\n" +
          deadlinesRes.data.map((d) => `- ${d.title} on ${d.date} [${d.priority}]`).join("\n")
      );
    }
    if (remindersRes.data?.length) {
      contextSections.push(
        "Reminders:\n" +
          remindersRes.data.map((r) => `- ${r.title} at ${r.time || "N/A"}`).join("\n")
      );
    }
    if (notesRes.data?.length) {
      contextSections.push(
        "Recent Notes:\n" +
          notesRes.data.map((n) => `- ${n.title} [${n.category}]`).join("\n")
      );
    }

    const systemPrompt = `You are a personal AI assistant embedded in a private productivity dashboard. Be concise, helpful, and friendly. Use markdown formatting (bold, bullet lists) to structure your responses.

${
  contextSections.length > 0
    ? `Here is the user's current workspace context:\n\n${contextSections.join("\n\n")}\n\nUse this context to answer questions about their tasks, deadlines, notes, and reminders. If you don't find relevant data, say so honestly.`
    : "The user's workspace appears to be empty or no context is available."
}`;

    // Build message history for Chat Completions API
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const groqKey = Deno.env.get("GROQ_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    let reply = "";

    if (groqKey) {
      // Call Groq API (OpenAI-compatible)
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        console.error("Groq API error:", errText);
        return new Response(
          JSON.stringify({ error: "Groq API error", details: errText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const groqData = await groqRes.json();
      reply = groqData.choices?.[0]?.message?.content || "";
    } else if (openaiKey) {
      // Call OpenAI Chat Completions API
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: apiMessages,
        }),
      });

      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        console.error("OpenAI error:", errText);
        return new Response(
          JSON.stringify({ error: "OpenAI API error", details: errText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const openaiData = await openaiRes.json();
      reply = openaiData.choices?.[0]?.message?.content || "";
    } else {
      return new Response(
        JSON.stringify({ error: "Neither GROQ_API_KEY nor OPENAI_API_KEY is configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reply) {
      reply = "I'm sorry, I couldn't generate a response. Please try again.";
    }

    // Persist to DB: ensure conversation exists, then save both messages
    let convoId = conversationId;

    if (!convoId) {
      // Create new conversation with auto-title from first message (truncated)
      const title = message.length > 50 ? message.slice(0, 47) + "..." : message;
      const { data: newConvo, error: convoErr } = await supabase
        .from("ai_conversations")
        .insert({ user_id: user.id, title })
        .select("id")
        .single();
      if (convoErr) {
        console.error("Convo create error:", convoErr);
      } else {
        convoId = newConvo.id;
      }
    }

    if (convoId) {
      await supabase.from("ai_messages").insert([
        { conversation_id: convoId, role: "user",      content: message },
        { conversation_id: convoId, role: "assistant", content: reply   },
      ]);
    }

    return new Response(
      JSON.stringify({ reply, conversationId: convoId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
