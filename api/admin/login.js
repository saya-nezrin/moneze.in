import { allowedAdminEmails } from "../../lib/adminAuth.js";
import { isValidEmail, normalizeEmail, requirePost, sendJson } from "../../lib/emailOtp.js";
import { getSupabaseConfiguration } from "../../lib/supabaseAdmin.js";

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;
  const email = normalizeEmail(request.body?.email);
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  if (!isValidEmail(email) || !password || password.length > 256 || !allowedAdminEmails().has(email)) {
    return sendJson(response, 401, { message: "Invalid admin credentials." });
  }
  const { url, publishableKey } = getSupabaseConfiguration();
  if (!url || !publishableKey) return sendJson(response, 503, { message: "Admin login is temporarily unavailable." });

  try {
    const authResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const auth = await authResponse.json().catch(() => ({}));
    if (!authResponse.ok || !auth.access_token || normalizeEmail(auth.user?.email) !== email) {
      return sendJson(response, 401, { message: "Invalid admin credentials." });
    }
    const maxAge = Math.min(Number(auth.expires_in) || 3600, 3600);
    response.setHeader("Set-Cookie", `moneze_admin=${encodeURIComponent(auth.access_token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`);
    return sendJson(response, 200, { authenticated: true, email });
  } catch {
    return sendJson(response, 503, { message: "Admin login is temporarily unavailable." });
  }
}
