# Troubleshooting

## Backend Does Not Start

### Symptom

`uvicorn backend.api.main:app --reload` fails on startup.

### Common Causes and Fixes

| Cause                             | Fix                                                           |
| --------------------------------- | ------------------------------------------------------------- |
| Python dependencies missing       | Run `pip install -r backend\requirements.txt`.                        |
| Virtual environment not activated | Run `.\.venv\Scripts\Activate.ps1` on Windows PowerShell.     |
| Model artifact missing            | Confirm `backend/models/salary_decision_tree_pipeline.joblib` exists. |
| Cleaned dataset missing           | Confirm `backend/data/processed/cleaned_salaries.csv` exists.         |
| Invalid working directory         | Run commands from repository root.                            |

## `/health` Shows Model or Dataset Not Loaded

### Check

Open:

```text
http://127.0.0.1:8000/health
```

Expected:

```json
{
  "status": "ok",
  "model_loaded": true,
  "dataset_loaded": true
}
```

If this fails, verify the model and dataset files exist and are readable.

## `/predict` Returns 422

### Cause

One or more query parameters are missing, have the wrong type, or are not included in `backend/api/allowed_values.json`.

### Fix

Call `/options` and use only returned values:

```text
http://127.0.0.1:8000/options
```

Example valid remote ratios:

```json
[0, 50, 100]
```

## `/analyze` Predicts Salary but Does Not Save

### Symptom

Response contains:

```json
{
  "storage": {
    "saved_to_supabase": false
  }
}
```

### Common Causes

- `SUPABASE_URL` is missing.
- `SUPABASE_SERVICE_ROLE_KEY` is missing.
- `salary_predictions` table does not exist.
- Supabase credentials are invalid.
- Database insert violates table schema or policy.

### Fix

1. Check root `.env`.
2. Restart FastAPI after editing `.env`.
3. Confirm the table exists in Supabase.
4. Review the returned `storage.error` field.

## `/history` Returns 500

### Cause

The backend cannot query Supabase.

### Fix

Ensure the root `.env` includes:

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Also confirm the `salary_predictions` table exists and contains a `created_at` column.

## LLM Analysis Says Ollama Is Not Running

### Cause

`backend/api/llm_analysis.py` could not connect to:

```text
http://localhost:11434/api/generate
```

### Fix

```powershell
ollama pull llama3.2
ollama serve
```

Then retry `/analyze`.

## LLM Analysis Times Out

### Cause

The Ollama request exceeded the 60-second timeout.

### Fixes

- Confirm the machine has enough CPU/RAM or GPU resources.
- Try a smaller local model.
- Reduce concurrent `/analyze` calls.
- Move `OLLAMA_MODEL` and timeout into configurable settings if needed.

## Dashboard Fails with Missing Supabase Variables

### Symptom

Next.js throws:

```text
Missing NEXT_PUBLIC_SUPABASE_URL
```

or:

```text
Missing NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Fix

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Restart the dashboard after editing environment variables.

## Dashboard Cannot Load Salary Options

### Cause

The FastAPI backend is not running, or `NEXT_PUBLIC_API_BASE_URL` points to the wrong URL.

### Fix

1. Start the backend:

```powershell
uvicorn backend.api.main:app --reload
```

2. Confirm:

```text
http://127.0.0.1:8000/options
```

3. Check `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Dashboard History Is Empty

### Possible Causes

- No predictions have been saved yet.
- `/analyze` failed to save to Supabase.
- Supabase anon key cannot read `salary_predictions`.
- RLS policies block browser reads.

### Fix

1. Run a prediction from the dashboard simulator.
2. Check `/analyze` response storage status.
3. Confirm rows exist in Supabase.
4. Review Supabase RLS policies.

## Chart Image Does Not Display

### Cause

The saved `chart_url` is relative and the dashboard needs `NEXT_PUBLIC_API_BASE_URL` to build the full URL.

### Fix

Set:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Also confirm the file exists under:

```text
backend/static/charts/
```

## API Test Script Fails with Connection Error

### Cause

`scripts/test_prediction_api.py` expects the API at:

```text
http://127.0.0.1:8000
```

### Fix

Start FastAPI before running the script:

```powershell
uvicorn backend.api.main:app --reload
python backend\scripts\test_prediction_api.py
```

## `npm run build` Fails

### Common Causes

- Missing dashboard environment variables.
- TypeScript or lint errors.
- Node version incompatible with Next.js 16.

### Fix

```powershell
cd frontend
npm install
npm run lint
npm run build
```

Review the first error in the build output.

## Assumptions / Missing Information

- No CI logs or production logs are included.
- No centralized application logging is implemented.
- No health endpoint exists for Supabase or Ollama dependencies beyond indirect endpoint behavior.


