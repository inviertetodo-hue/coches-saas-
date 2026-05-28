export default function ExecutiveSummaryPanel({
  executive,
}) {
  const hasExecutiveData =
    executive &&
    (
      executive.summary?.length > 0 ||
      executive.priorities?.length > 0 ||
      executive.nextActions?.length > 0
    );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>
            Executive Layer
          </p>

          <h2 style={titleStyle}>
            🧠 Executive AI Summary
          </h2>
        </div>

        <div style={statusPillStyle}>
          {hasExecutiveData
            ? "Activo"
            : "Sin datos"}
        </div>
      </div>

      <Section
        title="📊 Executive Summary"
        items={executive?.summary}
        empty="Todavía no hay resumen ejecutivo."
        styleType="summary"
      />

      <Section
        title="🎯 Strategic Priorities"
        items={executive?.priorities}
        empty="Sin prioridades estratégicas todavía."
        styleType="priority"
      />

      <Section
        title="🚀 Next Recommended Actions"
        items={executive?.nextActions}
        empty="Sin acciones recomendadas todavía."
        styleType="action"
      />
    </div>
  );
}

function Section({
  title,
  items = [],
  empty,
  styleType,
}) {
  const styleMap = {
    summary: summaryCardStyle,
    priority: priorityCardStyle,
    action: actionCardStyle,
  };

  const safeItems = Array.isArray(items)
    ? items
    : [];

  return (
    <div style={sectionContainerStyle}>
      <p style={sectionTitleStyle}>
        {title}
      </p>

      {safeItems.length === 0 && (
        <p style={emptyTextStyle}>
          {empty}
        </p>
      )}

      {safeItems.map((item, index) => (
        <div
          key={index}
          style={styleMap[styleType]}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

const containerStyle = {
  marginBottom: "32px",
  padding: "26px",
  borderRadius: "28px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.16)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "24px",
};

const eyebrowStyle = {
  color: "#93c5fd",
  fontSize: "12px",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "8px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  margin: 0,
};

const statusPillStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(59,130,246,0.14)",
  border: "1px solid rgba(59,130,246,0.24)",
  color: "#bfdbfe",
  fontSize: "13px",
  fontWeight: "900",
};

const sectionContainerStyle = {
  marginBottom: "24px",
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: "900",
  marginBottom: "14px",
};

const emptyTextStyle = {
  color: "#94a3b8",
  background: "rgba(2,6,23,0.45)",
  border: "1px solid rgba(148,163,184,0.12)",
  padding: "14px 16px",
  borderRadius: "16px",
};

const summaryCardStyle = {
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.20)",
  padding: "16px",
  borderRadius: "18px",
  marginBottom: "12px",
  fontWeight: "700",
  lineHeight: "1.5",
};

const priorityCardStyle = {
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.22)",
  padding: "16px",
  borderRadius: "18px",
  marginBottom: "12px",
  fontWeight: "700",
  lineHeight: "1.5",
};

const actionCardStyle = {
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.20)",
  padding: "16px",
  borderRadius: "18px",
  marginBottom: "12px",
  fontWeight: "700",
  lineHeight: "1.5",
};