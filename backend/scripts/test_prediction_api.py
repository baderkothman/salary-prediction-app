# We use the csv module to save the test results inside a CSV file.
import csv

# We use random to choose random allowed values from the API options.
import random

# We use sys so we can stop the script with an error code if tests fail.
import sys

# We use datetime to save the time when each test was executed.
from datetime import datetime

# We use Path to create file and folder paths in a clean way.
from pathlib import Path

# We use requests to send HTTP requests to the FastAPI server.
import requests

# __file__ means the current Python file.
# .resolve() gets the full path of this file.
# .parent gets the folder that contains this file.
# .parent.parent moves one folder up from that folder.
BASE_DIR = Path(__file__).resolve().parent.parent

# This is the base URL of the FastAPI server.
# The server must be running locally on port 8000.
BASE_URL = "http://127.0.0.1:8000"

# This is the endpoint that returns the allowed values.
OPTIONS_URL = f"{BASE_URL}/options"

# This is the endpoint that predicts the salary.
PREDICT_URL = f"{BASE_URL}/predict"

# This is the folder where the CSV test report will be saved.
OUTPUT_DIR = BASE_DIR / "reports"

# This creates the reports folder if it does not already exist.
# parents=True allows Python to create missing parent folders too.
# exist_ok=True prevents an error if the folder already exists.
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# This is the full path of the CSV report file.
REPORT_PATH = OUTPUT_DIR / "api_prediction_test_results.csv"


# These are the fields required by the /predict endpoint.
# Every prediction request must include all of these fields.
REQUIRED_FIELDS = [
    "work_year",
    "experience_level",
    "employment_type",
    "job_title",
    "employee_residence",
    "remote_ratio",
    "company_location",
    "company_size",
]


def safe_get(url, params=None, timeout=10):
    """
    Sends a GET request safely.

    Why do we need this function?
    Because API requests can fail for many reasons:
    - The server is not running.
    - The request takes too long.
    - The server returns invalid JSON.
    - Something else goes wrong.

    Instead of crashing the script, this function returns a clear result dictionary.
    """

    # try means: run this code, but if an error happens, go to except.
    try:
        # Send a GET request to the given URL.
        # params contains query parameters like work_year=2023.
        # timeout stops the request if it takes too long.
        response = requests.get(url, params=params, timeout=timeout)

        # Convert the API response from JSON text into a Python dictionary.
        response_json = response.json()

        # Return a successful result.
        return {
            "success": True,
            "status_code": response.status_code,
            "json": response_json,
            "error": None,
            "url": response.url,
        }

    # This runs if Python cannot connect to the API server.
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "status_code": None,
            "json": None,
            "error": "Connection error. Make sure the FastAPI server is running.",
            "url": url,
        }

    # This runs if the request takes longer than the timeout value.
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "status_code": None,
            "json": None,
            "error": "Request timed out.",
            "url": url,
        }

    # This runs for other request-related errors.
    except requests.exceptions.RequestException as error:
        return {
            "success": False,
            "status_code": None,
            "json": None,
            "error": str(error),
            "url": url,
        }

    # This runs if the response is not valid JSON.
    except ValueError:
        return {
            "success": False,
            "status_code": response.status_code,
            "json": None,
            "error": "Response was not valid JSON.",
            "url": response.url,
        }


def get_options():
    """
    Gets the allowed values from the API.

    Example:
    The API may say that experience_level can only be:
    ["Entry-level", "Mid-level", "Senior-level", "Executive-level"]

    This is useful because the test script can use the real values from your dataset.
    """

    # Send a request to the /options endpoint.
    result = safe_get(OPTIONS_URL)

    # If the request failed, stop the script and show the error.
    if not result["success"]:
        raise RuntimeError(result["error"])

    # The /options endpoint should return status code 200.
    # 200 means success.
    if result["status_code"] != 200:
        raise RuntimeError(f"/options failed with status code {result['status_code']}")

    # Return the JSON data from the API.
    return result["json"]


