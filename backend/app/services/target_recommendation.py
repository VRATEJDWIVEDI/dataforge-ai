import pandas as pd


def recommend_problem_type(df: pd.DataFrame, target_column: str) -> dict:
    if target_column not in df.columns:
        raise ValueError(f"Column '{target_column}' does not exist.")

    series = df[target_column].dropna()
    unique_count = series.nunique()
    total_count = len(series)
    is_numeric = pd.api.types.is_numeric_dtype(series)

    unique_ratio = unique_count / total_count if total_count > 0 else 0

    if not is_numeric:
        return {
            "recommendation": "classification",
            "reason": f"'{target_column}' contains text/categorical values "
                      f"({unique_count} unique classes), which is a classic classification target.",
            "unique_values": int(unique_count),
            "is_numeric": False,
        }

    if unique_count <= 20 and unique_ratio < 0.05:
        return {
            "recommendation": "classification",
            "reason": f"'{target_column}' is numeric but only has {unique_count} distinct values "
                      f"out of {total_count} rows — this looks like encoded categories rather than a continuous quantity.",
            "unique_values": int(unique_count),
            "is_numeric": True,
        }

    return {
        "recommendation": "regression",
        "reason": f"'{target_column}' is numeric with {unique_count} distinct values spread across "
                  f"a wide range — this looks like a continuous quantity to predict.",
        "unique_values": int(unique_count),
        "is_numeric": True,
    }