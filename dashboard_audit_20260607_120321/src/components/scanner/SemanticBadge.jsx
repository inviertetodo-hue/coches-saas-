export default function SemanticBadge({ active, label }) {
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

const semanticBadgeStyle = {
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.05)",
  fontWeight: "900",
};