import AppSidebar from "./AppSidebar";

export default function AppLayout({ children }) {
  return (
    <div style={layoutStyle}>
      <AppSidebar />

      <main style={contentStyle}>{children}</main>
    </div>
  );
}

const layoutStyle = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "280px 1fr",
  background: "#020617",
};

const contentStyle = {
  padding: "32px",
  overflowX: "hidden",
};