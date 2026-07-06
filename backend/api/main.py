# We import json so we can read the allowed_values.json file.
import json

# We import Path so we can build file paths safely.
from pathlib import Path

# We import joblib so we can load the saved machine learning model.
import joblib

# We import pandas so we can create DataFrames and read the cleaned dataset.
import pandas as pd

# FastAPI creates the API.
# HTTPException lets us return API errors.
# Query lets us describe and validate URL query parameters.
from fastapi import FastAPI, HTTPException, Query

# CORSMiddleware allows the frontend to call this backend API.
from fastapi.middleware.cors import CORSMiddleware

# StaticFiles lets FastAPI serve files like generated chart images.
from fastapi.staticfiles import StaticFiles

# This function checks if user inputs are allowed.
from .validation import validate_allowed_value

# This function creates a salary comparison chart.
from .charts import generate_salary_comparison_chart

# This function asks Ollama to write a salary analysis.
from .llm_analysis import generate_llm_salary_analysis

# These functions save predictions to Supabase and read prediction history.
from .supabase_service import save_prediction_result, get_prediction_history


# BASE_DIR means the main project folder.
# __file__ is this file: api/main.py
# parent is the api folder.
# parent.parent goes one level above api, which is the project root.
BASE_DIR = Path(__file__).resolve().parent.parent

# This is the saved model file from the training notebook.
MODEL_PATH = BASE_DIR / "models" / "salary_best_model_pipeline.joblib"

# This file contains the allowed input values for the API.
ALLOWED_VALUES_PATH = BASE_DIR / "api" / "allowed_values.json"

# This is the cleaned salary dataset.
DATA_PATH = BASE_DIR / "data" / "processed" / "cleaned_salaries.csv"

# This is the static folder.
# Static files are files the browser can open directly.
STATIC_DIR = BASE_DIR / "static"

# This is the folder where generated chart images will be saved.
CHARTS_DIR = STATIC_DIR / "charts"

# Create the static folder if it does not exist.
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Create the charts folder if it does not exist.
CHARTS_DIR.mkdir(parents=True, exist_ok=True)


# Create the FastAPI app.
app = FastAPI(
    title="Salary Prediction API",                                                        # API title in the docs page.
    description="GET API for predicting data science salaries using the best trained regression model.", # API description.
    version="1.0.0",                                                                      # API version.
)


# Add CORS settings.
# This allows a frontend app to call this API.
app.add_middleware(
    CORSMiddleware,        # The middleware class.
    allow_origins=["*"],   # Allow requests from any frontend URL.
    allow_credentials=True,# Allow cookies/credentials if needed.
    allow_methods=["*"],   # Allow all HTTP methods like GET and POST.
    allow_headers=["*"],   # Allow all request headers.
)


# Make the static folder available through the /static URL.
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# Load the trained machine learning model once when the API starts.
model = joblib.load(MODEL_PATH)

# Load the cleaned salary dataset once when the API starts.
salary_df = pd.read_csv(DATA_PATH)

# Open the allowed values JSON file.
with open(ALLOWED_VALUES_PATH, "r", encoding="utf-8") as file:
    # Load allowed values into a Python dictionary.
    allowed_values = json.load(file)


# This function validates all prediction inputs.
def validate_prediction_inputs(
    work_year: int,             # User input: work year.
    experience_level: str,      # User input: experience level.
    employment_type: str,       # User input: employment type.
    job_title: str,             # User input: job title.
    employee_residence: str,    # User input: employee residence.
    remote_ratio: int,          # User input: remote ratio.
    company_location: str,      # User input: company location.
    company_size: str,          # User input: company size.
):
    # Check if the work_year exists in allowed_values.
    validate_allowed_value("work_year", work_year, allowed_values)

    # Check if the experience_level exists in allowed_values.
    validate_allowed_value("experience_level", experience_level, allowed_values)

    # Check if the employment_type exists in allowed_values.
    validate_allowed_value("employment_type", employment_type, allowed_values)

    # Check if the job_title exists in allowed_values.
    validate_allowed_value("job_title", job_title, allowed_values)

    # Check if the employee_residence exists in allowed_values.
    validate_allowed_value("employee_residence", employee_residence, allowed_values)

    # Check if the remote_ratio exists in allowed_values.
    validate_allowed_value("remote_ratio", remote_ratio, allowed_values)

    # Check if the company_location exists in allowed_values.
    validate_allowed_value("company_location", company_location, allowed_values)

    # Check if the company_size exists in allowed_values.
    validate_allowed_value("company_size", company_size, allowed_values)


