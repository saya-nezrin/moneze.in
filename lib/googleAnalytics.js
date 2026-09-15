async function getAccessToken(request) {
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const audience = process.env.GCP_WORKLOAD_IDENTITY_PROVIDER;
  const oidcToken = request.headers?.["x-vercel-oidc-token"];
  if (!clientEmail || !audience || !oidcToken) throw new Error("Google Analytics keyless reporting access is not configured.");
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
      { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "date" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }], orderBys: [{ dimension: { dimensionName: "date" } }] },
      { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: "6" },
      { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: "10" },
    ] }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || "Google Analytics reports could not be loaded.");
  const [summary, daily, pages, events] = payload.reports || [];
  return {
    period: "Last 30 days",
    summary: { activeUsers: metricValue(summary, 0), newUsers: metricValue(summary, 1), sessions: metricValue(summary, 2), pageViews: metricValue(summary, 3), events: metricValue(summary, 4) },
    daily: (daily?.rows || []).map((row) => ({ date: row.dimensionValues?.[0]?.value || "", users: Number(row.metricValues?.[0]?.value || 0), sessions: Number(row.metricValues?.[1]?.value || 0) })),
    pages: (pages?.rows || []).map((row) => ({ path: row.dimensionValues?.[0]?.value || "/", views: Number(row.metricValues?.[0]?.value || 0), users: Number(row.metricValues?.[1]?.value || 0) })),
    events: (events?.rows || []).map((row) => ({ name: row.dimensionValues?.[0]?.value || "", count: Number(row.metricValues?.[0]?.value || 0) })),
  };
}
