export default function StatusPage({ badge, title, text, action }) {
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {badge && <p style={badgeStyle}>{badge}</p>}

        <h1 style={titleStyle}>{title}</h1>

        {text && <p style={textStyle}>{text}</p>}

        {action}
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "70vh",
  display: "grid",
  placeItems: "center",
  color: "white",
  padding: "40px",
};

const cardStyle = {
  maxWidth: "560px",
  padding: "34px",
  borderRadius: "28px",
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(148,163,184,0.18)",
  textAlign: "center",
};

const badgeStyle = {
  color: "#93c5fd",
  fontWeight: "900",
  fontSize: "15px",
  marginBottom: "10px",
};

const titleStyle = {
  fontSize: "34px",
  marginBottom: "12px",
};

const textStyle = {
  color: "#cbd5e1",
  lineHeight: "1.6",
  marginBottom: "24px",
};