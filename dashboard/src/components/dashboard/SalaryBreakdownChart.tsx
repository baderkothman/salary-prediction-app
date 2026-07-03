import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartMode, ChartPoint } from "@/types/dashboard";
import { formatCurrency } from "@/utils/dashboard-formatters";
import DashboardEmptyState from "./DashboardEmptyState";
import SectionCard from "./SectionCard";

const chartColors = ["#1e40af", "#d97706", "#15803d", "#7c3aed", "#be123c"];

const chartModeTabs: { value: ChartMode; label: string }[] = [
  { value: "experience", label: "Experience" },
  { value: "job", label: "Job" },
  { value: "company", label: "Company" },
  { value: "remote", label: "Remote" },
  { value: "benchmarks", label: "Benchmarks" },
];

type SalaryBreakdownChartProps = {
  chartMode: ChartMode;
  onChartModeChange: (mode: ChartMode) => void;
  chartData: ChartPoint[];
};

export default function SalaryBreakdownChart({
  chartMode,
  onChartModeChange,
  chartData,
}: SalaryBreakdownChartProps) {
  return (
    <SectionCard
      title="Salary Breakdown"
      description="Average predicted salary grouped by the selected dimension."
      action={
        <Tabs
          value={chartMode}
          variant="scrollable"
          onChange={(_, value: ChartMode) => onChartModeChange(value)}
          aria-label="Salary chart grouping"
        >
          {chartModeTabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      }
    >
      {chartData.length === 0 ? (
        <DashboardEmptyState
          severity="warning"
          message="No chartable data matches the current filters."
        />
      ) : (
        <Box sx={{ height: 360, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
              <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="average_salary" name="Salary" isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </SectionCard>
  );
}
