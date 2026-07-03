"use client";

import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import HistoryIcon from "@mui/icons-material/History";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";

import ComparisonPanel from "@/components/dashboard/ComparisonPanel";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardStatusBanner from "@/components/dashboard/DashboardStatusBanner";
import PredictionHistory from "@/components/dashboard/PredictionHistory";
import PredictionSimulator from "@/components/dashboard/PredictionSimulator";
import SalaryBreakdownChart from "@/components/dashboard/SalaryBreakdownChart";
import { useDashboardData } from "@/hooks/useDashboardData";

type ActiveView = "predict" | "dashboard";

function MaterialIcon({
  children,
  size = 22,
}: {
  children: string;
  filled?: boolean;
  size?: number;
}) {
  const Icon = iconMap[children] ?? AnalyticsIcon;
  return (
    <Icon aria-hidden="true" sx={{ fontSize: size, display: "block" }} />
  );
}

const iconMap: Record<string, typeof AnalyticsIcon> = {
  account_circle: AccountCircleIcon,
  add: AddIcon,
  analytics: AnalyticsIcon,
  arrow_forward: ArrowForwardIcon,
  bolt: BoltIcon,
  check_circle: CheckCircleIcon,
  dashboard: DashboardIcon,
  dashboard_customize: DashboardCustomizeIcon,
  database: StorageIcon,
  history: HistoryIcon,
  lightbulb: LightbulbIcon,
  menu: MenuIcon,
  search: SearchIcon,
  settings: SettingsIcon,
};

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: "100%",
        justifyContent: "flex-start",
        gap: 2,
        px: 2,
        py: 1.1,
        borderRadius: "8px",
        color: active ? "var(--sl-secondary-text)" : "var(--sl-muted)",
        bgcolor: active ? "var(--sl-secondary-container)" : "transparent",
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: 14,
        fontWeight: active ? 700 : 500,
        transition: "160ms ease",
        "&:hover": {
          bgcolor: active ? "var(--sl-secondary-container)" : "var(--sl-panel-high)",
          color: "var(--sl-black)",
        },
      }}
    >
      <MaterialIcon filled={active}>
        {icon}
      </MaterialIcon>
      <span>{label}</span>
    </ButtonBase>
  );
}

