import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com";
const SUPABASE_URL = "https://ytbrsiswpoqaaparfgon.supabase.co";
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

const textEncoder = new TextEncoder();

function base64Encode(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64Decode(str) {
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSignature(secretBytes, content) {
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, textEncoder.encode(content));
  return base64Encode(new Uint8Array(sig));
}

async function verifyWebhook(headers, rawBody) {
  const svixId = headers.get("svix-id") || "";
  const svixTimestamp = headers.get("svix-timestamp") || "";
  const svixSignature = headers.get("svix-signature") || "";
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET") || "";

  if (!svixId || !svixTimestamp || !svixSignature || !secret) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  const ts = parseInt(svixTimestamp, 10);
  if (isNaN(ts) || Math.abs(nowSec - ts) > 300) return false;

  const signedContent = svixId + "." + svixTimestamp + "." + rawBody;

  let keyBytes;
  try {
    keyBytes = base64Decode(secret.replace(/^whsec_/, ""));
  } catch (_) {
    keyBytes = textEncoder.encode(secret);
  }
  const expected = await hmacSignature(keyBytes, signedContent);

  for (const part of svixSignature.split(" ")) {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) continue;
    if (constantTimeEqual(expected, sig)) return true;
  }
  return false;
}

function parseFrom(raw) {
  let name = "";
  let email = String(raw || "").trim();
  const m = email.match(/^(.*?)\s*<([^>]+)>$/);
  if (m) {
    name = m[1].trim().replace(/^"|"$/g, "");
    email = m[2].trim();
  }
  return { name, email };
}

function firstEmail(list) {
  if (!list) return "";
  if (typeof list === "string") return list;
  if (Array.isArray(list)) return String(list[0] || "");
  return "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const rawBody = await req.text();
  if (!(await verifyWebhook(req.headers, rawBody))) {
    return json({ ok: false, error: "Invalid webhook signature" }, 401);
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (_) {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  if (event.type !== "email.received") {
    return json({ ok: true });
  }

  const meta = event.data || {};
  const emailId = String(meta.email_id || "");
  if (!emailId) {
    return json({ ok: false, error: "Missing email_id" }, 400);
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    return json({ ok: false, error: "RESEND_API_KEY secret not configured" }, 500);
  }

  const res = await fetch(RESEND_API_URL + "/emails/receiving/" + encodeURIComponent(emailId), {
    headers: { Authorization: "Bearer " + resendKey },
  });
  if (!res.ok) {
    return json({ ok: false, error: "Failed to fetch received email (" + res.status + ")" }, 502);
  }

  const body = await res.json();
  const mail = body.data || body;

  const from = parseFrom(mail.from || meta.from);
  const toEmail = firstEmail(mail.to || meta.to || []);
  const subject = String(mail.subject || meta.subject || "").trim();
  const text = String(mail.text || "");
  const html = String(mail.html || "");
  const attachments = mail.attachments && Array.isArray(mail.attachments)
    ? mail.attachments.map((a) => ({ id: a.id, filename: a.filename, content_type: a.content_type }))
    : (meta.attachments && Array.isArray(meta.attachments)
        ? meta.attachments.map((a) => ({ id: a.id, filename: a.filename, content_type: a.content_type }))
        : []);
  const createdAt = mail.created_at || event.created_at || new Date().toISOString();

  const row = {
    email_id: emailId,
    from_name: from.name,
    from_email: from.email,
    to_email: toEmail,
    subject,
    body_text: text,
    body_html: html,
    attachments,
    read: false,
    created_at: createdAt,
  };

  const upsert = await fetch(
    SUPABASE_URL + "/rest/v1/email_inbox?on_conflict=email_id",
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify([row]),
    }
  );

  if (!upsert.ok) {
    const err = await upsert.text();
    return json({ ok: false, error: "Failed to store email: " + err }, 502);
  }

  return json({ ok: true, email_id: emailId });
});
