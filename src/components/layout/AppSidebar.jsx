import { APP_BRAND } from "../../config/appBrand";
import { NAVIGATION_ITEMS } from "../../config/navigation";

import AppSidebarNavItem from "./AppSidebarNavItem";
import AppSidebarObjective from "./AppSidebarObjective";

export default function AppSidebar() {
  return (
    <aside>
      <h1>{APP_BRAND.title}</h1>

      <p style={subtitleStyle}>{APP_BRAND.subtitle}</p>

      <nav style={navStyle}>
        {NAVIGATION_ITEMS.map((item) => (
          <AppSidebarNavItem key={item.id} item={item} />
        ))}
      </nav>

      <AppSidebarObjective />
    </aside>
  );
}

const subtitleStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: "1.5",
  marginTop: "12px",
};

const navStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  marginTop: "30px",
};