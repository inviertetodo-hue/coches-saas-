import CarAnalysisCard from "./CarAnalysisCard";

export default function AnalysisGrid({
  analyses,
  onDelete,
}) {
  return (
    <div style={gridStyle}>
      {analyses.map((item) => (
        <CarAnalysisCard
          key={item.id}
          item={item}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "24px",
};