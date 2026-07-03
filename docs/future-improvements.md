# Future Improvements

## High Priority

| Improvement                                   | Reason                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Add database migrations                       | Makes Supabase setup reproducible and reviewable.                          |
| Restrict CORS                                 | Current wildcard CORS is not appropriate for production.                   |
| Add authentication and authorization          | Protects saved prediction history and API usage.                           |
| Add rate limiting                             | Prevents excessive chart generation, database writes, and Ollama load.     |
| Move Ollama settings to environment variables | Avoids hardcoded local-only configuration.                                 |
| Add `.env.example` files                      | Makes setup clearer without exposing secrets.                              |
| Ignore dashboard secrets/build output         | Add `dashboard/.env.local`, `.next/`, and `node_modules/` to ignore rules. |

## AI and Model Improvements

- Add a model card documenting dataset source, license, intended use, limitations, and evaluation results.
- Add confidence intervals or prediction ranges.
- Compare multiple models such as Random Forest, Gradient Boosting, XGBoost, LightGBM, or regularized linear models.
- Add subgroup error analysis by country, experience level, job title, and company size.
- Add data drift monitoring if new salary records are added.
- Add model versioning and save model version with each prediction record.
- Automate retraining with a reproducible pipeline.
- Add cross-validation reports and residual plots.
- Add tests to verify prediction schema compatibility before loading a new model.

## API Improvements

- Add `POST /predict` and `POST /analyze` with JSON bodies.
- Keep `GET /predict` for simple demos if desired.
- Add response models with Pydantic schemas.
- Add structured error codes.
- Add request IDs and structured logging.
- Add health checks for Supabase and Ollama.
- Add pagination and filters to `/history`.
- Add cleanup logic for generated chart files.

## Frontend Improvements

- Use backend `/history` or a dedicated API route instead of querying Supabase directly from the browser if history should be protected.
- Add loading and retry states for each data source independently.
- Add server-side pagination for large prediction history.
- Add export options for filtered history.
- Add model metadata display, including MAE, RMSE, R2, and model version.
- Add clearer user-facing disclaimer that salaries are estimates.
- Add accessible chart summaries for screen readers.

## Database Improvements

- Add SQL migration files under a versioned migrations directory.
- Add indexes for `created_at` and frequently filtered fields.
- Add explicit RLS policies.
- Add `model_version`, `api_version`, and `analysis_status` columns.
- Add `user_id` only if authentication is introduced.
- Add retention or archival policy for old predictions.

## Security Improvements

- Add authentication.
- Add authorization checks for history access.
- Restrict CORS to known dashboard origins.
- Keep service role key only in backend runtime secrets.
- Add input size limits and rate limits.
- Add dependency vulnerability scanning.
- Add production secret-management guidance.
- Add privacy and retention documentation.

## Deployment Improvements

- Add Dockerfile for the FastAPI backend.
- Add separate deployment config for the Next.js dashboard.
- Add CI workflow for lint, build, and API tests.
- Replace local chart storage with Supabase Storage or another object store.
- Add environment-specific settings for development, staging, and production.
- Add observability: logs, metrics, traces, and alerts.

## Documentation Improvements

- Add screenshots of the dashboard.
- Add a live architecture diagram generated from source.
- Add a model card.
- Add a data dictionary for all raw and processed dataset columns.
- Add a contributor guide.
- Add changelog and release process.

## Assumptions / Missing Information

- The desired production platform is not specified.
- The intended privacy model for prediction history is not specified.
- The project owner has not specified whether salary history should be public, private, or user-specific.
