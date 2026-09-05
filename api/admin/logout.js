import { requirePost, sendJson } from "../../lib/emailOtp.js";

export default function handler(request, response) {
  if (!requirePost(request, response)) return;
  response.setHeader("Set-Cookie", "moneze_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
  return sendJson(response, 200, { authenticated: false });
}
