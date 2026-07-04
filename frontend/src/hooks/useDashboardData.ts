import { useEffect, useMemo, useState, useTransition } from "react";

import {
  analyzeSalary,
  getSalaryOptions,
  getSalaryPredictions,
  type AnalyzeInput,
  type SalaryOptions,
} from "@/lib/predictions";
import type { SalaryPrediction } from "@/types/prediction";
import type { ChartMode, Filters, InsightKey } from "@/types/dashboard";
import {
  average,
  buildEmptyFilters,
  filterPredictions,
  getSalaryBounds,
  groupAverage,
} from "@/utils/dashboard-data";
import { formatCurrency } from "@/utils/dashboard-formatters";

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

export function useDashboardData() {
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
          : "We couldn't load your results. Please check your connection and try again.",
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

  const salaryBounds = useMemo(() => getSalaryBounds(predictions), [predictions]);

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
        `Done! Estimated salary for ${simulator.job_title}: ${formatCurrency(
          result.prediction.salary_in_usd,
        )}. The result was saved to My Results.`,
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
          : "Something went wrong while estimating the salary. Please try again.",
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

  function clearComparison() {
    setSelectedIds([]);
  }

  return {
    // data
    predictions,
    filteredPredictions,
    options,
    latestPrediction,
    selectedPredictions,
    averagePredictedSalary,
    salaryBounds,
    chartData,
    insightText,

    // filter state
    filters,
    updateFilter,
    resetFilters,

    // chart / insight state
    chartMode,
    setChartMode,
    activeInsight,
    setActiveInsight,

    // history state
    expandedId,
    setExpandedId,
    selectedIds,
    toggleSelected,
    clearComparison,

    // simulator state
    simulator,
    updateSimulator,
    handleAnalyze,
    analyzing,

    // lifecycle state
    loading,
    refreshing,
    refreshData,
    error,
    setError,
    success,
    setSuccess,
  };
}

export type UseDashboardDataResult = ReturnType<typeof useDashboardData>;
