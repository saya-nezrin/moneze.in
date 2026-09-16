import { requireAdmin } from "../../lib/adminAuth.js";
import { sendJson } from "../../lib/emailOtp.js";
import { getAnalyticsOverview } from "../../lib/googleAnalytics.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { message: "Method not allowed." });
  }
  let admin;
  try { admin = await requireAdmin(request); } catch { admin = null; }
  if (!admin) return sendJson(response, 401, { message: "Admin authentication required." });
  try {
    response.setHeader("Cache-Control", "private, max-age=300");
    return sendJson(response, 200, { analytics: await getAnalyticsOverview(request) });
  } catch (error) {
    console.error("Google Analytics report failed", { message: error?.message });
    return sendJson(response, 503, { message: error?.message || "Google Analytics reports are temporarily unavailable." });
  }
}
