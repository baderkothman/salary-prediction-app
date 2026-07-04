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
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
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
  refresh: RefreshIcon,
  filter_off: FilterAltOffIcon,
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
            Know what a job should pay
          </Typography>
        </Box>

        <Stack component="nav" spacing={0.75} sx={{ flex: 1 }}>
          <NavButton
            icon="analytics"
            label="Predict a Salary"
            active={activeView === "predict"}
            onClick={() => setActiveView("predict")}
          />
          <NavButton
            icon="dashboard"
            label="My Results"
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")}
          />
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
            <Box component="span" sx={{ color: "var(--sl-text)", fontWeight: 700 }}>
              {activeView === "dashboard" ? "My Results" : "Predict a Salary"}
            </Box>
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <IconButton
              aria-label="Reload your results"
              title="Reload your results"
              onClick={dashboard.refreshData}
            >
              <MaterialIcon size={21}>refresh</MaterialIcon>
            </IconButton>
            <IconButton
              aria-label="Clear all filters"
              title="Clear all filters"
              onClick={dashboard.resetFilters}
            >
              <MaterialIcon size={21}>filter_off</MaterialIcon>
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

          {activeView === "dashboard" && dashboard.predictions.length === 0 ? (
            <Stack spacing={3} sx={{ maxWidth: 720, mx: "auto", py: { xs: 2, md: 6 } }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 28, md: 34 },
                    lineHeight: 1.2,
                    fontWeight: 800,
                    color: "var(--sl-text)",
                  }}
                >
                  Welcome to SalaryLens
                </Typography>
                <Typography sx={{ color: "var(--sl-muted)", mt: 1.5, fontSize: 16 }}>
                  SalaryLens tells you how much a tech job should pay. Answer a few
                  quick questions about a job and get an instant salary estimate based
                  on real market data.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  gap: 2,
                }}
              >
                {[
                  ["add", "1. Describe the job", "Pick a job title, experience level, and location."],
                  ["bolt", "2. Get your estimate", "See the expected yearly salary in seconds."],
                  ["dashboard", "3. Compare results", "Every estimate is saved here so you can compare jobs."],
                ].map(([icon, title, text]) => (
                  <Box
                    key={title}
                    sx={{
                      border: "1px solid var(--sl-border)",
                      borderRadius: "8px",
                      bgcolor: "var(--sl-panel)",
                      p: 2.5,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        bgcolor: "var(--sl-panel-high)",
                        display: "grid",
                        placeItems: "center",
                        mx: "auto",
                        mb: 1.25,
                      }}
                    >
                      <MaterialIcon size={21}>{icon}</MaterialIcon>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 14, mb: 0.5 }}>
                      {title}
                    </Typography>
                    <Typography sx={{ color: "var(--sl-muted)", fontSize: 13 }}>
                      {text}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <ButtonBase
                  onClick={() => setActiveView("predict")}
                  sx={{
                    bgcolor: "#000",
                    color: "#fff",
                    borderRadius: "8px",
                    px: 4,
                    py: 1.5,
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: 14,
                    fontWeight: 700,
                    gap: 1,
                    "&:hover": { opacity: 0.9 },
                  }}
                >
                  Create Your First Estimate
                  <MaterialIcon size={18}>arrow_forward</MaterialIcon>
                </ButtonBase>
                <Typography sx={{ color: "var(--sl-muted)", fontSize: 13, mt: 1.5 }}>
                  It takes less than a minute — no sign-up needed.
                </Typography>
              </Box>
            </Stack>
          ) : activeView === "dashboard" ? (
            <Stack spacing={3}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
              >
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
                    My Results
                  </Typography>
                  <Typography sx={{ color: "var(--sl-muted)", mt: 0.5 }}>
                    All the salary estimates you have created, in one place. Use the
                    filters to explore them, or compare two side by side.
                  </Typography>
                </Box>
                <ButtonBase
                  onClick={() => setActiveView("predict")}
                  sx={{
                    bgcolor: "#000",
                    color: "#fff",
                    borderRadius: "8px",
                    px: 2.5,
                    py: 1.25,
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    gap: 1,
                    flexShrink: 0,
                    "&:hover": { opacity: 0.9 },
                  }}
                >
                  <MaterialIcon size={18}>add</MaterialIcon>
                  New Salary Estimate
                </ButtonBase>
              </Stack>

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
                  Predict a Salary
                </Typography>
                <Typography sx={{ color: "var(--sl-muted)", mt: 0.5 }}>
                  Fill in the job details below and we&apos;ll estimate a fair yearly
                  salary (in US dollars) based on real market data.
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
                      How it works
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
                        ["add", "Describe the job", "Fill in the details above"],
                        ["bolt", "Get an estimate", "We compare it with real salary data"],
                        ["dashboard_customize", "Saved automatically", "Find it later under My Results"],
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
                        Where the numbers come from
                      </Typography>
                      <Typography sx={{ color: "var(--sl-muted)", fontSize: 14, mb: 2 }}>
                        Estimates are based on thousands of real salary records from
                        the tech industry, so the numbers reflect what companies
                        actually pay.
                      </Typography>
                      <Stack spacing={1}>
                        {["Built on real salary data", "Every estimate is saved for you"].map((item) => (
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
                      <Typography sx={{ fontWeight: 800, color: "#fff" }}>Tip</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 14, lineHeight: "20px" }}>
                      Try a few versions — for example the same job at different
                      experience levels. Every result is saved, so you can compare
                      them side by side under My Results.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          )}
        </div>

        <footer className="salarylens-footer">
          <Typography className="sl-label">© 2026 SalaryLens AI</Typography>
          <Typography className="sl-label">
            Estimates are a guide — actual offers may vary.
          </Typography>
        </footer>
      </main>

      <nav className="salarylens-mobile-nav" aria-label="Mobile navigation">
        <ButtonBase onClick={() => setActiveView("predict")} sx={{ flexDirection: "column" }}>
          <MaterialIcon filled={activeView === "predict"}>analytics</MaterialIcon>
          <Typography className="sl-label">Predict</Typography>
        </ButtonBase>
        <ButtonBase onClick={() => setActiveView("dashboard")} sx={{ flexDirection: "column" }}>
          <MaterialIcon filled={activeView === "dashboard"}>dashboard</MaterialIcon>
          <Typography className="sl-label">My Results</Typography>
        </ButtonBase>
      </nav>
    </div>
  );
}
