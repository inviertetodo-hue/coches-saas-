import AppSidebarBrand from "./AppSidebarBrand";
import AppSidebarNav from "./AppSidebarNav";
import AppSidebarObjective from "./AppSidebarObjective";

import "./AppSidebar.css";

export default function AppSidebar({ isOpen = false, onClose = () => {} }) {
  return (
    <aside className={`app-sidebar${isOpen ? " is-open" : ""}`}>
      <button
        type="button"
        className="app-sidebar-close"
        aria-label="Cerrar menú"
        onClick={onClose}
      >
        ✕
      </button>

      <div>
        <AppSidebarBrand />

        <AppSidebarNav onNavigate={onClose} />
      </div>

      <AppSidebarObjective />
    </aside>
  );
}
