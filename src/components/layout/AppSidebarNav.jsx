import { NAVIGATION_ITEMS } from "../../config/navigation";

import AppSidebarNavItem from "./AppSidebarNavItem";

export default function AppSidebarNav() {
  return (
    <nav style={navStyle}>
      {NAVIGATION_ITEMS.map((item) => (
        <AppSidebarNavItem key={item.id} item={item} />
      ))}
    </nav>
  );
}

const navStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  marginTop: "30px",
};