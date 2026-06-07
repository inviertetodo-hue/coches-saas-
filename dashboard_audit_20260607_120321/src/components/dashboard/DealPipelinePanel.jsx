import { MetricCard } from "./DashboardBlocks";

export default function DealPipelinePanel({
  pipeline,
}) {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        🧭 AI Deal Pipeline
      </h2>

      <div style={gridStyle}>
        <MetricCard
          label="Pipeline Score"
          value={`${pipeline.pipelineScore || 0}/100`}
        />

        <MetricCard
          label="Pipeline Level"
          value={pipeline.pipelineLevel || "-"}
        />

        <MetricCard
          label="Priority"
          value={pipeline.stages?.priority?.length || 0}
        />

        <MetricCard
          label="Analysis"
          value={pipeline.stages?.analysis?.length || 0}
        />
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>
          🧠 Pipeline Insights
        </p>

        {pipeline.insights?.map((item, index) => (
          <div key={index} style={insightCardStyle}>
            {item}
          </div>
        ))}
      </div>

      <PipelineColumn
        title="🚀 Priority Deals"
        items={pipeline.stages?.priority}
        empty="Sin operaciones prioritarias."
        type="priority"
      />

      <PipelineColumn
        title="🟡 Needs Analysis"
        items={pipeline.stages?.analysis}
        empty="Sin operaciones pendientes de análisis."
        type="analysis"
      />

      <PipelineColumn
        title="🔎 Discovery"
        items={pipeline.stages?.discovery}
        empty="Sin operaciones en discovery."
        type="discovery"
      />

      <PipelineColumn
        title="🔴 Discard"
        items={pipeline.stages?.discard}
        empty="Sin operaciones descartadas."
        type="discard"
      />
    </div>
  );
}

function PipelineColumn({
  title,
  items = [],
  empty,
  type,
}) {
  const styleMap = {
    priority: priorityCardStyle,
    analysis: analysisCardStyle,
    discovery: discoveryCardStyle,
    discard: discardCardStyle,
  };

  return (
    <div style={sectionStyle}>
      <p style={sectionTitleStyle}>{title}</p>

      {items.length === 0 && (
        <p style={emptyStyle}>{empty}</p>
      )}

      {items.map((item) => (
        <div key={item.id} style={styleMap[type]}>
          <h3 style={dealTitleStyle}>
            {item.title}
          </h3>

          <p style={dealTextStyle}>
            Score {item.score} · ROI {item.roi}% · Beneficio {item.profit} €
          </p>
        </div>
      ))}
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
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const sectionStyle = {
  marginBottom: "24px",
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: "900",
  marginBottom: "14px",
};

const insightCardStyle = {
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.22)",
  padding: "14px 16px",
  borderRadius: "16px",
  marginBottom: "12px",
  fontWeight: "800",
};

const priorityCardStyle = {
  background: "rgba(34,197,94,0.14)",
  border: "1px solid rgba(34,197,94,0.28)",
  padding: "16px",
  borderRadius: "18px",
  marginBottom: "12px",
};

const analysisCardStyle = {
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.25)",
  padding: "16px",
  borderRadius: "18px",
  marginBottom: "12px",
};

const discoveryCardStyle = {
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.22)",
  padding: "16px",
  borderRadius: "18px",
  marginBottom: "12px",
};

const discardCardStyle = {
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.25)",
  padding: "16px",
  borderRadius: "18px",
  marginBottom: "12px",
};

const dealTitleStyle = {
  fontSize: "18px",
  marginBottom: "8px",
};

const dealTextStyle = {
  color: "#cbd5e1",
};

const emptyStyle = {
  color: "#94a3b8",
};