# API Reference

## Overview

The backend is a FastAPI application defined in `api/main.py`.

Default local base URL:

```text
http://127.0.0.1:8000
```

Interactive documentation:

```text
http://127.0.0.1:8000/docs
```

All implemented endpoints use `GET`.

## Authentication

The API does not implement authentication or authorization.

The Supabase service role key is used server-side by `api/supabase_service.py` for insert and history operations. It must never be exposed to the browser.

## Common Prediction Query Parameters

The `/predict` and `/analyze` endpoints require the same query parameters.

| Parameter            | Type    | Required | Validation                                                                       |
| -------------------- | ------- | -------- | -------------------------------------------------------------------------------- |
| `work_year`          | integer | Yes      | Must exist in `api/allowed_values.json`. Current values: `2020`, `2021`, `2022`. |
| `experience_level`   | string  | Yes      | Must be an allowed dataset value.                                                |
| `employment_type`    | string  | Yes      | Must be an allowed dataset value.                                                |
| `job_title`          | string  | Yes      | 2-100 characters and must be an allowed dataset value.                           |
| `employee_residence` | string  | Yes      | 2-3 characters and must be an allowed dataset value.                             |
| `remote_ratio`       | integer | Yes      | Must be one of `0`, `50`, `100`.                                                 |
| `company_location`   | string  | Yes      | 2-3 characters and must be an allowed dataset value.                             |
| `company_size`       | string  | Yes      | Must be an allowed dataset value.                                                |

Allowed values are returned by `/options`.

## `GET /`

Returns service metadata.

### Response

```json
{
  "message": "Salary Prediction API is running.",
  "available_endpoints": [
    "/health",
    "/options",
    "/predict",
    "/analyze",
    "/history"
  ]
}
```

## `GET /health`

Checks whether the model and dataset loaded successfully.

### Response

```json
{
  "status": "ok",
  "model_loaded": true,
  "dataset_loaded": true
}
```

## `GET /options`

Returns allowed values for prediction fields.

### Response Shape

```json
{
  "work_year": [2020, 2021, 2022],
  "experience_level": [
    "Entry-level",
    "Executive-level",
    "Mid-level",
    "Senior-level"
  ],
  "employment_type": ["Contract", "Freelance", "Full-time", "Part-time"],
  "job_title": ["Data Analyst", "Data Scientist"],
  "employee_residence": ["DE", "US"],
  "remote_ratio": [0, 50, 100],
  "company_location": ["DE", "US"],
  "company_size": ["Large", "Medium", "Small"]
}
```

The actual response contains the full allowed-value lists from `api/allowed_values.json`.

## `GET /predict`

Runs salary prediction and returns only the prediction and normalized input.

### Example Request

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/predict?work_year=2022&experience_level=Senior-level&employment_type=Full-time&job_title=Data%20Scientist&employee_residence=US&remote_ratio=100&company_location=US&company_size=Medium"
```

### Response

```json
{
  "prediction": {
    "salary_in_usd": 140000.0
  },
  "input": {
    "work_year": 2022,
    "experience_level": "Senior-level",
    "employment_type": "Full-time",
    "job_title": "Data Scientist",
    "employee_residence": "US",
    "remote_ratio": 100,
    "company_location": "US",
    "company_size": "Medium"
  }
}
```

The numeric value above is an example. Actual output depends on the saved model.

## `GET /analyze`

Runs prediction, calculates dataset insights, creates a chart, requests local LLM analysis, saves the result to Supabase, and returns the full analysis payload.

### Example Request

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/analyze?work_year=2022&experience_level=Senior-level&employment_type=Full-time&job_title=Data%20Scientist&employee_residence=US&remote_ratio=100&company_location=US&company_size=Medium"
```

### Response Shape

```json
{
  "prediction": {
    "salary_in_usd": 140000.0
  },
  "input": {
    "work_year": 2022,
    "experience_level": "Senior-level",
    "employment_type": "Full-time",
    "job_title": "Data Scientist",
    "employee_residence": "US",
    "remote_ratio": 100,
    "company_location": "US",
    "company_size": "Medium"
  },
  "dataset_insights": {
    "overall_average_salary": 110610.34,
    "experience_average_salary": 138617.29,
    "company_size_average_salary": 116905.47,
    "job_title_average_salary": 108187.83
  },
  "llm_analysis": "Narrative analysis or an Ollama error message.",
  "visualization": {
    "chart_type": "bar_chart",
    "title": "Predicted Salary Compared with Average Salary by Experience Level",
    "chart_url": "/static/charts/salary_comparison_<uuid>.png"
  },
  "storage": {
    "saved_to_supabase": true,
    "error": null,
    "record": {
      "id": "uuid",
      "work_year": 2022,
      "experience_level": "Senior-level",
      "created_at": "2026-07-03T00:00:00Z"
    }
  }
}
```

### Storage Behavior

If Supabase is not configured or insertion fails, the endpoint still returns prediction, insights, chart URL, and LLM analysis. The storage object reports:

```json
{
  "saved_to_supabase": false,
  "error": "Supabase is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  "record": null
}
```

## `GET /history`

Returns recent prediction records from Supabase.

### Query Parameters

| Parameter | Type    | Default | Validation                  |
| --------- | ------- | ------: | --------------------------- |
| `limit`   | integer |      20 | Minimum `1`, maximum `100`. |

### Example Request

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/history?limit=10"
```

### Response

```json
{
  "count": 1,
  "data": [
    {
      "id": "uuid",
      "work_year": 2022,
      "experience_level": "Senior-level",
      "employment_type": "Full-time",
      "job_title": "Data Scientist",
      "employee_residence": "US",
      "remote_ratio": 100,
      "company_location": "US",
      "company_size": "Medium",
      "predicted_salary": 140000.0,
      "overall_average_salary": 110610.34,
      "experience_average_salary": 138617.29,
      "company_size_average_salary": 116905.47,
      "job_title_average_salary": 108187.83,
      "llm_analysis": "Narrative analysis.",
      "chart_url": "/static/charts/salary_comparison_<uuid>.png",
      "created_at": "2026-07-03T00:00:00Z"
    }
  ]
}
```

## Validation Errors

FastAPI returns `422` for missing or type-invalid query parameters.

The custom validation helper also returns `422` when a value is not present in the training dataset allowed values.

### Example Invalid Value Response

```json
{
  "detail": {
    "error": "Invalid input value",
    "field": "remote_ratio",
    "received": 75,
    "allowed_values": [0, 50, 100],
    "message": "The received value was not found in the training dataset allowed values."
  }
}
```

## Server Errors

`/history` returns `500` if Supabase is not configured or the query fails:

```json
{
  "detail": {
    "error": "Failed to fetch prediction history",
    "message": "Supabase is not configured."
  }
}
```

## CORS

The backend currently allows all origins, methods, headers, and credentials:

```python
allow_origins=["*"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

This is convenient for local development but should be restricted in production.

## Assumptions / Missing Information

- No OpenAPI customization beyond FastAPI defaults is implemented.
- No API keys, JWT validation, rate limiting, or user-level permissions are implemented.
- All mutation-like behavior currently happens through `GET /analyze`, which inserts a Supabase row.
