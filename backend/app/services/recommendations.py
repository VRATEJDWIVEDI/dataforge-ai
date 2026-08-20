import pandas as pd


def recommend_visualizations(df: pd.DataFrame) -> list[dict]:
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category", "str"]).columns.tolist()

    recommendations = []

    # Single numerical variable -> histogram
    for col in numeric_cols[:3]:
        recommendations.append({
            "chart_type": "histogram",
            "x": col,
            "y": None,
            "reason": f"'{col}' is numerical — a histogram shows its distribution.",
        })

    # Single categorical variable -> bar chart
    for col in categorical_cols[:2]:
        recommendations.append({
            "chart_type": "bar",
            "x": col,
            "y": None,
            "reason": f"'{col}' is categorical — a bar chart shows category frequencies.",
        })

    # Numerical vs numerical -> scatter plot (use first pair only)
    if len(numeric_cols) >= 2:
        recommendations.append({
            "chart_type": "scatter",
            "x": numeric_cols[0],
            "y": numeric_cols[1],
            "reason": f"'{numeric_cols[0]}' and '{numeric_cols[1]}' are both numerical — a scatter plot reveals their relationship.",
        })

    # Categorical vs numerical -> box plot (use first pair only)
    if categorical_cols and numeric_cols:
        recommendations.append({
            "chart_type": "box",
            "x": categorical_cols[0],
            "y": numeric_cols[0],
            "reason": f"Comparing '{numeric_cols[0]}' across '{categorical_cols[0]}' groups works well as a box plot.",
        })

    return recommendations