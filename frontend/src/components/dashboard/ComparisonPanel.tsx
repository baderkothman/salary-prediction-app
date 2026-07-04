import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
      title="Compare Two Estimates"
      description="See two of your estimates side by side and the salary difference between them."
      icon={<CompareArrowsIcon sx={{ color: "#000" }} aria-hidden="true" />}
    >
      {selectedPredictions.length < 2 ? (
        <DashboardEmptyState message="Nothing to compare yet. Tick the boxes next to two estimates in the list above and they will appear here." />
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
              <Box
                key={prediction.id}
                sx={{
                  border: "1px solid var(--sl-border)",
                  borderRadius: "6px",
                  bgcolor: "var(--sl-panel-low)",
                  p: 1.5,
                }}
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
              </Box>
            ))}
          </Box>

          <Alert severity="success" sx={{ borderRadius: "8px" }}>
            Salary difference between the two:{" "}
            {formatCurrency(
              Math.abs(
                (selectedPredictions[0].predicted_salary ?? 0) -
                  (selectedPredictions[1].predicted_salary ?? 0),
              ),
            )}
          </Alert>

          <Button
            variant="outlined"
            onClick={onClear}
            sx={{
              borderColor: "var(--sl-border)",
              color: "var(--sl-text)",
              borderRadius: "6px",
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              textTransform: "none",
            }}
          >
            Clear Selection
          </Button>
        </Stack>
      )}
    </SectionCard>
  );
}
