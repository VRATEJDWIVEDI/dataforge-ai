import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.services.dataset_store import store_dataset, get_dataset
from app.services.inspection import inspect_dataset

app = FastAPI(title="DataForge AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "DataForge AI backend is running"}


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse this file as a valid CSV.")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded CSV is empty.")

    dataset_id = store_dataset(df)

    return {
        "dataset_id": dataset_id,
        "filename": file.filename,
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": df.columns.tolist(),
    }


@app.get("/dataset/{dataset_id}/inspect")
def inspect(dataset_id: str):
    try:
        df = get_dataset(dataset_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found. It may have expired or the server restarted.")

    return inspect_dataset(df)