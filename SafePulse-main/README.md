# SafePulse — Data-Driven Emergency Response System

> **Nexathon 2 Hackathon Project**  
> **Team Members:** Shadab Patel, Hasib Shaikh, Ayaz Khan

SafePulse is an interactive emergency response and guidance system engineered to reduce panic and guide bystanders and individuals through time-sensitive emergencies. SafePulse combines **Priority-First Assessment**, **Machine Learning Urgency Classification**, verified **First-Aid Guidance**, a **Native SVG AI Voice Assistant**, and the **Phantom Protocol** for 100% offline resilience.

---

## Key Features Built & Verified

### 1. Priority-First Emergency Assessment
- **Principle:** *"The more time-sensitive the situation, the fewer unnecessary steps SafePulse should require."*
- **Phase 1: High-Priority Questions:** Screens for instant red-flag indicators (e.g., spurting blood, airway burns, unconsciousness, cardiac collapse, compound fractures).
- **Critical Circuit Breaker:** If any critical indicator is detected, the questionnaire immediately aborts, triggers the **Critical Emergency Escalation** screen, dials emergency services (**112 in India / 911**), and jumps directly to life-saving interventions.
- **Phase 2: Detailed Assessment:** When no life threats are detected, gathers clinical parameters (severity, extent, duration, age bracket, pain level) to feed into the Machine Learning engine.

### 2. Machine Learning Urgency Classifier
- **Models:** Stratified Random Forest & Decision Tree trained on 1,500 emergency scenarios.
- **Metrics:** **89.0% Overall Accuracy**, **85.6% Macro Precision**, **89.8% Recall**, **87.4% F1-Score**.
- **Outputs:** Continuous urgency index (0.0 to 1.0) and categorical urgency tiers (**LOW**, **MODERATE**, **HIGH**) with calibrated confidence scores and decision rationale.
- **Analytics Dashboard:** Live interactive confusion matrix heatmap, classification report, and top feature importance graph for hackathon audit.

### 3. The 5 PRD Emergency Categories
1. **Heavy Bleeding:** Arterial spurting, tourniquet placement, shock management.
2. **Burns:** Thermal, chemical, scalds, airway burns, cool-water rules (no ice/butter).
3. **Choking:** Partial vs. complete obstruction, Heimlich maneuver, unconscious choking CPR.
4. **Cardiac Emergency:** Heart attack signs, semi-reclined 'W' posture, cardiac arrest chest compressions.
5. **Serious Injury:** Fractures, dislocations, spinal immobilization, R.I.C.E protocol.

### 4. Interactive First-Aid & CPR Metronome
- **Visual Step Cards:** Action-oriented, non-technical instructions designed for high stress.
- **CPR Audio Metronome:** American Heart Association standard **110 BPM** rhythmic audio clicker powered by the Web Audio API with synchronized animated visual compression pulse.
- **Do's & Don'ts:** Clear lists highlighting critical safety rules and dangerous misconceptions.

### 5. Native SVG / CSS AI Voice Assistant (No GIFs!)
- **Visualizer:** Pure SVG dynamic glowing sound orb with gradient plasma rings and responsive audio waveform bars.
- **Web Speech API:** Calm voice narration of triage steps and hands-free voice commands (`"Yes"`, `"No"`, `"Next"`, `"Repeat"`, `"CPR"`, `"Call Ambulance"`), allowing responders to operate the app while applying pressure to wounds.

### 6. Phantom Protocol (OAP - Offline Assessment Protocol)
- **Zero-Connectivity Survival:** Operates in disaster zones, remote areas, or cellular deadzones.
- **PWA Service Worker:** Pre-caches all shell assets, guidance steps, and styles.
- **Client-Side Edge ML Engine:** Embedded Decision Tree algorithm mirroring server model weights directly inside the browser.
- **Phantom Distress Beacon:** Encodes current GPS coordinates and triage summary into an offline Emergency SMS payload ready to transmit over 2G cellular SMS.
- **Visual SOS Strobe:** Fullscreen Morse code flashlight strobe (`... --- ...`) for search-and-rescue signaling.

---

## Project Structure

```
safepulse/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_triage.py        # /triage/assess & question endpoints
│   │   │   ├── routes_guidance.py      # /guidance/{category} endpoint
│   │   │   └── routes_analytics.py     # /analytics/metrics & tree-spec
│   │   ├── ml/
│   │   │   ├── train.py                # Pure-NumPy Random Forest & Decision Tree
│   │   │   └── model_metadata.json     # Metrics, Confusion Matrix, Tree Export
│   │   ├── services/
│   │   │   ├── triage_service.py       # Priority-first safety gate & ML inference
│   │   │   ├── guidance_service.py     # Verified first-aid knowledge base
│   │   │   └── dataset_generator.py    # 1,500 emergency scenario dataset generator
│   │   ├── models/
│   │   │   └── schemas.py              # Pydantic request/response schemas
│   │   └── main.py                     # FastAPI server & static file mount
│   ├── tests/
│   │   ├── test_triage.py              # Unit tests for safety gate & guidance
│   │   └── test_e2e.py                 # Full 9-phase end-to-end integration tests
│   └── run.py                          # Backend launcher
├── frontend/
│   ├── index.html                      # Single Page Application
│   ├── manifest.json                   # PWA Manifest
│   ├── sw.js                           # Phantom Protocol Service Worker (Offline Cache)
│   ├── css/
│   │   ├── variables.css               # Design tokens (Colors, Typography, Dark Mode)
│   │   ├── base.css                    # Responsive layout & top navigation
│   │   ├── components.css              # Cards, HUD, gauges, SVG voice assistant, buttons
│   │   └── emergency.css               # Critical alert banners, SOS strobe, beacons
│   └── js/
│       ├── state.js                    # Reactive state store
│       ├── api.js                      # REST API client with edge fallback
│       ├── phantom_engine.js           # Client-side ML decision engine & SMS beacon
│       ├── audio_metronome.js          # Web Audio API 110 BPM CPR engine
│       ├── voice_assistant.js          # Native SVG orb & hands-free speech recognition
│       ├── triage_wizard.js            # Priority-first questionnaire controller
│       ├── first_aid.js                # Step-by-step guidance & metronome view
│       ├── analytics_view.js           # Live ML metrics & confusion matrix charts
│       └── app.js                      # Main router & application bootstrap
├── data/
│   └── synthetic_emergency_dataset.csv # 1,500 clinical emergency scenarios
└── README.md
```

---

## Quick Start Guide

### 1. Run the SafePulse Application
From the `safepulse` directory:
```bash
python backend/run.py
```
Open your browser at:
```
http://127.0.0.1:8000
```
Interactive API Documentation is available at:
```
http://127.0.0.1:8000/docs
```

### 2. Run the Automated Test Suite
```bash
python backend/tests/test_e2e.py
```
This validates all 9 phases: Healthcheck, 5 Emergency Categories, Priority-First Safety Gate circuit breaker, ML Urgency Classifier, First-Aid Guidance, Model Analytics, Offline Decision Tree export, and static PWA assets.

---

## Disclaimer
*SafePulse is designed as a data-driven emergency guidance and response-support system. It does not replace qualified doctors, paramedics, or emergency services. In any life-threatening situation, users should call emergency services (112 / 911) immediately.*
