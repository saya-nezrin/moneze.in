import { allowedAdminEmails } from "../../lib/adminAuth.js";
import { normalizeEmail, requirePost, sendJson } from "../../lib/emailOtp.js";
import { getSupabaseConfiguration } from "../../lib/supabaseAdmin.js";

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;
  const accessToken = typeof request.body?.accessToken === "string" ? request.body.accessToken : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  if (!accessToken || accessToken.length > 4096 || password.length < 10 || password.length > 256) {
    return sendJson(response, 400, { message: "Use a password containing at least 10 characters." });
  }
  const { url, publishableKey } = getSupabaseConfiguration();
  if (!url || !publishableKey) return sendJson(response, 503, { message: "Password reset is temporarily unavailable." });

  try {
    const userResponse = await fetch(`${url}/auth/v1/user`, { headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}` } });
    const user = await userResponse.json().catch(() => ({}));
    if (!userResponse.ok || !allowedAdminEmails().has(normalizeEmail(user.email))) {
      return sendJson(response, 401, { message: "This recovery link is invalid or has expired." });
    }
    const updateResponse = await fetch(`${url}/auth/v1/user`, {
      method: "PUT",
      headers: { apikey: publishableKey, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!updateResponse.ok) {
      const error = await updateResponse.json().catch(() => ({}));
      return sendJson(response, 400, { message: error.message || "The password could not be updated." });
    }
    response.setHeader("Set-Cookie", "moneze_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
    return sendJson(response, 200, { updated: true });
  } catch {
    return sendJson(response, 503, { message: "Password reset is temporarily unavailable." });
  }
}
