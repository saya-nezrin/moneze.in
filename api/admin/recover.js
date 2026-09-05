import { allowedAdminEmails } from "../../lib/adminAuth.js";
import { isValidEmail, normalizeEmail, requirePost, sendJson } from "../../lib/emailOtp.js";
import { getSupabaseConfiguration } from "../../lib/supabaseAdmin.js";

function recoveryRedirectUrl() {
  const configured = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const base = configured || (vercelHost ? `https://${vercelHost}` : "");
  return base ? `${base}/?admin-recovery=1` : "";
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;
  const email = normalizeEmail(request.body?.email);
  const { url, publishableKey } = getSupabaseConfiguration();
  const redirectTo = recoveryRedirectUrl();
  const genericResponse = { sent: true, message: "If this is an authorised admin account, a recovery email has been sent." };
  if (!isValidEmail(email) || !allowedAdminEmails().has(email)) return sendJson(response, 200, genericResponse);
  if (!url || !publishableKey || !redirectTo) return sendJson(response, 503, { message: "Password recovery is temporarily unavailable." });

  try {
    const authResponse = await fetch(`${url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST",
      headers: { apikey: publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!authResponse.ok) {
      console.error("Supabase password recovery failed", { status: authResponse.status });
      return sendJson(response, 502, { message: "The recovery email could not be sent. Please try again later." });
    }
    return sendJson(response, 200, genericResponse);
  } catch {
    return sendJson(response, 503, { message: "Password recovery is temporarily unavailable." });
  }
}
