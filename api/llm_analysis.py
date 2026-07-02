import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2"


def generate_llm_salary_analysis(
    input_data: dict,
    predicted_salary: float,
    dataset_insights: dict,
) -> str:
    """
    Sends prediction context to Ollama and returns narrative analysis.
    """

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

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()

        data = response.json()
        return data.get("response", "").strip()

    except requests.exceptions.ConnectionError:
        return (
            "Ollama is not running. Please start Ollama locally and try again. "
            "The prediction was generated successfully, but the LLM analysis could not be created."
        )

    except requests.exceptions.Timeout:
        return (
            "Ollama took too long to respond. The prediction was generated successfully, "
            "but the LLM analysis timed out."
        )

    except requests.exceptions.RequestException as error:
        return f"The prediction was generated successfully, but the LLM analysis failed: {error}"
