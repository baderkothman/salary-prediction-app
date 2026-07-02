import csv
import itertools
import random
import sys
from datetime import datetime
from pathlib import Path

import requests

BASE_URL = "http://127.0.0.1:8000"
OPTIONS_URL = f"{BASE_URL}/options"
PREDICT_URL = f"{BASE_URL}/predict"

OUTPUT_DIR = Path("reports")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

REPORT_PATH = OUTPUT_DIR / "api_prediction_test_results.csv"


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
    Safe GET request wrapper.
    This prevents unhandled network/API errors.
    """
    try:
        response = requests.get(url, params=params, timeout=timeout)
        return {
            "success": True,
            "status_code": response.status_code,
            "json": response.json(),
            "error": None,
            "url": response.url,
        }

    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "status_code": None,
            "json": None,
            "error": "Connection error. Make sure the FastAPI server is running.",
            "url": url,
        }

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "status_code": None,
            "json": None,
            "error": "Request timed out.",
            "url": url,
        }

    except requests.exceptions.RequestException as error:
        return {
            "success": False,
            "status_code": None,
            "json": None,
            "error": str(error),
            "url": url,
        }

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
    Reads allowed values from the API.
    This makes the script adapt to your real dataset.
    """
    result = safe_get(OPTIONS_URL)

    if not result["success"]:
        raise RuntimeError(result["error"])

    if result["status_code"] != 200:
        raise RuntimeError(f"/options failed with status code {result['status_code']}")

    return result["json"]


def get_base_valid_input(options):
    """
    Creates one valid input using the first available value for each field.
    """
    base_input = {}

    for field in REQUIRED_FIELDS:
        values = options.get(field, [])

        if not values:
            raise ValueError(f"No allowed values found for field: {field}")

        base_input[field] = values[0]

    return base_input


def generate_one_value_coverage_cases(options):
    """
    Covers the input space by making sure every allowed value appears
    in at least one request.

    This avoids generating the full Cartesian product, which could be huge.
    """
    base_input = get_base_valid_input(options)
    test_cases = []

    for field in REQUIRED_FIELDS:
        for value in options[field]:
            case = base_input.copy()
            case[field] = value

            test_cases.append(
                {
                    "case_type": "valid_value_coverage",
                    "field_under_test": field,
                    "params": case,
                    "expected_status": 200,
                }
            )

    return test_cases


def generate_random_combination_cases(options, count=30):
    """
    Adds random valid combinations to test real-world mixed inputs.
    """
    test_cases = []

    for index in range(count):
        params = {}

        for field in REQUIRED_FIELDS:
            params[field] = random.choice(options[field])

        test_cases.append(
            {
                "case_type": "valid_random_combination",
                "field_under_test": "multiple",
                "params": params,
                "expected_status": 200,
            }
        )

    return test_cases


def generate_invalid_cases(options):
    """
    Tests invalid values and missing required fields.
    The API should return 422, not crash.
    """
    base_input = get_base_valid_input(options)
    test_cases = []

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

    for field, invalid_value in invalid_values.items():
        case = base_input.copy()
        case[field] = invalid_value

        test_cases.append(
            {
                "case_type": "invalid_value",
                "field_under_test": field,
                "params": case,
                "expected_status": 422,
            }
        )

    for field in REQUIRED_FIELDS:
        case = base_input.copy()
        case.pop(field)

        test_cases.append(
            {
                "case_type": "missing_required_field",
                "field_under_test": field,
                "params": case,
                "expected_status": 422,
            }
        )

    return test_cases


def run_test_case(test_case):
    """
    Calls /predict and checks whether the response status is expected.
    """
    result = safe_get(PREDICT_URL, params=test_case["params"])

    actual_status = result["status_code"]
    expected_status = test_case["expected_status"]

    passed = result["success"] and actual_status == expected_status

    prediction = None
    error_detail = None

    if result["json"]:
        if actual_status == 200:
            prediction = result["json"].get("prediction", {}).get("salary_in_usd")
        else:
            error_detail = result["json"].get("detail")

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
    Saves test results into a CSV file.
    """
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

    with open(REPORT_PATH, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)


def main():
    print("Starting Salary Prediction API tests...")

    options = get_options()

    test_cases = []
    test_cases.extend(generate_one_value_coverage_cases(options))
    test_cases.extend(generate_random_combination_cases(options, count=30))
    test_cases.extend(generate_invalid_cases(options))

    print(f"Total test cases generated: {len(test_cases)}")

    results = []

    for index, test_case in enumerate(test_cases, start=1):
        result = run_test_case(test_case)
        results.append(result)

        status = "PASS" if result["passed"] else "FAIL"

        print(
            f"{index}. {status} | "
            f"{result['case_type']} | "
            f"{result['field_under_test']} | "
            f"Expected: {result['expected_status']} | "
            f"Actual: {result['actual_status']}"
        )

    save_report(results)

    passed_count = sum(1 for result in results if result["passed"])
    failed_count = len(results) - passed_count

    print("\nTest Summary")
    print(f"Passed: {passed_count}")
    print(f"Failed: {failed_count}")
    print(f"Report saved to: {REPORT_PATH}")

    if failed_count > 0:
        print("\nSome API tests failed. Check the CSV report.")
        sys.exit(1)

    print("\nAll API tests passed successfully.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"\nHandled script error: {error}")
        sys.exit(1)
