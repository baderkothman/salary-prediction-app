# We import requests so Python can send an HTTP request to Ollama.
import requests


# This is the local Ollama API URL.
# Ollama usually runs on port 11434 on your computer.
OLLAMA_URL = "http://localhost:11434/api/generate"

# This is the Ollama model name that will generate the text analysis.
OLLAMA_MODEL = "llama3.2"


# This function sends salary prediction details to Ollama and returns a written analysis.
def generate_llm_salary_analysis(
    input_data: dict,          # The user input used for the prediction.
    predicted_salary: float,   # The salary predicted by the ML model.
    dataset_insights: dict,    # Average salary values calculated from the dataset.
) -> str:
    """
    Create a salary analysis using Ollama.

    Important:
    - The machine learning model predicts the salary.
    - Ollama only writes an explanation/story about the prediction.
    """

    # This is the text instruction we send to Ollama.
    # It includes the user input, predicted salary, and dataset averages.
    prompt = f"""
You are a professional data analyst.

Write a clear salary analysis story based on the following machine learning prediction.

User input:
- Work year: {input_data["work_year"]}
- Experience level: {input_data["experience_level"]}
- Employment type: {input_data["employment_type"]}
- Job title: {input_data["job_title"]}
- Employee residence: {input_data["employee_residence"]}
- Remote ratio: {input_data["remote_ratio"]}
- Company location: {input_data["company_location"]}
- Company size: {input_data["company_size"]}

Predicted salary:
- ${predicted_salary:,.2f}

Dataset insights:
- Average salary overall: ${dataset_insights["overall_average_salary"]:,.2f}
- Average salary for this experience level: ${dataset_insights["experience_average_salary"]:,.2f}
- Average salary for this company size: ${dataset_insights["company_size_average_salary"]:,.2f}
- Average salary for this job title: ${dataset_insights["job_title_average_salary"]:,.2f}

Write the response in 3 short sections:

1. Salary Prediction Summary
Explain the predicted salary in simple words.

2. Market Comparison
Compare the predicted salary with the dataset averages.

3. Key Factors
Explain how experience level, job title, company size, location, and remote work may affect the salary.

Use a storytelling style.
Do not mention that you are an AI model.
Do not invent facts outside the provided data.
Keep it professional and easy to understand.
"""

    # This dictionary is the request body we send to Ollama.
    payload = {
        "model": OLLAMA_MODEL,  # Tell Ollama which model to use.
        "prompt": prompt,       # Send the prompt we created above.
        "stream": False,        # False means return the full answer at once.
    }

    # We use try/except because Ollama might be closed or may fail.
    try:
        # Send a POST request to Ollama.
        # json=payload sends our dictionary as JSON.
        # timeout=60 means wait up to 60 seconds.
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)

        # If Ollama returns an error status, raise an exception.
        response.raise_for_status()

        # Convert the JSON response from Ollama into a Python dictionary.
        data = response.json()

        # Get the generated text from the response dictionary.
        # If "response" does not exist, use an empty string.
        answer = data.get("response", "")

        # Remove extra spaces from the beginning and end of the answer.
        answer = answer.strip()

        # Return the final text analysis.
        return answer

    # This runs when Ollama is not running locally.
    except requests.exceptions.ConnectionError:
        # Return a friendly message instead of crashing the API.
        return (
            "Ollama is not running. Please start Ollama locally and try again. "
            "The prediction was generated successfully, but the LLM analysis could not be created."
        )

    # This runs when Ollama takes more than 60 seconds.
    except requests.exceptions.Timeout:
        # Return a friendly timeout message instead of crashing the API.
        return (
            "Ollama took too long to respond. The prediction was generated successfully, "
            "but the LLM analysis timed out."
        )

    # This runs for other request errors.
    except requests.exceptions.RequestException as error:
        # Return the error message so you can understand what failed.
        return f"The prediction was generated successfully, but the LLM analysis failed: {error}"
