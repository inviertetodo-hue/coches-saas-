import { SIDEBAR_CONTENT } from "../../config/sidebarContent";

export default function AppSidebarObjective() {
  return (
    <div style={objectiveBoxStyle}>
      <p style={objectiveLabelStyle}>{SIDEBAR_CONTENT.objective.label}</p>

      <p style={objectiveTextStyle}>{SIDEBAR_CONTENT.objective.text}</p>
    </div>
  );
}

const objectiveBoxStyle = {
  marginTop: "40px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(59,130,246,0.10)",
  border: "1px solid rgba(59,130,246,0.18)",
};

const objectiveLabelStyle = {
  margin: 0,
  color: "#93c5fd",
  fontWeight: "900",
  fontSize: "13px",
};

const objectiveTextStyle = {
  marginTop: "10px",
  color: "#cbd5e1",
  lineHeight: "1.5",
  fontSize: "13px",
};