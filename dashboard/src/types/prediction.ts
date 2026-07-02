export type SalaryPrediction = {
  id: string;
  work_year: number | null;
  experience_level: string | null;
  employment_type: string | null;
  job_title: string | null;
  employee_residence: string | null;
  remote_ratio: number | null;
  company_location: string | null;
  company_size: string | null;

  predicted_salary: number | null;

  overall_average_salary: number | null;
  experience_average_salary: number | null;
  company_size_average_salary: number | null;
  job_title_average_salary: number | null;

  llm_analysis: string | null;
  chart_url: string | null;
  created_at: string | null;
};
