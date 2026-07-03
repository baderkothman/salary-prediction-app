# Security Documentation

## Overview

This project handles salary-related inputs, generated analysis text, database credentials, and saved prediction history. The current implementation is suitable for local development and demos, but production deployment needs additional controls.

## Secrets and Environment Variables

### Backend Secrets

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` is highly sensitive because it can bypass Supabase Row-Level Security. It must only be used server-side.

### Dashboard Public Variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_BASE_URL=...
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to browser code. Do not store service role keys or private API keys in dashboard environment variables.

## Git Hygiene

The root `.gitignore` ignores:

```text
.env
.venv/
api/__pycache__/
```

Recommended additions:

```text
dashboard/.env.local
dashboard/.next/
dashboard/node_modules/
__pycache__/
*.pyc
```

## Authentication and Authorization

Current state:

- Backend API has no authentication.
- Dashboard uses Supabase anon key.
- Backend uses Supabase service role key.
- CORS allows all origins.

Production recommendations:

- Add authentication if prediction or history data should not be public.
- Restrict CORS to trusted dashboard domains.
- Use Supabase RLS policies for all browser-accessed tables.
- Keep all write operations behind the backend unless direct browser writes are explicitly intended.

## CORS Risk

Current backend CORS configuration:

```python
allow_origins=["*"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

This should be replaced with explicit origins in production:

```python
allow_origins=["https://your-dashboard-domain.example.com"]
```

## Data Privacy

Saved records include:

- Job title.
- Residence and company country codes.
- Employment and experience levels.
- Predicted salary.
- LLM analysis text.

Although this app does not collect names or emails, salary data can still be sensitive. Treat saved prediction history as potentially confidential.

Recommendations:

- Do not store unnecessary user identifiers.
- Define retention policy for prediction history.
- Avoid public read access unless data is intended to be public.
- Add deletion workflows if users can submit personal data.

## LLM and Prompt Safety

The local LLM receives only structured input fields, predicted salary, and dataset insights. It does not retrieve documents, call tools, or execute code.

Prompt injection risk is lower than in a free-form chat or RAG app, but still possible through fields such as `job_title` if validation is relaxed in the future.

Current mitigation:

- `job_title` must exist in `api/allowed_values.json`.
- The prompt tells the model not to invent facts outside the provided data.

Recommended improvements:

- Keep strict validation for all fields.
- Do not pass arbitrary user text into the LLM prompt without sanitization and instruction boundaries.
- Clearly label LLM output as generated analysis in user-facing UI.
- Add output length limits.
- Consider logging LLM failures without storing sensitive prompt content.

## Model Safety

The model predicts salaries from historical data. Risks include:

- Inaccurate predictions for underrepresented countries or roles.
- Historical bias reflected in salary data.
- Misinterpretation of predictions as guaranteed market offers.
- No confidence interval or uncertainty estimate.

Recommendations:

- Add disclaimers for decision support use.
- Add subgroup error analysis.
- Monitor prediction drift if new data is added.
- Include model version in saved predictions.

## File Handling

The backend writes chart PNGs to:

```text
static/charts/
```

The filename is generated with `uuid4`, which reduces collision risk. The app does not accept user-uploaded files.

Production recommendations:

- Limit static file retention.
- Use object storage with controlled access if charts should not be public.
- Monitor disk usage.

## Dependency Security

Recommended routine checks:

```powershell
pip list --outdated
cd dashboard
npm audit
```

For production, pin dependencies intentionally and update them through reviewed pull requests.

## API Abuse Risks

Potential abuse:

- Repeated `/analyze` calls can create many chart files and database records.
- Ollama calls can consume CPU/GPU resources.
- No rate limit or authentication prevents automated traffic.

Recommended controls:

- Add request rate limiting.
- Add authentication or API keys.
- Add quotas for `/analyze`.
- Cache repeated predictions or analysis where appropriate.
- Add chart cleanup or object-storage lifecycle policies.

## Assumptions / Missing Information

- Supabase RLS policies are not included in the repository.
- No authentication requirements are defined.
- No production secret-management approach is specified.
- No privacy policy or data-retention policy is included.
