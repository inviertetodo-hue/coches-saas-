export function MetricCard({ label, value }) {
  return (
    <div style={marketCardStyle}>
      <p style={marketLabel}>{label}</p>
      <h2 style={marketValue}>{value}</h2>
    </div>
  );
}

export function InsightSection({
  title,
  items,
  empty,
  cardStyle,
}) {
  return (
    <div style={insightsContainerStyle}>
      <p style={sectionTitle}>{title}</p>

      {items?.length === 0 && (
        <p style={mutedTextStyle}>{empty}</p>
      )}

      {items?.map((item, index) => (
        <div key={index} style={cardStyle}>
          {item}
        </div>
      ))}
    </div>
  );
}

export function AlertSection({
  title,
  items,
  empty,
  styleType,
}) {
  const styleMap = {
    warning: warningAlertCardStyle,
    risk: riskAlertCardStyle,
  };

  return (
    <div style={insightsContainerStyle}>
      <p style={sectionTitle}>{title}</p>

      {items?.length === 0 && (
        <p style={mutedTextStyle}>{empty}</p>
      )}

      {items?.map((item, index) => (
        <div key={index} style={styleMap[styleType]}>
          {item}
        </div>
      ))}
    </div>
  );
}

export function Badge({ children }) {
  return <div style={badgeChipStyle}>{children}</div>;
}

const marketCardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "22px",
  padding: "22px",
};

const marketLabel = {
  color: "#94a3b8",
};

const marketValue = {
  fontSize: "30px",
  fontWeight: "900",
};

const insightsContainerStyle = {
  marginBottom: "28px",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "900",
  marginBottom: "14px",
};

const mutedTextStyle = {
  color: "#94a3b8",
};

const warningAlertCardStyle = {
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const riskAlertCardStyle = {
  background: "rgba(239,68,68,0.16)",
  border: "1px solid rgba(239,68,68,0.32)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
};

const badgeChipStyle = {
  display: "inline-block",
  background: "rgba(255,255,255,0.06)",
  padding: "8px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "700",
  marginRight: "8px",
  marginBottom: "8px",
};