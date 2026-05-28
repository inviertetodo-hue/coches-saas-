import { APP_BRAND } from "../../config/appBrand";

export default function AppSidebarBrand() {
  return (
    <div style={wrapperStyle}>
      <div style={logoStyle}>{APP_BRAND.logo}</div>

      <div>
        <h1 style={titleStyle}>{APP_BRAND.name}</h1>

        <p style={subtitleStyle}>{APP_BRAND.subtitle}</p>
      </div>
    </div>
  );
}

const wrapperStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const logoStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "18px",
  display: "grid",
  placeItems: "center",
  fontWeight: "900",
  fontSize: "18px",
  color: "white",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  boxShadow: "0 10px 30px rgba(37,99,235,0.35)",
};

const titleStyle = {
  margin: 0,
  color: "white",
  fontSize: "20px",
  fontWeight: "900",
};

const subtitleStyle = {
  marginTop: "4px",
  color: "#94a3b8",
  fontSize: "13px",
};