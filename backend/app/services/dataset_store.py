import uuid
import pandas as pd

# Simple in-memory store: dataset_id -> DataFrame
# NOTE: This resets whenever the server restarts, and does not scale to
# multiple server processes. Fine for local development; would need to
# become a database or cache (e.g. Redis) for a real multi-user deployment.
_datasets: dict[str, pd.DataFrame] = {}


def store_dataset(df: pd.DataFrame) -> str:
    dataset_id = str(uuid.uuid4())
    _datasets[dataset_id] = df
    return dataset_id


def get_dataset(dataset_id: str) -> pd.DataFrame:
    if dataset_id not in _datasets:
        raise KeyError(f"Dataset {dataset_id} not found")
    return _datasets[dataset_id]

def update_dataset(dataset_id: str, df: pd.DataFrame) -> None:
    if dataset_id not in _datasets:
        raise KeyError(f"Dataset {dataset_id} not found")
    _datasets[dataset_id] = df