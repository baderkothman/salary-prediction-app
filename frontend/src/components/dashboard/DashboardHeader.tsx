import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

type DashboardHeaderProps = {
  refreshing: boolean;
  onReset: () => void;
  onRefresh: () => void;
};

export default function DashboardHeader({
  refreshing,
  onReset,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <Paper
      elevation={0}
      component="header"
      sx={{ border: "1px solid #dbeafe", borderRadius: 2, p: 2.5 }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: "#0f172a",
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            Salary Prediction Dashboard
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Filter, simulate, compare, and inspect saved salary predictions.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={onReset}>
            Reset filters
          </Button>
          <Button
            variant="contained"
            startIcon={refreshing ? <CircularProgress size={18} /> : <RefreshIcon />}
            onClick={onRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
