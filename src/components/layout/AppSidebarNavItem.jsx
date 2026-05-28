import { NavLink } from "react-router-dom";

export default function AppSidebarNavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      style={({ isActive }) => ({
        ...navLinkStyle,
        ...(isActive ? activeNavLinkStyle : {}),
      })}
    >
      <span>{item.label}</span>
    </NavLink>
  );
}

const navLinkStyle = {
  padding: "12px 14px",
  borderRadius: "16px",
  textDecoration: "none",
  color: "#cbd5e1",
  fontWeight: "800",
  border: "1px solid transparent",
  transition: "all 0.18s ease",
};

const activeNavLinkStyle = {
  color: "#dbeafe",
  background: "rgba(59,130,246,0.16)",
  border: "1px solid rgba(59,130,246,0.30)",
};