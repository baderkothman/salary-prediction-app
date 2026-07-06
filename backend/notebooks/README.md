# Notebook Guide

This folder contains the notebooks used to prepare data and train the salary prediction model.

## Recommended Run Order

1. `01_data_cleaning.ipynb`
2. `02_model_training.ipynb`

## `01_data_cleaning.ipynb`

Purpose: clean the raw salary dataset and create a model-ready CSV.

Input:

- `../data/raw/ds_salaries.csv`

Output:

- `../data/processed/cleaned_salaries.csv`

Main steps:

- Load and inspect the raw dataset.
- Standardize column names.
- Remove missing values and duplicates.
- Clean categorical and numeric fields.
- Expand coded values such as experience level, employment type, and company size.
- Remove extreme `salary_in_usd` outliers above the 99th percentile.
- Group rare job titles into `Other`.
- Add a readable work-setting label from `remote_ratio`.
- Select the final columns used for model training.

## `02_model_training.ipynb`

Purpose: train, compare, evaluate, and save the best salary prediction model.

Input:

- `../data/processed/cleaned_salaries.csv`

Outputs:

- `../models/salary_best_model_pipeline.joblib`
- `../models/model_metrics.json`
- `../models/input_schema.json`
- `../data/processed/feature_importance.csv`
- `../api/allowed_values.json`

Main steps:

- Load the cleaned dataset.
- Select prediction features and the `salary_in_usd` target.
- Split the data into training and test sets.
- Build a preprocessing pipeline for categorical and numeric features.
- Train and compare `DecisionTreeRegressor`, `RandomForestRegressor`, and `GradientBoostingRegressor`.
- Test both raw salary targets and a `log1p` target transformation.
- Compare each candidate against a median-salary baseline.
- Save the model, metrics, input schema, and feature importance table.

## Notes

- The raw data file is not modified by the notebooks.
- Run the data cleaning notebook before the model training notebook.
- The saved model artifact includes both preprocessing and regression steps, so prediction inputs should use the schema saved in `../models/input_schema.json`.
