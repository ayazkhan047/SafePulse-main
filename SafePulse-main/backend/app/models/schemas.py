"""
Pydantic Schemas for SafePulse Emergency Response System
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class QuickQuestionSchema(BaseModel):
    id: str
    text: str
    subtext: Optional[str] = None
    critical_trigger: str = "yes"  # Answering 'yes' triggers critical escalation

class DetailedQuestionSchema(BaseModel):
    id: str
    text: str
    help_text: Optional[str] = None
    type: str  # 'select' or 'range' or 'boolean'
    options: Optional[List[Dict[str, Any]]] = None
    default: Optional[Any] = None

class EmergencyCategoryInfo(BaseModel):
    id: str
    name: str
    short_name: str
    icon: str
    color: str
    description: str
    quick_questions: List[QuickQuestionSchema]
    detailed_questions: List[DetailedQuestionSchema]

class AssessmentRequest(BaseModel):
    category: str
    quick_answers: Dict[str, str] = Field(default_factory=dict)
    detailed_answers: Dict[str, Any] = Field(default_factory=dict)
    client_mode: Optional[str] = "ONLINE" # ONLINE or PHANTOM_OFFLINE

class AssessmentResult(BaseModel):
    assessment_id: str
    category: str
    category_name: str
    urgency: str  # LOW, MODERATE, HIGH
    score: float  # 0.0 to 1.0
    is_critical: bool
    critical_reason: Optional[str] = None
    confidence: float
    recommended_pathway: List[str]
    medical_escalation: str
    primary_action: str
    mode: str  # SAFETY_GATE or ML_MODEL or PHANTOM_OFFLINE
    timestamp: str

class FirstAidStep(BaseModel):
    step_number: int
    title: str
    instruction: str
    warning: Optional[str] = None
    action_type: str = "standard"  # standard, cpr, compress, cool, airway

class GuidanceResponse(BaseModel):
    category: str
    category_name: str
    urgency: str
    headline: str
    primary_directive: str
    steps: List[FirstAidStep]
    dos: List[str]
    donts: List[str]
    call_helpline_now: bool
    helpline_numbers: Dict[str, str] = {"Primary (India)": "112", "Ambulance (India)": "108", "US Emergency": "911"}

class ModelMetricsResponse(BaseModel):
    model_type: str
    classes: List[str]
    sample_size: int
    test_size: int
    metrics: Dict[str, Any]
    confusion_matrix: Dict[str, Any]
    feature_importances: List[Dict[str, Any]]
