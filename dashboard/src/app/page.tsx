"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
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

import {
  analyzeSalary,
  getSalaryOptions,
  getSalaryPredictions,
  type AnalyzeInput,
  type SalaryOptions,
} from "@/lib/predictions";
import type { SalaryPrediction } from "@/types/prediction";

type ChartMode = "experience" | "job" | "company" | "remote" | "benchmarks";
type InsightKey = "total" | "average" | "latest";

type Filters = {
  search: string;
  experience: string;
  companySize: string;
  remoteRatio: string;
  salaryRange: [number, number];
  startDate: string;
  endDate: string;
};

const emptyOptions: SalaryOptions = {
  work_year: [2022, 2021, 2020],
  experience_level: ["Entry-level", "Mid-level", "Senior-level", "Executive-level"],
  employment_type: ["Full-time", "Part-time", "Contract", "Freelance"],
  job_title: ["Data Scientist", "Data Analyst", "Data Engineer"],
  employee_residence: ["US"],
  remote_ratio: [0, 50, 100],
  company_location: ["US"],
  company_size: ["Small", "Medium", "Large"],
};

const initialSimulator: AnalyzeInput = {
  work_year: 2022,
  experience_level: "Senior-level",
  employment_type: "Full-time",
  job_title: "Data Scientist",
  employee_residence: "US",
  remote_ratio: 100,
  company_location: "US",
  company_size: "Medium",
};

const chartColors = ["#1e40af", "#d97706", "#15803d", "#7c3aed", "#be123c"];

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

