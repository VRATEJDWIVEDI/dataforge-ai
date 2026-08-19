import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.dataset_store import (
    store_dataset,
    get_dataset,
    update_dataset,
)

from app.services.inspection import inspect_dataset

from app.services.cleaning import (
    remove_duplicates,
    drop_columns,
    rename_column,
    remove_constant_columns,
    handle_missing_values,
)


app = FastAPI(title="DataForge AI API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------
# Request Schemas
# -------------------------------------------------------------------

class DropColumnsRequest(BaseModel):
    columns: list[str]


class RenameColumnRequest(BaseModel):
    old_name: str
    new_name: str


class HandleMissingRequest(BaseModel):
    column: str
    strategy: str
    custom_value: str | None = None


# -------------------------------------------------------------------
# Root
# -------------------------------------------------------------------

@app.get("/")
def read_root():
    return {"status": "DataForge AI backend is running"}


# -------------------------------------------------------------------
# Upload Dataset
# -------------------------------------------------------------------

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported.",
        )

    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not parse this file as a valid CSV.",
        )

    if df.empty:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV is empty.",
        )

    dataset_id = store_dataset(df)

    return {
        "dataset_id": dataset_id,
        "filename": file.filename,
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": df.columns.tolist(),
    }


# -------------------------------------------------------------------
# Dataset Inspection
# -------------------------------------------------------------------

@app.get("/dataset/{dataset_id}/inspect")
def inspect(dataset_id: str):
    try:
        df = get_dataset(dataset_id)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found. It may have expired or the server restarted.",
        )

    return inspect_dataset(df)


# -------------------------------------------------------------------
# Cleaning: Remove Duplicates
# -------------------------------------------------------------------

@app.post("/dataset/{dataset_id}/clean/remove-duplicates")
def clean_remove_duplicates(dataset_id: str):
    try:
        df = get_dataset(dataset_id)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    before_rows = df.shape[0]

    cleaned = remove_duplicates(df)

    update_dataset(dataset_id, cleaned)

    return {
        "rows_before": before_rows,
        "rows_after": cleaned.shape[0],
        "rows_removed": before_rows - cleaned.shape[0],
    }


# -------------------------------------------------------------------
# Cleaning: Drop Columns
# -------------------------------------------------------------------

@app.post("/dataset/{dataset_id}/clean/drop-columns")
def clean_drop_columns(
    dataset_id: str,
    request: DropColumnsRequest,
):
    try:
        df = get_dataset(dataset_id)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    before_columns = df.shape[1]

    try:
        cleaned = drop_columns(df, request.columns)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    update_dataset(dataset_id, cleaned)

    return {
        "columns_before": before_columns,
        "columns_after": cleaned.shape[1],
        "remaining_columns": cleaned.columns.tolist(),
    }


# -------------------------------------------------------------------
# Cleaning: Rename Column
# -------------------------------------------------------------------

@app.post("/dataset/{dataset_id}/clean/rename-column")
def clean_rename_column(
    dataset_id: str,
    request: RenameColumnRequest,
):
    try:
        df = get_dataset(dataset_id)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    try:
        cleaned = rename_column(
            df,
            request.old_name,
            request.new_name,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    update_dataset(dataset_id, cleaned)

    return {
        "columns": cleaned.columns.tolist(),
    }


# -------------------------------------------------------------------
# Cleaning: Remove Constant Columns
# -------------------------------------------------------------------

@app.post("/dataset/{dataset_id}/clean/remove-constant-columns")
def clean_remove_constant_columns(dataset_id: str):
    try:
        df = get_dataset(dataset_id)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    before_columns = df.shape[1]

    cleaned = remove_constant_columns(df)

    update_dataset(dataset_id, cleaned)

    return {
        "columns_before": before_columns,
        "columns_after": cleaned.shape[1],
        "remaining_columns": cleaned.columns.tolist(),
    }


# -------------------------------------------------------------------
# Cleaning: Handle Missing Values
# -------------------------------------------------------------------

@app.post("/dataset/{dataset_id}/clean/handle-missing")
def clean_handle_missing(
    dataset_id: str,
    request: HandleMissingRequest,
):
    try:
        df = get_dataset(dataset_id)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found.",
        )

    before_missing = (
        int(df[request.column].isnull().sum())
        if request.column in df.columns
        else 0
    )

    try:
        cleaned = handle_missing_values(
            df,
            request.column,
            request.strategy,
            request.custom_value,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    update_dataset(dataset_id, cleaned)

    after_missing = (
        int(cleaned[request.column].isnull().sum())
        if request.column in cleaned.columns
        else 0
    )

    return {
        "missing_before": before_missing,
        "missing_after": after_missing,
        "rows_remaining": cleaned.shape[0],
    }