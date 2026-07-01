import json
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from api.validation import validate_allowed_value

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "salary_decision_tree_pipeline.joblib"
ALLOWED_VALUES_PATH = BASE_DIR / "api" / "allowed_values.json"


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


model = joblib.load(MODEL_PATH)

with open(ALLOWED_VALUES_PATH, "r", encoding="utf-8") as file:
    allowed_values = json.load(file)


@app.get("/")
def root():
    return {
        "message": "Salary Prediction API is running.",
        "available_endpoints": ["/health", "/options", "/predict"],
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}


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
    validate_allowed_value("work_year", work_year, allowed_values)
    validate_allowed_value("experience_level", experience_level, allowed_values)
    validate_allowed_value("employment_type", employment_type, allowed_values)
    validate_allowed_value("job_title", job_title, allowed_values)
    validate_allowed_value("employee_residence", employee_residence, allowed_values)
    validate_allowed_value("remote_ratio", remote_ratio, allowed_values)
    validate_allowed_value("company_location", company_location, allowed_values)
    validate_allowed_value("company_size", company_size, allowed_values)

    input_data = pd.DataFrame(
        [
            {
                "work_year": work_year,
                "experience_level": experience_level,
                "employment_type": employment_type,
                "job_title": job_title,
                "employee_residence": employee_residence,
                "remote_ratio": remote_ratio,
                "company_location": company_location,
                "company_size": company_size,
            }
        ]
    )

    prediction = model.predict(input_data)[0]

    return {
        "prediction": {"salary_in_usd": round(float(prediction), 2)},
        "input": {
            "work_year": work_year,
            "experience_level": experience_level,
            "employment_type": employment_type,
            "job_title": job_title,
            "employee_residence": employee_residence,
            "remote_ratio": remote_ratio,
            "company_location": company_location,
            "company_size": company_size,
        },
    }
