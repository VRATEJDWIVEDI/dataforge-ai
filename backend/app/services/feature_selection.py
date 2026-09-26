import pandas as pd


def detect_id_like_columns(df: pd.DataFrame, target_column: str) -> list[str]:
    """
    Flags columns that are almost certainly identifiers, not real features:
    - Every value is unique (like Order ID)
    - Extremely high-cardinality text columns (likely free text or codes)
    """
    id_like = []

    for col in df.columns:
        if col == target_column:
            continue

        unique_count = df[col].nunique(dropna=True)
        total_count = len(df[col].dropna())

        if total_count == 0:
            continue

        uniqueness_ratio = unique_count / total_count

        # Nearly every value is unique -> almost certainly an identifier
        if uniqueness_ratio > 0.95 and unique_count > 10:
            id_like.append(col)

    return id_like


def get_feature_suggestions(df: pd.DataFrame, target_column: str) -> dict:
    if target_column not in df.columns:
        raise ValueError(f"Column '{target_column}' does not exist.")

    all_features = [col for col in df.columns if col != target_column]
    suggested_exclude = detect_id_like_columns(df, target_column)

    return {
        "available_features": all_features,
        "suggested_exclude": suggested_exclude,
    }