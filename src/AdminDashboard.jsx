import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Download, ExternalLink, Eye, LogOut, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";

const leadStatuses = ["new", "contacted", "scheduled", "completed", "closed"];
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const formatFieldName = (value) => String(value).replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
const displayValue = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, item]) => {
      const formattedItem = key.toLowerCase().includes("amount") && !Number.isNaN(Number(item))
        ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(item))
        : displayValue(item);
      return `${formatFieldName(key)}: ${formattedItem}`;
    }).join(" • ");
  }
  return value === null || value === undefined || value === "" ? "—" : String(value);
};
const assessmentLabels = { childAges: "Children’s ages", monthlyIncome: "Monthly take-home income", otherIncome: "Monthly other income", householdExpenses: "Monthly household expenses", emiLoans: "Monthly loan EMIs", monthlySurplus: "Monthly surplus", emergencyFund: "Savings / emergency funds", investmentTypes: "Existing investment types", investmentValue: "Total existing investment value", existingSip: "Current monthly SIP / investments", chittyMonthlyAmount: "Monthly Chitty amount", chittyStatus: "Chitty status", healthInsurance: "Health insurance cover", termInsurance: "Term insurance cover", sipCapacity: "Future monthly investment capacity", marketFallResponse: "Response to investment decline", goalUncertain: "No specific goal / unsure" };
const moneyFields = new Set(["monthlyIncome", "otherIncome", "householdExpenses", "emiLoans", "monthlySurplus", "emergencyFund", "investmentValue", "existingSip", "chittyMonthlyAmount", "healthInsurance", "termInsurance", "sipCapacity"]);
const formatAnswer = (key, value) => moneyFields.has(key) && value !== "" && value != null ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value)) : key === "childAges" && Array.isArray(value) ? value.map((age, index) => `Child ${index + 1}: ${age} years`).join(" • ") || "—" : displayValue(value);
const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const getLeadPhone = (lead) => lead.assessment_data?.answers?.phone || "";
const getLeadEmail = (lead) => lead.email?.endsWith("@mobile.moneze.invalid") ? "" : lead.email;

