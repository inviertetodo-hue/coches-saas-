export default function MarketSectionCard({
  title,
  children,
  color = "blue",
}) {
  return (
    <div
      style={{
        ...boxStyle,
        ...getColorStyle(color),
      }}
    >
      <h4 style={titleStyle}>{title}</h4>

      {children}
    </div>
  );
}

function getColorStyle(color) {
  switch (color) {
    case "green":
      return {
        background: "rgba(34,197,94,0.09)",
        border: "1px solid rgba(34,197,94,0.18)",
      };

    case "orange":
      return {
        background: "rgba(245,158,11,0.10)",
        border: "1px solid rgba(245,158,11,0.22)",
      };

    case "teal":
      return {
        background: "rgba(20,184,166,0.10)",
        border: "1px solid rgba(20,184,166,0.22)",
      };

    default:
      return {
        background: "rgba(59,130,246,0.10)",
        border: "1px solid rgba(59,130,246,0.20)",
      };
  }
}

const boxStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "20px",
};

const titleStyle = {
  marginTop: 0,
  marginBottom: "14px",
  fontSize: "15px",
};