"""
Emergency First-Aid Guidance API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import GuidanceResponse
from app.services.guidance_service import get_category_guidance, EMERGENCY_DATA

router = APIRouter(tags=["Guidance"])

@router.get("/guidance/{category_id}", response_model=GuidanceResponse)
def get_guidance(category_id: str, urgency: str = Query("HIGH")):
    """Returns verified step-by-step first-aid guidance for the given emergency category and urgency level"""
    cat = category_id.lower().strip()
    if cat not in EMERGENCY_DATA:
        raise HTTPException(status_code=404, detail=f"Emergency category '{category_id}' not found.")

    urg = (urgency or "HIGH").upper().strip()
    if urg not in ("LOW", "MODERATE", "HIGH"):
        raise HTTPException(status_code=400, detail=f"Invalid urgency '{urgency}'. Must be LOW, MODERATE, or HIGH.")

    data = get_category_guidance(cat, urg)
    return data

