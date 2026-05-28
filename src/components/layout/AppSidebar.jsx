import AppSidebarBrand from "./AppSidebarBrand";
import AppSidebarNav from "./AppSidebarNav";
import AppSidebarObjective from "./AppSidebarObjective";

export default function AppSidebar() {
  return (
    <aside style={sidebarStyle}>
      <div>
        <AppSidebarBrand />

        <AppSidebarNav />
      </div>

      <AppSidebarObjective />
    </aside>
  );
}

const sidebarStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "28px 20px",
  borderRight: "1px solid rgba(148,163,184,0.12)",
  background: "rgba(15,23,42,0.82)",
  backdropFilter: "blur(12px)",
};