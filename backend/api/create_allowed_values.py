# We import json so we can save the allowed values as a JSON file.
import json

# We import Path so we can build file paths in a clean way.
from pathlib import Path

# We import pandas so we can read the cleaned salary CSV file.
import pandas as pd


# BASE_DIR means the main project folder.
# __file__ is this file: api/create_allowed_values.py
# parent is the api folder.
# parent.parent goes one level above api, which is the project root.
BASE_DIR = Path(__file__).resolve().parent.parent

# This is the path of the cleaned dataset.
DATA_PATH = BASE_DIR / "data" / "processed" / "cleaned_salaries.csv"

# This is where we will save the generated allowed values file.
OUTPUT_PATH = BASE_DIR / "api" / "allowed_values.json"


# Read the cleaned salary dataset into a pandas DataFrame.
df = pd.read_csv(DATA_PATH)


# This helper function makes a clean sorted list of values from one column.
def get_text_values(column_name: str) -> list:
    # Select one column from the dataset.
    column = df[column_name]

    # Remove missing values.
    column = column.dropna()

    # Convert values to text.
    column = column.astype(str)

    # Get unique values only.
    values = column.unique()

    # Convert the NumPy array into a normal Python list.
    values = values.tolist()

    # Sort values alphabetically.
    values = sorted(values)

    # Return the final clean list.
    return values


# This helper function makes a clean sorted list of integer values from one column.
def get_number_values(column_name: str) -> list:
    # Select one column from the dataset.
    column = df[column_name]

    # Remove missing values.
    column = column.dropna()

    # Convert values to integers.
    column = column.astype(int)

    # Get unique values only.
    values = column.unique()

    # Convert the NumPy array into a normal Python list.
    values = values.tolist()

    # Sort values from smallest to largest.
    values = sorted(values)

    # Return the final clean list.
    return values


# This dictionary stores the allowed values for each API input field.
# The API will use this file later to reject invalid user inputs.
allowed_values = {
    # Allowed years from the dataset.
    "work_year": get_number_values("work_year"),

    # Allowed experience levels from the dataset.
    "experience_level": get_text_values("experience_level"),

    # Allowed employment types from the dataset.
    "employment_type": get_text_values("employment_type"),

    # Allowed job titles from the dataset.
    "job_title": get_text_values("job_title"),

    # Allowed employee residence country codes from the dataset.
    "employee_residence": get_text_values("employee_residence"),

    # Allowed remote ratios from the dataset.
    "remote_ratio": get_number_values("remote_ratio"),

    # Allowed company location country codes from the dataset.
    "company_location": get_text_values("company_location"),

    # Allowed company sizes from the dataset.
    "company_size": get_text_values("company_size"),
}


# Open the output JSON file in write mode.
with open(OUTPUT_PATH, "w", encoding="utf-8") as file:
    # Save the allowed_values dictionary into the JSON file.
    # indent=4 makes the file easy to read.
    json.dump(allowed_values, file, indent=4)


# Print a success message so we know where the file was saved.
print(f"Allowed values saved to: {OUTPUT_PATH}")
