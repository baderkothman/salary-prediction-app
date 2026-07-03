import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";

type DashboardStatusBannerProps = {
  refreshing: boolean;
  error: string | null;
  success: string | null;
  onDismissError: () => void;
  onDismissSuccess: () => void;
};

export default function DashboardStatusBanner({
  refreshing,
  error,
  success,
  onDismissError,
  onDismissSuccess,
}: DashboardStatusBannerProps) {
  if (!refreshing && !error && !success) return null;

  return (
    <Stack spacing={1.5}>
      {refreshing ? <LinearProgress aria-label="Refreshing dashboard data" /> : null}

      {error ? (
        <Alert severity="error" role="alert" onClose={onDismissError}>
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert severity="success" role="status" onClose={onDismissSuccess}>
          {success}
        </Alert>
      ) : null}
    </Stack>
  );
}
