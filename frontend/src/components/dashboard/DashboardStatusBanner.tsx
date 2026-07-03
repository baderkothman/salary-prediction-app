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
    <Stack spacing={1.5} sx={{ mb: 3 }}>
      {refreshing ? <LinearProgress aria-label="Refreshing dashboard data" /> : null}

      {error ? (
        <Alert
          severity="error"
          role="alert"
          onClose={onDismissError}
          sx={{ borderRadius: "8px", border: "1px solid var(--sl-border)" }}
        >
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert
          severity="success"
          role="status"
          onClose={onDismissSuccess}
          sx={{ borderRadius: "8px", border: "1px solid var(--sl-border)" }}
        >
          {success}
        </Alert>
      ) : null}
    </Stack>
  );
}