def get_base_valid_input(options):
    """
    Creates one valid input dictionary.

    It uses the first allowed value for each required field.
    This gives us a safe starting point for tests.
    """

    # Create an empty dictionary to store the valid input.
    base_input = {}

    # Loop over every required field.
    for field in REQUIRED_FIELDS:
        # Get the allowed values for this field.
        values = options.get(field, [])

        # If a field has no allowed values, we cannot create a valid test.
        if not values:
            raise ValueError(f"No allowed values found for field: {field}")

        # Use the first allowed value as the default valid value.
        base_input[field] = values[0]

    # Return the complete valid input.
    return base_input


def generate_one_value_coverage_cases(options):
    """
    Creates test cases that cover every allowed value.

    Instead of testing every possible combination, which can be huge,
    this function changes one field at a time.

    Example:
    If experience_level has 4 values, it creates 4 tests for that field.
    """

    # Create one valid input that we can reuse.
    base_input = get_base_valid_input(options)

    # This list will store all test cases.
    test_cases = []

    # Loop over each required field.
    for field in REQUIRED_FIELDS:
        # Loop over each allowed value for that field.
        for value in options[field]:
            # Copy the base valid input.
            case_params = base_input.copy()

            # Replace only the current field with the current value.
            case_params[field] = value

            # Add this test case to the list.
            test_cases.append(
                {
                    "case_type": "valid_value_coverage",
                    "field_under_test": field,
                    "params": case_params,
                    "expected_status": 200,
                }
            )

    # Return all generated test cases.
    return test_cases


def generate_random_combination_cases(options, count=30):
    """
    Creates random valid test cases.

    These tests are useful because they mix different valid values together.
    """

    # This list will store the random test cases.
    test_cases = []

    # Repeat the process based on the count number.
    for index in range(count):
        # Create an empty dictionary for one request.
        case_params = {}

        # Fill every required field with a random allowed value.
        for field in REQUIRED_FIELDS:
            case_params[field] = random.choice(options[field])

        # Add the random test case to the list.
        test_cases.append(
            {
                "case_type": "valid_random_combination",
                "field_under_test": "multiple",
                "params": case_params,
                "expected_status": 200,
            }
        )

    # Return all random test cases.
    return test_cases


def generate_invalid_cases(options):
    """
    Creates invalid test cases.

    These tests check that the API rejects:
    - Wrong values.
    - Missing required fields.

    The API should return 422 for these cases.
    422 means the request data is invalid.
    """

    # Create one valid input first.
    base_input = get_base_valid_input(options)

    # This list will store all invalid test cases.
    test_cases = []

    # These are invalid values for each field.
    invalid_values = {
        "work_year": 1900,
        "experience_level": "Invalid-level",
        "employment_type": "Invalid-type",
        "job_title": "Invalid Job Title",
        "employee_residence": "XX",
        "remote_ratio": 75,
        "company_location": "XX",
        "company_size": "Extra Large",
    }

    # Create one test case for each invalid value.
    for field, invalid_value in invalid_values.items():
        # Copy the valid input.
        case_params = base_input.copy()

        # Replace one field with an invalid value.
        case_params[field] = invalid_value

        # Add the invalid value test case.
        test_cases.append(
            {
                "case_type": "invalid_value",
                "field_under_test": field,
                "params": case_params,
                "expected_status": 422,
            }
        )

    # Create one test case for each missing required field.
    for field in REQUIRED_FIELDS:
        # Copy the valid input.
        case_params = base_input.copy()

        # Remove one required field from the request.
        case_params.pop(field)

        # Add the missing field test case.
        test_cases.append(
            {
                "case_type": "missing_required_field",
                "field_under_test": field,
                "params": case_params,
                "expected_status": 422,
            }
        )

    # Return all invalid test cases.
    return test_cases


def run_test_case(test_case):
    """
    Runs one test case.

    It sends the test case parameters to /predict,
    then checks whether the actual status code matches the expected status code.
    """

    # Send the test request to the /predict endpoint.
    result = safe_get(PREDICT_URL, params=test_case["params"])

    # Get the status code returned by the API.
    actual_status = result["status_code"]

    # Get the status code we expected for this test.
    expected_status = test_case["expected_status"]

    # The test passes if:
    # 1. The request itself succeeded.
    # 2. The actual status code matches the expected status code.
    passed = result["success"] and actual_status == expected_status

    # This will store the predicted salary if the request is successful.
    prediction = None

    # This will store the API error details if the request fails.
    error_detail = None

    # If the API returned JSON, read useful information from it.
    if result["json"]:
        # If the API returned 200, get the predicted salary.
        if actual_status == 200:
            prediction = result["json"].get("prediction", {}).get("salary_in_usd")

        # Otherwise, get the error details.
        else:
            error_detail = result["json"].get("detail")

    # Return a clean result dictionary for the report.
    return {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "case_type": test_case["case_type"],
        "field_under_test": test_case["field_under_test"],
        "expected_status": expected_status,
        "actual_status": actual_status,
        "passed": passed,
        "prediction": prediction,
        "error": result["error"],
        "error_detail": str(error_detail)[:300],
        "url": result["url"],
    }


