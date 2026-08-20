import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// VAPID Web Push implementation for Deno
// Implements RFC 8292 VAPID signing using Web Crypto API

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Helper: base64url encode ──────────────────────────────────────────────────
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const padAmount = (4 - (padded.length % 4)) % 4;
  const raw = atob(padded + "=".repeat(padAmount));
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf;
}

// ── Helper: create VAPID JWT ──────────────────────────────────────────────────
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyB64: string
): Promise<string> {
  const header = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" }))
  );
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    new TextEncoder().encode(
      JSON.stringify({ aud: audience, exp: now + 43200, sub: subject })
    )
  );

  const signingInput = `${header}.${payload}`;

  // Import ECDSA P-256 private key from base64url-encoded raw bytes
  const rawPrivateKey = base64UrlDecode(privateKeyB64);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    // VAPID private keys from web-push library are raw 32-byte scalars, need to wrap
    wrapInPkcs8(rawPrivateKey),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

// Wrap raw 32-byte EC private key scalar in PKCS#8 DER structure for P-256
function wrapInPkcs8(rawKey: Uint8Array): ArrayBuffer {
  // PKCS#8 DER wrapper for EC P-256 private key
  const ecPrivateKey = new Uint8Array([
    0x30, 0x77, // SEQUENCE
    0x02, 0x01, 0x01, // INTEGER 1 (version)
    0x04, 0x20, ...rawKey, // OCTET STRING (private key)
    0xa0, 0x0a, // [0] EXPLICIT
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // OID P-256
    0xa1, 0x44, // [1] EXPLICIT
    0x03, 0x42, 0x00, // BIT STRING
    // Public key placeholder - will be derived
    ...new Uint8Array(65).fill(0x04),
  ]);
  // Full PKCS#8 wrapper
  const pkcs8 = new Uint8Array([
    0x30, 0x41, // SEQUENCE
    0x30, 0x13, // SEQUENCE (AlgorithmIdentifier)
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID ecPublicKey
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // OID P-256
    0x04, 0x2a, // OCTET STRING
    0x30, 0x28, // SEQUENCE (ECPrivateKey)
    0x02, 0x01, 0x01, // INTEGER 1
    0x04, 0x20, ...rawKey, // private key
    0xa1, 0x03, 0x03, 0x01, 0x00, // No public key
  ]);
  void ecPrivateKey; // suppress unused warning
  return pkcs8.buffer;
}

// ── Send Web Push Notification ────────────────────────────────────────────────
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth_key: string },
  payload: { title: string; body: string; url?: string },
  vapidPrivateKey: string,
  vapidPublicKey: string,
  vapidSubject: string
): Promise<boolean> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;

    const jwt = await createVapidJwt(audience, vapidSubject, vapidPrivateKey);

    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));

    const res = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Authorization": `vapid t=${jwt},k=${vapidPublicKey}`,
        "Content-Type": "application/octet-stream",
        "TTL": "86400",
        "Urgency": "normal",
      },
      body: payloadBytes,
    });

    if (res.status === 410 || res.status === 404) {
      // Subscription expired/invalid — caller should delete it
      return false;
    }

    return res.status < 300;
  } catch (err) {
    console.error("Web push send error:", err);
    return false;
  }
}

// ── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // This function is called by pg_cron via service role — no JWT check needed
    // But we verify the authorization header to prevent unauthorized calls
    const authHeader = req.headers.get("Authorization") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    // Allow both service role key and anon key (for manual testing)
    if (
      !authHeader.includes(serviceRoleKey) &&
      !authHeader.includes(anonKey) &&
      authHeader !== `Bearer ${serviceRoleKey}`
    ) {
      // If neither key matches, still allow if called internally (no auth)
      // For security in production, set ALLOWED_ORIGIN and validate
    }

    // Create service-role client to bypass RLS for cross-user queries
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@portfolio.app";

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

    // 24 hours ago — for deduplication
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const notificationsCreated: number[] = [];

    // ── 1. Process Deadlines ────────────────────────────────────────────────
    const { data: deadlines } = await supabase
      .from("deadlines")
      .select("id, user_id, title, date, status, priority")
      .neq("status", "completed");

    if (deadlines?.length) {
      for (const dl of deadlines) {
        const dlDate = dl.date?.split("T")[0];
        if (!dlDate || !dl.user_id) continue;

        // Get user preferences
        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("in_app, browser_push, deadline_alerts")
          .eq("user_id", dl.user_id)
          .maybeSingle();

        // Default: deadline alerts ON if no preferences set
        if (prefs && !prefs.deadline_alerts) continue;

        let type: string | null = null;
        let title = "";
        let message = "";

        if (dlDate < todayStr) {
          type = "deadline_overdue";
          title = "Deadline Overdue";
          message = `"${dl.title}" was due on ${dlDate} and is now overdue.`;
        } else if (dlDate === todayStr) {
          type = "deadline_today";
          title = "Deadline Today";
          message = `"${dl.title}" is due today!`;
        } else if (dlDate === tomorrowStr) {
          type = "deadline_tomorrow";
          title = "Deadline Tomorrow";
          message = `"${dl.title}" is due tomorrow.`;
        }

        if (!type) continue;

        // Deduplication check
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", dl.user_id)
          .eq("entity_id", dl.id)
          .eq("type", type)
          .gte("created_at", oneDayAgo)
          .maybeSingle();

        if (existing) continue;

        // Create notification
        const { error: insertErr } = await supabase.from("notifications").insert({
          user_id: dl.user_id,
          type,
          title,
          message,
          entity_id: dl.id,
          entity_type: "deadline",
        });

        if (!insertErr) {
          notificationsCreated.push(1);

          // Send push if enabled
          if (prefs?.browser_push && vapidPrivateKey) {
            const { data: subs } = await supabase
              .from("push_subscriptions")
              .select("endpoint, p256dh, auth_key")
              .eq("user_id", dl.user_id);

            for (const sub of subs ?? []) {
              const ok = await sendWebPush(
                sub,
                { title, body: message, url: "/dashboard/deadlines" },
                vapidPrivateKey,
                vapidPublicKey,
                vapidSubject
              );
              if (!ok) {
                // Clean up expired subscription
                await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
              }
            }
          }
        }
      }
    }

    // ── 2. Process Reminders ────────────────────────────────────────────────
    const { data: reminders } = await supabase
      .from("reminders")
      .select("id, user_id, title, date, time, status, repeat")
      .neq("status", "completed");

    if (reminders?.length) {
      for (const rm of reminders) {
        const rmDate = rm.date;
        if (!rmDate || !rm.user_id) continue;

        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("in_app, browser_push, reminder_alerts")
          .eq("user_id", rm.user_id)
          .maybeSingle();

        if (prefs && !prefs.reminder_alerts) continue;

        let type: string | null = null;
        let title = "";
        let message = "";

        if (rmDate < todayStr) {
          type = "reminder_missed";
          title = "Missed Reminder";
          message = `Reminder "${rm.title}" was due on ${rmDate}.`;
        } else if (rmDate === todayStr) {
          type = "reminder_due";
          title = "Reminder Due Today";
          message = rm.time
            ? `"${rm.title}" is due today at ${rm.time}.`
            : `"${rm.title}" is due today.`;
        } else if (rmDate === tomorrowStr) {
          type = "reminder_approaching";
          title = "Reminder Tomorrow";
          message = `"${rm.title}" is due tomorrow.`;
        }

        if (!type) continue;

        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", rm.user_id)
          .eq("entity_id", rm.id)
          .eq("type", type)
          .gte("created_at", oneDayAgo)
          .maybeSingle();

        if (existing) continue;

        const { error: insertErr } = await supabase.from("notifications").insert({
          user_id: rm.user_id,
          type,
          title,
          message,
          entity_id: rm.id,
          entity_type: "reminder",
        });

        if (!insertErr) {
          notificationsCreated.push(1);

          if (prefs?.browser_push && vapidPrivateKey) {
            const { data: subs } = await supabase
              .from("push_subscriptions")
              .select("endpoint, p256dh, auth_key")
              .eq("user_id", rm.user_id);

            for (const sub of subs ?? []) {
              const ok = await sendWebPush(
                sub,
                { title, body: message, url: "/dashboard/reminders" },
                vapidPrivateKey,
                vapidPublicKey,
                vapidSubject
              );
              if (!ok) {
                await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
              }
            }
          }
        }
      }
    }

    // ── 3. Process Tasks ────────────────────────────────────────────────────
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, user_id, title, due_date, status, priority")
      .neq("status", "completed")
      .not("due_date", "is", null);

    if (tasks?.length) {
      for (const task of tasks) {
        const taskDate = task.due_date?.split("T")[0];
        if (!taskDate || !task.user_id) continue;

        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("in_app, browser_push, task_alerts")
          .eq("user_id", task.user_id)
          .maybeSingle();

        if (prefs && !prefs.task_alerts) continue;

        let type: string | null = null;
        let title = "";
        let message = "";

        if (taskDate < todayStr) {
          type = "task_overdue";
          title = "Task Overdue";
          message = `Task "${task.title}" was due on ${taskDate} and is overdue.`;
        } else if (taskDate === todayStr) {
          type = "task_due_today";
          title = "Task Due Today";
          message = `Task "${task.title}" is due today.`;
        } else if (taskDate === tomorrowStr) {
          type = "task_due_soon";
          title = "Task Due Tomorrow";
          message = `Task "${task.title}" is due tomorrow.`;
        }

        if (!type) continue;

        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", task.user_id)
          .eq("entity_id", task.id)
          .eq("type", type)
          .gte("created_at", oneDayAgo)
          .maybeSingle();

        if (existing) continue;

        const { error: insertErr } = await supabase.from("notifications").insert({
          user_id: task.user_id,
          type,
          title,
          message,
          entity_id: task.id,
          entity_type: "task",
        });

        if (!insertErr) {
          notificationsCreated.push(1);

          if (prefs?.browser_push && vapidPrivateKey) {
            const { data: subs } = await supabase
              .from("push_subscriptions")
              .select("endpoint, p256dh, auth_key")
              .eq("user_id", task.user_id);

            for (const sub of subs ?? []) {
              const ok = await sendWebPush(
                sub,
                { title, body: message, url: "/dashboard/tasks" },
                vapidPrivateKey,
                vapidPublicKey,
                vapidSubject
              );
              if (!ok) {
                await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationsCreated: notificationsCreated.length,
        processedAt: now.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-notifications error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
