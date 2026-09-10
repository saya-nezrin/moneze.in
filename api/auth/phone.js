import { createPhoneVerificationSession, isValidIndianPhone, normalizeIndianPhone, requirePost, sendJson } from "../../lib/emailOtp.js";

async function sendOtp(phone, response) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_SMS_TEMPLATE_ID;
  if (!authKey || !templateId) {
    console.error("SMS OTP configuration is incomplete", { authKey: Boolean(authKey), templateId: Boolean(templateId) });
    return sendJson(response, 503, { message: "Mobile verification is temporarily unavailable." });
  }

  try {
    const configuredExpirySeconds = Number.parseInt(process.env.OTP_EXPIRY_SECONDS || "600", 10);
    const expiryMinutes = Math.max(1, Math.min(30, Math.ceil(configuredExpirySeconds / 60)));
    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", templateId);
    url.searchParams.set("mobile", `91${phone}`);
    url.searchParams.set("authkey", authKey);
    url.searchParams.set("otp_length", "6");
    url.searchParams.set("otp_expiry", String(expiryMinutes));
    const msg91Response = await fetch(url, { method: "POST", headers: { accept: "application/json" } });
    const payload = await msg91Response.json().catch(() => ({}));
    if (!msg91Response.ok || payload.type === "error") {
      console.error("MSG91 SMS request failed", { status: msg91Response.status, message: payload.message });
      return sendJson(response, 502, { message: "We could not send the mobile OTP. Please try again." });
    }
    return sendJson(response, 200, { requestId: phone });
  } catch (error) {
    console.error("SMS OTP delivery failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return sendJson(response, 502, { message: "We could not send the mobile OTP. Please try again." });
  }
}

async function verifyOtp(phone, otp, response) {
  if (!/^\d{6}$/.test(otp)) return sendJson(response, 400, { verified: false, message: "Invalid verification request." });
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

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;
  const phone = normalizeIndianPhone(request.body?.phone);
  if (!isValidIndianPhone(phone)) return sendJson(response, 400, { verified: false, message: "Enter a valid 10-digit Indian mobile number." });
  if (request.body?.action === "send") return sendOtp(phone, response);
  if (request.body?.action === "verify") {
    const otp = typeof request.body?.otp === "string" ? request.body.otp.trim() : "";
    return verifyOtp(phone, otp, response);
  }
  return sendJson(response, 400, { verified: false, message: "Invalid verification action." });
}
