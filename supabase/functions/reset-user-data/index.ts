import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // 1. Verify JWT & extract canonical user ID
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { password, confirmText } = body;

    // 2. Validate exact "RESET" text confirmation
    if (confirmText !== "RESET") {
      return new Response(JSON.stringify({ error: "Invalid confirmation text. Must type RESET exactly." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Password Verification (if user signed up with password)
    if (user.email && password) {
      const { error: signInErr } = await userClient.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (signInErr) {
        return new Response(JSON.stringify({ error: "Invalid password. Reset authorization failed." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const userId = user.id; // Strictly server-derived verified JWT user ID

    // 4. Admin client for scoped user data reset
    const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

    const userTables = [
      "education",
      "experience",
      "skills",
      "projects",
      "achievements",
      "tasks",
      "notes",
      "reminders",
      "deadlines",
      "important",
      "documents",
      "ai_conversations",
      "ai_messages",
    ];

    for (const table of userTables) {
      try {
        await adminClient.from(table).delete().eq("user_id", userId);
      } catch (tableErr) {
        console.error(`Error resetting table ${table}:`, tableErr);
      }
    }

    // Reset user profile details while preserving Auth account
    await adminClient
      .from("profiles")
      .update({
        role_title: "",
        bio: "",
        phone: "",
        location: "",
        avatar_url: "",
        github_url: "",
        linkedin_url: "",
        website_url: "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    // 5. Scoped Storage Cleanup for User's folder only
    const buckets = ["documents", "portfolio-images", "avatars"];
    for (const bucket of buckets) {
      try {
        const { data: fileList } = await adminClient.storage.from(bucket).list(userId);
        if (fileList && fileList.length > 0) {
          const filePaths = fileList.map((f) => `${userId}/${f.name}`);
          await adminClient.storage.from(bucket).remove(filePaths);
        }
      } catch (storageErr) {
        console.error(`Storage cleanup note for bucket ${bucket}:`, storageErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "User data successfully reset." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "An error occurred during data reset." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
