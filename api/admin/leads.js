import { requireAdmin } from "../../lib/adminAuth.js";
import { sendJson } from "../../lib/emailOtp.js";
import { getSupabaseConfiguration, supabaseHeaders } from "../../lib/supabaseAdmin.js";
import { getAnalyticsOverview } from "../../lib/googleAnalytics.js";
import { getConsultation } from "../../lib/calendly.js";

const statuses = new Set(["new", "contacted", "scheduled", "completed", "closed"]);

export default async function handler(request, response) {
  let admin;
  try { admin = await requireAdmin(request); } catch { admin = null; }
  if (!admin) return sendJson(response, 401, { message: "Admin authentication required." });

  if (request.method === "GET" && request.query?.view === "analytics") {
    try {
      response.setHeader("Cache-Control", "private, max-age=300");
      return sendJson(response, 200, { analytics: await getAnalyticsOverview(request) });
    } catch (error) {
      console.error("Google Analytics report failed", { message: error?.message });
      return sendJson(response, 503, { message: error?.message || "Google Analytics reports are temporarily unavailable." });
    }
  }

  const { url, secretKey } = getSupabaseConfiguration();
  if (!url || !secretKey) return sendJson(response, 503, { message: "Lead storage is temporarily unavailable." });

  if (request.method === "GET") {
    const databaseResponse = await fetch(`${url}/rest/v1/consultation_leads?select=*&order=created_at.desc&limit=200`, {
      headers: supabaseHeaders(secretKey),
    });
    if (!databaseResponse.ok) return sendJson(response, 502, { message: "Leads could not be loaded." });
    const leads = await databaseResponse.json();
    const bookings = new Map();
    await Promise.all(leads.map(async (lead) => {
      const uri = lead.calendly_event_uri;
      if (!uri) return;
      if (!bookings.has(uri)) bookings.set(uri, getConsultation(uri));
      lead.consultation = await bookings.get(uri);
    }));
    return sendJson(response, 200, { leads });
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

  if (request.method === "DELETE") {
    const id = typeof request.body?.id === "string" ? request.body.id : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return sendJson(response, 400, { message: "Invalid lead identifier." });
    const databaseResponse = await fetch(`${url}/rest/v1/consultation_leads?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: supabaseHeaders(secretKey, { Prefer: "return=representation" }),
    });
    if (!databaseResponse.ok) return sendJson(response, 502, { message: "The record could not be deleted. Please try again." });
    const rows = await databaseResponse.json().catch(() => []);
    if (!rows.length) return sendJson(response, 404, { message: "This record no longer exists." });
    return sendJson(response, 200, { deleted: true, id });
  }

  response.setHeader("Allow", "GET, PATCH, DELETE");
  return sendJson(response, 405, { message: "Method not allowed." });
}