function formatDateInput(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function getChartUrl(chartUrl: string | null) {
  if (!chartUrl) return null;

  if (chartUrl.startsWith("http")) {
    return chartUrl;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    return null;
  }

  return `${apiBaseUrl.replace(/\/$/, "")}${chartUrl}`;
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildEmptyFilters(predictions: SalaryPrediction[]): Filters {
  const salaries = predictions
    .map((prediction) => prediction.predicted_salary)
    .filter((value): value is number => typeof value === "number");

  const min = Math.floor(Math.min(...salaries, 0));
  const max = Math.ceil(Math.max(...salaries, 500000));

  return {
    search: "",
    experience: "all",
    companySize: "all",
    remoteRatio: "all",
    salaryRange: [min, max],
    startDate: "",
    endDate: "",
  };
}

function groupAverage(
  predictions: SalaryPrediction[],
  key: keyof SalaryPrediction,
  limit = 8,
) {
  const grouped = new Map<string, { total: number; count: number }>();

  predictions.forEach((prediction) => {
    const salary = prediction.predicted_salary;
    const label = prediction[key];
    if (typeof salary !== "number" || label === null || label === undefined) return;

    const groupKey = String(label);
    const current = grouped.get(groupKey) ?? { total: 0, count: 0 };
    grouped.set(groupKey, {
      total: current.total + salary,
      count: current.count + 1,
    });
  });

  return Array.from(grouped.entries())
    .map(([label, value]) => ({
      label,
      average_salary: Math.round(value.total / value.count),
      count: value.count,
    }))
    .sort((a, b) => b.average_salary - a.average_salary)
    .slice(0, limit);
}

function filterPredictions(predictions: SalaryPrediction[], filters: Filters) {
  const search = filters.search.trim().toLowerCase();

  return predictions.filter((prediction) => {
    const salary = prediction.predicted_salary ?? 0;
    const createdAt = formatDateInput(prediction.created_at);
    const matchesSearch =
      search.length === 0 ||
      [
        prediction.job_title,
        prediction.company_location,
        prediction.employee_residence,
        prediction.experience_level,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);

    return (
      matchesSearch &&
      (filters.experience === "all" ||
        prediction.experience_level === filters.experience) &&
      (filters.companySize === "all" ||
        prediction.company_size === filters.companySize) &&
      (filters.remoteRatio === "all" ||
        String(prediction.remote_ratio) === filters.remoteRatio) &&
      salary >= filters.salaryRange[0] &&
      salary <= filters.salaryRange[1] &&
      (!filters.startDate || createdAt >= filters.startDate) &&
      (!filters.endDate || createdAt <= filters.endDate)
    );
  });
}

function optionValues<T extends string | number>(values: T[]) {
  return Array.from(new Set(values)).filter(Boolean);
}

export default function Home() {
  const [predictions, setPredictions] = useState<SalaryPrediction[]>([]);
  const [options, setOptions] = useState<SalaryOptions>(emptyOptions);
  const [filters, setFilters] = useState<Filters>(() => buildEmptyFilters([]));
  const [chartMode, setChartMode] = useState<ChartMode>("experience");
  const [activeInsight, setActiveInsight] = useState<InsightKey>("latest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [simulator, setSimulator] = useState<AnalyzeInput>(initialSimulator);
  const [loading, setLoading] = useState(true);
  const [refreshing, startRefreshTransition] = useTransition();
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadPredictions(showSpinner = false) {
    if (showSpinner) setLoading(true);
    setError(null);

    try {
      const [rows, fetchedOptions] = await Promise.all([
        getSalaryPredictions(),
        getSalaryOptions().catch(() => emptyOptions),
      ]);
      setPredictions(rows);
      setOptions(fetchedOptions);
      setFilters((current) => {
        if (predictions.length !== 0) return current;
        return buildEmptyFilters(rows);
      });
      setSelectedIds((current) =>
        current.filter((id) => rows.some((prediction) => prediction.id === id)),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPredictions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPredictions = useMemo(
    () => filterPredictions(predictions, filters),
    [predictions, filters],
  );

  const latestPrediction = predictions[0];
  const selectedPredictions = useMemo(
    () =>
      selectedIds
        .map((id) => predictions.find((prediction) => prediction.id === id))
        .filter((prediction): prediction is SalaryPrediction => Boolean(prediction)),
    [predictions, selectedIds],
  );

  const averagePredictedSalary = useMemo(
    () =>
      average(
        filteredPredictions
          .map((prediction) => prediction.predicted_salary)
          .filter((value): value is number => typeof value === "number"),
      ),
    [filteredPredictions],
  );

  const salaryBounds = useMemo(() => {
    const salaries = predictions
      .map((prediction) => prediction.predicted_salary)
      .filter((value): value is number => typeof value === "number");
    const min = Math.floor(Math.min(...salaries, 0));
    const max = Math.ceil(Math.max(...salaries, 500000));
    return { min, max: Math.max(max, min + 1) };
  }, [predictions]);

  const chartData = useMemo(() => {
    if (chartMode === "experience") {
      return groupAverage(filteredPredictions, "experience_level");
    }

    if (chartMode === "job") {
      return groupAverage(filteredPredictions, "job_title", 6);
    }

    if (chartMode === "company") {
      return groupAverage(filteredPredictions, "company_size");
    }

    if (chartMode === "remote") {
      return groupAverage(filteredPredictions, "remote_ratio");
    }

    const source = latestPrediction;
    if (!source) return [];

    return [
      { label: "Predicted", average_salary: source.predicted_salary ?? 0 },
      { label: "Overall", average_salary: source.overall_average_salary ?? 0 },
      {
        label: "Experience",
        average_salary: source.experience_average_salary ?? 0,
      },
      { label: "Company", average_salary: source.company_size_average_salary ?? 0 },
      { label: "Job title", average_salary: source.job_title_average_salary ?? 0 },
    ];
  }, [chartMode, filteredPredictions, latestPrediction]);

  const insightText = useMemo(() => {
    if (activeInsight === "total") {
      return `${filteredPredictions.length} of ${predictions.length} predictions match the current filters.`;
    }

    if (activeInsight === "average") {
      return `The filtered average is ${formatCurrency(
        averagePredictedSalary,
      )}. Filter by role or level to isolate a segment.`;
    }

    return latestPrediction
      ? `${latestPrediction.job_title ?? "Latest role"} is currently predicted at ${formatCurrency(
          latestPrediction.predicted_salary,
        )}.`
      : "No saved prediction is available yet.";
  }, [
    activeInsight,
    averagePredictedSalary,
    filteredPredictions.length,
    latestPrediction,
    predictions.length,
  ]);

  async function handleAnalyze() {
    setAnalyzing(true);
    setSuccess(null);
    setError(null);

    try {
      const result = await analyzeSalary(simulator);
      if (!result.storage.saved_to_supabase) {
        throw new Error(result.storage.error ?? "Prediction was not saved");
      }

      setSuccess(
        `Saved ${simulator.job_title} prediction at ${formatCurrency(
          result.prediction.salary_in_usd,
        )}.`,
      );
      await loadPredictions(false);
      setChartMode("benchmarks");
      if (result.storage.record?.id) {
        setExpandedId(result.storage.record.id);
      }
    } catch (analyzeError) {
      setError(
        analyzeError instanceof Error
          ? analyzeError.message
          : "Failed to run salary analysis",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function updateSimulator<K extends keyof AnalyzeInput>(
    key: K,
    value: AnalyzeInput[K],
  ) {
    setSimulator((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters(buildEmptyFilters(predictions));
  }

  function refreshData() {
    startRefreshTransition(() => {
      void loadPredictions(false);
    });
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((selectedId) => selectedId !== id);
      }

      return [...current.slice(-1), id];
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={2}>
            <Skeleton variant="text" width={420} height={62} />
            <Skeleton variant="rounded" height={104} />
            <Skeleton variant="rounded" height={420} />
          </Stack>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #dbeafe",
              borderRadius: 2,
              p: 2.5,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{
                alignItems: { xs: "stretch", md: "center" },
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: "#0f172a",
                    fontSize: { xs: "2rem", md: "3rem" },
                    fontWeight: 800,
                    lineHeight: 1.05,
                  }}
                >
                  Salary Prediction Dashboard
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Filter, simulate, compare, and inspect saved salary predictions.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={resetFilters}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    refreshing ? <CircularProgress size={18} /> : <RefreshIcon />
                  }
                  onClick={refreshData}
                  disabled={refreshing}
                >
                  Refresh
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {refreshing ? <LinearProgress /> : null}

          {error ? (
            <Alert severity="error" role="alert" onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : null}

          {success ? (
            <Alert severity="success" role="status" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          ) : null}

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
              <Paper elevation={0} sx={{ border: "1px solid #dbeafe", p: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <FilterAltIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Filters
                    </Typography>
                  </Stack>

                  <TextField
                    label="Search role or location"
                    size="small"
                    value={filters.search}
                    onChange={(event) => updateFilter("search", event.target.value)}
                  />

                  <FormControl size="small">
                    <InputLabel>Experience</InputLabel>
                    <Select
                      label="Experience"
                      value={filters.experience}
                      onChange={(event) =>
                        updateFilter("experience", event.target.value)
                      }
                    >
                      <MenuItem value="all">All levels</MenuItem>
                      {optionValues(options.experience_level).map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small">
                    <InputLabel>Company size</InputLabel>
                    <Select
                      label="Company size"
                      value={filters.companySize}
                      onChange={(event) =>
                        updateFilter("companySize", event.target.value)
                      }
                    >
                      <MenuItem value="all">All sizes</MenuItem>
                      {optionValues(options.company_size).map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small">
                    <InputLabel>Remote ratio</InputLabel>
                    <Select
                      label="Remote ratio"
                      value={filters.remoteRatio}
                      onChange={(event) =>
                        updateFilter("remoteRatio", event.target.value)
                      }
                    >
                      <MenuItem value="all">All remote ratios</MenuItem>
                      {optionValues(options.remote_ratio).map((value) => (
                        <MenuItem key={value} value={String(value)}>
                          {value}%
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Salary range
                    </Typography>
                    <Slider
                      value={filters.salaryRange}
                      min={salaryBounds.min}
                      max={salaryBounds.max}
                      step={1000}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => formatCurrency(value)}
                      onChange={(_, value) =>
                        updateFilter("salaryRange", value as [number, number])
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(filters.salaryRange[0])} to{" "}
                      {formatCurrency(filters.salaryRange[1])}
                    </Typography>
                  </Box>

                  <TextField
                    label="Start date"
                    size="small"
                    type="date"
                    value={filters.startDate}
                    slotProps={{ inputLabel: { shrink: true } }}
                    onChange={(event) => updateFilter("startDate", event.target.value)}
                  />
                  <TextField
                    label="End date"
                    size="small"
                    type="date"
                    value={filters.endDate}
                    slotProps={{ inputLabel: { shrink: true } }}
                    onChange={(event) => updateFilter("endDate", event.target.value)}
                  />
                </Stack>
              </Paper>
            </Stack>

            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  gap: 2,
                }}
              >
                {[
                  {
                    key: "total" as const,
                    label: "Matching Predictions",
                    value: filteredPredictions.length,
                  },
                  {
                    key: "average" as const,
                    label: "Average Predicted Salary",
                    value: formatCurrency(averagePredictedSalary),
                  },
                  {
                    key: "latest" as const,
                    label: "Latest Predicted Salary",
                    value: formatCurrency(latestPrediction?.predicted_salary),
                  },
                ].map((item) => (
                  <Card
                    key={item.key}
                    elevation={0}
                    sx={{
                      border:
                        activeInsight === item.key
                          ? "2px solid #1e40af"
                          : "1px solid #dbeafe",
                    }}
                  >
                    <CardActionArea onClick={() => setActiveInsight(item.key)}>
                      <CardContent>
                        <Typography color="text.secondary">{item.label}</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                          {item.value}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>

              <Alert severity="info" icon={<AnalyticsIcon />}>
                {insightText}
              </Alert>

              <Paper elevation={0} sx={{ border: "1px solid #dbeafe", p: 2 }}>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1}
                    sx={{
                      alignItems: { xs: "stretch", md: "center" },
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Salary Breakdown
                    </Typography>
                    <Tabs
                      value={chartMode}
                      variant="scrollable"
                      onChange={(_, value: ChartMode) => setChartMode(value)}
                      aria-label="Salary chart mode"
                    >
                      <Tab value="experience" label="Experience" />
                      <Tab value="job" label="Job" />
                      <Tab value="company" label="Company" />
                      <Tab value="remote" label="Remote" />
                      <Tab value="benchmarks" label="Benchmarks" />
                    </Tabs>
                  </Stack>

                  {chartData.length === 0 ? (
                    <Alert severity="warning">No chartable data matches the filters.</Alert>
                  ) : (
                    <Box sx={{ height: 360, minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                          <RechartsTooltip
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                          <Legend />
                          <Bar
                            dataKey="average_salary"
                            name="Salary"
                            isAnimationActive={false}
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={entry.label}
                                fill={chartColors[index % chartColors.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ border: "1px solid #dbeafe", p: 2 }}>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    sx={{ justifyContent: "space-between" }}
                    spacing={1}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Prediction History
                      </Typography>
                      <Typography color="text.secondary">
                        Expand rows or select two predictions to compare.
                      </Typography>
                    </Box>
                    <Chip
                      icon={<CompareArrowsIcon />}
                      label={`${selectedPredictions.length}/2 selected`}
                      color={selectedPredictions.length === 2 ? "primary" : "default"}
                    />
                  </Stack>

                  {filteredPredictions.length === 0 ? (
                    <Alert severity="info">
                      No predictions match the current filters.
                    </Alert>
                  ) : (
                    filteredPredictions.map((prediction) => {
                      const expanded = expandedId === prediction.id;
                      const selected = selectedIds.includes(prediction.id);
                      const chartUrl = getChartUrl(prediction.chart_url);

                      return (
                        <Card
                          key={prediction.id}
                          elevation={0}
                          sx={{
                            border: selected
                              ? "2px solid #1e40af"
                              : "1px solid #e2e8f0",
                          }}
                        >
                          <CardContent sx={{ p: 0 }}>
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              spacing={1.5}
                              sx={{ p: 2, alignItems: { md: "center" } }}
                            >
                              <Checkbox
                                checked={selected}
                                onChange={() => toggleSelected(prediction.id)}
                                slotProps={{
                                  input: {
                                    "aria-label": `Select ${prediction.job_title ?? "prediction"} for comparison`,
                                  },
                                }}
                              />

                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                  {prediction.job_title ?? "Unknown job title"}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  useFlexGap
                                  sx={{ flexWrap: "wrap", mt: 1 }}
                                >
                                  <Chip
                                    label={prediction.experience_level ?? "No level"}
                                    size="small"
                                  />
                                  <Chip
                                    label={prediction.employment_type ?? "No type"}
                                    size="small"
                                  />
                                  <Chip
                                    label={prediction.company_size ?? "No size"}
                                    size="small"
                                  />
                                  <Chip
                                    label={`Remote: ${prediction.remote_ratio ?? "N/A"}%`}
                                    size="small"
                                  />
                                </Stack>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  Company: {prediction.company_location ?? "N/A"} -
                                  Residence: {prediction.employee_residence ?? "N/A"} -
                                  Created: {formatDate(prediction.created_at)}
                                </Typography>
                              </Box>

                              <Box sx={{ minWidth: 170 }}>
                                <Typography color="text.secondary">
                                  Predicted Salary
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                                  {formatCurrency(prediction.predicted_salary)}
                                </Typography>
                              </Box>

                              <Tooltip title={expanded ? "Collapse" : "Expand"}>
                                <IconButton
                                  onClick={() =>
                                    setExpandedId(expanded ? null : prediction.id)
                                  }
                                  aria-label={
                                    expanded
                                      ? "Collapse prediction details"
                                      : "Expand prediction details"
                                  }
                                  sx={{
                                    transform: expanded
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                    transition: "transform 180ms ease",
                                  }}
                                >
                                  <ExpandMoreIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>

                            <Collapse in={expanded} timeout="auto" unmountOnExit>
                              <Divider />
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: {
                                    xs: "1fr",
                                    md: chartUrl ? "1fr 320px" : "1fr",
                                  },
                                  gap: 2,
                                  p: 2,
                                }}
                              >
                                <Typography sx={{ whiteSpace: "pre-line" }}>
                                  {prediction.llm_analysis ||
                                    "No LLM analysis was saved for this prediction."}
                                </Typography>

                                {chartUrl ? (
                                  <Box
                                    component="img"
                                    src={chartUrl}
                                    alt="Salary comparison chart"
                                    loading="lazy"
                                    sx={{
                                      width: "100%",
                                      borderRadius: 1.5,
                                      border: "1px solid #e2e8f0",
                                    }}
                                  />
                                ) : null}
                              </Box>
                            </Collapse>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </Stack>
              </Paper>
            </Stack>

            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <Paper elevation={0} sx={{ border: "1px solid #dbeafe", p: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <PlayArrowIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Prediction Simulator
                    </Typography>
                  </Stack>

                  <FormControl size="small">
                    <InputLabel>Work year</InputLabel>
                    <Select
                      label="Work year"
                      value={String(simulator.work_year)}
                      onChange={(event) =>
                        updateSimulator("work_year", Number(event.target.value))
                      }
                    >
                      {optionValues(options.work_year).map((value) => (
                        <MenuItem key={value} value={String(value)}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small">
                    <InputLabel>Experience</InputLabel>
                    <Select
                      label="Experience"
                      value={simulator.experience_level}
                      onChange={(event) =>
                        updateSimulator("experience_level", event.target.value)
                      }
                    >
                      {optionValues(options.experience_level).map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small">
                    <InputLabel>Employment</InputLabel>
                    <Select
                      label="Employment"
                      value={simulator.employment_type}
                      onChange={(event) =>
                        updateSimulator("employment_type", event.target.value)
                      }
                    >
                      {optionValues(options.employment_type).map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Autocomplete
                    size="small"
                    options={options.job_title}
                    value={simulator.job_title}
                    onChange={(_, value) =>
                      updateSimulator("job_title", value ?? simulator.job_title)
                    }
                    renderInput={(params) => (
                      <TextField
                        id={params.id}
                        disabled={params.disabled}
                        fullWidth={params.fullWidth}
                        size={params.size}
                        slotProps={params.slotProps}
                        label="Job title"
                      />
                    )}
                  />

                  <Stack direction="row" spacing={1}>
                    <Autocomplete
                      size="small"
                      options={options.employee_residence}
                      value={simulator.employee_residence}
                      onChange={(_, value) =>
                        updateSimulator(
                          "employee_residence",
                          value ?? simulator.employee_residence,
                        )
                      }
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          id={params.id}
                          disabled={params.disabled}
                          fullWidth={params.fullWidth}
                          size={params.size}
                          slotProps={params.slotProps}
                          label="Residence"
                        />
                      )}
                    />
                    <Autocomplete
                      size="small"
                      options={options.company_location}
                      value={simulator.company_location}
                      onChange={(_, value) =>
                        updateSimulator(
                          "company_location",
                          value ?? simulator.company_location,
                        )
                      }
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          id={params.id}
                          disabled={params.disabled}
                          fullWidth={params.fullWidth}
                          size={params.size}
                          slotProps={params.slotProps}
                          label="Company"
                        />
                      )}
                    />
                  </Stack>

                  <FormControl size="small">
                    <InputLabel>Remote ratio</InputLabel>
                    <Select
                      label="Remote ratio"
                      value={String(simulator.remote_ratio)}
                      onChange={(event) =>
                        updateSimulator("remote_ratio", Number(event.target.value))
                      }
                    >
                      {optionValues(options.remote_ratio).map((value) => (
                        <MenuItem key={value} value={String(value)}>
                          {value}%
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small">
                    <InputLabel>Company size</InputLabel>
                    <Select
                      label="Company size"
                      value={simulator.company_size}
                      onChange={(event) =>
                        updateSimulator("company_size", event.target.value)
                      }
                    >
                      {optionValues(options.company_size).map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    startIcon={
                      analyzing ? <CircularProgress size={18} /> : <PlayArrowIcon />
                    }
                    onClick={handleAnalyze}
                    disabled={analyzing}
                  >
                    Analyze and Save
                  </Button>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ border: "1px solid #dbeafe", p: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <CompareArrowsIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Compare Predictions
                    </Typography>
                  </Stack>

                  {selectedPredictions.length < 2 ? (
                    <Alert severity="info">
                      Select two history rows to compare salary, inputs, and benchmark
                      deltas.
                    </Alert>
                  ) : (
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "minmax(0, 1fr)",
                            sm: "repeat(2, minmax(0, 1fr))",
                          },
                          gap: 1,
                        }}
                      >
                        {selectedPredictions.map((prediction) => (
                          <Paper
                            key={prediction.id}
                            elevation={0}
                            sx={{ border: "1px solid #e2e8f0", p: 1.5 }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {prediction.job_title}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>
                              {formatCurrency(prediction.predicted_salary)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {prediction.experience_level} -{" "}
                              {prediction.company_size} - Remote{" "}
                              {prediction.remote_ratio}%
                            </Typography>
                          </Paper>
                        ))}
                      </Box>

                      <Alert severity="success">
                        Difference:{" "}
                        {formatCurrency(
                          Math.abs(
                            (selectedPredictions[0].predicted_salary ?? 0) -
                              (selectedPredictions[1].predicted_salary ?? 0),
                          ),
                        )}
                      </Alert>

                      <Button variant="outlined" onClick={() => setSelectedIds([])}>
                        Clear comparison
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </main>
  );
}
