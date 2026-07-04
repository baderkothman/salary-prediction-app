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

const chartColors = ["#d5e3fd", "#b9c7e0", "#000000", "#adc6ff", "#001a42"];

const chartModeTabs: { value: ChartMode; label: string }[] = [
  { value: "experience", label: "By Experience" },
  { value: "job", label: "By Job Title" },
  { value: "company", label: "By Company Size" },
  { value: "remote", label: "By Remote Work" },
  { value: "benchmarks", label: "Latest vs. Market" },
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
      title="Salary Chart"
      description="Average estimated salary from your results. Use the tabs to group the bars in different ways."
      action={
        <Tabs
          value={chartMode}
          variant="scrollable"
          onChange={(_, value: ChartMode) => onChartModeChange(value)}
          aria-label="Salary chart grouping"
          sx={{
            minHeight: 32,
            "& .MuiTab-root": {
              minHeight: 32,
              py: 0.5,
              px: 1.25,
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 10,
              fontWeight: 700,
              color: "var(--sl-muted)",
              bgcolor: "var(--sl-panel-mid)",
              borderRadius: "4px",
              mr: 0.75,
            },
            "& .Mui-selected": {
              color: "#000",
              bgcolor: "var(--sl-secondary-container)",
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
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
          message="Nothing to chart yet. Try clearing some filters, or create a new salary estimate."
        />
      ) : (
        <Box sx={{ height: 360, minWidth: 0, pt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#c6c6cd" strokeOpacity={0.35} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#45464d", fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" }}
                axisLine={{ stroke: "#c6c6cd" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
                tick={{ fill: "#45464d", fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend wrapperStyle={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12 }} />
              <Bar
                dataKey="average_salary"
                name="Salary"
                isAnimationActive={false}
                radius={[3, 3, 0, 0]}
              >
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
