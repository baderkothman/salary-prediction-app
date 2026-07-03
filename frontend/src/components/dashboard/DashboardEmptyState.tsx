import Alert from "@mui/material/Alert";
import type { AlertColor } from "@mui/material/Alert";

type DashboardEmptyStateProps = {
  message: string;
  severity?: AlertColor;
};

export default function DashboardEmptyState({
  message,
  severity = "info",
}: DashboardEmptyStateProps) {
  return (
    <Alert
      severity={severity}
      sx={{
        borderRadius: "8px",
        border: "1px solid var(--sl-border)",
        bgcolor: "var(--sl-panel-low)",
        color: "var(--sl-text)",
      }}
    >
      {message}
    </Alert>
  );
}
