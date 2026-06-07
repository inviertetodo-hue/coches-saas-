import { MetricCard } from "./DashboardBlocks";

export default function DataQualityPanel({
  validation,
}) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        🛡️ Data Quality Check
      </h2>

      <div style={gridStyle}>
        <MetricCard
          label="Quality Score"
          value={`${validation.qualityScore || 0}/100`}
        />

        <MetricCard
          label="Valid Records"
          value={`${validation.validCount || 0}/${validation.total || 0}`}
        />

        <MetricCard
          label="Warnings"
          value={validation.warningCount || 0}
        />

        <MetricCard
          label="Errors"
          value={validation.errorCount || 0}
        />
      </div>

      <div style={sectionStyle}>
        {validation.insights?.map((item, index) => (
          <div
            key={index}
            style={
              validation.isHealthy
                ? successCardStyle
                : warningCardStyle
            }
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

const containerStyle = {
  marginBottom: "40px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  marginBottom: "24px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const sectionStyle = {
  marginBottom: "24px",
};

const successCardStyle = {
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const warningCardStyle = {
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.25)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};