import { Link } from "react-router-dom";

import StatusPage from "../components/common/StatusPage";
import { NOT_FOUND_CONTENT } from "../config/notFoundContent";
import { ROUTE_PATHS } from "../config/routePaths";

export default function NotFound() {
  return (
    <StatusPage
      badge={NOT_FOUND_CONTENT.badge}
      title={NOT_FOUND_CONTENT.title}
      text={NOT_FOUND_CONTENT.text}
      action={
        <Link to={ROUTE_PATHS.scanner} style={buttonStyle}>
          {NOT_FOUND_CONTENT.actionLabel}
        </Link>
      }
    />
  );
}

const buttonStyle = {
  display: "inline-block",
  padding: "13px 18px",
  borderRadius: "16px",
  background: "rgba(59,130,246,0.18)",
  border: "1px solid rgba(59,130,246,0.35)",
  color: "#dbeafe",
  fontWeight: "900",
  textDecoration: "none",
};