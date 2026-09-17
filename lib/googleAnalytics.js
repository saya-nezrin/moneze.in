import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

const encodeBase64Url = (value) => Buffer.from(value).toString("base64url");

async function getServiceAccountAccessToken(clientEmail) {
  const encodedKey = process.env.GA_PRIVATE_KEY_BASE64;
  const privateKey = encodedKey
    ? Buffer.from(encodedKey, "base64").toString("utf8")
    : process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${encodeBase64Url(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const assertion = `${unsignedToken}.${signer.sign(privateKey, "base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new Error("Google Analytics service-account authentication failed.");
  return payload.access_token;
}

async function refreshAuthorizedUser(credentials) {
  if (!credentials.client_id || !credentials.client_secret || !credentials.refresh_token) {
    throw new Error("Google Analytics user credentials are incomplete.");
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: credentials.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new Error("Google Analytics user authentication failed.");
  return payload.access_token;
}

async function getAuthorizedUserAccessToken() {
  const credentialsPath = process.env.GA_ADC_PATH;
  if (!credentialsPath) return null;
  const credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
  if (credentials.type === "authorized_user") return refreshAuthorizedUser(credentials);
  if (credentials.type === "impersonated_service_account") {
    const sourceAccessToken = await refreshAuthorizedUser(credentials.source_credentials || {});
    if (!credentials.service_account_impersonation_url) {
      throw new Error("Google Analytics service-account impersonation is incomplete.");
    }
    const response = await fetch(credentials.service_account_impersonation_url, {
      method: "POST",
      headers: { Authorization: `Bearer ${sourceAccessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        delegates: credentials.delegates || [],
        scope: ["https://www.googleapis.com/auth/analytics.readonly"],
        lifetime: "3600s",
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.accessToken) {
      throw new Error(payload?.error?.message || "Google Analytics service-account impersonation failed.");
    }
    return payload.accessToken;
  }
  throw new Error("Google Analytics credential type is unsupported.");
}

async function getAccessToken(request) {
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  if (clientEmail) {
    const serviceAccountToken = await getServiceAccountAccessToken(clientEmail);
    if (serviceAccountToken) return serviceAccountToken;
  }
  const authorizedUserToken = await getAuthorizedUserAccessToken();
  if (authorizedUserToken) return authorizedUserToken;

  if (!clientEmail) throw new Error("Google Analytics reporting access is not configured.");

  const audience = process.env.GCP_WORKLOAD_IDENTITY_PROVIDER;
  const oidcToken = request.headers?.["x-vercel-oidc-token"];
  if (!audience || !oidcToken) throw new Error("Google Analytics reporting access is not configured for this server.");
  const response = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audience, grantType: "urn:ietf:params:oauth:grant-type:token-exchange", requestedTokenType: "urn:ietf:params:oauth:token-type:access_token", scope: "https://www.googleapis.com/auth/cloud-platform", subjectTokenType: "urn:ietf:params:oauth:token-type:jwt", subjectToken: oidcToken }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new Error("Google Analytics identity exchange failed.");
  const tokenResponse = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(clientEmail)}:generateAccessToken`, {
    method: "POST",
    headers: { Authorization: `Bearer ${payload.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ scope: ["https://www.googleapis.com/auth/analytics.readonly"], lifetime: "3600s" }),
  });
  const token = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !token.accessToken) throw new Error("Google Analytics read-only access could not be granted.");
  return token.accessToken;
}

const metricValue = (report, index) => Number(report?.rows?.[0]?.metricValues?.[index]?.value || 0);

export async function getAnalyticsOverview(request) {
  const propertyId = process.env.GA_PROPERTY_ID || "554231468";
  const accessToken = await getAccessToken(request);
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [
      { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews", "eventCount"].map((name) => ({ name })) },
      { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "country" }, { name: "city" }, { name: "deviceCategory" }, { name: "sessionDefaultChannelGroup" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }], orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: "100" },
      { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: "6" },
      { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: "10000" },
      { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "eventName" }, { name: "pageLocation" }], metrics: [{ name: "eventCount" }, { name: "totalUsers" }], orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: "10000" },
    ] }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || "Google Analytics reports could not be loaded.");
  const [summary, visitors, pages, events, activity] = payload.reports || [];
  return {
    period: "Last 30 days",
    summary: { activeUsers: metricValue(summary, 0), newUsers: metricValue(summary, 1), sessions: metricValue(summary, 2), pageViews: metricValue(summary, 3), events: metricValue(summary, 4) },
    visitors: (visitors?.rows || []).map((row) => ({ country: row.dimensionValues?.[0]?.value, city: row.dimensionValues?.[1]?.value, device: row.dimensionValues?.[2]?.value, channel: row.dimensionValues?.[3]?.value, users: Number(row.metricValues?.[0]?.value || 0), sessions: Number(row.metricValues?.[1]?.value || 0) })),
    pages: (pages?.rows || []).map((row) => ({ path: row.dimensionValues?.[0]?.value || "/", views: Number(row.metricValues?.[0]?.value || 0), users: Number(row.metricValues?.[1]?.value || 0) })),
    events: (events?.rows || []).map((row) => ({ name: row.dimensionValues?.[0]?.value || "", count: Number(row.metricValues?.[0]?.value || 0) })),
    activity: (activity?.rows || []).map((row) => ({ name: row.dimensionValues?.[0]?.value || "", page: row.dimensionValues?.[1]?.value || "", count: Number(row.metricValues?.[0]?.value || 0), users: Number(row.metricValues?.[1]?.value || 0) })),
  };
}
