from fastapi import FastAPI

app = FastAPI(title="DataForge AI API")


@app.get("/")
def read_root():
    return {"status": "DataForge AI backend is running"}