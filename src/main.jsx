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

instrumentHistory();

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
