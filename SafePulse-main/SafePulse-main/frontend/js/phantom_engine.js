/**
 * SafePulse Phantom Protocol (OAP - Offline Assessment Protocol)
 * 100% resilient client-side Triage ML decision tree & emergency distress beacon
 */

const PhantomEngine = {
  // Offline Embedded Decision Tree Weights
  decisionTree: null,

  async init() {
    try {
      const res = await fetch('/api/v1/analytics/tree-spec');
      if (res.ok) {
        const data = await res.json();
        this.decisionTree = data.decision_tree;
        localStorage.setItem('safepulse_offline_tree', JSON.stringify(this.decisionTree));
      }
    } catch (e) {
      // Load cached tree from localStorage
      const cached = localStorage.getItem('safepulse_offline_tree');
      if (cached) {
        this.decisionTree = JSON.parse(cached);
      }
    }
  },

  // Client-Side Edge ML Inference
  traverseTree(features, node) {
    if (!node) return { "LOW": 0.2, "MODERATE": 0.5, "HIGH": 0.3 };
    if (node.value && node.probas) {
      return node.probas;
    }
    const feat = node.feature;
    const thresh = node.threshold;
    if (features[feat] <= thresh) {
      return this.traverseTree(features, node.left);
    } else {
      return this.traverseTree(features, node.right);
    }
  },

  assessOffline(categoryId, quickAnswers, detailedAnswers, categoryInfo) {
    const timestamp = new Date().toISOString();
    const assessmentId = 'PHANTOM-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // 1. SAFETY GATE CHECK
    let criticalDetected = false;
    let criticalReason = null;

    if (categoryInfo && categoryInfo.quick_questions) {
      for (const q of categoryInfo.quick_questions) {
        const ans = String(quickAnswers[q.id] || '').toLowerCase().trim();
        const trig = String(q.critical_trigger || 'yes').toLowerCase().trim();
        if (ans === trig) {
          criticalDetected = true;
          criticalReason = `Critical Indicator: ${q.text}`;
          break;
        }
      }
    }

    if (criticalDetected) {
      return {
        assessment_id: assessmentId,
        category: categoryId,
        category_name: categoryInfo ? categoryInfo.name : categoryId.toUpperCase(),
        urgency: "HIGH",
        score: 0.98,
        is_critical: true,
        critical_reason: criticalReason,
        confidence: 0.99,
        recommended_pathway: [
          "Call Emergency Services (112 in India / 911) Immediately",
          "Put Phone on Speaker & Stay Beside Patient",
          "Commence Immediate High-Priority First-Aid Steps"
        ],
        medical_escalation: "Potentially life-threatening emergency detected. Immediate professional medical dispatch required.",
        primary_action: "Emergency services call required immediately. Begin first-aid instructions now.",
        mode: "PHANTOM_SAFETY_GATE",
        timestamp: timestamp
      };
    }

    // 2. DETAILED VECTOR INFERENCE
    const severity = parseInt(detailedAnswers.severity || 2, 10);
    const extent = parseInt(detailedAnswers.extent || 2, 10);
    const duration = parseInt(detailedAnswers.duration || 10, 10);
    const breathing = parseInt(detailedAnswers.breathing || 0, 10);
    const ageGroup = String(detailedAnswers.age_group || 'adult').toLowerCase();
    const pain = parseInt(detailedAnswers.pain_level || 5, 10);

    const categoriesList = ["bleeding", "burns", "choking", "cardiac", "injury"];
    const catOneHot = categoriesList.map(c => (categoryId === c ? 1 : 0));
    const ageOneHot = [ageGroup === 'child' ? 1 : 0, ageGroup === 'adult' ? 1 : 0, ageGroup === 'elderly' ? 1 : 0];

    const featureVector = [
      0, // quick_critical
      severity,
      extent,
      duration,
      breathing,
      0, // consciousness alert
      pain,
      ...catOneHot,
      ...ageOneHot
    ];

    let probas = { "LOW": 0.2, "MODERATE": 0.5, "HIGH": 0.3 };
    let urgency = "MODERATE";

    if (this.decisionTree) {
      probas = this.traverseTree(featureVector, this.decisionTree);
      urgency = Object.keys(probas).reduce((a, b) => probas[a] > probas[b] ? a : b);
    } else {
      // Heuristic fallback if tree not yet cached
      if (severity === 3 || extent === 3) urgency = "HIGH";
      else if (severity === 2 || extent === 2) urgency = "MODERATE";
      else urgency = "LOW";
    }

    const pLow = probas.LOW || 0.1;
    const pMod = probas.MODERATE || 0.4;
    const pHigh = probas.HIGH || 0.5;
    const score = Math.round((0.15 * pLow + 0.50 * pMod + 0.88 * pHigh) * 100) / 100;

    let pathway = [];
    let medicalEscalation = "";
    let primaryAction = "";

    if (urgency === "LOW") {
      pathway = [
        "Self-Care & Basic First-Aid Protocol (Phantom Offline)",
        "Clean, Protect & Monitor Wound/Injury",
        "Observe for Infection or Worsening Over Next 24 Hours"
      ];
      medicalEscalation = "Professional emergency dispatch not currently indicated. Consult physician if symptoms persist.";
      primaryAction = "Administer basic first-aid steps below and observe condition.";
    } else if (urgency === "MODERATE") {
      pathway = [
        "Active First-Aid Guidance & Stabilization",
        "Seek Clinical / Urgent Care Evaluation When Feasible",
        "Monitor for Escalation Red Flags"
      ];
      medicalEscalation = "Recommend evaluation by medical clinic within 2-4 hours.";
      primaryAction = "Stabilize using first-aid instructions and prepare for medical assessment.";
    } else {
      pathway = [
        "Immediate High-Urgency First-Aid Protocol",
        "Strongly Recommend Calling Emergency Services (112 / 911)",
        "Prepare for Emergency Medical Responders"
      ];
      medicalEscalation = "High urgency situation. Professional emergency medical assistance is strongly recommended.";
      primaryAction = "Follow immediate guidance and contact emergency helpline.";
    }

    return {
      assessment_id: assessmentId,
      category: categoryId,
      category_name: categoryInfo ? categoryInfo.name : categoryId.toUpperCase(),
      urgency: urgency,
      score: score,
      is_critical: false,
      critical_reason: null,
      confidence: Math.round((probas[urgency] || 0.75) * 100) / 100,
      recommended_pathway: pathway,
      medical_escalation: medicalEscalation,
      primary_action: primaryAction,
      mode: "PHANTOM_EDGE_ML",
      timestamp: timestamp
    };
  },

  // Generate Offline Emergency SMS Beacon Payload
  async generateDistressPayload(assessmentResult) {
    let coords = "GPS UNAVAILABLE";
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        coords = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
      } catch (e) {
        coords = "GPS SIGNAL WEAK";
      }
    }

    const payload = `SOS! SAFEPULSE EMERGENCY:
TYPE: ${assessmentResult.category_name.toUpperCase()}
URGENCY: ${assessmentResult.urgency} (Score: ${assessmentResult.score})
LOC: ${coords}
ACTION: ${assessmentResult.primary_action}
TIME: ${new Date().toLocaleTimeString()}
DISPATCH HELP TO THIS LOCATION IMMEDIATELY.`;

    return payload;
  },

  // Visual SOS Morse Code Screen Strobe
  startVisualStrobe() {
    let modal = document.getElementById('strobeModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'strobeModal';
      modal.className = 'strobe-overlay active-strobe';
      modal.innerHTML = `
        <button class="btn-close-strobe" onclick="PhantomEngine.stopVisualStrobe()">EXIT SOS STROBE</button>
        <h2 style="font-size:36px;font-weight:900;letter-spacing:0.1em;margin-bottom:12px;">EMERGENCY SOS BEACON</h2>
        <p style="font-size:18px;">Flashing Morse Code SOS (... --- ...) for aerial / bystander rescue</p>
      `;
      document.body.appendChild(modal);
    } else {
      modal.classList.remove('hidden');
      modal.classList.add('active-strobe');
    }
  },

  stopVisualStrobe() {
    const modal = document.getElementById('strobeModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('active-strobe');
    }
  }
};

window.PhantomEngine = PhantomEngine;
