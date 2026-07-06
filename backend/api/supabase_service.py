# We import os so we can read environment variables from the .env file.
import os

# We import Path so we can build the path to the .env file.
from pathlib import Path

# We import Optional because the Supabase client can be a Client or None.
from typing import Optional

# load_dotenv reads values from the .env file and puts them into environment variables.
from dotenv import load_dotenv

# Client is the Supabase client type.
# create_client creates a Supabase client using your Supabase URL and key.
from supabase import Client, create_client


# BASE_DIR means the main project folder.
# __file__ is this file: api/supabase_service.py
# parent is the api folder.
# parent.parent goes one level above api, which is the project root.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load the .env file from the project root.
load_dotenv(BASE_DIR / ".env")


# Read the Supabase project URL from the .env file.
SUPABASE_URL = os.getenv("SUPABASE_URL")

# Read the Supabase service role key from the .env file.
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


# This function creates and returns a Supabase client.
def get_supabase_client() -> Optional[Client]:
    # If the Supabase URL or key is missing, we cannot connect to Supabase.
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        # Return None instead of crashing.
        return None

    # Create the Supabase client and return it.
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# Create one Supabase client when this file loads.
supabase = get_supabase_client()


# This function saves one salary prediction result into Supabase.
def save_prediction_result(
    input_data: dict,          # The user inputs.
    predicted_salary: float,   # The predicted salary value.
    dataset_insights: dict,    # The dataset average values.
    llm_analysis: str,         # The LLM written explanation.
    chart_url: str,            # The generated chart URL.
):
    # If Supabase is not configured, do not crash the API.
    if supabase is None:
        # Return a clear result explaining that saving failed.
        return {
            "saved": False,
            "error": "Supabase is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
            "data": None,
        }

    # This dictionary represents one row that will be inserted into the salary_predictions table.
    row = {
        "work_year": input_data["work_year"],                                      # Prediction input: work year.
        "experience_level": input_data["experience_level"],                        # Prediction input: experience level.
        "employment_type": input_data["employment_type"],                          # Prediction input: employment type.
        "job_title": input_data["job_title"],                                      # Prediction input: job title.
        "employee_residence": input_data["employee_residence"],                    # Prediction input: employee residence.
        "remote_ratio": input_data["remote_ratio"],                                # Prediction input: remote ratio.
        "company_location": input_data["company_location"],                        # Prediction input: company location.
        "company_size": input_data["company_size"],                                # Prediction input: company size.
        "predicted_salary": predicted_salary,                                      # Model prediction result.
        "overall_average_salary": dataset_insights["overall_average_salary"],      # Dataset average salary.
        "experience_average_salary": dataset_insights["experience_average_salary"],# Average salary for selected experience.
        "company_size_average_salary": dataset_insights["company_size_average_salary"], # Average salary for selected company size.
        "job_title_average_salary": dataset_insights["job_title_average_salary"],  # Average salary for selected job title.
        "llm_analysis": llm_analysis,                                              # Text analysis from Ollama.
        "chart_url": chart_url,                                                    # URL of the generated chart.
    }

    # Use try/except because the database insert can fail.
    try:
        # Insert the row into the salary_predictions table.
        response = supabase.table("salary_predictions").insert(row).execute()

        # Return a success response.
        return {
            "saved": True,
            "error": None,
            "data": response.data[0] if response.data else None,
        }

    # If Supabase returns an error, catch it here.
    except Exception as error:
        # Return a failure response instead of crashing the API.
        return {
            "saved": False,
            "error": str(error),
            "data": None,
        }


# This function gets recent prediction history from Supabase.
def get_prediction_history(limit: int = 20):
    # If Supabase is not configured, we cannot fetch history.
    if supabase is None:
        # Return a clear error response.
        return {
            "success": False,
            "error": "Supabase is not configured.",
            "data": [],
        }

    # Use try/except because the database query can fail.
    try:
        # Build and run a Supabase query.
        response = (
            supabase.table("salary_predictions")  # Choose the table.
            .select("*")                          # Select all columns.
            .order("created_at", desc=True)       # Newest records first.
            .limit(limit)                         # Limit the number of rows.
            .execute()                            # Run the query.
        )

        # Return the data if the query worked.
        return {
            "success": True,
            "error": None,
            "data": response.data,
        }

    # If the query fails, catch the error here.
    except Exception as error:
        # Return a failure response instead of crashing the API.
        return {
            "success": False,
            "error": str(error),
            "data": [],
        }
