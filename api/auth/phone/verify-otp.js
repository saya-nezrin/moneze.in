import { createPhoneVerificationSession, isValidIndianPhone, normalizeIndianPhone, requirePost, sendJson } from "../../../lib/emailOtp.js";

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;

  const phone = normalizeIndianPhone(request.body?.phone);
  const otp = typeof request.body?.otp === "string" ? request.body.otp.trim() : "";
  if (!isValidIndianPhone(phone) || !/^\d{6}$/.test(otp)) {
    return sendJson(response, 400, { verified: false, message: "Invalid verification request." });
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) return sendJson(response, 503, { verified: false, message: "Mobile verification is temporarily unavailable." });

  try {
    const url = new URL("https://control.msg91.com/api/v5/otp/verify");
    url.searchParams.set("otp", otp);
    url.searchParams.set("mobile", `91${phone}`);
    const msg91Response = await fetch(url, { headers: { accept: "application/json", authkey: authKey } });
    const payload = await msg91Response.json().catch(() => ({}));
    const message = String(payload.message || "").toLowerCase();
    const verified = msg91Response.ok && (payload.type === "success" || message.includes("verified success"));
    if (!verified) return sendJson(response, 400, { verified: false, message: payload.message || "The verification code is incorrect." });

    const session = createPhoneVerificationSession(phone);
    response.setHeader("Set-Cookie", `moneze_verified=${encodeURIComponent(session)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=7200`);
    return sendJson(response, 200, { verified: true });
  } catch (error) {
    console.error("Mobile OTP verification failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return sendJson(response, 503, { verified: false, message: "Mobile verification is temporarily unavailable." });
  }
}