def save_report(results):
    """
    Saves all test results into a CSV file.

    CSV files can be opened in Excel, Google Sheets, or VS Code.
    """

    # These are the CSV column names.
    fieldnames = [
        "timestamp",
        "case_type",
        "field_under_test",
        "expected_status",
        "actual_status",
        "passed",
        "prediction",
        "error",
        "error_detail",
        "url",
    ]

    # Open the CSV file in write mode.
    # newline="" prevents extra empty lines in the CSV file.
    # encoding="utf-8" supports normal text safely.
    with open(REPORT_PATH, "w", newline="", encoding="utf-8") as file:
        # Create a CSV writer that writes dictionaries.
        writer = csv.DictWriter(file, fieldnames=fieldnames)

        # Write the first row with column names.
        writer.writeheader()

        # Write all test result rows.
        writer.writerows(results)


def main():
    """
    Main function.

    This controls the full testing flow:
    1. Get allowed values from the API.
    2. Generate valid and invalid test cases.
    3. Run all test cases.
    4. Save a CSV report.
    5. Print a summary.
    """

    # Print a starting message.
    print("Starting Salary Prediction API tests...")

    # Get the allowed values from the /options endpoint.
    options = get_options()

    # Create an empty list for all test cases.
    test_cases = []

    # Add tests that cover every allowed value once.
    test_cases.extend(generate_one_value_coverage_cases(options))

    # Add 30 random valid tests.
    test_cases.extend(generate_random_combination_cases(options, count=30))

    # Add invalid value and missing field tests.
    test_cases.extend(generate_invalid_cases(options))

    # Print how many test cases were created.
    print(f"Total test cases generated: {len(test_cases)}")

    # Create an empty list to store test results.
    results = []

    # Loop over all test cases.
    # enumerate gives us both the index number and the test case.
    # start=1 means counting starts from 1 instead of 0.
    for index, test_case in enumerate(test_cases, start=1):
        # Run one test case.
        result = run_test_case(test_case)

        # Save the result in the results list.
        results.append(result)

        # Show PASS if the test passed, otherwise show FAIL.
        status = "PASS" if result["passed"] else "FAIL"

        # Print a short line explaining this test result.
        print(
            f"{index}. {status} | "
            f"{result['case_type']} | "
            f"{result['field_under_test']} | "
            f"Expected: {result['expected_status']} | "
            f"Actual: {result['actual_status']}"
        )

    # Save all results into a CSV file.
    save_report(results)

    # Count how many tests passed.
    passed_count = sum(1 for result in results if result["passed"])

    # Count how many tests failed.
    failed_count = len(results) - passed_count

    # Print the final summary title.
    print("\nTest Summary")

    # Print the number of passed tests.
    print(f"Passed: {passed_count}")

    # Print the number of failed tests.
    print(f"Failed: {failed_count}")

    # Print the CSV report path.
    print(f"Report saved to: {REPORT_PATH}")

    # If at least one test failed, stop the script with error code 1.
    if failed_count > 0:
        print("\nSome API tests failed. Check the CSV report.")
        sys.exit(1)

    # If no tests failed, print a success message.
    print("\nAll API tests passed successfully.")


# This line checks if this file is being run directly.
# It prevents main() from running automatically if this file is imported somewhere else.
if __name__ == "__main__":
    # try allows us to catch unexpected errors and show a clean message.
    try:
        # Start the script.
        main()

    # This catches any unexpected error from the script.
    except Exception as error:
        # Print a readable error message.
        print(f"\nHandled script error: {error}")

        # Stop the script with error code 1.
        sys.exit(1)
