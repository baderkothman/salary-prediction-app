import { Fragment } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
      title="Your Past Estimates"
      description="Every estimate you create is saved here. Tick the boxes on two rows to compare them side by side."
    >
      {predictions.length === 0 ? (
        <DashboardEmptyState message="No results match your current filters. Try clearing some filters, or create a new salary estimate." />
      ) : (
        <Box sx={{ overflowX: "auto", mx: -3, mb: -3 }}>
          <Box component="table" sx={tableSx}>
            <Box component="thead" sx={{ bgcolor: "var(--sl-panel-low)" }}>
              <Box component="tr">
                <Box component="th" sx={headerCellSx}>
                  Compare
                </Box>
                <Box component="th" sx={headerCellSx}>
                  Job
                </Box>
                <Box component="th" sx={headerCellSx}>
                  Location
                </Box>
                <Box component="th" sx={{ ...headerCellSx, textAlign: "right" }}>
                  Estimated Salary
                </Box>
                <Box component="th" sx={{ ...headerCellSx, textAlign: "center" }}>
                  Vs. Market Average
                </Box>
                <Box component="th" sx={{ ...headerCellSx, textAlign: "right" }}>
                  <Box component="span" sx={visuallyHiddenSx}>
                    Details
                  </Box>
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
                              benchmarkDelta === null
                                ? "var(--sl-muted)"
                                : benchmarkDelta >= 0
                                  ? "var(--sl-blue)"
                                  : "var(--sl-error)",
                            mt: "7px",
                          }}
                        />
                        <Typography className="sl-label">
                          {benchmarkDelta === null
                            ? "No data"
                            : benchmarkDelta >= 0
                              ? `${formatCurrency(Math.abs(benchmarkDelta))} above`
                              : `${formatCurrency(Math.abs(benchmarkDelta))} below`}
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
                            <ExpandMoreIcon sx={{ fontSize: 18 }} />
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
                        {expanded ? "Hide details" : "View details"}
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
                                "No written summary was saved for this estimate."}
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
              {selectedCount === 0
                ? "Tick the boxes on two rows to compare them side by side."
                : selectedCount === 1
                  ? "1 of 2 selected — pick one more to compare."
                  : "2 of 2 selected — see the comparison below."}
            </Typography>
          </Box>
        </Box>
      )}
    </SectionCard>
  );
}

const visuallyHiddenSx = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

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
