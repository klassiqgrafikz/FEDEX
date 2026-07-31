import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com/emails";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YnJzaXN3cG9xYWFwYXJmZ29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MzMyNjIsImV4cCI6MjEwMDUwOTI2Mn0.KkpG3hiscVSBtYDqZFCqHZnoNDOOJPnPWZ8vvV_UaN0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const apikey = req.headers.get("apikey") || "";
  const auth = req.headers.get("authorization") || "";
  if (!apikey.includes(SUPABASE_ANON_KEY) && !auth.includes(SUPABASE_ANON_KEY)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    return json({ ok: false, error: "RESEND_API_KEY secret not configured" }, 500);
  }
  const from = Deno.env.get("EMAIL_FROM") || "FedEx <onboarding@resend.dev>";

  let body;
  try {
    body = await req.json();
  } catch (_) {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const to = String(body.to || "").trim();
  const subject = String(body.subject || "").trim();
  const html = String(body.html || "").trim();

  if (!to || !subject || !html) {
    return json({ ok: false, error: "to, subject and html are required" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return json({ ok: false, error: "Invalid recipient email" }, 400);
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + resendKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const data = await res.json();
  if (!res.ok) {
    return json({ ok: false, error: data.message || "Resend API error" }, 502);
  }
  return json({ ok: true, id: data.id });
});
