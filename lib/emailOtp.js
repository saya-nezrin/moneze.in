import crypto from "node:crypto";

const DEFAULT_EXPIRY_SECONDS = 600;
const SESSION_EXPIRY_SECONDS = 2 * 60 * 60;

export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSecret() {
  const secret = process.env.OTP_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("OTP_SECRET must contain at least 32 characters.");
  }
  return secret;
}

function digest(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createVerificationSession(email) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ email, issuedAt: now, expiresAt: now + SESSION_EXPIRY_SECONDS })).toString("base64url");
  return `${payload}.${digest(`session:${payload}`)}`;
}

export function verifyVerificationSession(token) {
  if (typeof token !== "string" || token.length > 2048) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const supplied = Buffer.from(signature);
  const expected = Buffer.from(digest(`session:${payload}`));
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!isValidEmail(session.email) || session.expiresAt < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function readCookie(request, name) {
  const cookies = typeof request.headers?.cookie === "string" ? request.headers.cookie.split(";") : [];
  const match = cookies.map((cookie) => cookie.trim().split("=")).find(([key]) => key === name);
  return match ? decodeURIComponent(match.slice(1).join("=")) : null;
}

export function createOtpRequest(email, otp) {
  const now = Math.floor(Date.now() / 1000);
  const configuredExpiry = Number.parseInt(process.env.OTP_EXPIRY_SECONDS || "", 10);
  const expirySeconds = Number.isFinite(configuredExpiry) ? Math.min(Math.max(configuredExpiry, 120), 1800) : DEFAULT_EXPIRY_SECONDS;
  const salt = crypto.randomBytes(18).toString("base64url");
  const payload = {
    emailHash: digest(`email:${email}`),
    otpHash: digest(`otp:${email}:${salt}:${otp}`),
    salt,
    issuedAt: now,
    expiresAt: now + expirySeconds,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = digest(`request:${encodedPayload}`);
  return `${encodedPayload}.${signature}`;
}

export function verifyOtpRequest(requestId, email, otp) {
  if (typeof requestId !== "string" || requestId.length > 2048) return { valid: false, reason: "invalid" };
  const [encodedPayload, signature, extra] = requestId.split(".");
  if (!encodedPayload || !signature || extra) return { valid: false, reason: "invalid" };

  const expectedSignature = digest(`request:${encodedPayload}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false, reason: "invalid" };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    return { valid: false, reason: "invalid" };
  }

  if (!payload.expiresAt || payload.expiresAt < Math.floor(Date.now() / 1000)) {
    return { valid: false, reason: "expired" };
  }

  const suppliedEmailHash = Buffer.from(digest(`email:${email}`));
  const storedEmailHash = Buffer.from(payload.emailHash || "");
  const suppliedOtpHash = Buffer.from(digest(`otp:${email}:${payload.salt}:${otp}`));
  const storedOtpHash = Buffer.from(payload.otpHash || "");
  const emailMatches = suppliedEmailHash.length === storedEmailHash.length && crypto.timingSafeEqual(suppliedEmailHash, storedEmailHash);
  const otpMatches = suppliedOtpHash.length === storedOtpHash.length && crypto.timingSafeEqual(suppliedOtpHash, storedOtpHash);
  return { valid: emailMatches && otpMatches, reason: emailMatches && otpMatches ? "verified" : "incorrect" };
}

export function sendJson(response, status, body) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  return response.status(status).json(body);
}

export function requirePost(request, response) {
  if (request.method === "POST") return true;
  response.setHeader("Allow", "POST");
  sendJson(response, 405, { message: "Method not allowed." });
  return false;
}
