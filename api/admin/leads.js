import { requireAdmin } from "../../lib/adminAuth.js";
import { sendJson } from "../../lib/emailOtp.js";
import { getSupabaseConfiguration, supabaseHeaders } from "../../lib/supabaseAdmin.js";

const statuses = new Set(["new", "contacted", "scheduled", "completed", "closed"]);

export default async function handler(request, response) {
  let admin;
  try { admin = await requireAdmin(request); } catch { admin = null; }
  if (!admin) return sendJson(response, 401, { message: "Admin authentication required." });

  const { url, secretKey } = getSupabaseConfiguration();
  if (!url || !secretKey) return sendJson(response, 503, { message: "Lead storage is temporarily unavailable." });

  if (request.method === "GET") {
    const databaseResponse = await fetch(`${url}/rest/v1/consultation_leads?select=*&order=created_at.desc&limit=200`, {
      headers: supabaseHeaders(secretKey),
    });
    if (!databaseResponse.ok) return sendJson(response, 502, { message: "Leads could not be loaded." });
    return sendJson(response, 200, { leads: await databaseResponse.json() });
  }

  if (request.method === "PATCH") {
    const id = typeof request.body?.id === "string" ? request.body.id : "";
    const status = typeof request.body?.status === "string" ? request.body.status : "";
    if (!/^[0-9a-f-]{36}$/i.test(id) || !statuses.has(status)) return sendJson(response, 400, { message: "Invalid lead update." });
    const databaseResponse = await fetch(`${url}/rest/v1/consultation_leads?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: supabaseHeaders(secretKey, { "Content-Type": "application/json", Prefer: "return=representation" }),
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    });
    if (!databaseResponse.ok) return sendJson(response, 502, { message: "Lead status could not be updated." });
    const rows = await databaseResponse.json().catch(() => []);
    return sendJson(response, 200, { lead: rows[0] || { id, status } });
  }

  response.setHeader("Allow", "GET, PATCH");
  return sendJson(response, 405, { message: "Method not allowed." });
}
