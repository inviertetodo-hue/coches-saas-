import { useState } from "react";

import AppSidebar from "./AppSidebar";
import { APP_BRAND } from "../../config/appBrand";

import "./AppLayout.css";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <header className="app-topbar">
        <button
          type="button"
          className="app-topbar-menu"
          aria-label="Abrir menú"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        <span className="app-topbar-title">{APP_BRAND.title}</span>
      </header>

      {sidebarOpen ? (
        <div
          className="app-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="app-content">{children}</main>
    </div>
  );
}
