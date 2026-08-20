import pandas as pd


def histogram_data(df: pd.DataFrame, column: str, bins: int = 10) -> dict:
    series = df[column].dropna()
    counts, bin_edges = pd.cut(series, bins=bins, retbins=True)
    value_counts = counts.value_counts().sort_index()

    labels = [f"{round(interval.left, 1)}–{round(interval.right, 1)}" for interval in value_counts.index]

    return {
        "chart_type": "histogram",
        "labels": labels,
        "values": [int(v) for v in value_counts.values],
        "x_label": column,
        "y_label": "Count",
    }


def bar_chart_data(df: pd.DataFrame, column: str, top_n: int = 15) -> dict:
    value_counts = df[column].value_counts().head(top_n)

    return {
        "chart_type": "bar",
        "labels": [str(v) for v in value_counts.index],
        "values": [int(v) for v in value_counts.values],
        "x_label": column,
        "y_label": "Count",
    }


def scatter_data(df: pd.DataFrame, x_column: str, y_column: str, max_points: int = 2000) -> dict:
    subset = df[[x_column, y_column]].dropna()
    if len(subset) > max_points:
        subset = subset.sample(max_points, random_state=42)

    return {
        "chart_type": "scatter",
        "x_values": subset[x_column].tolist(),
        "y_values": subset[y_column].tolist(),
        "x_label": x_column,
        "y_label": y_column,
    }


def box_plot_data(df: pd.DataFrame, category_column: str, value_column: str, max_categories: int = 10) -> dict:
    top_categories = df[category_column].value_counts().head(max_categories).index

    groups = []
    for category in top_categories:
        values = df[df[category_column] == category][value_column].dropna().tolist()
        if values:
            groups.append({"category": str(category), "values": values})

    return {
        "chart_type": "box",
        "groups": groups,
        "x_label": category_column,
        "y_label": value_column,
    }