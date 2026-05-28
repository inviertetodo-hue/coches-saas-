import { memo, useMemo } from "react";

export const MetricCard = memo(function MetricCard({
  label,
  value,
}) {
  return (
    <div style={marketCardStyle}>
      <p style={marketLabel}>{label}</p>

      <h2 style={marketValue}>{value}</h2>
    </div>
  );
});

export const InsightSection = memo(function InsightSection({
  title,
  items = [],
  empty,
  cardStyle,
}) {
  const safeItems = useMemo(() => {
    return Array.isArray(items)
      ? items
      : [];
  }, [items]);

  return (
    <div style={insightsContainerStyle}>
      <p style={sectionTitle}>{title}</p>

      {safeItems.length === 0 && (
        <p style={mutedTextStyle}>{empty}</p>
      )}

      {safeItems.map((item, index) => (
        <div
          key={`${title}-${index}`}
          style={cardStyle}
        >
          {item}
        </div>
      ))}
    </div>
  );
});

export const AlertSection = memo(function AlertSection({
  title,
  items = [],
  empty,
  styleType,
}) {
  const safeItems = useMemo(() => {
    return Array.isArray(items)
      ? items
      : [];
  }, [items]);

  const styleMap = {
    warning: warningAlertCardStyle,
    risk: riskAlertCardStyle,
  };

  const selectedStyle =
    styleMap[styleType] ||
    warningAlertCardStyle;

  return (
    <div style={insightsContainerStyle}>
      <p style={sectionTitle}>{title}</p>

      {safeItems.length === 0 && (
        <p style={mutedTextStyle}>{empty}</p>
      )}

      {safeItems.map((item, index) => (
        <div
          key={`${styleType}-${index}`}
          style={selectedStyle}
        >
          {item}
        </div>
      ))}
    </div>
  );
});

export const Badge = memo(function Badge({
  children,
}) {
  return (
    <div style={badgeChipStyle}>
      {children}
    </div>
  );
});

const marketCardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "22px",
  padding: "22px",
  border: "1px solid rgba(148,163,184,0.10)",
  backdropFilter: "blur(8px)",
};

const marketLabel = {
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "800",
  marginBottom: "10px",
};

const marketValue = {
  fontSize: "30px",
  fontWeight: "900",
  margin: 0,
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
  lineHeight: "1.6",
};

const warningAlertCardStyle = {
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "700",
};

const riskAlertCardStyle = {
  background: "rgba(239,68,68,0.16)",
  border: "1px solid rgba(239,68,68,0.32)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "700",
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
  border: "1px solid rgba(148,163,184,0.10)",
};