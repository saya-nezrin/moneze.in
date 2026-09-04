import { createVerificationSession, isValidEmail, normalizeEmail, requirePost, sendJson, verifyOtpRequest } from "../../../lib/emailOtp.js";

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;

  const email = normalizeEmail(request.body?.email);
  const otp = typeof request.body?.otp === "string" ? request.body.otp.trim() : "";
  const requestId = request.body?.requestId;
  if (!isValidEmail(email) || !/^\d{6}$/.test(otp) || typeof requestId !== "string") {
    return sendJson(response, 400, { verified: false, message: "Invalid verification request." });
  }

  try {
    const result = verifyOtpRequest(requestId, email, otp);
    if (result.reason === "expired") {
      return sendJson(response, 400, { verified: false, message: "This code has expired. Request a new OTP." });
    }
    if (!result.valid) {
      return sendJson(response, 400, { verified: false, message: "The verification code is incorrect." });
    }
    const session = createVerificationSession(email);
    response.setHeader("Set-Cookie", `moneze_verified=${encodeURIComponent(session)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=7200`);
    return sendJson(response, 200, { verified: true });
  } catch (error) {
    console.error("Email OTP verification failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return sendJson(response, 503, { verified: false, message: "Email verification is temporarily unavailable." });
  }
}
