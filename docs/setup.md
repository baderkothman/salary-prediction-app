# Setup and Local Development

## Prerequisites

- Python 3.11 or newer recommended.
- Node.js compatible with Next.js 16.
- npm.
- Supabase project if you want persistence and dashboard history.
- Ollama if you want local LLM narrative analysis.

## Backend Setup

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Start the API:

```powershell
uvicorn backend.api.main:app --reload
```

Open:

```text
http://127.0.0.1:8000/docs
```

## Frontend Setup

From the frontend folder:

```powershell
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Start the dashboard:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

### Backend

| Variable                    | Required                     | Purpose                                                                 |
| --------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| `SUPABASE_URL`              | Required for storage/history | Supabase project URL.                                                   |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for storage/history | Service role key used by backend to insert and read prediction history. |

If these values are missing, `/analyze` still predicts salary but reports that storage failed. `/history` returns a `500` error.

### Dashboard

| Variable                        | Required                 | Purpose                                                                                      |
| ------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes                      | Supabase project URL used by browser client.                                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes                      | Supabase anon key used by browser client.                                                    |
| `NEXT_PUBLIC_API_BASE_URL`      | Optional but recommended | FastAPI base URL. Defaults to `http://127.0.0.1:8000` in `frontend/src/lib/predictions.ts`. |

## Optional Ollama Setup

`backend/api/llm_analysis.py` expects Ollama at:

```text
http://localhost:11434/api/generate
```

Install and run the configured model:

```powershell
ollama pull llama3.2
ollama serve
```

The model name and Ollama URL are currently hardcoded:

```python
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2"
```

## Regenerating Allowed Values

When `backend/data/processed/cleaned_salaries.csv` changes, regenerate API validation options:

```powershell
python backend\api\create_allowed_values.py
```

This updates:

```text
backend/api/allowed_values.json
```

## Running Tests

Start the backend first:

```powershell
uvicorn backend.api.main:app --reload
```

Then run the API test script:

```powershell
python backend\scripts\test_prediction_api.py
```

The script writes:

```text
backend/reports/api_prediction_test_results.csv
```

Dashboard checks:

```powershell
cd frontend
npm run lint
npm run build
```

## Development URLs

| Service           | URL                          |
| ----------------- | ---------------------------- |
| FastAPI           | `http://127.0.0.1:8000`      |
| FastAPI docs      | `http://127.0.0.1:8000/docs` |
| Next.js dashboard | `http://localhost:3000`      |
| Ollama            | `http://localhost:11434`     |

## Common Local Workflow

1. Activate Python virtual environment.
2. Start Ollama if LLM analysis is needed.
3. Start FastAPI on port `8000`.
4. Start Next.js dashboard on port `3000`.
5. Use the dashboard Prediction Simulator to call `/analyze`.
6. Confirm a row appears in Supabase and in the dashboard history.

## Assumptions / Missing Information

- The repo does not include a `.env.example`; the examples above are based on code usage.
- The root `.gitignore` ignores backend and frontend environment/build artifacts.
- No automated setup script exists for creating the Supabase table.