# This function puts all user inputs into one dictionary.
def build_input_data(
    work_year: int,             # User input: work year.
    experience_level: str,      # User input: experience level.
    employment_type: str,       # User input: employment type.
    job_title: str,             # User input: job title.
    employee_residence: str,    # User input: employee residence.
    remote_ratio: int,          # User input: remote ratio.
    company_location: str,      # User input: company location.
    company_size: str,          # User input: company size.
):
    # Return the input values using the same column names used during model training.
    return {
        "work_year": work_year,
        "experience_level": experience_level,
        "employment_type": employment_type,
        "job_title": job_title,
        "employee_residence": employee_residence,
        "remote_ratio": remote_ratio,
        "company_location": company_location,
        "company_size": company_size,
    }


# This function calculates simple salary averages from the dataset.
def calculate_dataset_insights(input_data: dict):
    # Calculate the average salary across the whole dataset.
    overall_average_salary = salary_df["salary_in_usd"].mean()

    # Keep only rows that match the selected experience level.
    experience_rows = salary_df[
        salary_df["experience_level"] == input_data["experience_level"]
    ]

    # Keep only rows that match the selected company size.
    company_size_rows = salary_df[
        salary_df["company_size"] == input_data["company_size"]
    ]

    # Keep only rows that match the selected job title.
    job_title_rows = salary_df[
        salary_df["job_title"] == input_data["job_title"]
    ]

    # If matching experience rows exist, use their average salary.
    # Otherwise, use the overall average salary.
    if not experience_rows.empty:
        experience_average_salary = experience_rows["salary_in_usd"].mean()
    else:
        experience_average_salary = overall_average_salary

    # If matching company size rows exist, use their average salary.
    # Otherwise, use the overall average salary.
    if not company_size_rows.empty:
        company_size_average_salary = company_size_rows["salary_in_usd"].mean()
    else:
        company_size_average_salary = overall_average_salary

    # If matching job title rows exist, use their average salary.
    # Otherwise, use the overall average salary.
    if not job_title_rows.empty:
        job_title_average_salary = job_title_rows["salary_in_usd"].mean()
    else:
        job_title_average_salary = overall_average_salary

    # Return all averages rounded to 2 decimal places.
    return {
        "overall_average_salary": round(float(overall_average_salary), 2),
        "experience_average_salary": round(float(experience_average_salary), 2),
        "company_size_average_salary": round(float(company_size_average_salary), 2),
        "job_title_average_salary": round(float(job_title_average_salary), 2),
    }


# This route runs when the user opens the main API URL.
@app.get("/")
def root():
    # Return a simple message and list of available endpoints.
    return {
        "message": "Salary Prediction API is running.",
        "available_endpoints": [
            "/health",
            "/options",
            "/predict",
            "/analyze",
            "/history",
        ],
    }


# This route checks if the API, model, and dataset are working.
@app.get("/health")
def health_check():
    # Return basic API health information.
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "dataset_loaded": not salary_df.empty,
    }


# This route returns all allowed values for the frontend.
@app.get("/options")
def get_options():
    # Return the allowed values loaded from allowed_values.json.
    return allowed_values


# This route predicts a salary only.
@app.get("/predict")
def predict_salary(
    # Work year is required because Query(...) means required.
    work_year: int = Query(..., description="Work year, for example 2022"),

    # Experience level is required and must have at least 2 characters.
    experience_level: str = Query(..., min_length=2, description="Experience level"),

    # Employment type is required and must have at least 2 characters.
    employment_type: str = Query(..., min_length=2, description="Employment type"),

    # Job title is required and must be between 2 and 100 characters.
    job_title: str = Query(..., min_length=2, max_length=100, description="Job title"),

    # Employee residence is required and should be a country code.
    employee_residence: str = Query(
        ..., min_length=2, max_length=3, description="Employee residence country code"
    ),

    # Remote ratio is required, usually 0, 50, or 100.
    remote_ratio: int = Query(..., description="Remote ratio: 0, 50, or 100"),

    # Company location is required and should be a country code.
    company_location: str = Query(
        ..., min_length=2, max_length=3, description="Company location country code"
    ),

    # Company size is required.
    company_size: str = Query(..., min_length=1, description="Company size"),
):
    # Validate every input before using the model.
    validate_prediction_inputs(
        work_year=work_year,
        experience_level=experience_level,
        employment_type=employment_type,
        job_title=job_title,
        employee_residence=employee_residence,
        remote_ratio=remote_ratio,
        company_location=company_location,
        company_size=company_size,
    )

    # Put all input values into one dictionary.
    input_data = build_input_data(
        work_year=work_year,
        experience_level=experience_level,
        employment_type=employment_type,
        job_title=job_title,
        employee_residence=employee_residence,
        remote_ratio=remote_ratio,
        company_location=company_location,
        company_size=company_size,
    )

    # Convert the input dictionary into a one-row DataFrame.
    # The model expects a DataFrame because it was trained using pandas data.
    input_df = pd.DataFrame([input_data])

    # Ask the machine learning model to predict the salary.
    prediction = model.predict(input_df)[0]

    # Convert the prediction to a float and round it to 2 decimal places.
    predicted_salary = round(float(prediction), 2)

    # Return the prediction and the input values.
    return {
        "prediction": {"salary_in_usd": predicted_salary},
        "input": input_data,
    }


