import { useEffect, useMemo, useState } from "react";

import { createMemoryRepository } from "../../services/intelligence/memoryRepository";
import { buildDashboardMemoryDataset } from "../../services/intelligence/memoryDashboardAdapter";

export default function MemoryIntelligencePanel() {
  const [records, setRecords] = useState([]);
  const [lifecycle, setLifecycle] = useState(null);

  const memoryRepository = useMemo(() => createMemoryRepository(), []);

  useEffect(() => {
    setRecords(memoryRepository.getAll());
    setLifecycle(memoryRepository.getLifecycleSummary());
  }, [memoryRepository]);

  const dataset = useMemo(() => {
    return buildDashboardMemoryDataset(records);
  }, [records]);

  if (!dataset.totalRecords) {
    return (
      <section style={panelStyle}>
        <div style={headerStyle}>
          <div>
            <p style={eyebrowStyle}>Market Memory Intelligence</p>
            <h2 style={titleStyle}>🧠 Memoria de mercado protegida</h2>
          </div>
          <span style={badgeStyle}>Sin datos válidos</span>
        </div>

        <p style={emptyStyle}>
          La memoria existe, pero todavía no hay registros activos y suficientemente
          fiables para alimentar esta capa sin contaminar el dashboard.
        </p>
      </section>
    );
  }

  return (
    <section style={panelStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Market Memory Intelligence</p>
          <h2 style={titleStyle}>🧠 Memoria de mercado protegida</h2>
        </div>

        <span style={badgeStyle}>
          {dataset.totalRecords} registros válidos
        </span>
      </div>

      <div style={gridStyle}>
        <Metric label="Registros válidos" value={dataset.totalRecords} />
        <Metric label="Marcas" value={dataset.brandsCount} />
        <Metric label="Modelos" value={dataset.modelsCount} />
        <Metric label="ROI medio" value={`${dataset.avgROI}%`} />
        <Metric label="Margen medio" value={`${formatNumber(dataset.avgProfit)} €`} />
      </div>

      {lifecycle && (
        <div style={lifecycleStyle}>
          <strong style={subTitleStyle}>Lifecycle</strong>

          <div style={miniGridStyle}>
            <MiniMetric label="ACTIVE" value={lifecycle.active} />
            <MiniMetric label="SOLD" value={lifecycle.sold} />
            <MiniMetric label="EXPIRED" value={lifecycle.expired} />
            <MiniMetric label="ARCHIVED" value={lifecycle.archived} />
          </div>
        </div>
      )}

      <div style={cardsGridStyle}>
        <OpportunityCard
          title="Mejor oportunidad memoria"
          item={dataset.bestOpportunity}
          positive
        />

        <OpportunityCard
          title="Peor oportunidad memoria"
          item={dataset.worstOpportunity}
        />
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <strong style={metricValueStyle}>{value}</strong>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div style={miniMetricStyle}>
      <span style={miniLabelStyle}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OpportunityCard({ title, item, positive = false }) {
  if (!item) {
    return (
      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>{title}</h3>
        <p style={emptyStyle}>Sin datos suficientes.</p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h3 style={cardTitleStyle}>{title}</h3>

      <strong style={vehicleStyle}>
        {[item.brand, item.model, item.year].filter(Boolean).join(" ")}
      </strong>

      <p style={detailStyle}>
        ROI {formatNumber(item.roi)}% · Margen {formatNumber(item.profit)} €
      </p>

      <span style={positive ? positiveTagStyle : warningTagStyle}>
        {positive ? "Señal positiva" : "Revisar"}
      </span>
    </div>
  );
}

function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numericValue.toLocaleString("es-ES", {
    maximumFractionDigits: 2,
  });
}

const panelStyle = {
  padding: "24px",
  borderRadius: "26px",
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(56,189,248,0.22)",
  marginBottom: "28px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "flex-start",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const eyebrowStyle = {
  margin: "0 0 6px 0",
  color: "#38bdf8",
  fontWeight: "900",
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const titleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: "900",
};

const badgeStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.14)",
  border: "1px solid rgba(34,197,94,0.28)",
  color: "#bbf7d0",
  fontWeight: "900",
  fontSize: "12px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const metricStyle = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(2,6,23,0.48)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const metricLabelStyle = {
  margin: 0,
  color: "#bae6fd",
  fontSize: "12px",
  fontWeight: "900",
};

const metricValueStyle = {
  display: "block",
  marginTop: "8px",
  fontSize: "23px",
  color: "#ffffff",
};

const lifecycleStyle = {
  padding: "16px",
  borderRadius: "20px",
  background: "rgba(30,41,59,0.62)",
  border: "1px solid rgba(148,163,184,0.18)",
  marginBottom: "18px",
};

const subTitleStyle = {
  display: "block",
  marginBottom: "12px",
  color: "#e0f2fe",
};

const miniGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: "10px",
};

const miniMetricStyle = {
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(15,23,42,0.62)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const miniLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: "900",
  marginBottom: "6px",
};

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: "14px",
};

const cardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(2,6,23,0.45)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const cardTitleStyle = {
  margin: "0 0 10px 0",
  fontSize: "15px",
  color: "#e0f2fe",
};

const vehicleStyle = {
  display: "block",
  fontSize: "18px",
  marginBottom: "8px",
};

const detailStyle = {
  margin: "0 0 12px 0",
  color: "#cbd5e1",
};

const positiveTagStyle = {
  display: "inline-block",
  padding: "7px 10px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.14)",
  border: "1px solid rgba(34,197,94,0.28)",
  color: "#bbf7d0",
  fontWeight: "900",
  fontSize: "12px",
};

const warningTagStyle = {
  display: "inline-block",
  padding: "7px 10px",
  borderRadius: "999px",
  background: "rgba(250,204,21,0.14)",
  border: "1px solid rgba(250,204,21,0.28)",
  color: "#fef3c7",
  fontWeight: "900",
  fontSize: "12px",
};

const emptyStyle = {
  color: "#94a3b8",
  margin: 0,
  lineHeight: "1.5",
};