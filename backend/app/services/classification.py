import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)
from sklearn.preprocessing import LabelEncoder

from app.services.ml_pipeline import build_preprocessor


CLASSIFICATION_MODELS = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Random Forest": RandomForestClassifier(random_state=42),
}


def train_classification_models(
    df: pd.DataFrame,
    target_column: str,
    excluded_columns: list[str] | None = None,
) -> dict:

    # If no columns were excluded, use an empty list
    excluded_columns = excluded_columns or []

    # Remove rows where the target is missing
    df = df.dropna(subset=[target_column])

    # Build feature list while excluding:
    # 1. The target column
    # 2. Any columns explicitly excluded by the user
    feature_columns = [
        col
        for col in df.columns
        if col != target_column
        and col not in excluded_columns
    ]

    if not feature_columns:
        raise ValueError(
            "No feature columns remain after exclusions."
        )

    X = df[feature_columns]

    y_raw = df[target_column]

    # Convert target labels into numeric values
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y if len(set(y)) > 1 else None,
    )

    # Build preprocessing pipeline
    preprocessor = build_preprocessor(
        df,
        feature_columns,
    )

    results = []
    trained_pipelines = {}

    # Train all classification models
    for name, model in CLASSIFICATION_MODELS.items():

        pipeline = Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("model", model),
            ]
        )

        pipeline.fit(
            X_train,
            y_train,
        )

        y_pred = pipeline.predict(X_test)

        # Binary classification uses binary metrics.
        # Multiclass classification uses weighted metrics.
        average_method = (
            "binary"
            if len(set(y)) == 2
            else "weighted"
        )

        results.append(
            {
                "model_name": name,

                "accuracy": round(
                    float(
                        accuracy_score(
                            y_test,
                            y_pred,
                        )
                    ),
                    4,
                ),

                "precision": round(
                    float(
                        precision_score(
                            y_test,
                            y_pred,
                            average=average_method,
                            zero_division=0,
                        )
                    ),
                    4,
                ),

                "recall": round(
                    float(
                        recall_score(
                            y_test,
                            y_pred,
                            average=average_method,
                            zero_division=0,
                        )
                    ),
                    4,
                ),

                "f1_score": round(
                    float(
                        f1_score(
                            y_test,
                            y_pred,
                            average=average_method,
                            zero_division=0,
                        )
                    ),
                    4,
                ),
            }
        )

        trained_pipelines[name] = pipeline

    # Highest F1 score first
    results.sort(
        key=lambda r: r["f1_score"],
        reverse=True,
    )

    return {
        "results": results,
        "target_classes": label_encoder.classes_.tolist(),
        "test_size": len(y_test),
    }