# This route predicts a salary and creates a full analysis.
@app.get("/analyze")
def analyze_salary(
    # Work year is required because Query(...) means required.
    work_year: int = Query(..., description="Work year, for example 2022"),

    # Experience level is required and must have at least 2 characters.
    experience_level: str = Query(..., min_length=2, description="Experience level"),

    # Employment type is required and must have at least 2 characters.
    employment_type: str = Query(..., min_length=2, description="Employment type"),

    # Job title is required and must be between 2 and 100 characters.
    job_title: str = Query(..., min_length=2, max_length=100, description="Job title"),

    # Employee residence is required and should be a country code.
    employee_residence: str = Query(
        ..., min_length=2, max_length=3, description="Employee residence country code"
    ),

    # Remote ratio is required, usually 0, 50, or 100.
    remote_ratio: int = Query(..., description="Remote ratio: 0, 50, or 100"),

    # Company location is required and should be a country code.
    company_location: str = Query(
        ..., min_length=2, max_length=3, description="Company location country code"
    ),

    # Company size is required.
    company_size: str = Query(..., min_length=1, description="Company size"),
):
    # Validate every input before using the model.
    validate_prediction_inputs(
        work_year=work_year,
        experience_level=experience_level,
        employment_type=employment_type,
        job_title=job_title,
        employee_residence=employee_residence,
        remote_ratio=remote_ratio,
        company_location=company_location,
        company_size=company_size,
    )

    # Put all input values into one dictionary.
    input_data = build_input_data(
        work_year=work_year,
        experience_level=experience_level,
        employment_type=employment_type,
        job_title=job_title,
        employee_residence=employee_residence,
        remote_ratio=remote_ratio,
        company_location=company_location,
        company_size=company_size,
    )

    # Convert the input dictionary into a one-row DataFrame.
    input_df = pd.DataFrame([input_data])

    # Ask the machine learning model to predict the salary.
    prediction = model.predict(input_df)[0]

    # Convert the prediction to a float and round it to 2 decimal places.
    predicted_salary = round(float(prediction), 2)

    # Calculate average salary values from the dataset.
    dataset_insights = calculate_dataset_insights(input_data)

    # Generate a chart and get the chart URL.
    chart_url = generate_salary_comparison_chart(
        df=salary_df,
        experience_level=experience_level,
        predicted_salary=predicted_salary,
    )

    # Ask Ollama to write a salary analysis.
    llm_analysis = generate_llm_salary_analysis(
        input_data=input_data,
        predicted_salary=predicted_salary,
        dataset_insights=dataset_insights,
    )

    # Save the result to Supabase.
    save_result = save_prediction_result(
        input_data=input_data,
        predicted_salary=predicted_salary,
        dataset_insights=dataset_insights,
        llm_analysis=llm_analysis,
        chart_url=chart_url,
    )

    # Return everything the frontend needs.
    return {
        "prediction": {"salary_in_usd": predicted_salary},
        "input": input_data,
        "dataset_insights": dataset_insights,
        "llm_analysis": llm_analysis,
        "visualization": {
            "chart_type": "bar_chart",
            "title": "Predicted Salary Compared with Average Salary by Experience Level",
            "chart_url": chart_url,
        },
        "storage": {
            "saved_to_supabase": save_result["saved"],
            "error": save_result["error"],
            "record": save_result["data"],
        },
    }


# This route returns recent prediction history from Supabase.
@app.get("/history")
def prediction_history(
    # limit controls how many prediction records we return.
    limit: int = Query(
        20,                                            # Default value.
        ge=1,                                          # Minimum value.
        le=100,                                        # Maximum value.
        description="Number of recent predictions to return",
    )
):
    # Ask Supabase for recent prediction history.
    result = get_prediction_history(limit=limit)

    # If Supabase failed, return an API error.
    if not result["success"]:
        # Raise a 500 error because this is a server/database issue.
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to fetch prediction history",
                "message": result["error"],
            },
        )

    # Return the number of rows and the actual history data.
    return {
        "count": len(result["data"]),
        "data": result["data"],
    }
