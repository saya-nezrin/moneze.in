import { isValidEmail, readCookie, requirePost, sendJson, verifyVerificationSession } from "../lib/emailOtp.js";

const allowedStatuses = new Set(["complete"]);

function cleanText(value, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return;

  let session;
  try {
    session = verifyVerificationSession(readCookie(request, "moneze_verified"));
  } catch {
    session = null;
  }
  if (!session || !isValidEmail(session.email)) {
    return sendJson(response, 401, { message: "Please verify your email again before submitting." });
  }

  const body = cleanObject(request.body);
  const answers = cleanObject(body.answers);
  const goals = cleanObject(body.goals);
  const name = cleanText(answers.name || body.profile?.name, 120);
  const investmentRange = cleanText(body.profile?.investmentRange, 80);
  const assessmentStatus = cleanText(body.assessmentStatus, 30);
  if (name.length < 2 || !body.consentAccepted || !allowedStatuses.has(assessmentStatus)) {
    return sendJson(response, 400, { message: "Complete the required information and consent before submitting." });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase configuration is incomplete");
    return sendJson(response, 503, { message: "Submission storage is temporarily unavailable." });
  }

  const record = {
    name,
    email: session.email,
    email_verified: true,
    investment_range: investmentRange || null,
    assessment_data: { answers: { ...answers, email: session.email }, goals },
    consultation_scheduled: Boolean(body.consultationScheduled),
    calendly_event_uri: cleanText(body.calendlyEventUri, 500) || null,
    status: "new",
    consent_at: new Date().toISOString(),
  };

  try {
    const databaseHeaders = {
      apikey: supabaseKey,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
    // Legacy service-role keys are JWTs; new sb_secret_* keys must only be
    // sent through the apikey header.
    if (!supabaseKey.startsWith("sb_secret_")) {
      databaseHeaders.Authorization = `Bearer ${supabaseKey}`;
    }
    const databaseResponse = await fetch(`${supabaseUrl}/rest/v1/consultation_leads`, {
      method: "POST",
      headers: databaseHeaders,
      body: JSON.stringify(record),
    });
    if (!databaseResponse.ok) {
      console.error("Supabase assessment insert failed", { status: databaseResponse.status });
      return sendJson(response, 502, { message: "Your assessment could not be saved. Please try again." });
    }
    const rows = await databaseResponse.json().catch(() => []);
    return sendJson(response, 201, { saved: true, submissionId: rows[0]?.id || null });
  } catch (error) {
    console.error("Assessment storage failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return sendJson(response, 502, { message: "Your assessment could not be saved. Please try again." });
  }
}
