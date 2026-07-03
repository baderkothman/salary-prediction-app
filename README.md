# Salary Prediction App

A full-stack AI application for predicting data science salaries in USD. The project combines a trained scikit-learn regression model, a FastAPI backend, optional local LLM salary analysis through Ollama, Supabase persistence, and a Next.js dashboard for exploring saved predictions.

## Project Goal

The application helps users estimate data science salaries from role, experience, employment type, location, remote-work ratio, year, and company size. It is useful for:

- Developers reviewing an end-to-end ML application.
- Stakeholders evaluating salary trends and prediction quality.
- Future maintainers improving the model, API, dashboard, and deployment setup.

## Problem Statement

Salary expectations vary by job title, experience level, geography, company size, and remote-work arrangement. This project uses historical salary data to predict `salary_in_usd` and explain the prediction with dataset comparisons and an optional locally generated narrative.

## Main Features

- Predicts data science salaries with a trained `DecisionTreeRegressor`.
- Validates API inputs against values observed in the processed training dataset.
- Provides dataset benchmark averages for overall salary, experience level, company size, and job title.
- Generates salary comparison charts as static PNG files.
- Generates optional narrative analysis using local Ollama model `llama3.2`.
- Saves analysis results to a Supabase table named `salary_predictions`.
- Provides a Next.js dashboard for filtering, simulating, comparing, and inspecting saved salary predictions.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Backend API | FastAPI, Uvicorn |
| ML model | scikit-learn `Pipeline`, `ColumnTransformer`, `OneHotEncoder`, `DecisionTreeRegressor` |
| Data processing | pandas, NumPy, Jupyter notebooks |
| Visualization | matplotlib, Recharts |
| LLM analysis | Ollama local API, model `llama3.2` |
| Database | Supabase Postgres via `supabase-py` and `@supabase/supabase-js` |
| Frontend | Next.js, React, TypeScript, Material UI, Tailwind CSS |

## Repository Structure

```text
salary-prediction-app/
+-- api/                         # FastAPI app, validation, chart, LLM, and Supabase logic
+-- dashboard/                   # Next.js dashboard application
+-- data/
|   +-- raw/                     # Original dataset
|   +-- processed/               # Cleaned dataset and feature importance report
+-- docs/                        # Project documentation
+-- models/                      # Saved model pipeline, metrics, and input schema
+-- notebooks/                   # Data cleaning and model training notebooks
+-- reports/                     # API test reports
+-- scripts/                     # Utility and API test scripts
+-- static/charts/               # Generated chart PNG files
+-- requirements.txt             # Python dependencies
+-- .env                         # Backend environment variables, not committed
```

## Documentation Index

- [Architecture](docs/architecture.md)
- [AI Workflow](docs/ai-workflow.md)
- [API Reference](docs/api.md)
- [Database](docs/database.md)
- [Setup](docs/setup.md)
- [Deployment](docs/deployment.md)
- [Security](docs/security.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Future Improvements](docs/future-improvements.md)

## Quick Start

### 1. Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn api.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Interactive API docs:

```text
http://127.0.0.1:8000/docs
```

### 2. Optional Ollama LLM Analysis

The `/analyze` endpoint still returns a prediction if Ollama is unavailable, but the narrative analysis will contain an error message.

```powershell
ollama pull llama3.2
ollama serve
```

Ollama is expected at:

```text
http://localhost:11434/api/generate
```

### 3. Frontend Dashboard

```powershell
cd dashboard
npm install
npm run dev
```

Dashboard URL:

```text
http://localhost:3000
```

## Environment Variables

Backend `.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Dashboard `dashboard/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

See [Setup](docs/setup.md) for details.

## API Summary

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Basic service metadata |
| `GET` | `/health` | Model and dataset health check |
| `GET` | `/options` | Allowed prediction input values |
| `GET` | `/predict` | Salary prediction only |
| `GET` | `/analyze` | Prediction, benchmarks, chart, LLM analysis, and Supabase save |
| `GET` | `/history` | Recent prediction records from Supabase |

Example prediction request:

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/predict?work_year=2022&experience_level=Senior-level&employment_type=Full-time&job_title=Data%20Scientist&employee_residence=US&remote_ratio=100&company_location=US&company_size=Medium"
```

## Model Summary

| Item | Value |
| --- | --- |
| Model | `DecisionTreeRegressor` |
| Target | `salary_in_usd` |
| Rows in raw dataset | 607 |
| Rows in cleaned dataset | 565 |
| Evaluation split | 80 percent train, 20 percent test |
| Cross-validation | 5-fold `GridSearchCV` |
| MAE | 32,331.41 USD |
| RMSE | 52,882.32 USD |
| R2 | 0.4179 |
| Baseline MAE | 50,958.96 USD |

## Testing

Run the API first, then execute:

```powershell
python scripts\test_prediction_api.py
```

The script calls `/options`, generates valid and invalid `/predict` test cases, and writes results to:

```text
reports/api_prediction_test_results.csv
```

For the dashboard:

```powershell
cd dashboard
npm run lint
npm run build
```

## Assumptions / Missing Information

- No database migration or SQL schema file is included. The database documentation infers table fields from backend and frontend code.
- No production deployment files such as Dockerfile, Compose file, Procfile, Vercel config, or CI workflow are included.
- The API currently has no authentication layer and allows all CORS origins.
- The project does not implement RAG, embeddings, vector databases, agents, or external hosted LLM APIs.
- The local Ollama URL and model name are hardcoded in `api/llm_analysis.py`.
