import pandas as pd


def inspect_dataset(df: pd.DataFrame) -> dict:
    total_cells = df.shape[0] * df.shape[1]
    missing_count = int(df.isnull().sum().sum())
    missing_percentage = round((missing_count / total_cells) * 100, 2) if total_cells > 0 else 0

    duplicate_rows = int(df.duplicated().sum())

    numerical_columns = df.select_dtypes(include="number").columns.tolist()
    categorical_columns = df.select_dtypes(include=["object", "category"]).columns.tolist()

    constant_columns = [col for col in df.columns if df[col].nunique(dropna=False) <= 1]

    columns_info = []
    for col in df.columns:
        columns_info.append({
            "name": col,
            "dtype": str(df[col].dtype),
            "missing_count": int(df[col].isnull().sum()),
            "missing_percentage": round(float(df[col].isnull().mean() * 100), 2),
            "unique_values": int(df[col].nunique(dropna=True)),
        })

    return {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "missing_count": missing_count,
        "missing_percentage": missing_percentage,
        "duplicate_rows": duplicate_rows,
        "numerical_columns": numerical_columns,
        "categorical_columns": categorical_columns,
        "constant_columns": constant_columns,
        "columns_info": columns_info,
    }