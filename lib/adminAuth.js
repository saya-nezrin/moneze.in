import { readCookie } from "./emailOtp.js";
import { getSupabaseConfiguration } from "./supabaseAdmin.js";

export function allowedAdminEmails() {
  return new Set((process.env.ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export async function requireAdmin(request) {
  const token = readCookie(request, "moneze_admin");
  const { url, publishableKey } = getSupabaseConfiguration();
  if (!token || !url || !publishableKey) return null;
  const authResponse = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${token}` },
  });
  if (!authResponse.ok) return null;
  const user = await authResponse.json();
  const email = user?.email?.trim().toLowerCase();
  if (!email || !allowedAdminEmails().has(email)) return null;
  return { id: user.id, email };
}
