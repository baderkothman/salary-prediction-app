from pathlib import Path
from uuid import uuid4

import matplotlib.pyplot as plt
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
CHARTS_DIR = BASE_DIR / "static" / "charts"
CHARTS_DIR.mkdir(parents=True, exist_ok=True)


def generate_salary_comparison_chart(
    df: pd.DataFrame,
    experience_level: str,
    predicted_salary: float,
) -> str:
    """
    Generates a bar chart comparing the predicted salary
    with the dataset average salary for each experience level.
    """

    salary_by_experience = (
        df.groupby("experience_level")["salary_in_usd"]
        .mean()
        .sort_values(ascending=False)
    )

    chart_filename = f"salary_comparison_{uuid4().hex}.png"
    chart_path = CHARTS_DIR / chart_filename

    plt.figure(figsize=(10, 6))

    salary_by_experience.plot(kind="bar")

    plt.axhline(
        y=predicted_salary,
        linestyle="--",
        linewidth=2,
        label=f"Predicted Salary: ${predicted_salary:,.0f}",
    )

    plt.title("Predicted Salary Compared with Average Salary by Experience Level")
    plt.xlabel("Experience Level")
    plt.ylabel("Average Salary in USD")
    plt.xticks(rotation=30, ha="right")
    plt.legend()
    plt.tight_layout()

    plt.savefig(chart_path)
    plt.close()

    return f"/static/charts/{chart_filename}"
