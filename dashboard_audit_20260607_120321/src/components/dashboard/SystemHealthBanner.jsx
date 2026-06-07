export default function SystemHealthBanner({
  health,
}) {
  if (!health) {
    return null;
  }

  const bannerStyle = getBannerStyle(
    health.status
  );

  return (
    <div style={bannerStyle.container}>
      <div style={topRowStyle}>
        <div>
          <div style={statusLabelStyle}>
            System Health
          </div>

          <div style={statusValueStyle}>
            {getStatusEmoji(
              health.status
            )}{" "}
            {health.label ||
              health.status}
          </div>
        </div>

        <div style={scoreBoxStyle}>
          <div style={scoreLabelStyle}>
            Quality
          </div>

          <div style={scoreValueStyle}>
            {health.qualityScore || 0}
          </div>
        </div>
      </div>

      {!health.canShowAdvanced && (
        <div style={blockedStyle}>
          ⚠️ Advanced Intelligence
          temporalmente limitada por
          protección del sistema.
        </div>
      )}

      <div style={messagesStyle}>
        {health.insights?.map(
          (item, index) => (
            <div
              key={index}
              style={messageStyle}
            >
              • {item}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function getStatusEmoji(status) {
  if (status === "healthy")
    return "🟢";

  if (status === "warning")
    return "🟡";

  return "🔴";
}

function getBannerStyle(status) {
  if (status === "healthy") {
    return healthyStyle;
  }

  if (status === "warning") {
    return warningStyle;
  }

  return criticalStyle;
}

const baseStyle = {
  borderRadius: "24px",
  padding: "24px",
  marginBottom: "28px",
};

const healthyStyle = {
  container: {
    ...baseStyle,
    background:
      "rgba(34,197,94,0.12)",
    border:
      "1px solid rgba(34,197,94,0.25)",
  },
};

const warningStyle = {
  container: {
    ...baseStyle,
    background:
      "rgba(250,204,21,0.12)",
    border:
      "1px solid rgba(250,204,21,0.25)",
  },
};

const criticalStyle = {
  container: {
    ...baseStyle,
    background:
      "rgba(239,68,68,0.12)",
    border:
      "1px solid rgba(239,68,68,0.25)",
  },
};

const topRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "18px",
};

const statusLabelStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const statusValueStyle = {
  fontSize: "24px",
  fontWeight: "900",
  color: "white",
};

const scoreBoxStyle = {
  minWidth: "90px",
  borderRadius: "18px",
  padding: "14px",
  background:
    "rgba(255,255,255,0.06)",
  textAlign: "center",
};

const scoreLabelStyle = {
  color: "#94a3b8",
  fontSize: "12px",
  marginBottom: "6px",
};

const scoreValueStyle = {
  fontSize: "30px",
  fontWeight: "900",
  color: "white",
};

const blockedStyle = {
  marginBottom: "18px",
  padding: "14px 16px",
  borderRadius: "16px",
  background:
    "rgba(239,68,68,0.14)",
  border:
    "1px solid rgba(239,68,68,0.24)",
  color: "#fecaca",
  fontWeight: "700",
};

const messagesStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const messageStyle = {
  lineHeight: "1.5",
  color: "#e2e8f0",
  fontSize: "14px",
};