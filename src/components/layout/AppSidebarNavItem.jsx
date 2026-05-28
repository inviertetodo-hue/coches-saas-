import { NavLink } from "react-router-dom";

export default function AppSidebarNavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      style={({ isActive }) => ({
        ...navLinkStyle,
        ...(isActive ? activeNavLinkStyle : {}),
      })}
    >
      {item.label}
    </NavLink>
  );
}

const navLinkStyle = {
  padding: "10px 12px",
  borderRadius: "14px",
  textDecoration: "none",
  color: "#cbd5e1",
  fontWeight: "800",
  border: "1px solid transparent",
};

const activeNavLinkStyle = {
  color: "#dbeafe",
  background: "rgba(59,130,246,0.16)",
  border: "1px solid rgba(59,130,246,0.30)",
};