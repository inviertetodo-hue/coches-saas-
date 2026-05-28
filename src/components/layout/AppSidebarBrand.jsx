import { APP_BRAND } from "../../config/appBrand";

export default function AppSidebarBrand() {
  return (
    <>
      <h1>{APP_BRAND.title}</h1>

      <p style={subtitleStyle}>{APP_BRAND.subtitle}</p>
    </>
  );
}

const subtitleStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: "1.5",
  marginTop: "12px",
};