"""
Triage & Emergency Assessment API Routes
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.schemas import AssessmentRequest, AssessmentResult
from app.services.guidance_service import get_all_categories, get_category_questions
from app.services.triage_service import TriageService

router = APIRouter(tags=["Triage"])

@router.get("/emergencies", response_model=List[Dict[str, Any]])
def list_emergencies():
    """Returns the 5 core PRD emergency categories"""
    return get_all_categories()

@router.get("/emergencies/{category_id}/questions")
def get_questions(category_id: str):
    """Returns high-priority quick questions and detailed questions for the emergency"""
    data = get_category_questions(category_id.lower())
    if not data:
        raise HTTPException(status_code=404, detail=f"Emergency category '{category_id}' not found.")
    return data

@router.post("/triage/assess", response_model=AssessmentResult)
def assess_emergency(req: AssessmentRequest):
    """
    Submits user answers to the Priority-First Triage engine:
    1. Evaluates quick questions for critical indicators (Safety Gate)
    2. If clear, runs ML Decision Tree Urgency inference
    """
    try:
        result = TriageService.assess(
            category_id=req.category.lower(),
            quick_answers=req.quick_answers,
            detailed_answers=req.detailed_answers,
            client_mode=req.client_mode or "ONLINE"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
