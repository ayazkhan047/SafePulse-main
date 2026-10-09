"""
SafePulse Automated Tests for Triage Engine, Safety Gate & Model Evaluation
"""

import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.triage_service import TriageService
from app.services.guidance_service import get_all_categories, get_category_questions, get_category_guidance

def test_priority_first_safety_gate():
    """Verify that any critical indicator immediately triggers HIGH urgency without exception"""
    res = TriageService.assess(
        category_id="bleeding",
        quick_answers={"q_spurting": "yes"},
        detailed_answers={}
    )
    assert res["urgency"] == "HIGH", f"Expected HIGH, got {res['urgency']}"
    assert res["is_critical"] is True
    assert res["mode"] == "SAFETY_GATE"
    assert "Critical Indicator" in res["critical_reason"]
    print(" PASS: Priority-First Safety Gate correctly escalates critical emergency.")

def test_cardiac_arrest_critical_gate():
    """Verify cardiac arrest quick indicator triggers immediate life-support pathway"""
    res = TriageService.assess(
        category_id="cardiac",
        quick_answers={"q_cardiac_unresponsive": "yes"},
        detailed_answers={}
    )
    assert res["urgency"] == "HIGH"
    assert res["is_critical"] is True
    assert res["mode"] == "SAFETY_GATE"
    print(" PASS: Cardiac unresponsive patient triggers instant safety gate.")

def test_detailed_assessment_ml_inference():
    """Verify that when no critical indicators are present, ML inference determines urgency"""
    # Mild burn case
    res_mild = TriageService.assess(
        category_id="burns",
        quick_answers={"q_burn_airway": "no", "q_burn_source": "no", "q_burn_charred": "no"},
        detailed_answers={"severity": 1, "extent": 1, "duration": 5, "age_group": "adult", "pain_level": 2}
    )
    assert res_mild["is_critical"] is False
    assert res_mild["mode"] == "ML_MODEL"
    assert res_mild["urgency"] in ["LOW", "MODERATE"]
    assert 0.0 <= res_mild["score"] <= 1.0
    print(f" PASS: Detailed Assessment ML inference returned {res_mild['urgency']} (Score: {res_mild['score']}).")

def test_guidance_knowledge_base():
    """Verify guidance content is available for all 5 categories and all 3 urgency levels"""
    categories = ["bleeding", "burns", "choking", "cardiac", "injury"]
    urgencies = ["LOW", "MODERATE", "HIGH"]

    for cat in categories:
        q_data = get_category_questions(cat)
        assert len(q_data["quick_questions"]) > 0, f"Missing quick questions for {cat}"
        assert len(q_data["detailed_questions"]) > 0, f"Missing detailed questions for {cat}"

        for urg in urgencies:
            guide = get_category_guidance(cat, urg)
            assert len(guide["steps"]) > 0, f"Missing steps for {cat} / {urg}"
            assert len(guide["dos"]) > 0
            assert len(guide["donts"]) > 0

    print(" PASS: Guidance knowledge base contains complete verified steps for all 5 categories.")

if __name__ == "__main__":
    print("Running SafePulse Automated Backend Verification...")
    test_priority_first_safety_gate()
    test_cardiac_arrest_critical_gate()
    test_detailed_assessment_ml_inference()
    test_guidance_knowledge_base()
    print("ALL TESTS PASSED SUCCESSFULLY!")
