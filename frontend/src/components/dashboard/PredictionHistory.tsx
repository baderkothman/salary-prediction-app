import { Fragment } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import type { SalaryPrediction } from "@/types/prediction";
import { formatCurrency, formatDate, getChartUrl } from "@/utils/dashboard-formatters";
import { formatCountry } from "@/utils/country-codes";
import DashboardEmptyState from "./DashboardEmptyState";
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
      description="Review and export recent model outputs."
      action={
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            borderColor: "var(--sl-border)",
            color: "var(--sl-text)",
            borderRadius: "6px",
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 12,
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          Export All
        </Button>
      }
    >
      {predictions.length === 0 ? (
        <DashboardEmptyState message="No predictions match the current filters. Try widening your filters or running a new analysis." />
      ) : (
        <Box sx={{ overflowX: "auto", mx: -3, mb: -3 }}>
          <Box component="table" sx={tableSx}>
            <Box component="thead" sx={{ bgcolor: "var(--sl-panel-low)" }}>
              <Box component="tr">
                <Box component="th" sx={headerCellSx}>
                  Select
                </Box>
                <Box component="th" sx={headerCellSx}>
                  Position & Dataset
                </Box>
                <Box component="th" sx={headerCellSx}>
                  Location
                </Box>
                <Box component="th" sx={{ ...headerCellSx, textAlign: "right" }}>
                  Predicted Salary
                </Box>
                <Box component="th" sx={{ ...headerCellSx, textAlign: "center" }}>
                  Benchmark
                </Box>
                <Box component="th" sx={{ ...headerCellSx, textAlign: "right" }}>
                  Action
                </Box>
              </Box>
            </Box>
            <Box component="tbody">
              {predictions.map((prediction, index) => {
                const expanded = expandedId === prediction.id;
                const chartUrl = getChartUrl(prediction.chart_url);
                const benchmarkDelta =
                  typeof prediction.predicted_salary === "number" &&
                  typeof prediction.overall_average_salary === "number"
                    ? prediction.predicted_salary - prediction.overall_average_salary
                    : null;

                return (
                  <Fragment key={prediction.id}>
                    <Box component="tr" sx={rowSx(index)}>
                    <Box component="td" sx={bodyCellSx}>
                      <Checkbox
                        checked={selectedIds.includes(prediction.id)}
                        onChange={() => onToggleSelected(prediction.id)}
                        slotProps={{
                          input: {
                            "aria-label": `Select ${
                              prediction.job_title ?? "prediction"
                            } for comparison`,
                          },
                        }}
                        sx={{
                          color: "var(--sl-border-strong)",
                          "&.Mui-checked": { color: "#000" },
                        }}
                      />
                    </Box>
                    <Box component="td" sx={bodyCellSx}>
                      <Typography sx={{ fontWeight: 800 }}>
                        {prediction.job_title ?? "Unknown job title"}
                      </Typography>
                      <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
                        {prediction.experience_level ?? "No level"} /{" "}
                        {prediction.employment_type ?? "No type"}
                      </Typography>
                    </Box>
                    <Box component="td" sx={bodyCellSx}>
                      <Typography sx={{ fontSize: 14 }}>
                        {formatCountry(prediction.company_location)}
                      </Typography>
                      <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
                        Remote {prediction.remote_ratio ?? "N/A"}%
                      </Typography>
                    </Box>
                    <Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
                      <Typography className="sl-label-md">
                        {formatCurrency(prediction.predicted_salary)}
                      </Typography>
                    </Box>
                    <Box component="td" sx={bodyCellSx}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor:
                              benchmarkDelta === null || benchmarkDelta >= 0
                                ? "var(--sl-error)"
                                : "var(--sl-blue)",
                            mt: "7px",
                          }}
                        />
                        <Typography className="sl-label">
                          {benchmarkDelta === null
                            ? "N/A"
                            : benchmarkDelta >= 0
                              ? `Above ${formatCurrency(Math.abs(benchmarkDelta))}`
                              : `Below ${formatCurrency(Math.abs(benchmarkDelta))}`}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
                      <Button
                        variant="text"
                        onClick={() => onToggleExpanded(prediction.id)}
                        endIcon={
                          expanded ? (
                            <ExpandLessIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <OpenInNewIcon sx={{ fontSize: 18 }} />
                          )
                        }
                        sx={{
                          color: "var(--sl-muted)",
                          fontFamily: 'var(--font-jetbrains-mono), monospace',
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: "none",
                          "&:hover": { color: "#000" },
                        }}
                      >
                        Details
                      </Button>
                    </Box>
                    </Box>
                    <Box component="tr" sx={{ bgcolor: "rgba(57,128,244,0.04)" }}>
                    <Box component="td" colSpan={6} sx={{ p: 0, borderTop: 0 }}>
                      <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: chartUrl ? "1fr 320px" : "1fr" },
                            gap: 2,
                            p: 3,
                            bgcolor: "rgba(57,128,244,0.04)",
                            borderTop: "1px solid var(--sl-border)",
                          }}
                        >
                          <Box>
                            <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
                              Created {formatDate(prediction.created_at)}
                            </Typography>
                            <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>
                              {prediction.llm_analysis ||
                                "No LLM analysis was saved for this prediction."}
                            </Typography>
                          </Box>
                          {chartUrl ? (
                            <Box
                              component="img"
                              src={chartUrl}
                              alt={`Salary comparison chart for ${
                                prediction.job_title ?? "prediction"
                              }`}
                              loading="lazy"
                              sx={{
                                width: "100%",
                                borderRadius: "6px",
                                border: "1px solid var(--sl-border)",
                                bgcolor: "#fff",
                              }}
                            />
                          ) : null}
                        </Box>
                      </Collapse>
                    </Box>
                    </Box>
                  </Fragment>
                );
              })}
            </Box>
          </Box>
          <Box sx={{ px: 3, py: 1.5, borderTop: "1px solid var(--sl-border)" }}>
            <Typography className="sl-label" sx={{ color: "var(--sl-muted)" }}>
              {selectedCount}/2 selected for comparison
            </Typography>
          </Box>
        </Box>
      )}
    </SectionCard>
  );
}

const tableSx = {
  width: "100%",
  minWidth: 900,
  borderCollapse: "collapse",
};

const headerCellSx = {
  px: 3,
  py: 1.5,
  textAlign: "left",
  color: "var(--sl-muted)",
  fontFamily: 'var(--font-jetbrains-mono), monospace',
  fontSize: 12,
  lineHeight: "16px",
  fontWeight: 700,
  textTransform: "uppercase",
  borderBottom: "1px solid var(--sl-border)",
};

const bodyCellSx = {
  px: 3,
  py: 2,
  borderBottom: "1px solid var(--sl-border)",
  verticalAlign: "middle",
};

function rowSx(index: number) {
  return {
    bgcolor: index % 2 === 1 ? "rgba(242,244,246,0.42)" : "transparent",
    "&:hover": { bgcolor: "var(--sl-panel-mid)" },
  };
}
