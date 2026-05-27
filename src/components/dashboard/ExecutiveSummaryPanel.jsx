export default function ExecutiveSummaryPanel({
  executive,
}) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        🧠 Executive AI Summary
      </h2>

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
  items,
  empty,
  styleType,
}) {
  const styleMap = {
    summary: summaryCardStyle,
    priority: priorityCardStyle,
    action: actionCardStyle,
  };

  return (
    <div style={sectionContainerStyle}>
      <p style={sectionTitleStyle}>
        {title}
      </p>

      {items?.length === 0 && (
        <p style={emptyTextStyle}>{empty}</p>
      )}

      {items?.map((item, index) => (
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
};

const sectionContainerStyle = {
  marginBottom: "24px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  marginBottom: "24px",
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: "900",
  marginBottom: "14px",
};

const emptyTextStyle = {
  color: "#94a3b8",
};

const summaryCardStyle = {
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.20)",
  padding: "16px",
  borderRadius: "18px",
  marginBottom: "12px",
  fontWeight: "700",
};

const priorityCardStyle = {
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.22)",
  padding: "16px",
  borderRadius: "18px",
  marginBottom: "12px",
  fontWeight: "700",
};

const actionCardStyle = {
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.20)",
  padding: "16px",
  borderRadius: "18px",
  marginBottom: "12px",
  fontWeight: "700",
};