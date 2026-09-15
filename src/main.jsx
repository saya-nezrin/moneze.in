import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import { HamburgerRoute } from "./HamburgerPages.jsx";
import "./styles.css";

const trackPageView = () => {
  if (window.location.hash === "#admin" || new URLSearchParams(window.location.search).has("admin-recovery")) return;
  window.gtag?.("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
  });
};

const instrumentHistory = () => {
  ["pushState", "replaceState"].forEach((method) => {
    const original = window.history[method];
    window.history[method] = function trackedHistoryChange(...args) {
      const result = original.apply(this, args);
      trackPageView();
      return result;
    };
  });
  window.addEventListener("hashchange", trackPageView);
  window.addEventListener("popstate", trackPageView);
  trackPageView();
};

const instrumentEngagement = () => {
  const sent = new Set();
  const send = (name, params = {}) => {
    if (window.location.hash === "#admin" || new URLSearchParams(window.location.search).has("admin-recovery")) return;
    window.gtag?.("event", name, params);
  };
  const labelFor = (element) => (element?.getAttribute("aria-label") || element?.textContent || element?.getAttribute("href") || "").trim().replace(/\s+/g, " ").slice(0, 100);
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("a,button,[role='button']") : null;
    if (!target) return;
    const label = labelFor(target);
    const name = `click_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "control"}`.slice(0, 40);
    send(name, { element_type: target.tagName.toLowerCase(), element_label: label });
  }, { passive: true });
  document.addEventListener("submit", () => send("form_submit"), { passive: true });
  window.addEventListener("hashchange", () => sent.clear());
  window.addEventListener("popstate", () => sent.clear());
  window.addEventListener("scroll", () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    if (height <= 0) return;
    const depth = Math.min(100, Math.round((window.scrollY / height) * 100));
    [25, 50, 75, 90, 100].forEach((threshold) => {
      if (depth >= threshold && !sent.has(threshold)) { sent.add(threshold); send(`scroll_depth_${threshold}`, { percent_scrolled: threshold }); }
    });
  }, { passive: true });
};

instrumentHistory();
instrumentEngagement();

function Root() {
  const isAdminRoute = () => window.location.hash === "#admin" || new URLSearchParams(window.location.search).has("admin-recovery") || new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
  const isHamburgerRoute = () => ["/financial-planning", "/mutual-funds", "/learn", "/about", "/contact"].some((path) => window.location.pathname === path || (path === "/learn" && window.location.pathname.startsWith("/learn/")));
  const getRoute = () => ({ admin: isAdminRoute(), hamburger: isHamburgerRoute() });
  const [route, setRoute] = React.useState(getRoute);
  React.useEffect(() => {
    const onRouteChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onRouteChange);
    window.addEventListener("popstate", onRouteChange);
    return () => { window.removeEventListener("hashchange", onRouteChange); window.removeEventListener("popstate", onRouteChange); };
  }, []);
  if (route.admin) return <AdminDashboard />;
  if (route.hamburger) return <HamburgerRoute />;
  return <App />;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><Root /></React.StrictMode>);
