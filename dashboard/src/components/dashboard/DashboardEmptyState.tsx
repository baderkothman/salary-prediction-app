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
  return <Alert severity={severity}>{message}</Alert>;
}
