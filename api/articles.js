import { sendJson } from "../lib/emailOtp.js";
import { getSupabaseConfiguration, supabaseHeaders } from "../lib/supabaseAdmin.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { message: "Method not allowed." });
  }

  const { url, secretKey } = getSupabaseConfiguration();
  if (!url || !secretKey) return sendJson(response, 503, { message: "Articles are temporarily unavailable." });
  const slug = typeof request.query?.slug === "string" ? request.query.slug.trim().slice(0, 180) : "";
  const params = new URLSearchParams({
    select: "slug,title,excerpt,category,content,published_at,featured,meta_title,meta_description,focus_keyword",
    published: "eq.true",
    order: "featured.desc,published_at.desc",
    limit: slug ? "1" : "100"
  });
  if (slug) params.set("slug", `eq.${slug}`);

  try {
    const databaseResponse = await fetch(`${url}/rest/v1/articles?${params}`, { headers: supabaseHeaders(secretKey) });
    if (!databaseResponse.ok) {
      console.error("Supabase article query failed", { status: databaseResponse.status });
      return sendJson(response, 502, { message: "Articles could not be loaded." });
    }
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
    return response.status(200).json({ articles: await databaseResponse.json() });
  } catch {
    return sendJson(response, 503, { message: "Articles are temporarily unavailable." });
  }
}
