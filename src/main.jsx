import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import "./styles.css";

function Root() {
  const isAdminRoute = () => window.location.hash === "#admin" || new URLSearchParams(window.location.search).has("admin-recovery") || new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
  const [adminRoute, setAdminRoute] = React.useState(isAdminRoute);
  React.useEffect(() => {
    const onHashChange = () => setAdminRoute(isAdminRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return adminRoute ? <AdminDashboard /> : <App />;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><Root /></React.StrictMode>);
