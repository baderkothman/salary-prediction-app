import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

import type { SalaryPrediction } from "@/types/prediction";
import DashboardEmptyState from "./DashboardEmptyState";
import PredictionCard from "./PredictionCard";
import SectionCard from "./SectionCard";

type PredictionHistoryProps = {
  predictions: SalaryPrediction[];
  expandedId: string | null;
  selectedIds: string[];
  selectedCount: number;
  onToggleExpanded: (id: string) => void;
  onToggleSelected: (id: string) => void;
};

export default function PredictionHistory({
  predictions,
  expandedId,
  selectedIds,
  selectedCount,
  onToggleExpanded,
  onToggleSelected,
}: PredictionHistoryProps) {
  return (
    <SectionCard
      title="Prediction History"
      description="Expand a row for details, or select two predictions to compare."
      action={
        <Chip
          icon={<CompareArrowsIcon />}
          label={`${selectedCount}/2 selected`}
          color={selectedCount === 2 ? "primary" : "default"}
        />
      }
    >
      {predictions.length === 0 ? (
        <DashboardEmptyState message="No predictions match the current filters. Try widening your filters or running a new analysis." />
      ) : (
        <Stack spacing={1.5} component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {predictions.map((prediction) => (
            <Box component="li" key={prediction.id}>
              <PredictionCard
                prediction={prediction}
                expanded={expandedId === prediction.id}
                selected={selectedIds.includes(prediction.id)}
                onToggleExpanded={() => onToggleExpanded(prediction.id)}
                onToggleSelected={() => onToggleSelected(prediction.id)}
              />
            </Box>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
