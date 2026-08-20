import pandas as pd


def numerical_summary(df: pd.DataFrame) -> list[dict]:
    numeric_cols = df.select_dtypes(include="number").columns
    summary = []

    for col in numeric_cols:
        series = df[col].dropna()
        if series.empty:
            continue

        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outlier_count = int(((series < lower_bound) | (series > upper_bound)).sum())

        summary.append({
            "column": col,
            "mean": round(float(series.mean()), 2),
            "median": round(float(series.median()), 2),
            "std": round(float(series.std()), 2) if len(series) > 1 else 0.0,
            "min": round(float(series.min()), 2),
            "max": round(float(series.max()), 2),
            "q1": round(float(q1), 2),
            "q3": round(float(q3), 2),
            "outlier_count": outlier_count,
        })

    return summary


def categorical_summary(df: pd.DataFrame, top_n: int = 5) -> list[dict]:
    categorical_cols = df.select_dtypes(include=["object", "category", "str"]).columns
    summary = []

    for col in categorical_cols:
        value_counts = df[col].value_counts().head(top_n)
        summary.append({
            "column": col,
            "unique_count": int(df[col].nunique(dropna=True)),
            "top_values": [
                {"value": str(idx), "count": int(count)}
                for idx, count in value_counts.items()
            ],
        })

    return summary


def correlation_matrix(df: pd.DataFrame) -> dict:
    numeric_df = df.select_dtypes(include="number")
    if numeric_df.shape[1] < 2:
        return {"columns": [], "matrix": []}

    corr = numeric_df.corr().round(3)
    return {
        "columns": corr.columns.tolist(),
        "matrix": corr.values.tolist(),
    }