"""
SafePulse Triage Service
Implements Priority-First Assessment:
1. Critical Safety Gate (Instant Circuit Breaker for life threats)
2. Machine Learning Urgency Classification (Feature vector inference)
"""

import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Tuple
from app.services.guidance_service import EMERGENCY_DATA, get_category_guidance

# Load model metadata and decision tree
METADATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "ml",
    "model_metadata.json"
)

MODEL_METADATA = None
if os.path.exists(METADATA_PATH):
    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        MODEL_METADATA = json.load(f)

def traverse_tree_dict(x: list, node: dict) -> dict:
    if "value" in node and "probas" in node:
        return node["probas"]
    feat = node["feature"]
    thresh = node["threshold"]
    if x[feat] <= thresh:
        return traverse_tree_dict(x, node["left"])
    else:
        return traverse_tree_dict(x, node["right"])

class TriageService:
    @staticmethod
    def assess(category_id: str, quick_answers: Dict[str, str], detailed_answers: Dict[str, Any], client_mode: str = "ONLINE") -> Dict[str, Any]:
        cat_id = category_id.lower().strip()
        cat_info = EMERGENCY_DATA.get(cat_id, EMERGENCY_DATA["bleeding"])
        assessment_id = f"SP-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.now().isoformat()

        # STEP 1: PRIORITY-FIRST SAFETY GATE CHECK
        # Evaluate high-priority quick questions for critical triggers
        critical_detected = False
        critical_reason = None

        for q in cat_info["quick_questions"]:
            qid = q["id"]
            user_val = str(quick_answers.get(qid, "")).strip().lower()
            trigger_val = str(q.get("critical_trigger", "yes")).strip().lower()

            if user_val == trigger_val:
                critical_detected = True
                critical_reason = f"Critical Indicator: {q['text']}"
                break

        # If critical indicator detected, execute instant circuit breaker!
        if critical_detected:
            return {
                "assessment_id": assessment_id,
                "category": category_id,
                "category_name": cat_info["name"],
                "urgency": "HIGH",
                "score": 0.98,
                "is_critical": True,
                "critical_reason": critical_reason,
                "confidence": 0.99,
                "recommended_pathway": [
                    "Call Emergency Services (112 in India / 911) Immediately",
                    "Put Phone on Speaker & Stay Beside Patient",
                    "Commence Immediate High-Priority First-Aid Steps"
                ],
                "medical_escalation": "Potentially life-threatening emergency detected. Immediate professional medical dispatch required.",
                "primary_action": "Emergency services call required immediately. Begin first-aid instructions now.",
                "mode": "SAFETY_GATE",
                "timestamp": timestamp
            }

        # STEP 2: ML-BASED DETAILED ASSESSMENT
        # If no critical indicators, process detailed answers with ML model
        severity_score = int(detailed_answers.get("severity", 2))
        extent_affected = int(detailed_answers.get("extent", 2))
        duration_mins = int(detailed_answers.get("duration", 10))
        breathing_difficulty = int(detailed_answers.get("breathing", 0))
        age_group = str(detailed_answers.get("age_group", "adult")).lower()
        pain_level = int(detailed_answers.get("pain_level", 5))

        # Vector format matching train.py:
        # [quick_critical, severity_score, extent_affected, duration_mins, breathing_difficulty,
        #  consciousness_level, pain_level, cat_bleeding, cat_burns, cat_choking, cat_cardiac, cat_injury,
        #  age_child, age_adult, age_elderly]
        categories_list = ["bleeding", "burns", "choking", "cardiac", "injury"]
        cat_one_hot = [1 if category_id == c else 0 for c in categories_list]
        age_one_hot = [1 if age_group == "child" else 0, 1 if age_group == "adult" else 0, 1 if age_group == "elderly" else 0]

        feature_vector = [
            0, # quick_critical is 0 here
            severity_score,
            extent_affected,
            duration_mins,
            breathing_difficulty,
            0, # consciousness_level (alert)
            pain_level
        ] + cat_one_hot + age_one_hot

        # Tree inference
        probas = {"LOW": 0.33, "MODERATE": 0.34, "HIGH": 0.33}
        urgency = "MODERATE"

        if MODEL_METADATA and "decision_tree_export" in MODEL_METADATA:
            tree_root = MODEL_METADATA["decision_tree_export"]
            probas = traverse_tree_dict(feature_vector, tree_root)
            # Find class with highest probability
            urgency = max(probas.items(), key=lambda x: x[1])[0]

        # Calculate calibrated continuous score between 0.0 and 1.0
        p_low = probas.get("LOW", 0.0)
        p_mod = probas.get("MODERATE", 0.0)
        p_high = probas.get("HIGH", 0.0)
        continuous_score = round(float(0.15 * p_low + 0.50 * p_mod + 0.88 * p_high), 2)
        confidence = round(float(probas.get(urgency, 0.7)), 2)

        # Build pathways based on Urgency
        if urgency == "LOW":
            pathway = [
                "Self-Care & Basic First-Aid Protocol",
                "Clean, Protect & Monitor Wound/Injury",
                "Observe for Infection or Worsening Over Next 24 Hours"
            ]
            medical_escalation = "Professional emergency dispatch not currently indicated. Consult family physician if symptoms persist."
            primary_action = "Administer basic first-aid steps below and observe condition."
        elif urgency == "MODERATE":
            pathway = [
                "Active First-Aid Guidance & Stabilization",
                "Consider Professional Medical Evaluation (Urgent Care / Clinic)",
                "Monitor for Escalation Red Flags"
            ]
            medical_escalation = "Recommend evaluation by an urgent care physician or clinical facility within 2-4 hours."
            primary_action = "Stabilize using first-aid instructions and prepare for medical assessment."
        else: # HIGH
            pathway = [
                "Immediate High-Urgency First-Aid Protocol",
                "Strongly Recommend Calling Emergency Services (112 / 911)",
                "Prepare for Emergency Medical Responders"
            ]
            medical_escalation = "High urgency situation. Professional emergency medical assistance is strongly recommended."
            primary_action = "Follow immediate guidance and contact emergency helpline."

        return {
            "assessment_id": assessment_id,
            "category": category_id,
            "category_name": cat_info["name"],
            "urgency": urgency,
            "score": continuous_score,
            "is_critical": False,
            "critical_reason": None,
            "confidence": confidence,
            "recommended_pathway": pathway,
            "medical_escalation": medical_escalation,
            "primary_action": primary_action,
            "mode": "ML_MODEL" if client_mode == "ONLINE" else "PHANTOM_OFFLINE",
            "timestamp": timestamp
        }
