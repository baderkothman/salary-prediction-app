import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_supabase_client() -> Optional[Client]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return None

    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


supabase = get_supabase_client()


def save_prediction_result(
    input_data: dict,
    predicted_salary: float,
    dataset_insights: dict,
    llm_analysis: str,
    chart_url: str,
):
    if supabase is None:
        return {
            "saved": False,
            "error": "Supabase is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
            "data": None,
        }

    row = {
        "work_year": input_data["work_year"],
        "experience_level": input_data["experience_level"],
        "employment_type": input_data["employment_type"],
        "job_title": input_data["job_title"],
        "employee_residence": input_data["employee_residence"],
        "remote_ratio": input_data["remote_ratio"],
        "company_location": input_data["company_location"],
        "company_size": input_data["company_size"],
        "predicted_salary": predicted_salary,
        "overall_average_salary": dataset_insights["overall_average_salary"],
        "experience_average_salary": dataset_insights["experience_average_salary"],
        "company_size_average_salary": dataset_insights["company_size_average_salary"],
        "job_title_average_salary": dataset_insights["job_title_average_salary"],
        "llm_analysis": llm_analysis,
        "chart_url": chart_url,
    }

    try:
        response = supabase.table("salary_predictions").insert(row).execute()

        return {
            "saved": True,
            "error": None,
            "data": response.data[0] if response.data else None,
        }

    except Exception as error:
        return {
            "saved": False,
            "error": str(error),
            "data": None,
        }


def get_prediction_history(limit: int = 20):
    if supabase is None:
        return {
            "success": False,
            "error": "Supabase is not configured.",
            "data": [],
        }

    try:
        response = (
            supabase.table("salary_predictions")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        return {
            "success": True,
            "error": None,
            "data": response.data,
        }

    except Exception as error:
        return {
            "success": False,
            "error": str(error),
            "data": [],
        }
