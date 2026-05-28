import { NAVIGATION_ITEMS } from "../../config/navigation";

import AppSidebarBrand from "./AppSidebarBrand";
import AppSidebarNavItem from "./AppSidebarNavItem";
import AppSidebarObjective from "./AppSidebarObjective";

export default function AppSidebar() {
  return (
    <aside>
      <AppSidebarBrand />

      <nav style={navStyle}>
        {NAVIGATION_ITEMS.map((item) => (
          <AppSidebarNavItem key={item.id} item={item} />
        ))}
      </nav>

      <AppSidebarObjective />
    </aside>
  );
}

const navStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  marginTop: "30px",
};