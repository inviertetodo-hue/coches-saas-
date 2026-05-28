import { NavLink } from "react-router-dom";

import { APP_BRAND } from "../../config/appBrand";
import { NAVIGATION_ITEMS } from "../../config/navigation";

export default function AppSidebar() {
  return (
    <aside>
      <h1>{APP_BRAND.title}</h1>

      <p style={subtitleStyle}>{APP_BRAND.subtitle}</p>

      <nav style={navStyle}>
        {NAVIGATION_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            style={({ isActive }) => ({
              ...navLinkStyle,
              ...(isActive ? activeNavLinkStyle : {}),
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={objectiveBoxStyle}>
        <p style={objectiveLabelStyle}>{APP_BRAND.objectiveLabel}</p>

        <p style={objectiveTextStyle}>{APP_BRAND.objectiveText}</p>
      </div>
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

const objectiveBoxStyle = {
  marginTop: "40px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.18)",
};

const objectiveLabelStyle = {
  margin: 0,
  color: "#93c5fd",
  fontWeight: "900",
  fontSize: "13px",
};

const objectiveTextStyle = {
  marginTop: "10px",
  color: "#cbd5e1",
  lineHeight: "1.5",
  fontSize: "13px",
};