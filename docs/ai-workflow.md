# AI Workflow

## Overview

The AI behavior has two separate parts:

1. A supervised machine learning salary prediction model.
2. An optional local LLM narrative generator that explains predictions using only the model output and dataset-derived benchmarks.

The project does not implement RAG, embeddings, vector search, agents, tool-calling, or a hosted LLM API.

## Dataset

| File                                  | Rows | Purpose                                                   |
| ------------------------------------- | ---: | --------------------------------------------------------- |
| `backend/data/raw/ds_salaries.csv`            |  607 | Original salary dataset.                                  |
| `backend/data/processed/cleaned_salaries.csv` |  565 | Cleaned dataset used by training and API benchmark logic. |

Raw columns include compact category codes such as `MI`, `SE`, `FT`, and `M`. The cleaning notebook expands these into readable labels.

## Cleaning Workflow

Implemented in `notebooks/01_data_cleaning.ipynb`.

Main steps:

1. Load `backend/data/raw/ds_salaries.csv`.
2. Standardize column names.
3. Remove missing values.
4. Remove duplicate rows.
5. Trim text columns.
6. Expand encoded labels:
   - Experience: `EN`, `MI`, `SE`, `EX` to readable levels.
   - Employment: `FT`, `PT`, `CT`, `FL` to readable types.
   - Company size: `S`, `M`, `L` to readable sizes.
7. Coerce numeric fields.
8. Remove invalid non-positive salary rows.
9. Add readable `work_setting` from `remote_ratio`.
10. Save `backend/data/processed/cleaned_salaries.csv`.

## Model Training Workflow

Implemented in `notebooks/02_model_training.ipynb`.

```mermaid
flowchart TD
    A[Load cleaned_salaries.csv] --> B[Select features and target]
    B --> C[Train/test split, random_state=42]
    C --> D[One-hot encode categorical features]
    D --> E[Pass through numeric features]
    E --> F[Train DecisionTreeRegressor]
    F --> G[GridSearchCV, 5 folds, MAE scoring]
    G --> H[Evaluate tuned model]
    H --> I[Compare to median baseline]
    I --> J[Save model, metrics, schema, feature importance]
```

## Model Type

The saved model is a scikit-learn `Pipeline`:

```text
Pipeline
+-- preprocessor: ColumnTransformer
|   +-- categorical: OneHotEncoder(handle_unknown="ignore")
|   +-- numeric: passthrough
+-- model: DecisionTreeRegressor(random_state=42)
```

The tuned model parameters are:

```json
{
  "model__max_depth": 7,
  "model__max_features": null,
  "model__min_samples_leaf": 2,
  "model__min_samples_split": 5
}
```

## Features and Target

| Field                | Type        | Role    |
| -------------------- | ----------- | ------- |
| `work_year`          | Numeric     | Feature |
| `experience_level`   | Categorical | Feature |
| `employment_type`    | Categorical | Feature |
| `job_title`          | Categorical | Feature |
| `employee_residence` | Categorical | Feature |
| `remote_ratio`       | Numeric     | Feature |
| `company_location`   | Categorical | Feature |
| `company_size`       | Categorical | Feature |
| `salary_in_usd`      | Numeric     | Target  |

`work_setting` is kept in the cleaned dataset for readability but excluded from training because it duplicates information already present in `remote_ratio`.

## Hyperparameter Search

The training notebook uses `GridSearchCV` with 5-fold cross-validation and `neg_mean_absolute_error` scoring.

Search space:

```python
{
    "model__max_depth": [3, 5, 7, 10, 15, None],
    "model__min_samples_split": [2, 5, 10, 20],
    "model__min_samples_leaf": [1, 2, 5, 10],
    "model__max_features": [None, "sqrt", "log2"],
}
```

## Evaluation Metrics

From `backend/models/model_metrics.json`:

| Metric | Tuned Model | Median Baseline |
| ------ | ----------: | --------------: |
| MAE    |   32,331.41 |       50,958.96 |
| RMSE   |   52,882.32 |       69,822.65 |
| R2     |      0.4179 |         -0.0149 |

The model outperforms the simple median-salary baseline, but its R2 indicates moderate predictive strength rather than high-confidence salary forecasting.

## Feature Importance

Feature importance is saved in `backend/data/processed/feature_importance.csv`. The highest-impact feature in the current artifact is `employee_residence_US`, followed by experience-level and work-year related features.

Because this is a one-hot encoded decision tree, importances are assigned to encoded feature columns rather than only to original business fields.

## Inference Flow

```mermaid
flowchart TD
    A[Request query parameters] --> B[Validate values against allowed_values.json]
    B --> C[Build one-row pandas DataFrame]
    C --> D[scikit-learn pipeline preprocessing]
    D --> E[DecisionTreeRegressor prediction]
    E --> F[Round predicted salary to 2 decimals]
    F --> G[Return JSON response]
```

## Dataset Insights

The `/analyze` endpoint calculates benchmark averages from `backend/data/processed/cleaned_salaries.csv`:

- Overall average salary.
- Average salary for the selected experience level.
- Average salary for the selected company size.
- Average salary for the selected job title.

If a filtered group has no rows, the API falls back to the overall average.

## Chart Generation

`backend/api/charts.py` groups the cleaned dataset by `experience_level`, calculates average salary, and creates a bar chart. It overlays the predicted salary as a horizontal dashed line and saves a PNG under:

```text
backend/static/charts/
```

The API returns a relative chart URL such as:

```text
/static/charts/salary_comparison_<uuid>.png
```

## LLM Analysis

Implemented in `backend/api/llm_analysis.py`.

The app sends a prompt to:

```text
http://localhost:11434/api/generate
```

Payload:

```json
{
  "model": "llama3.2",
  "prompt": "Generated prompt with input fields, predicted salary, and dataset insights.",
  "stream": false
}
```

The prompt asks for three short sections:

1. Salary Prediction Summary
2. Market Comparison
3. Key Factors

The prompt also instructs the model to avoid inventing facts outside the provided data.

## Failure Behavior

If Ollama is unavailable, times out, or returns an error, `/analyze` still returns the salary prediction. The `llm_analysis` field contains a human-readable error message instead of generated analysis.

## Model Limitations

- The dataset is small: 565 cleaned rows.
- Valid API inputs are limited to categories observed in the cleaned dataset.
- The model is a decision tree, which can overfit and may generalize poorly outside training-like records.
- Salaries are historical and may not represent current market rates.
- The model predicts point estimates only; it does not provide confidence intervals.
- Location and role categories may be sparse.

## Assumptions / Missing Information

- The notebooks do not document the original public source or license of `ds_salaries.csv`.
- No model card, fairness evaluation, subgroup error analysis, or drift monitoring report is included.
- No retraining automation or scheduled data refresh exists.


