import { NavLink } from "react-router-dom";

export default function AppSidebarNavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      onClick={onNavigate}
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
  color: "#ede9fe",
  background:
    "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(34,211,238,0.14))",
  border: "1px solid rgba(139,92,246,0.35)",
  boxShadow: "0 8px 24px rgba(139,92,246,0.18)",
};