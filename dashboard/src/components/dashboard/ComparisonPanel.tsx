import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

import type { SalaryPrediction } from "@/types/prediction";
import { formatCurrency } from "@/utils/dashboard-formatters";
import DashboardEmptyState from "./DashboardEmptyState";
import SectionCard from "./SectionCard";

type ComparisonPanelProps = {
  selectedPredictions: SalaryPrediction[];
  onClear: () => void;
};

export default function ComparisonPanel({
  selectedPredictions,
  onClear,
}: ComparisonPanelProps) {
  return (
    <SectionCard
      title="Compare Predictions"
      icon={<CompareArrowsIcon color="primary" aria-hidden="true" />}
    >
      {selectedPredictions.length < 2 ? (
        <DashboardEmptyState message="Select two history rows to compare salary, inputs, and benchmark deltas." />
      ) : (
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 1,
            }}
          >
            {selectedPredictions.map((prediction) => (
              <Paper
                key={prediction.id}
                elevation={0}
                sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5, p: 1.5 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {prediction.job_title}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {formatCurrency(prediction.predicted_salary)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {prediction.experience_level} - {prediction.company_size} - Remote{" "}
                  {prediction.remote_ratio}%
                </Typography>
              </Paper>
            ))}
          </Box>

          <Alert severity="success">
            Difference:{" "}
            {formatCurrency(
              Math.abs(
                (selectedPredictions[0].predicted_salary ?? 0) -
                  (selectedPredictions[1].predicted_salary ?? 0),
              ),
            )}
          </Alert>

          <Button variant="outlined" onClick={onClear}>
            Clear comparison
          </Button>
        </Stack>
      )}
    </SectionCard>
  );
}
