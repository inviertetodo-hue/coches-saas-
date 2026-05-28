import { useMemo, useState } from "react";
import { buildMarketScan } from "../services/marketScanner";
import { generateMockMarketFeed } from "../services/mockMarketFeed";

export default function Scanner() {
  const [form, setForm] = useState({
    query: "BMW X5 45e",
    maxBudget: "60000",
    country: "Europa",
    useCase: "reventa",
  });

  const [searchTriggered, setSearchTriggered] = useState(false);

  const scan = useMemo(() => buildMarketScan(form), [form]);

  const marketFeed = useMemo(() => {
    if (!searchTriggered) {
      return null;
    }

    return generateMockMarketFeed(scan);
  }, [scan, searchTriggered]);

  function updateField(field, value) {
    setSearchTriggered(false);

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSearch() {
    setSearchTriggered(true);
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={badgeStyle}>
            AI Automotive Opportunity Scanner
          </p>

          <h1 style={titleStyle}>
            Encuentra chollos reales en Europa
          </h1>

          <p style={subtitleStyle}>
            Escribe el vehículo que quieres comprar y pulsa buscar. El sistema
            prioriza oportunidades por margen neto, ROI, liquidez y riesgo.
          </p>
        </div>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <label style={labelStyle}>Vehículo objetivo</label>

            <input
              value={form.query}
              onChange={(event) => updateField("query", event.target.value)}
              placeholder="BMW X5 45e, Audi Q7..."
              style={inputStyle}
            />

            <label style={labelStyle}>Presupuesto máximo</label>

            <input
              value={form.maxBudget}
              onChange={(event) =>
                updateField("maxBudget", event.target.value)
              }
              placeholder="60000"
              style={inputStyle}
            />

            <label style={labelStyle}>Mercado</label>

            <select
              value={form.country}
              onChange={(event) => updateField("country", event.target.value)}
              style={inputStyle}
            >
              <option>Europa</option>
              <option>Alemania</option>
              <option>Holanda</option>
              <option>Bélgica</option>
              <option>Francia</option>
              <option>España</option>
            </select>

            <label style={labelStyle}>Objetivo</label>

            <select
              value={form.useCase}
              onChange={(event) => updateField("useCase", event.target.value)}
              style={inputStyle}
            >
              <option value="reventa">Reventa</option>
              <option value="quedarmelo">Quedármelo</option>
            </select>

            <button onClick={handleSearch} style={searchButtonStyle}>
              🔎 Buscar oportunidades IA
            </button>
          </div>

          <div style={cardStyle}>
            <p style={sectionLabelStyle}>Resumen IA</p>

            <h2 style={summaryStyle}>{scan.summary}</h2>

            <div style={semanticGridStyle}>
              <SemanticBadge
                active={scan.semantic?.isPremium}
                label="Premium"
              />

              <SemanticBadge active={scan.semantic?.isPhev} label="PHEV" />

              <SemanticBadge active={scan.semantic?.isSuv} label="SUV" />

              <SemanticBadge
                active={scan.semantic?.isPerformance}
                label="Performance"
              />
            </div>

            {!searchTriggered && (
              <div style={waitingBoxStyle}>
                Pulsa <strong>Buscar oportunidades IA</strong> para generar el
                ranking de posibles chollos.
              </div>
            )}

            {marketFeed?.best && (
              <div style={bestDealStyle}>
                <p style={bestDealLabelStyle}>
                  🏆 Mejor oportunidad detectada
                </p>

                <h3 style={bestDealTitleStyle}>{marketFeed.best.title}</h3>

                <p style={bestDealDecisionStyle}>
                  {marketFeed.best.decision}
                </p>

                <div style={bestDealGridStyle}>
                  <MetricCard
                    label="Score"
                    value={`${marketFeed.best.opportunityScore}/100`}
                  />

                  <MetricCard
                    label="Margen Neto"
                    value={`${marketFeed.best.netProfit.toLocaleString(
                      "es-ES"
                    )} €`}
                  />

                  <MetricCard
                    label="ROI Neto"
                    value={`${marketFeed.best.netRoi}%`}
                  />

                  <MetricCard
                    label="Precio"
                    value={`${marketFeed.best.price.toLocaleString(
                      "es-ES"
                    )} €`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {marketFeed && (
          <>
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Feed IA de oportunidades</h2>

              <div style={feedGridStyle}>
                {marketFeed.opportunities.map((item) => (
                  <div key={item.id} style={feedCardStyle}>
                    <div>
                      <p style={feedSourceStyle}>{item.source}</p>

                      <h3 style={feedTitleStyle}>{item.title}</h3>

                      <p style={feedPriceStyle}>
                        {item.price.toLocaleString("es-ES")} €
                      </p>

                      <p style={feedMetaStyle}>
                        {item.year} · {item.km.toLocaleString("es-ES")} km
                      </p>
                    </div>

                    <div style={feedMetricsStyle}>
                      <FeedMetric
                        label="Opportunity"
                        value={`${item.opportunityScore}/100`}
                      />

                      <FeedMetric label="ROI" value={`${item.netRoi}%`} />

                      <FeedMetric
                        label="Margen"
                        value={`${item.netProfit.toLocaleString("es-ES")} €`}
                      />
                    </div>

                    <div style={decisionStyle}>{item.decision}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Inteligencia IA</h2>

              <div style={insightGridStyle}>
                {marketFeed.insights.map((insight, index) => (
                  <div key={index} style={insightCardStyle}>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SemanticBadge({ active, label }) {
  return (
    <div
      style={{
        ...semanticBadgeStyle,
        opacity: active ? 1 : 0.45,
      }}
    >
      {active ? "✅" : "○"} {label}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={metricLabelStyle}>{label}</p>
      <h3 style={metricValueStyle}>{value}</h3>
    </div>
  );
}

function FeedMetric({ label, value }) {
  return (
    <div style={feedMetricStyle}>
      <p style={feedMetricLabelStyle}>{label}</p>
      <h4 style={feedMetricValueStyle}>{value}</h4>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, #020617 42%, #020617 100%)",
  color: "white",
  padding: "48px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
};

const headerStyle = {
  marginBottom: "36px",
};

const badgeStyle = {
  display: "inline-block",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  padding: "8px 14px",
  borderRadius: "999px",
  fontWeight: "900",
  marginBottom: "18px",
};

const titleStyle = {
  fontSize: "clamp(38px, 6vw, 62px)",
  margin: 0,
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginTop: "16px",
  lineHeight: "1.7",
  maxWidth: "780px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
};

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "28px",
  padding: "28px",
  border: "1px solid rgba(148,163,184,0.16)",
};

const labelStyle = {
  display: "block",
  marginTop: "16px",
  marginBottom: "8px",
  color: "#cbd5e1",
  fontWeight: "800",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,0.20)",
  background: "rgba(2,6,23,0.86)",
  color: "white",
  outline: "none",
  fontWeight: "700",
};

const searchButtonStyle = {
  width: "100%",
  marginTop: "24px",
  padding: "18px",
  borderRadius: "18px",
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#16a34a)",
  color: "white",
  fontWeight: "900",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 10px 30px rgba(37,99,235,0.35)",
};

const sectionLabelStyle = {
  color: "#93c5fd",
  fontWeight: "900",
};

const summaryStyle = {
  fontSize: "30px",
  lineHeight: "1.3",
};

const semanticGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "24px",
};

const semanticBadgeStyle = {
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.05)",
  fontWeight: "900",
};

const waitingBoxStyle = {
  marginTop: "28px",
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.22)",
  color: "#dbeafe",
  lineHeight: "1.55",
};

const bestDealStyle = {
  marginTop: "30px",
  padding: "24px",
  borderRadius: "24px",
  background:
    "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(59,130,246,0.14))",
};

const bestDealLabelStyle = {
  color: "#86efac",
  fontWeight: "900",
};

const bestDealTitleStyle = {
  fontSize: "28px",
};

const bestDealDecisionStyle = {
  color: "#facc15",
  fontWeight: "900",
};

const bestDealGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
  gap: "14px",
  marginTop: "22px",
};

const metricCardStyle = {
  background: "rgba(2,6,23,0.55)",
  borderRadius: "18px",
  padding: "18px",
};

const metricLabelStyle = {
  color: "#cbd5e1",
};

const metricValueStyle = {
  fontSize: "26px",
};

const sectionStyle = {
  marginTop: "34px",
};

const sectionTitleStyle = {
  fontSize: "28px",
};

const feedGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
  gap: "18px",
};

const feedCardStyle = {
  background: "rgba(15,23,42,0.82)",
  borderRadius: "24px",
  padding: "24px",
  border: "1px solid rgba(148,163,184,0.16)",
};

const feedSourceStyle = {
  color: "#86efac",
  fontWeight: "900",
};

const feedTitleStyle = {
  fontSize: "22px",
};

const feedPriceStyle = {
  fontSize: "34px",
  fontWeight: "900",
};

const feedMetaStyle = {
  color: "#cbd5e1",
};

const feedMetricsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "12px",
  marginTop: "20px",
};

const feedMetricStyle = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: "16px",
  padding: "14px",
};

const feedMetricLabelStyle = {
  color: "#cbd5e1",
  fontSize: "12px",
};

const feedMetricValueStyle = {
  fontSize: "20px",
};

const decisionStyle = {
  marginTop: "20px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  fontWeight: "900",
  textAlign: "center",
};

const insightGridStyle = {
  display: "grid",
  gap: "14px",
};

const insightCardStyle = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: "18px",
  padding: "18px",
  fontWeight: "700",
};