import crypto from "node:crypto";
import { createOtpRequest, isValidEmail, normalizeEmail, requirePost, sendJson } from "../../../lib/emailOtp.js";

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;

  const email = normalizeEmail(request.body?.email);
  if (!isValidEmail(email)) return sendJson(response, 400, { message: "Enter a valid email address." });

  const authKey = process.env.MSG91_AUTH_KEY;
  const domain = process.env.MSG91_EMAIL_DOMAIN;
  const fromEmail = process.env.MSG91_FROM_EMAIL;
  const templateId = process.env.MSG91_EMAIL_TEMPLATE_ID;
  const otpSecret = process.env.OTP_SECRET;
  if (!authKey || !domain || !fromEmail || !templateId || !otpSecret || otpSecret.length < 32) {
    console.error("Email OTP configuration is incomplete", {
      authKey: Boolean(authKey),
      domain: Boolean(domain),
      fromEmail: Boolean(fromEmail),
      templateId: Boolean(templateId),
      otpSecretValid: Boolean(otpSecret && otpSecret.length >= 32),
    });
    return sendJson(response, 503, { message: "Email verification is temporarily unavailable." });
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  try {
    // Create the signed verification request before sending the email. This
    // prevents delivery of an OTP that the application cannot later verify.
    const requestId = createOtpRequest(email, otp);
    const msg91Response = await fetch("https://control.msg91.com/api/v5/email/send", {
      method: "POST",
      headers: {
        accept: "application/json",
        authkey: authKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        recipients: [{ to: [{ name: "Moneze user", email }], variables: { otp } }],
        from: { name: "Moneze", email: fromEmail },
        domain,
        template_id: templateId,
      }),
    });

    if (!msg91Response.ok) {
      console.error("MSG91 email request failed", { status: msg91Response.status });
      return sendJson(response, 502, { message: "We could not send the verification email. Please try again." });
    }

    return sendJson(response, 200, { requestId });
  } catch (error) {
    console.error("Email OTP delivery failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return sendJson(response, 502, { message: "We could not send the verification email. Please try again." });
  }
}
