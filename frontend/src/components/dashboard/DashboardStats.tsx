import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import DatasetIcon from "@mui/icons-material/Dataset";
import PaidIcon from "@mui/icons-material/Paid";
import RefreshIcon from "@mui/icons-material/Refresh";

import type { SalaryPrediction } from "@/types/prediction";
import type { InsightKey } from "@/types/dashboard";
import { formatCurrency } from "@/utils/dashboard-formatters";

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
  const items: {
    key: InsightKey;
    label: string;
    value: string | number;
    icon: typeof DatasetIcon;
  }[] = [
    {
      key: "total",
      label: "Matching predictions",
      value: filteredCount,
      icon: DatasetIcon,
    },
    {
      key: "average",
      label: "Average predicted salary",
      value: formatCurrency(averagePredictedSalary),
      icon: BarChartIcon,
    },
    {
      key: "latest",
      label: "Latest predicted salary",
      value: formatCurrency(latestPrediction?.predicted_salary),
      icon: PaidIcon,
    },
  ];
  const latestSalary = formatCurrency(latestPrediction?.predicted_salary ?? averagePredictedSalary);
  const marketRange =
    latestPrediction?.overall_average_salary && latestPrediction?.job_title_average_salary
      ? `${formatCurrency(
          Math.min(
            latestPrediction.overall_average_salary,
            latestPrediction.job_title_average_salary,
          ),
        )} - ${formatCurrency(
          Math.max(
            latestPrediction.overall_average_salary,
            latestPrediction.job_title_average_salary,
          ),
        )}`
      : "N/A";
  const aiText =
    latestPrediction?.llm_analysis?.trim() ||
    insightText ||
    "Run and save a prediction to generate the analyst narrative.";
  const coveragePercent = Math.min(100, Math.max(8, filteredCount * 12));

  return (
    <Box
      component="section"
      aria-label="Key salary metrics"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 8fr) minmax(320px, 4fr)" },
        gap: 3,
      }}
    >
      <Box
        sx={{
          bgcolor: "var(--sl-panel)",
          border: "1px solid var(--sl-border)",
          borderRadius: "8px",
          boxShadow: "var(--sl-shadow)",
          p: 3,
          minHeight: 278,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 132,
            height: 132,
            bgcolor: "rgba(0,0,0,0.04)",
            borderBottomLeftRadius: 80,
            transform: "translate(38px, -38px)",
          }}
        />
        <Stack spacing={3} sx={{ height: "100%", justifyContent: "space-between" }}>
          <Box>
            <Typography className="sl-label-md" sx={{ color: "var(--sl-muted)", mb: 1 }}>
              Predicted Benchmark
            </Typography>
            <Typography
              component="h2"
              sx={{
                color: "#000",
                fontSize: { xs: 42, md: 56 },
                lineHeight: { xs: "48px", md: "62px" },
                fontWeight: 800,
                letterSpacing: 0,
              }}
            >
              {latestSalary}
            </Typography>
            <Typography sx={{ color: "var(--sl-secondary-text)", mt: 0.5 }}>
              {latestPrediction
                ? `Based on ${latestPrediction.job_title ?? "saved role"}, ${
                    latestPrediction.company_location ?? "global"
                  }, ${latestPrediction.company_size ?? "unknown"} company.`
                : "Save a prediction to populate the latest salary benchmark."}
            </Typography>
          </Box>

          <Box sx={{ borderTop: "1px solid var(--sl-border)", pt: 3 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
                gap: 3,
                alignItems: "end",
              }}
            >
              <Box>
                <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
                  <Typography className="sl-label">Data Coverage</Typography>
                  <Typography className="sl-label" sx={{ color: "var(--sl-blue)" }}>
                    {coveragePercent}%
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    height: 8,
                    bgcolor: "var(--sl-panel-mid)",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${coveragePercent}%`,
                      bgcolor: "#000",
                      boxShadow: "0 0 12px rgba(57, 128, 244, 0.35)",
                    }}
                  />
                </Box>
              </Box>

              <Stack direction="row" spacing={3} sx={{ justifyContent: { md: "flex-end" } }}>
                <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                  <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
                    Market Range
                  </Typography>
                  <Typography className="sl-label-md">{marketRange}</Typography>
                </Box>
                <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                  <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
                    Records
                  </Typography>
                  <Typography className="sl-label-md">{filteredCount}</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 1,
            }}
          >
            {items.map((item) => (
              <ButtonBase
                key={item.key}
                onClick={() => onSelectInsight(item.key)}
                aria-pressed={activeInsight === item.key}
                sx={{
                  justifyContent: "flex-start",
                  textAlign: "left",
                  border: "1px solid",
                  borderColor:
                    activeInsight === item.key ? "var(--sl-border-strong)" : "var(--sl-border)",
                  bgcolor:
                    activeInsight === item.key
                      ? "var(--sl-secondary-container)"
                      : "var(--sl-panel-low)",
                  borderRadius: "6px",
                  p: 1.25,
                  gap: 1,
                }}
              >
                <item.icon sx={{ fontSize: 18, flex: "0 0 auto" }} />
                <Box>
                  <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
                    {item.label}
                  </Typography>
                  <Typography className="sl-label-md">{item.value}</Typography>
                </Box>
              </ButtonBase>
            ))}
          </Box>
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: "var(--sl-panel)",
          border: "1px solid var(--sl-border)",
          borderRadius: "8px",
          p: 3,
          position: "relative",
          minHeight: 278,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 32,
            bottom: 32,
            width: 3,
            bgcolor: "var(--sl-navy)",
            borderRadius: "0 4px 4px 0",
          }}
        />
        <Box sx={{ pl: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
            <AutoAwesomeIcon sx={{ color: "var(--sl-navy)", fontSize: 22 }} />
            <Typography className="sl-label-md" sx={{ color: "var(--sl-blue)" }}>
              AI Analysis
            </Typography>
          </Stack>

          <Box
            sx={{
              bgcolor: "rgba(57,128,244,0.06)",
              border: "1px solid rgba(57,128,244,0.16)",
              borderRadius: "8px",
              p: 2,
            }}
          >
            <Typography
              className="typewriter-text"
              sx={{
                color: "var(--sl-text)",
                fontSize: 14,
                lineHeight: "21px",
                whiteSpace: "pre-line",
                maxHeight: 145,
                overflow: "hidden",
              }}
            >
              {aiText}
            </Typography>
          </Box>

          <ButtonBase
            onClick={() => onSelectInsight("latest")}
            sx={{
              mt: 2,
              color: "#000",
              gap: 0.5,
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 12,
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            <RefreshIcon sx={{ fontSize: 15 }} />
            Re-analyze parameters
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
}
