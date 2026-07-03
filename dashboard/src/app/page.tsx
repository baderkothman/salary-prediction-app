"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

import ComparisonPanel from "@/components/dashboard/ComparisonPanel";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardStatusBanner from "@/components/dashboard/DashboardStatusBanner";
import PredictionHistory from "@/components/dashboard/PredictionHistory";
import PredictionSimulator from "@/components/dashboard/PredictionSimulator";
import SalaryBreakdownChart from "@/components/dashboard/SalaryBreakdownChart";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Home() {
  const dashboard = useDashboardData();

  if (dashboard.loading) {
    return <DashboardLoadingState />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <DashboardHeader
            refreshing={dashboard.refreshing}
            onReset={dashboard.resetFilters}
            onRefresh={dashboard.refreshData}
          />

          <DashboardStatusBanner
            refreshing={dashboard.refreshing}
            error={dashboard.error}
            success={dashboard.success}
            onDismissError={() => dashboard.setError(null)}
            onDismissSuccess={() => dashboard.setSuccess(null)}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                lg: "280px minmax(0, 1fr) 360px",
              },
              gap: 2,
              alignItems: "start",
            }}
          >
            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <DashboardFilters
                filters={dashboard.filters}
                options={dashboard.options}
                salaryBounds={dashboard.salaryBounds}
                onChange={dashboard.updateFilter}
              />
            </Stack>

            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <DashboardStats
                filteredCount={dashboard.filteredPredictions.length}
                averagePredictedSalary={dashboard.averagePredictedSalary}
                latestPrediction={dashboard.latestPrediction}
                activeInsight={dashboard.activeInsight}
                onSelectInsight={dashboard.setActiveInsight}
                insightText={dashboard.insightText}
              />

              <SalaryBreakdownChart
                chartMode={dashboard.chartMode}
                onChartModeChange={dashboard.setChartMode}
                chartData={dashboard.chartData}
              />

              <PredictionHistory
                predictions={dashboard.filteredPredictions}
                expandedId={dashboard.expandedId}
                selectedIds={dashboard.selectedIds}
                selectedCount={dashboard.selectedPredictions.length}
                onToggleExpanded={(id) =>
                  dashboard.setExpandedId(dashboard.expandedId === id ? null : id)
                }
                onToggleSelected={dashboard.toggleSelected}
              />
            </Stack>

            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <PredictionSimulator
                simulator={dashboard.simulator}
                options={dashboard.options}
                analyzing={dashboard.analyzing}
                onChange={dashboard.updateSimulator}
                onSubmit={dashboard.handleAnalyze}
              />

              <ComparisonPanel
                selectedPredictions={dashboard.selectedPredictions}
                onClear={dashboard.clearComparison}
              />
            </Stack>
          </Box>
        </Stack>
      </Container>
    </main>
  );
}
