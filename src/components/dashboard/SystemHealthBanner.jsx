export default function SystemHealthBanner({
  health,
}) {
  if (!health) {
    return null;
  }

  const isHealthy =
    health.status === "Saludable" ||
    health.status === "Aceptable";

  return (
    <div
      style={
        isHealthy
          ? healthyStyle
          : warningStyle
      }
    >
      <div style={headerStyle}>
        <span style={statusStyle}>
          System Status:
        </span>

        <span>
          {health.status}
        </span>
      </div>

      <div style={messagesStyle}>
        {health.messages?.map((item, index) => (
          <div
            key={index}
            style={messageStyle}
          >
            • {item}
          </div>
        ))}
      </div>
    </div>
  );
}

const healthyStyle = {
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.25)",
  borderRadius: "22px",
  padding: "20px",
  marginBottom: "28px",
};

const warningStyle = {
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.25)",
  borderRadius: "22px",
  padding: "20px",
  marginBottom: "28px",
};

const headerStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  marginBottom: "14px",
  fontWeight: "900",
  fontSize: "18px",
};

const statusStyle = {
  color: "#94a3b8",
};

const messagesStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const messageStyle = {
  lineHeight: "1.5",
  color: "#e2e8f0",
};