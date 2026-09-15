import { getSupabaseConfiguration, supabaseHeaders } from "../lib/supabaseAdmin.js";

// Vercel calls this once a day so the Supabase project receives activity.
// It reads only one row's id and never exposes database content.
export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).json({ message: "Method not allowed." });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.authorization !== `Bearer ${cronSecret}`) {
    return response.status(401).json({ message: "Unauthorized." });
  }

  const { url, secretKey } = getSupabaseConfiguration();
  if (!url || !secretKey) return response.status(503).json({ message: "Supabase configuration is incomplete." });

  try {
    const databaseResponse = await fetch(`${url}/rest/v1/consultation_leads?select=id&limit=1`, {
      headers: supabaseHeaders(secretKey),
    });
    if (!databaseResponse.ok) return response.status(502).json({ message: "Supabase health check failed." });
    return response.status(200).json({ ok: true });
  } catch {
    return response.status(502).json({ message: "Supabase health check failed." });
  }
}
