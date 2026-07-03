import json
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "processed" / "cleaned_salaries.csv"
OUTPUT_PATH = BASE_DIR / "api" / "allowed_values.json"


df = pd.read_csv(DATA_PATH)

allowed_values = {
    "work_year": sorted(df["work_year"].dropna().astype(int).unique().tolist()),
    "experience_level": sorted(
        df["experience_level"].dropna().astype(str).unique().tolist()
    ),
    "employment_type": sorted(
        df["employment_type"].dropna().astype(str).unique().tolist()
    ),
    "job_title": sorted(df["job_title"].dropna().astype(str).unique().tolist()),
    "employee_residence": sorted(
        df["employee_residence"].dropna().astype(str).unique().tolist()
    ),
    "remote_ratio": sorted(df["remote_ratio"].dropna().astype(int).unique().tolist()),
    "company_location": sorted(
        df["company_location"].dropna().astype(str).unique().tolist()
    ),
    "company_size": sorted(df["company_size"].dropna().astype(str).unique().tolist()),
}

with open(OUTPUT_PATH, "w", encoding="utf-8") as file:
    json.dump(allowed_values, file, indent=4)

print(f"Allowed values saved to: {OUTPUT_PATH}")
