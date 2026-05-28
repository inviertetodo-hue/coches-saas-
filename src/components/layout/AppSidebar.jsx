import AppSidebarBrand from "./AppSidebarBrand";
import AppSidebarNav from "./AppSidebarNav";
import AppSidebarObjective from "./AppSidebarObjective";

export default function AppSidebar() {
  return (
    <aside>
      <AppSidebarBrand />

      <AppSidebarNav />

      <AppSidebarObjective />
    </aside>
  );
}