export default function AdminDashboard() {
  const recoveryParams = new URLSearchParams(window.location.hash.slice(1));
  const recoveryToken = recoveryParams.get("access_token");
  const recoveryError = recoveryParams.get("error_description");
  const [session, setSession] = useState({ state: "checking", email: "" });
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [recoveryMode, setRecoveryMode] = useState(Boolean(new URLSearchParams(window.location.search).has("admin-recovery")));
  const [recoverySent, setRecoverySent] = useState(false);
  const [newPassword, setNewPassword] = useState({ password: "", confirm: "" });
  const [leads, setLeads] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({ state: "loading", data: null, message: "" });
  const [deletingIds, setDeletingIds] = useState([]);

  const loadLeads = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/leads");
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Leads could not be loaded.");
      setLeads(payload.leads || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalytics((current) => ({ ...current, state: "loading", message: "" }));
    try {
      const response = await fetch("/api/admin/leads?view=analytics");
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Analytics could not be loaded.");
      setAnalytics({ state: "ready", data: payload.analytics, message: "" });
    } catch (error) {
      setAnalytics({ state: "error", data: null, message: error.message });
    }
  };

  useEffect(() => {
    fetch("/api/admin/session").then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.authenticated) {
        setSession({ state: "authenticated", email: payload.email });
        return;
      }
      setSession({ state: "anonymous", email: "" });
    }).catch(() => setSession({ state: "anonymous", email: "" }));
  }, []);

  useEffect(() => { if (session.state === "authenticated") { loadLeads(); loadAnalytics(); } }, [session.state]);

  const filteredLeads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesQuery = !needle || [lead.name, lead.email, getLeadPhone(lead), lead.investment_range].some((value) => String(value || "").toLowerCase().includes(needle));
      return matchesStatus && matchesQuery;
    });
  }, [leads, query, statusFilter]);

  const login = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Login failed.");
      setCredentials({ email: "", password: "" });
      setSession({ state: "authenticated", email: payload.email });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const requestRecovery = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/recover", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: credentials.email }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Recovery email could not be sent.");
      setRecoverySent(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setMessage("");
    if (newPassword.password.length < 10) return setMessage("Use a password with at least 10 characters.");
    if (newPassword.password !== newPassword.confirm) return setMessage("The passwords do not match.");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: recoveryToken, password: newPassword.password }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Password could not be updated.");
      setMessage("Password updated. You can now sign in.");
      setNewPassword({ password: "", confirm: "" });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setLeads([]);
    setSelectedLead(null);
    setSession({ state: "anonymous", email: "" });
  };

  const updateStatus = async (lead, status) => {
    setMessage("");
    try {
      const response = await fetch("/api/admin/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: lead.id, status }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Status update failed.");
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status, updated_at: new Date().toISOString() } : item));
      setSelectedLead((current) => current?.id === lead.id ? { ...current, status } : current);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteLead = async (lead) => {
    if (!window.confirm(`Delete ${lead.name}’s record and financial assessment? This cannot be undone. This does not cancel their Calendly booking.`)) return;
    setDeletingIds((current) => [...current, lead.id]);
    try {
      const response = await fetch("/api/admin/leads", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: lead.id }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "The record could not be deleted.");
      setLeads((current) => current.filter((item) => item.id !== lead.id));
      setSelectedLead((current) => current?.id === lead.id ? null : current);
      setMessage("Record deleted.");
    } catch (error) { setMessage(error.message); }
    finally { setDeletingIds((current) => current.filter((id) => id !== lead.id)); }
  };

  const exportCsv = () => {
    const answerKeys = [...new Set(filteredLeads.flatMap((lead) => Object.keys(lead.assessment_data?.answers || {})))];
    const header = ["Name", "Email", "Mobile number", "Investment range", "Status", "Consultation scheduled", "Consultation date/time", "Created", ...answerKeys.map((key) => assessmentLabels[key] || formatFieldName(key)), "Goals", "Consent date"];
    const rows = filteredLeads.map((lead) => [lead.name, getLeadEmail(lead), getLeadPhone(lead), lead.investment_range, lead.status, lead.consultation_scheduled ? "Yes" : "No", lead.consultation?.startTime || "", lead.created_at, ...answerKeys.map((key) => formatAnswer(key, lead.assessment_data?.answers?.[key])), displayValue(lead.assessment_data?.goals), lead.consent_at]);
    const blob = new Blob([[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `moneze-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (recoveryToken || recoveryError) {
    return <main className="admin-login-page"><a className="admin-back-home" href="/#admin"><ArrowLeft size={18} /> Back to sign in</a><form className="admin-login-card" onSubmit={resetPassword}><img src="/moneze-logo.png" alt="Moneze" /><span className="admin-shield"><ShieldCheck size={28} /></span><h1>Set a new password</h1><p>Create a new password for your authorised admin account.</p>{recoveryError ? <p className="admin-error" role="alert">This recovery link is invalid or expired. Request a new one from the admin login page.</p> : <><label>New password<input type="password" autoComplete="new-password" minLength={10} required value={newPassword.password} onChange={(event) => setNewPassword((current) => ({ ...current, password: event.target.value }))} /></label><label>Confirm new password<input type="password" autoComplete="new-password" minLength={10} required value={newPassword.confirm} onChange={(event) => setNewPassword((current) => ({ ...current, confirm: event.target.value }))} /></label>{message && <p className={message.startsWith("Password updated") ? "admin-success" : "admin-error"} role="status">{message}</p>}<button type="submit" disabled={loading}>{loading ? "Updating…" : "Update password"}</button>{message.startsWith("Password updated") && <a className="admin-login-secondary" href="/#admin">Continue to sign in</a>}</>}</form></main>;
  }

  if (session.state === "checking") return <div className="admin-loading"><RefreshCw className="admin-spin" /> Checking admin access…</div>;

  if (session.state === "anonymous") {
    return <main className="admin-login-page"><a className="admin-back-home" href="#home"><ArrowLeft size={18} /> Back to website</a><form className="admin-login-card" onSubmit={recoveryMode ? requestRecovery : login}><img src="/moneze-logo.png" alt="Moneze" /><span className="admin-shield"><ShieldCheck size={28} /></span><h1>{recoveryMode ? "Recover password" : "Admin dashboard"}</h1><p>{recoveryMode ? "Enter your authorised admin email. We’ll send a secure recovery link." : "Sign in with your authorised Supabase admin account."}</p>{recoverySent ? <><p className="admin-success" role="status">If this is an authorised admin email, a recovery link has been sent. Check your inbox and spam folder.</p><button className="admin-login-secondary" type="button" onClick={() => { setRecoveryMode(false); setRecoverySent(false); setMessage(""); }}>Back to sign in</button></> : <><label>Email address<input type="email" autoComplete="username" required value={credentials.email} onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))} /></label>{!recoveryMode && <label>Password<input type="password" autoComplete="current-password" required value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} /></label>}{message && <p className="admin-error" role="alert">{message}</p>}<button type="submit" disabled={loading}>{loading ? "Please wait…" : recoveryMode ? "Send recovery link" : "Sign in securely"}</button><button className="admin-forgot" type="button" onClick={() => { setRecoveryMode((current) => !current); setMessage(""); }}>{recoveryMode ? "Back to sign in" : "Forgot password?"}</button></>}</form></main>;
  }

  return <main className="admin-page">
    <header className="admin-header"><a href="#home"><img src="/moneze-logo.png" alt="Moneze" /></a><div><span>{session.email}</span><button type="button" onClick={logout}><LogOut size={17} /> Logout</button></div></header>
    <section className="admin-container">
      <div className="admin-title"><div><p>ADMIN CONSOLE</p><h1>Consultation leads</h1><span>Review verified customer submissions and assessment details.</span></div><div className="admin-title-actions"><button type="button" onClick={() => { loadLeads(); loadAnalytics(); }} disabled={loading}><RefreshCw className={loading ? "admin-spin" : ""} size={18} /> Refresh</button><button type="button" onClick={exportCsv} disabled={!filteredLeads.length}><Download size={18} />Export CSV</button></div></div>
      <section className="admin-analytics-card" aria-labelledby="admin-analytics-title">
        <div className="admin-analytics-icon"><BarChart3 size={26} /></div>
        <div><p>GOOGLE ANALYTICS · LAST 30 DAYS</p><h2 id="admin-analytics-title">Website performance</h2><span>Live reporting from the Moneze GA4 property.</span></div>
        <a href="https://analytics.google.com/analytics/web/#/a408078035p554231468/reports/intelligenthome" target="_blank" rel="noreferrer">Open Analytics <ExternalLink size={17} /></a>
      </section>
      {analytics.state === "loading" && <div className="admin-analytics-loading"><RefreshCw className="admin-spin" size={18} /> Loading Google Analytics…</div>}
      {analytics.state === "error" && <div className="admin-analytics-error"><strong>Analytics reports unavailable.</strong><span>{analytics.message}</span></div>}
      {analytics.data && <><div className="admin-ga-stats">{[["Active users", analytics.data.summary.activeUsers], ["New users", analytics.data.summary.newUsers], ["Sessions", analytics.data.summary.sessions], ["Page views", analytics.data.summary.pageViews], ["Events", analytics.data.summary.events]].map(([label, value]) => <article key={label}><span>{label}</span><strong>{Number(value).toLocaleString("en-IN")}</strong></article>)}</div><section className="admin-ga-pages"><div><p>TOP CONTENT</p><h2>Most viewed pages</h2></div>{analytics.data.pages.length ? <div>{analytics.data.pages.map((page) => <article key={page.path}><span title={page.path}>{page.path}</span><strong>{page.views.toLocaleString("en-IN")} views</strong><small>{page.users.toLocaleString("en-IN")} users</small></article>)}</div> : <p className="admin-ga-empty">Google Analytics is collecting data. Page reports will appear here once processing is complete.</p>}</section></>}
      <div className="admin-stats"><article><Users size={24} /><div><strong>{leads.length}</strong><span>Total leads</span></div></article>{leadStatuses.slice(0, 3).map((status) => <article key={status}><div><strong>{leads.filter((lead) => lead.status === status).length}</strong><span>{status}</span></div></article>)}</div>
      <div className="admin-toolbar"><label><Search size={18} /><input aria-label="Search leads" placeholder="Search name, email, mobile or investment range" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{leadStatuses.map((status) => <option key={status}>{status}</option>)}</select></div>
      {message && <p className="admin-error" role="alert">{message}</p>}
<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Customer</th><th>Mobile number</th><th>Investment range</th><th>Consultation</th><th>Submitted</th><th>Status</th><th>Details</th><th>Delete</th></tr></thead><tbody>{filteredLeads.map((lead) => <tr key={lead.id}><td><strong>{lead.name}</strong><span>{lead.email}</span></td><td>{getLeadPhone(lead) ? <a className="admin-phone-link" href={`tel:+91${getLeadPhone(lead)}`}>+91 {getLeadPhone(lead)}</a> : "—"}</td><td>{lead.investment_range || "—"}</td><td>{lead.consultation?.startTime ? <><strong>{formatDate(lead.consultation.startTime)}</strong><span>{lead.consultation.status === "canceled" ? "Cancelled" : "Online consultation"}</span></> : lead.calendly_event_uri || lead.consultation_scheduled ? "Booked · time sync pending" : "Not confirmed"}</td><td>{formatDate(lead.created_at)}</td><td><select value={lead.status} onChange={(event) => updateStatus(lead, event.target.value)}>{leadStatuses.map((status) => <option key={status}>{status}</option>)}</select></td><td><button className="admin-view" type="button" onClick={() => setSelectedLead(lead)}><Eye size={17} />View</button></td><td><button className="admin-delete" type="button" disabled={deletingIds.includes(lead.id)} onClick={() => deleteLead(lead)} aria-label={`Delete ${lead.name} record`}>{deletingIds.includes(lead.id) ? "Deleting…" : "Delete"}</button></td></tr>)}</tbody></table>{!loading && !filteredLeads.length && <div className="admin-empty">No matching consultation leads.</div>}</div>
    </section>
{selectedLead && <div className="admin-detail-overlay" onClick={() => setSelectedLead(null)}><aside className="admin-detail" onClick={(event) => event.stopPropagation()}><button className="admin-detail-close" onClick={() => setSelectedLead(null)} aria-label="Close details">×</button><p>VERIFIED LEAD</p><h2>{selectedLead.name}</h2><div className="admin-detail-contacts">{getLeadEmail(selectedLead) && <a href={`mailto:${getLeadEmail(selectedLead)}`}>{getLeadEmail(selectedLead)}</a>}{getLeadPhone(selectedLead) && <a href={`tel:+91${getLeadPhone(selectedLead)}`}>+91 {getLeadPhone(selectedLead)}</a>}</div><div className="admin-detail-meta"><span>Investment range<strong>{selectedLead.investment_range || "—"}</strong></span><span>Submitted<strong>{formatDate(selectedLead.created_at)}</strong></span></div><h3>Financial assessment</h3><div className="admin-answer-list">{Object.entries(selectedLead.assessment_data?.answers || {}).map(([key, value]) => <div key={key}><span>{assessmentLabels[key] || formatFieldName(key)}</span><strong>{formatAnswer(key, value)}</strong></div>)}</div><h3>Goals</h3><div className="admin-answer-list">{Object.entries(selectedLead.assessment_data?.goals || {}).map(([key, value]) => <div key={key}><span>{formatFieldName(key)}</span><strong>{displayValue(value)}</strong></div>)}{!Object.keys(selectedLead.assessment_data?.goals || {}).length && <span>No goals selected.</span>}</div></aside></div>}
  </main>;
}
