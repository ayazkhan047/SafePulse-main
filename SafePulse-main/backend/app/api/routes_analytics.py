"""
Data Science & Model Analytics API Routes
"""

import os
import json
from fastapi import APIRouter, HTTPException
from typing import Dict, Any

router = APIRouter(tags=["Analytics"])

METADATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "ml",
    "model_metadata.json"
)

@router.get("/analytics/metrics")
def get_model_metrics() -> Dict[str, Any]:
    """Returns live ML performance metrics, confusion matrix, and feature importances for judges and audit"""
    if not os.path.exists(METADATA_PATH):
        raise HTTPException(status_code=404, detail="Model metadata not found. Please train the model first.")

    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Return copy without heavy tree export for metrics view
    clean_data = {
        "model_type": data.get("model_type"),
        "classes": data.get("classes"),
        "sample_size": data.get("sample_size"),
        "test_size": data.get("test_size"),
        "metrics": data.get("metrics"),
        "confusion_matrix": data.get("confusion_matrix"),
        "feature_importances": data.get("feature_importances")
    }
    return clean_data

@router.get("/analytics/tree-spec")
def get_decision_tree_spec() -> Dict[str, Any]:
    """Returns the JSON decision tree used by the Phantom Protocol offline engine"""
    if not os.path.exists(METADATA_PATH):
        raise HTTPException(status_code=404, detail="Model metadata not found.")

    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    return {
        "feature_names": data.get("feature_names"),
        "classes": data.get("classes"),
        "decision_tree": data.get("decision_tree_export")
    }
