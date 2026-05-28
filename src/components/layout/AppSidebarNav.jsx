import { NAVIGATION_ITEMS } from "../../config/navigation";

import AppSidebarNavItem from "./AppSidebarNavItem";

export default function AppSidebarNav() {
  return (
    <nav style={navStyle}>
      {NAVIGATION_ITEMS.map((item) => (
        <AppSidebarNavItem key={item.path} item={item} />
      ))}
    </nav>
  );
}

const navStyle = {
  marginTop: "42px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};