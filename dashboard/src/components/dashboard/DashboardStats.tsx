import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import AnalyticsIcon from "@mui/icons-material/Analytics";

import type { SalaryPrediction } from "@/types/prediction";
import type { InsightKey } from "@/types/dashboard";
import { formatCurrency } from "@/utils/dashboard-formatters";
import StatCard from "./StatCard";

type DashboardStatsProps = {
  filteredCount: number;
  averagePredictedSalary: number | null;
  latestPrediction: SalaryPrediction | undefined;
  activeInsight: InsightKey;
  onSelectInsight: (key: InsightKey) => void;
  insightText: string;
};

export default function DashboardStats({
  filteredCount,
  averagePredictedSalary,
  latestPrediction,
  activeInsight,
  onSelectInsight,
  insightText,
}: DashboardStatsProps) {
  const items: { key: InsightKey; label: string; value: string | number }[] = [
    {
      key: "total",
      label: "Matching predictions",
      value: filteredCount,
    },
    {
      key: "average",
      label: "Average predicted salary",
      value: formatCurrency(averagePredictedSalary),
    },
    {
      key: "latest",
      label: "Latest predicted salary",
      value: formatCurrency(latestPrediction?.predicted_salary),
    },
  ];

  return (
    <Box component="section" aria-label="Key salary metrics">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {items.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={item.value}
            selected={activeInsight === item.key}
            onSelect={() => onSelectInsight(item.key)}
          />
        ))}
      </Box>

      <Alert severity="info" icon={<AnalyticsIcon />} sx={{ mt: 2 }}>
        {insightText}
      </Alert>
    </Box>
  );
}
