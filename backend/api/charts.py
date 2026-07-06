# We import Path so we can work with folders and file paths safely.
from pathlib import Path

# We import uuid4 so every chart image gets a unique name.
from uuid import uuid4

# We import matplotlib because it creates the chart image.
import matplotlib.pyplot as plt

# We import pandas because the input dataset is a pandas DataFrame.
import pandas as pd


# BASE_DIR means the main project folder.
# __file__ is this file: api/charts.py
# parent is the api folder.
# parent.parent goes one level above api, which is the project root.
BASE_DIR = Path(__file__).resolve().parent.parent

# CHARTS_DIR is the folder where generated chart images will be saved.
CHARTS_DIR = BASE_DIR / "static" / "charts"

# This creates the charts folder if it does not already exist.
# parents=True means create missing parent folders too.
# exist_ok=True means do not crash if the folder already exists.
CHARTS_DIR.mkdir(parents=True, exist_ok=True)


# This function creates a salary comparison chart and returns the chart URL.
def generate_salary_comparison_chart(
    df: pd.DataFrame,          # The salary dataset.
    experience_level: str,     # The selected experience level from the user input.
    predicted_salary: float,   # The salary predicted by the machine learning model.
) -> str:
    """
    Create a bar chart.

    The chart shows:
    1. Average salary for each experience level.
    2. A dashed horizontal line for the predicted salary.

    The function returns a URL like:
    /static/charts/salary_comparison_xxxxx.png
    """

    # Group the dataset by experience level.
    # Then select the salary_in_usd column.
    # Then calculate the average salary for each experience level.
    salary_by_experience = df.groupby("experience_level")["salary_in_usd"].mean()

    # Sort the average salaries from highest to lowest.
    salary_by_experience = salary_by_experience.sort_values(ascending=False)

    # Create a unique file name for the chart image.
    # uuid4().hex gives us a random unique string.
    chart_filename = f"salary_comparison_{uuid4().hex}.png"

    # Create the full path where the chart image will be saved.
    chart_path = CHARTS_DIR / chart_filename

    # Create a new empty chart with width 10 and height 6.
    plt.figure(figsize=(10, 6))

    # Draw a bar chart using the average salary values.
    salary_by_experience.plot(kind="bar")

    # Draw a horizontal dashed line for the predicted salary.
    plt.axhline(
        y=predicted_salary,                                      # Position of the line on the y-axis.
        linestyle="--",                                          # Dashed line style.
        linewidth=2,                                             # Line thickness.
        label=f"Predicted Salary: ${predicted_salary:,.0f}",     # Label shown in the legend.
    )

    # Set the chart title.
    plt.title("Predicted Salary Compared with Average Salary by Experience Level")

    # Set the x-axis label.
    plt.xlabel("Experience Level")

    # Set the y-axis label.
    plt.ylabel("Average Salary in USD")

    # Rotate x-axis labels so they are easier to read.
    plt.xticks(rotation=30, ha="right")

    # Show the legend, including the predicted salary label.
    plt.legend()

    # Automatically adjust spacing so text does not get cut off.
    plt.tight_layout()

    # Save the chart image to the static/charts folder.
    plt.savefig(chart_path)

    # Close the chart to free memory.
    plt.close()

    # Return the URL that the frontend/API user can use to open the chart.
    return f"/static/charts/{chart_filename}"
