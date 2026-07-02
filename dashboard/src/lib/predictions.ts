import { supabase } from "@/lib/supabase";
import type { SalaryPrediction } from "@/types/prediction";

export type SalaryOptions = {
  work_year: number[];
  experience_level: string[];
  employment_type: string[];
  job_title: string[];
  employee_residence: string[];
  remote_ratio: number[];
  company_location: string[];
  company_size: string[];
};

export type AnalyzeInput = {
  work_year: number;
  experience_level: string;
  employment_type: string;
  job_title: string;
  employee_residence: string;
  remote_ratio: number;
  company_location: string;
  company_size: string;
};

type AnalyzeResponse = {
  prediction: {
    salary_in_usd: number;
  };
  storage: {
    saved_to_supabase: boolean;
    error: string | null;
    record: SalaryPrediction | null;
  };
};

export async function getSalaryPredictions(): Promise<SalaryPrediction[]> {
  const { data, error } = await supabase
    .from("salary_predictions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch salary predictions:", error.message);
    return [];
  }

  return data ?? [];
}

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000")
    .replace(/\/$/, "");
}

export async function getSalaryOptions(): Promise<SalaryOptions> {
  const response = await fetch(`${getApiBaseUrl()}/options`);

  if (!response.ok) {
    throw new Error("Failed to load salary options");
  }

  return response.json();
}

export async function analyzeSalary(
  input: AnalyzeInput,
): Promise<AnalyzeResponse> {
  const params = new URLSearchParams(
    Object.entries(input).map(([key, value]) => [key, String(value)]),
  );

  const response = await fetch(`${getApiBaseUrl()}/analyze?${params}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to analyze salary");
  }

  return response.json();
}
