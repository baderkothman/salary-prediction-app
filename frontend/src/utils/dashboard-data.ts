import type { SalaryPrediction } from "@/types/prediction";
import type { Filters } from "@/types/dashboard";
import { formatDateInput } from "@/utils/dashboard-formatters";

export function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildEmptyFilters(predictions: SalaryPrediction[]): Filters {
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

export function getSalaryBounds(predictions: SalaryPrediction[]) {
  const salaries = predictions
    .map((prediction) => prediction.predicted_salary)
    .filter((value): value is number => typeof value === "number");
  const min = Math.floor(Math.min(...salaries, 0));
  const max = Math.ceil(Math.max(...salaries, 500000));
  return { min, max: Math.max(max, min + 1) };
}

export function groupAverage(
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

export function filterPredictions(predictions: SalaryPrediction[], filters: Filters) {
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

export function optionValues<T extends string | number>(values: T[]) {
  return Array.from(new Set(values)).filter(
    (value) => value !== null && value !== undefined && value !== "",
  );
}
