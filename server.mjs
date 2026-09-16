import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import adminLeads from "./api/admin/leads.js";
import adminLogin from "./api/admin/login.js";
import adminLogout from "./api/admin/logout.js";
import adminRecover from "./api/admin/recover.js";
import adminResetPassword from "./api/admin/reset-password.js";
import adminSession from "./api/admin/session.js";
import articles from "./api/articles.js";
import emailSendOtp from "./api/auth/email/send-otp.js";
import emailVerifyOtp from "./api/auth/email/verify-otp.js";
import phoneOtp from "./api/auth/phone.js";
import calculator from "./api/calculator.js";
import financialAssessments from "./api/financial-assessments.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(root, "dist");
const port = Number(process.env.PORT || 3000);
const maxBodyBytes = 1024 * 1024;

const handlers = new Map([
  ["/api/admin/leads", adminLeads],
  ["/api/admin/login", adminLogin],
  ["/api/admin/logout", adminLogout],
  ["/api/admin/recover", adminRecover],
  ["/api/admin/reset-password", adminResetPassword],
  ["/api/admin/session", adminSession],
  ["/api/articles", articles],
  ["/api/auth/email/send-otp", emailSendOtp],
  ["/api/auth/email/verify-otp", emailVerifyOtp],
  ["/api/auth/phone", phoneOtp],
  ["/api/calculator", calculator],
  ["/api/financial-assessments", financialAssessments],
]);

const mime = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function sendFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  response.statusCode = 200;
  response.setHeader("Content-Type", mime[extension] || "application/octet-stream");
  if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
  fs.createReadStream(filePath).on("error", () => {
    if (!response.headersSent) response.statusCode = 500;
    response.end();
  }).pipe(response);
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new Error("Request body is too large.");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

async function handleApi(request, response, url) {
  const handler = handlers.get(url.pathname);
  if (!handler) {
    response.statusCode = 404;
    return response.end(JSON.stringify({ message: "API route not found." }));
  }
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.status = (statusCode) => {
    response.statusCode = statusCode;
    return response;
  };
  response.json = (body) => {
    if (!response.writableEnded) response.end(JSON.stringify(body));
    return response;
  };
  request.query = Object.fromEntries(url.searchParams.entries());
  try {
    request.body = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) ? await readBody(request) : {};
    await handler(request, response);
  } catch (error) {
    console.error("API request failed", { path: url.pathname, message: error?.message || "Unknown error" });
    if (!response.headersSent) response.statusCode = error?.message === "Request body is too large." ? 413 : 500;
    if (!response.writableEnded) response.end(JSON.stringify({ message: "The request could not be completed." }));
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) return handleApi(request, response, url);

  const decodedPath = decodeURIComponent(url.pathname);
  const requested = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const candidate = path.join(publicRoot, requested === "/" ? "index.html" : requested);
  if (candidate.startsWith(publicRoot) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return sendFile(response, candidate);
  }
  return sendFile(response, path.join(publicRoot, "index.html"));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Moneze web and API server listening on http://127.0.0.1:${port}`);
});
