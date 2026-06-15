import { NAVIGATION_SECTIONS } from "../../config/navigation";

import AppSidebarNavItem from "./AppSidebarNavItem";

export default function AppSidebarNav({ onNavigate }) {
  return (
    <nav style={navStyle}>
      {NAVIGATION_SECTIONS.map((section) => (
        <div key={section.id} style={sectionStyle}>
          <p style={sectionLabelStyle}>{section.label}</p>

          <div style={itemsStyle}>
            {section.items.map((item) => (
              <AppSidebarNavItem
                key={item.path}
                item={item}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

const navStyle = {
  marginTop: "42px",
  display: "flex",
  flexDirection: "column",
  gap: "22px",
};

const sectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const sectionLabelStyle = {
  margin: "0 0 2px",
  padding: "0 4px",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(226, 232, 240, 0.48)",
};

const itemsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};