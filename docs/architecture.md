# System Architecture

## Overview

The Salary Prediction App is a full-stack ML application with four main runtime parts:

1. A FastAPI backend that loads model and data artifacts.
2. A scikit-learn prediction pipeline saved as a Joblib file.
3. Supabase for storing and reading saved salary analyses.
4. A Next.js dashboard for simulation, filtering, charting, and comparison.

Ollama is an optional local dependency used only by `/analyze` to create a narrative explanation. The salary prediction itself does not depend on Ollama.

## High-Level Architecture

```mermaid
flowchart LR
    User[User] --> Dashboard[Next.js Dashboard]
    Dashboard -->|GET /options and /analyze| API[FastAPI Backend]
    Dashboard -->|select from salary_predictions| Supabase[(Supabase Postgres)]
    API --> Model[Joblib scikit-learn Pipeline]
    API --> Dataset[cleaned_salaries.csv]
    API --> Charts[static/charts PNG files]
    API -->|optional local request| Ollama[Ollama llama3.2]
    API -->|insert analysis record| Supabase
```

## Runtime Components

| Component                | Location                           | Responsibility                                                                                          |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| FastAPI app              | `api/main.py`                      | Defines routes, loads model/data, validates inputs, runs predictions, creates analysis responses.       |
| Validation helper        | `api/validation.py`                | Rejects query parameter values not present in `api/allowed_values.json`.                                |
| Chart generator          | `api/charts.py`                    | Builds matplotlib salary comparison PNGs in `static/charts/`.                                           |
| LLM analysis             | `api/llm_analysis.py`              | Sends prompt context to local Ollama `llama3.2` and returns narrative text or a graceful error message. |
| Supabase service         | `api/supabase_service.py`          | Creates Supabase client, inserts analysis rows, and fetches recent history.                             |
| Next.js dashboard        | `dashboard/src/app/page.tsx`       | Renders dashboard UI, filters history, runs simulations, displays chart and analysis details.           |
| Frontend data client     | `dashboard/src/lib/predictions.ts` | Calls FastAPI for options/analysis and Supabase for history.                                            |
| Frontend Supabase client | `dashboard/src/lib/supabase.ts`    | Initializes browser Supabase client from public environment variables.                                  |

## Request Flow

### Prediction-Only Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as FastAPI
    participant Model as scikit-learn Pipeline
    participant Values as allowed_values.json

    Client->>API: GET /predict?work_year=...&...
    API->>Values: Validate each input value
    API->>Model: model.predict(DataFrame[input])
    Model-->>API: salary_in_usd
    API-->>Client: prediction + normalized input
```

### Analysis and Save Flow

```mermaid
sequenceDiagram
    participant Dashboard
    participant API as FastAPI
    participant Model
    participant Dataset as cleaned_salaries.csv
    participant Ollama
    participant Supabase

    Dashboard->>API: GET /analyze?...
    API->>Model: Predict salary
    API->>Dataset: Calculate benchmark averages
    API->>API: Generate salary comparison PNG
    API->>Ollama: POST /api/generate with prompt
    Ollama-->>API: Narrative analysis
    API->>Supabase: Insert salary_predictions row
    API-->>Dashboard: Prediction, insights, chart URL, storage result
    Dashboard->>Supabase: Fetch updated history
```

## Data and Artifact Flow

```mermaid
flowchart TD
    Raw[data/raw/ds_salaries.csv] --> Cleaning[notebooks/01_data_cleaning.ipynb]
    Cleaning --> Cleaned[data/processed/cleaned_salaries.csv]
    Cleaned --> Training[notebooks/02_model_training.ipynb]
    Training --> Model[models/salary_decision_tree_pipeline.joblib]
    Training --> Metrics[models/model_metrics.json]
    Training --> Schema[models/input_schema.json]
    Training --> Importance[data/processed/feature_importance.csv]
    Cleaned --> Allowed[api/allowed_values.json]
    Model --> API[api/main.py]
    Cleaned --> API
    Allowed --> API
```

## Folder and File Responsibilities

| Path                                          | Purpose                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `api/main.py`                                 | API application entrypoint and route definitions.                      |
| `api/allowed_values.json`                     | Valid values for request validation, derived from the cleaned dataset. |
| `api/create_allowed_values.py`                | Regenerates `allowed_values.json` from `cleaned_salaries.csv`.         |
| `api/validation.py`                           | Shared input validation helper.                                        |
| `api/charts.py`                               | Creates salary comparison charts.                                      |
| `api/llm_analysis.py`                         | Local Ollama prompt and response handling.                             |
| `api/supabase_service.py`                     | Supabase connection, insert, and history query logic.                  |
| `dashboard/src/app/page.tsx`                  | Main interactive dashboard screen.                                     |
| `dashboard/src/lib/predictions.ts`            | Frontend API and Supabase data functions.                              |
| `dashboard/src/lib/supabase.ts`               | Supabase browser client configuration.                                 |
| `dashboard/src/types/prediction.ts`           | TypeScript shape of saved prediction rows.                             |
| `data/raw/ds_salaries.csv`                    | Original salary dataset.                                               |
| `data/processed/cleaned_salaries.csv`         | Cleaned model-ready dataset.                                           |
| `data/processed/feature_importance.csv`       | Feature importance report from trained decision tree.                  |
| `models/salary_decision_tree_pipeline.joblib` | Saved preprocessing and regression pipeline.                           |
| `models/model_metrics.json`                   | Model metrics and selected hyperparameters.                            |
| `models/input_schema.json`                    | Expected model input schema.                                           |
| `notebooks/01_data_cleaning.ipynb`            | Raw-to-cleaned data preparation notebook.                              |
| `notebooks/02_model_training.ipynb`           | Training, tuning, evaluation, and artifact export notebook.            |
| `scripts/test_prediction_api.py`              | API validation and prediction test script.                             |
| `static/charts/`                              | Generated PNG chart files returned by `/analyze`.                      |

## Architecture Decisions

- The model artifact includes preprocessing and regression in one pipeline, reducing training/inference drift.
- API validation uses observed dataset values so predictions stay inside the known training domain.
- The LLM is local through Ollama, so no hosted LLM API key is required.
- Supabase is optional for `/analyze` storage, but required for `/history` and for the dashboard history view.

## Assumptions / Missing Information

- No load balancer, container, reverse proxy, CI/CD, or production hosting configuration exists in the repository.
- No database migrations exist; database structure is inferred from application code.
- The API and dashboard are separate deployable services.
- The dashboard reads history directly from Supabase instead of calling the backend `/history` endpoint.
