import type { AnalyzeInput } from "@/lib/predictions";

export type ChartMode = "experience" | "job" | "company" | "remote" | "benchmarks";
export type InsightKey = "total" | "average" | "latest";

export type Filters = {
  search: string;
  experience: string;
  companySize: string;
  remoteRatio: string;
  salaryRange: [number, number];
  startDate: string;
  endDate: string;
};

export type ChartPoint = {
  label: string;
  average_salary: number;
  count?: number;
};

export type { AnalyzeInput };