export default function Home() {
  const dashboard = useDashboardData();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  if (dashboard.loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="salarylens-shell">
      <aside className="salarylens-sidebar">
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography
            component="h1"
            sx={{ fontSize: 24, lineHeight: "32px", fontWeight: 800, color: "#000" }}
          >
            SalaryLens AI
          </Typography>
          <Typography className="sl-label" sx={{ color: "var(--sl-muted)", mt: 0.25 }}>
            Enterprise Analytics
          </Typography>
        </Box>

        <Stack component="nav" spacing={0.75} sx={{ flex: 1 }}>
          <NavButton
            icon="analytics"
            label="Predict"
            active={activeView === "predict"}
            onClick={() => setActiveView("predict")}
          />
          <NavButton
            icon="dashboard"
            label="Dashboard"
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")}
          />
        </Stack>

        <Box sx={{ px: 1, pb: 1 }}>
          <ButtonBase
            onClick={() => setActiveView("predict")}
            sx={{
              width: "100%",
              bgcolor: "#000",
              color: "#fff",
              borderRadius: "8px",
              py: 1.25,
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 13,
              fontWeight: 700,
              gap: 1,
              "&:hover": { opacity: 0.9 },
            }}
          >
            <MaterialIcon size={18}>add</MaterialIcon>
            New Prediction
          </ButtonBase>
        </Box>

        <Stack spacing={0.75} sx={{ borderTop: "1px solid var(--sl-border)", pt: 2 }}>
          <NavButton icon="history" label="History" onClick={() => setActiveView("dashboard")} />
          <NavButton icon="settings" label="Settings" />
        </Stack>
      </aside>

      <main className="salarylens-main">
        <header className="salarylens-topbar">
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5 }}>
            <MaterialIcon>menu</MaterialIcon>
            <Typography sx={{ fontSize: 24, lineHeight: "32px", fontWeight: 800 }}>
              SalaryLens
            </Typography>
          </Box>

          <Typography
            sx={{
              display: { xs: "none", md: "block" },
              color: "var(--sl-muted)",
              fontSize: 16,
            }}
          >
            Analytics /{" "}
            <Box component="span" sx={{ color: "var(--sl-text)", fontWeight: 700 }}>
              {activeView === "dashboard" ? "Salary Dashboard" : "New Prediction"}
            </Box>
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
                bgcolor: "var(--sl-panel-mid)",
                border: "1px solid var(--sl-border)",
                borderRadius: "999px",
                px: 1.5,
                py: 0.7,
                width: 260,
              }}
            >
              <MaterialIcon size={20}>search</MaterialIcon>
              <Box
                component="input"
                aria-label="Search saved salary data"
                placeholder="Search data..."
                value={dashboard.filters.search}
                onChange={(event) => dashboard.updateFilter("search", event.target.value)}
                sx={{
                  border: 0,
                  outline: 0,
                  bgcolor: "transparent",
                  width: "100%",
                  fontSize: 13,
                  color: "var(--sl-text)",
                }}
              />
            </Box>

            <IconButton aria-label="Refresh dashboard" onClick={dashboard.refreshData}>
              <MaterialIcon size={21}>account_circle</MaterialIcon>
            </IconButton>
            <IconButton aria-label="Reset filters" onClick={dashboard.resetFilters}>
              <MaterialIcon size={21}>settings</MaterialIcon>
            </IconButton>
          </Stack>
        </header>

        <div className="salarylens-content">
          <DashboardStatusBanner
            refreshing={dashboard.refreshing}
            error={dashboard.error}
            success={dashboard.success}
            onDismissError={() => dashboard.setError(null)}
            onDismissSuccess={() => dashboard.setSuccess(null)}
          />

          {activeView === "dashboard" ? (
            <Stack spacing={3}>
              <DashboardStats
                filteredCount={dashboard.filteredPredictions.length}
                averagePredictedSalary={dashboard.averagePredictedSalary}
                latestPrediction={dashboard.latestPrediction}
                activeInsight={dashboard.activeInsight}
                onSelectInsight={dashboard.setActiveInsight}
                insightText={dashboard.insightText}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) 360px" },
                  gap: 3,
                  alignItems: "stretch",
                }}
              >
                <SalaryBreakdownChart
                  chartMode={dashboard.chartMode}
                  onChartModeChange={dashboard.setChartMode}
                  chartData={dashboard.chartData}
                />
                <DashboardFilters
                  filters={dashboard.filters}
                  options={dashboard.options}
                  salaryBounds={dashboard.salaryBounds}
                  onChange={dashboard.updateFilter}
                />
              </Box>

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

              <ComparisonPanel
                selectedPredictions={dashboard.selectedPredictions}
                onClear={dashboard.clearComparison}
              />
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 28, md: 32 },
                    lineHeight: { xs: "36px", md: "40px" },
                    fontWeight: 700,
                    color: "var(--sl-text)",
                  }}
                >
                  New Salary Prediction
                </Typography>
                <Typography sx={{ color: "var(--sl-muted)", mt: 0.5 }}>
                  Configure job parameters to generate a market-calibrated salary estimate
                  using ML.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 8fr) 360px" },
                  gap: 3,
                  alignItems: "start",
                }}
              >
                <Stack spacing={3} sx={{ minWidth: 0 }}>
                  <PredictionSimulator
                    simulator={dashboard.simulator}
                    options={dashboard.options}
                    analyzing={dashboard.analyzing}
                    onChange={dashboard.updateSimulator}
                    onSubmit={dashboard.handleAnalyze}
                  />

                  <Box
                    sx={{
                      borderLeft: "3px solid var(--sl-blue)",
                      border: "1px solid var(--sl-border)",
                      borderLeftColor: "var(--sl-blue)",
                      borderRadius: "0 8px 8px 0",
                      bgcolor: "rgba(0, 26, 66, 0.04)",
                      p: 3,
                    }}
                  >
                    <Typography className="sl-label-md" sx={{ color: "#000", mb: 2 }}>
                      End-to-End Pipeline
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr auto 1fr" },
                        gap: 2,
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      {[
                        ["bolt", "FastAPI", "ML Model Inference"],
                        ["database", "Supabase", "Data Persistence"],
                        ["dashboard_customize", "Next.js", "Frontend Dashboard"],
                      ].map(([icon, title, text], index) => (
                        <Box key={title} sx={{ display: "contents" }}>
                          <Stack spacing={0.75} sx={{ alignItems: "center" }}>
                            <Box
                              sx={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                bgcolor: "var(--sl-panel-high)",
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              <MaterialIcon size={21}>{icon}</MaterialIcon>
                            </Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
                              {title}
                            </Typography>
                            <Typography sx={{ color: "var(--sl-muted)", fontSize: 12 }}>
                              {text}
                            </Typography>
                          </Stack>
                          {index < 2 ? (
                            <Box sx={{ display: { xs: "none", md: "block" } }}>
                              <MaterialIcon>arrow_forward</MaterialIcon>
                            </Box>
                          ) : null}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Stack>

                <Stack spacing={3}>
                  <Box
                    sx={{
                      bgcolor: "var(--sl-panel-low)",
                      border: "1px solid var(--sl-border)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: 128,
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(57,128,244,0.18)), radial-gradient(circle at 80% 20%, rgba(0,26,66,0.24), transparent 34%), repeating-linear-gradient(135deg, rgba(118,119,125,0.18) 0 1px, transparent 1px 12px)",
                        borderBottom: "1px solid var(--sl-border)",
                      }}
                    />
                    <Box sx={{ p: 2.5 }}>
                      <Typography sx={{ fontWeight: 800, mb: 1 }}>
                        Engine Calibration
                      </Typography>
                      <Typography sx={{ color: "var(--sl-muted)", fontSize: 14, mb: 2 }}>
                        Decision Tree inference uses the cleaned Kaggle salary dataset,
                        validated API inputs, and persisted Supabase analysis records.
                      </Typography>
                      <Stack spacing={1}>
                        {["Decision Tree pipeline", "Validated input domain"].map((item) => (
                          <Stack key={item} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <MaterialIcon size={17}>check_circle</MaterialIcon>
                            <Typography className="sl-label" sx={{ textTransform: "none" }}>
                              {item}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "var(--sl-navy)",
                      color: "#d8e2ff",
                      borderRadius: "8px",
                      p: 2.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", mb: 1 }}>
                      <MaterialIcon>lightbulb</MaterialIcon>
                      <Typography sx={{ fontWeight: 800, color: "#fff" }}>Pro Tip</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 14, lineHeight: "20px" }}>
                      Run common scenarios before deploying the dashboard so the Supabase
                      history has useful stories, charts, and comparisons ready.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          )}
        </div>

        <footer className="salarylens-footer">
          <Typography className="sl-label">
            © 2026 SalaryLens AI Infrastructure. Powered by local ML and LLM analysis.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography className="sl-label">Data Policy</Typography>
            <Typography className="sl-label">System Status</Typography>
          </Stack>
        </footer>
      </main>

      <nav className="salarylens-mobile-nav" aria-label="Mobile navigation">
        <ButtonBase onClick={() => setActiveView("predict")} sx={{ flexDirection: "column" }}>
          <MaterialIcon filled={activeView === "predict"}>analytics</MaterialIcon>
          <Typography className="sl-label">Predict</Typography>
        </ButtonBase>
        <ButtonBase onClick={() => setActiveView("dashboard")} sx={{ flexDirection: "column" }}>
          <MaterialIcon filled={activeView === "dashboard"}>dashboard</MaterialIcon>
          <Typography className="sl-label">Dashboard</Typography>
        </ButtonBase>
        <ButtonBase onClick={() => setActiveView("dashboard")} sx={{ flexDirection: "column" }}>
          <MaterialIcon>history</MaterialIcon>
          <Typography className="sl-label">History</Typography>
        </ButtonBase>
        <ButtonBase sx={{ flexDirection: "column" }}>
          <MaterialIcon>settings</MaterialIcon>
          <Typography className="sl-label">Settings</Typography>
        </ButtonBase>
      </nav>
    </div>
  );
}
