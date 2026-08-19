import pandas as pd


def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop_duplicates().reset_index(drop=True)


def drop_columns(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    existing = [col for col in columns if col in df.columns]
    return df.drop(columns=existing)


def rename_column(df: pd.DataFrame, old_name: str, new_name: str) -> pd.DataFrame:
    if old_name not in df.columns:
        raise ValueError(f"Column '{old_name}' does not exist.")
    return df.rename(columns={old_name: new_name})


def remove_constant_columns(df: pd.DataFrame) -> pd.DataFrame:
    constant_cols = [col for col in df.columns if df[col].nunique(dropna=False) <= 1]
    return df.drop(columns=constant_cols)


def handle_missing_values(df: pd.DataFrame, column: str, strategy: str, custom_value: str | None = None) -> pd.DataFrame:
    if column not in df.columns:
        raise ValueError(f"Column '{column}' does not exist.")

    df = df.copy()

    if strategy == "mean":
        if not pd.api.types.is_numeric_dtype(df[column]):
            raise ValueError(f"Cannot apply 'mean' to non-numeric column '{column}'.")
        df[column] = df[column].fillna(df[column].mean())

    elif strategy == "median":
        if not pd.api.types.is_numeric_dtype(df[column]):
            raise ValueError(f"Cannot apply 'median' to non-numeric column '{column}'.")
        df[column] = df[column].fillna(df[column].median())

    elif strategy == "mode":
        mode_value = df[column].mode()
        if not mode_value.empty:
            df[column] = df[column].fillna(mode_value[0])

    elif strategy == "drop_rows":
        df = df.dropna(subset=[column])

    elif strategy == "custom_value":
        if custom_value is None:
            raise ValueError("custom_value must be provided for 'custom_value' strategy.")
        df[column] = df[column].fillna(custom_value)

    else:
        raise ValueError(f"Unknown strategy: '{strategy}'.")

    return df.reset_index(drop=True)