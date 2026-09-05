import { requireAdmin } from "../../lib/adminAuth.js";
import { sendJson } from "../../lib/emailOtp.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { message: "Method not allowed." });
  }
  try {
    const admin = await requireAdmin(request);
    return admin ? sendJson(response, 200, { authenticated: true, email: admin.email }) : sendJson(response, 401, { authenticated: false });
  } catch {
    return sendJson(response, 401, { authenticated: false });
  }
}
