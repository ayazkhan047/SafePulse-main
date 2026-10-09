"""
SafePulse End-to-End System Integration Tests
Validates all PRD core requirements:
- Priority-first emergency assessment & critical safety gate
- Machine learning urgency classification
- Verified first-aid guidance for all 5 categories
- Model analytics & confusion matrix
- Static web client & Service Worker assets
"""

import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def post(path, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def run_e2e_tests():
    print("=== SafePulse End-to-End Test Suite ===")

    # 1. Healthcheck
    status, health = get("/api/v1/health")
    assert status == 200
    assert health["status"] == "healthy"
    print(" [1/9] Healthcheck OK:", health["service"])

    # 2. 5 Emergency Categories
    status, emergencies = get("/api/v1/emergencies")
    assert status == 200
    assert len(emergencies) == 5
    cat_ids = [e["id"] for e in emergencies]
    assert set(cat_ids) == {"bleeding", "burns", "choking", "cardiac", "injury"}
    print(f" [2/9] 5 Emergency Categories verified: {cat_ids}")

    # 3. Question Retrieval
    for cat in cat_ids:
        status, q_data = get(f"/api/v1/emergencies/{cat}/questions")
        assert status == 200
        assert len(q_data["quick_questions"]) >= 2
        assert len(q_data["detailed_questions"]) >= 2
    print(" [3/9] High-priority and detailed questions verified for all 5 categories.")

    # 4. Priority-First Safety Gate Tests (Critical Interrupt)
    critical_cases = [
        ("bleeding", {"q_spurting": "yes"}, "Arterial Bleeding"),
        ("choking", {"q_choke_complete": "yes"}, "Complete Airway Obstruction"),
        ("burns", {"q_burn_airway": "yes"}, "Airway Inhalation Burn"),
        ("cardiac", {"q_cardiac_unresponsive": "yes"}, "Cardiac Arrest / Unresponsive"),
        ("injury", {"q_injury_compound": "yes"}, "Open Compound Fracture")
    ]
    for cat, quick_ans, desc in critical_cases:
        status, res = post("/api/v1/triage/assess", {
            "category": cat,
            "quick_answers": quick_ans,
            "detailed_answers": {}
        })
        assert status == 200
        assert res["urgency"] == "HIGH", f"Expected HIGH for {desc}, got {res['urgency']}"
        assert res["is_critical"] is True
        assert res["mode"] == "SAFETY_GATE"
        assert res["score"] >= 0.95
        print(f"       Critical Safety Gate Verified: {desc} -> IMMEDIATE HIGH URGENCY")
    print(" [4/9] Priority-First Circuit Breaker 100% verified across all emergency classes.")

    # 5. Phase 2 Detailed Assessment (ML Urgency Classification)
    mild_case = {
        "category": "burns",
        "quick_answers": {"q_burn_airway": "no", "q_burn_source": "no", "q_burn_charred": "no"},
        "detailed_answers": {
            "severity": 1,
            "extent": 1,
            "duration": 5,
            "age_group": "adult",
            "pain_level": 2
        }
    }
    status, res_mild = post("/api/v1/triage/assess", mild_case)
    assert status == 200
    assert res_mild["is_critical"] is False
    assert res_mild["mode"] == "ML_MODEL"
    assert res_mild["urgency"] in ["LOW", "MODERATE"]
    print(f" [5/9] ML Inference detailed triage verified: Classified as {res_mild['urgency']} (Score: {res_mild['score']}).")

    # 6. First-Aid Guidance API
    for cat in cat_ids:
        status, guide = get(f"/api/v1/guidance/{cat}?urgency=HIGH")
        assert status == 200
        assert len(guide["steps"]) >= 3
        assert len(guide["dos"]) >= 2
        assert len(guide["donts"]) >= 2
        assert guide["call_helpline_now"] is True
    print(" [6/9] First-aid guidance, do's & don'ts verified for all categories.")

    # 7. Model Analytics & Confusion Matrix
    status, metrics = get("/api/v1/analytics/metrics")
    assert status == 200
    assert "metrics" in metrics
    assert "confusion_matrix" in metrics
    assert metrics["metrics"]["accuracy"] > 0.85
    print(f" [7/9] ML Model Analytics verified: Model Accuracy is {metrics['metrics']['accuracy']*100:.1f}%.")

    # 8. Phantom Protocol Offline Decision Tree Export
    status, tree_spec = get("/api/v1/analytics/tree-spec")
    assert status == 200
    assert "decision_tree" in tree_spec
    assert tree_spec["decision_tree"] is not None
    print(" [8/9] Phantom Protocol Edge Decision Tree spec verified for client-side offline execution.")

    # 9. Static Assets & PWA Shell
    assets = [
        "/",
        "/css/variables.css",
        "/css/base.css",
        "/css/components.css",
        "/css/emergency.css",
        "/js/state.js",
        "/js/phantom_engine.js",
        "/js/api.js",
        "/js/audio_metronome.js",
        "/js/voice_assistant.js",
        "/js/triage_wizard.js",
        "/js/first_aid.js",
        "/js/analytics_view.js",
        "/js/app.js",
        "/sw.js",
        "/manifest.json"
    ]
    for asset in assets:
        with urllib.request.urlopen(f"{BASE_URL}{asset}") as resp:
            assert resp.status == 200
    # 10. Robust Guidance Query & Case-Insensitivity
    status, g_low = get("/api/v1/guidance/bleeding?urgency=low")
    assert status == 200
    assert g_low["urgency"] == "LOW"
    status, g_mod = get("/api/v1/guidance/burns?urgency=moderate")
    assert status == 200
    assert g_mod["urgency"] == "MODERATE"
    
    # Verify invalid urgency returns 400
    try:
        urllib.request.urlopen(f"{BASE_URL}/api/v1/guidance/bleeding?urgency=invalid")
        assert False, "Should have returned 400 for invalid urgency"
    except urllib.error.HTTPError as e:
        assert e.code == 400
    print(" [10/11] Case-insensitive urgency queries & input validation verified.")

    # 11. API 404 Route Isolation (Ensures SPA router does not swallow unknown API endpoints)
    try:
        urllib.request.urlopen(f"{BASE_URL}/api/v1/nonexistent_endpoint")
        assert False, "Should have returned 404 for nonexistent API route"
    except urllib.error.HTTPError as e:
        assert e.code == 404
    print(" [11/11] API route 404 isolation verified (SPA router correctly preserves API 404s).")

    print("\n=======================================================")
    print(" ALL 11 SYSTEM INTEGRATION & COMPLIANCE TESTS PASSED! ")
    print(" SafePulse is completely functional, verified & ready.")
    print("=======================================================")

if __name__ == "__main__":
    run_e2e_tests()

