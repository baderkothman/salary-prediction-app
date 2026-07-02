import json
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.validation import validate_allowed_value
from api.charts import generate_salary_comparison_chart
from api.llm_analysis import generate_llm_salary_analysis

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "salary_decision_tree_pipeline.joblib"
ALLOWED_VALUES_PATH = BASE_DIR / "api" / "allowed_values.json"
DATA_PATH = BASE_DIR / "data" / "processed" / "cleaned_salaries.csv"

STATIC_DIR = BASE_DIR / "static"
CHARTS_DIR = STATIC_DIR / "charts"

STATIC_DIR.mkdir(parents=True, exist_ok=True)
CHARTS_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="Salary Prediction API",
    description="GET API for predicting data science salaries using a trained Decision Tree model.",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


model = joblib.load(MODEL_PATH)

salary_df = pd.read_csv(DATA_PATH)

with open(ALLOWED_VALUES_PATH, "r", encoding="utf-8") as file:
    allowed_values = json.load(file)


def validate_prediction_inputs(
    work_year: int,
    experience_level: str,
    employment_type: str,
    job_title: str,
    employee_residence: str,
    remote_ratio: int,
    company_location: str,
    company_size: str,
):
    validate_allowed_value("work_year", work_year, allowed_values)
    validate_allowed_value("experience_level", experience_level, allowed_values)
    validate_allowed_value("employment_type", employment_type, allowed_values)
    validate_allowed_value("job_title", job_title, allowed_values)
    validate_allowed_value("employee_residence", employee_residence, allowed_values)
    validate_allowed_value("remote_ratio", remote_ratio, allowed_values)
    validate_allowed_value("company_location", company_location, allowed_values)
    validate_allowed_value("company_size", company_size, allowed_values)


def build_input_data(
    work_year: int,
    experience_level: str,
    employment_type: str,
    job_title: str,
    employee_residence: str,
    remote_ratio: int,
    company_location: str,
    company_size: str,
):
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


def calculate_dataset_insights(input_data: dict):
    overall_average_salary = salary_df["salary_in_usd"].mean()

    experience_rows = salary_df[
        salary_df["experience_level"] == input_data["experience_level"]
    ]

    company_size_rows = salary_df[
        salary_df["company_size"] == input_data["company_size"]
    ]

    job_title_rows = salary_df[salary_df["job_title"] == input_data["job_title"]]

    experience_average_salary = (
        experience_rows["salary_in_usd"].mean()
        if not experience_rows.empty
        else overall_average_salary
    )

    company_size_average_salary = (
        company_size_rows["salary_in_usd"].mean()
        if not company_size_rows.empty
        else overall_average_salary
    )

    job_title_average_salary = (
        job_title_rows["salary_in_usd"].mean()
        if not job_title_rows.empty
        else overall_average_salary
    )

    return {
        "overall_average_salary": round(float(overall_average_salary), 2),
        "experience_average_salary": round(float(experience_average_salary), 2),
        "company_size_average_salary": round(float(company_size_average_salary), 2),
        "job_title_average_salary": round(float(job_title_average_salary), 2),
    }


@app.get("/")
def root():
    return {
        "message": "Salary Prediction API is running.",
        "available_endpoints": [
            "/health",
            "/options",
            "/predict",
            "/analyze",
        ],
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "dataset_loaded": not salary_df.empty,
    }


@app.get("/options")
def get_options():
    return allowed_values


@app.get("/predict")
def predict_salary(
    work_year: int = Query(..., description="Work year, for example 2024"),
    experience_level: str = Query(..., min_length=2, description="Experience level"),
    employment_type: str = Query(..., min_length=2, description="Employment type"),
    job_title: str = Query(..., min_length=2, max_length=100, description="Job title"),
    employee_residence: str = Query(
        ..., min_length=2, max_length=3, description="Employee residence country code"
    ),
    remote_ratio: int = Query(..., description="Remote ratio: 0, 50, or 100"),
    company_location: str = Query(
        ..., min_length=2, max_length=3, description="Company location country code"
    ),
    company_size: str = Query(..., min_length=1, description="Company size"),
):
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

    input_df = pd.DataFrame([input_data])

    prediction = model.predict(input_df)[0]
    predicted_salary = round(float(prediction), 2)

    return {
        "prediction": {"salary_in_usd": predicted_salary},
        "input": input_data,
    }


@app.get("/analyze")
def analyze_salary(
    work_year: int = Query(..., description="Work year, for example 2024"),
    experience_level: str = Query(..., min_length=2, description="Experience level"),
    employment_type: str = Query(..., min_length=2, description="Employment type"),
    job_title: str = Query(..., min_length=2, max_length=100, description="Job title"),
    employee_residence: str = Query(
        ..., min_length=2, max_length=3, description="Employee residence country code"
    ),
    remote_ratio: int = Query(..., description="Remote ratio: 0, 50, or 100"),
    company_location: str = Query(
        ..., min_length=2, max_length=3, description="Company location country code"
    ),
    company_size: str = Query(..., min_length=1, description="Company size"),
):
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

    input_df = pd.DataFrame([input_data])

    prediction = model.predict(input_df)[0]
    predicted_salary = round(float(prediction), 2)

    dataset_insights = calculate_dataset_insights(input_data)

    chart_url = generate_salary_comparison_chart(
        df=salary_df,
        experience_level=experience_level,
        predicted_salary=predicted_salary,
    )

    llm_analysis = generate_llm_salary_analysis(
        input_data=input_data,
        predicted_salary=predicted_salary,
        dataset_insights=dataset_insights,
    )

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
    }
