"""
SafePulse Synthetic Emergency Dataset Generator
Generates clinical-grade synthetic emergency triage scenarios across the 5 PRD categories:
- Heavy Bleeding
- Burns
- Choking
- Cardiac Emergency
- Serious Injury
"""

import random
import pandas as pd
import numpy as np
import os

CATEGORIES = ["bleeding", "burns", "choking", "cardiac", "injury"]
AGE_GROUPS = ["child", "adult", "elderly"]

def generate_emergency_dataset(n_samples: int = 1500, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    random.seed(random_state)

    records = []

    for i in range(n_samples):
        cat = random.choice(CATEGORIES)
        age = random.choices(AGE_GROUPS, weights=[0.2, 0.55, 0.25])[0]

        # Scenario specific baseline features
        # 0 = No, 1 = Yes
        quick_critical = 0
        breathing_difficulty = 0
        consciousness_level = 0  # 0: Alert, 1: Confused/Lethargic, 2: Unresponsive
        severity_score = random.randint(1, 3) # 1: Mild, 2: Moderate, 3: Severe
        extent_affected = random.randint(1, 3) # 1: Small/Focal, 2: Moderate/Limb, 3: Large/Torso/Systemic
        duration_mins = max(1, int(np.random.exponential(scale=20)))
        pain_level = random.randint(1, 10)

        # Category specific critical & severe triggers
        if cat == "cardiac":
            # high risk for elderly/adults
            has_chest_crushing = random.choice([0, 1])
            radiating_pain = random.choice([0, 1])
            is_unresponsive = random.choices([0, 1], weights=[0.8, 0.2])[0]

            if is_unresponsive or (has_chest_crushing and radiating_pain):
                quick_critical = 1
                consciousness_level = 2 if is_unresponsive else 1
                breathing_difficulty = 1
                pain_level = max(pain_level, 8)
                urgency = "HIGH"
            elif has_chest_crushing or pain_level >= 7:
                urgency = "HIGH" if (age == "elderly" or breathing_difficulty) else "MODERATE"
            elif pain_level >= 4:
                urgency = "MODERATE"
            else:
                urgency = "LOW"

        elif cat == "bleeding":
            is_spurting = random.choices([0, 1], weights=[0.75, 0.25])[0]
            pool_rapid = random.choices([0, 1], weights=[0.7, 0.3])[0]
            shock_signs = random.choices([0, 1], weights=[0.8, 0.2])[0]

            if is_spurting or shock_signs:
                quick_critical = 1
                consciousness_level = 1 if shock_signs else 0
                urgency = "HIGH"
            elif pool_rapid or severity_score == 3:
                urgency = "HIGH"
            elif severity_score == 2 or extent_affected >= 2:
                urgency = "MODERATE"
            else:
                urgency = "LOW"

        elif cat == "choking":
            silent_struggle = random.choices([0, 1], weights=[0.7, 0.3])[0] # cannot speak/cough
            cyanosis = random.choices([0, 1], weights=[0.75, 0.25])[0] # turning blue
            lost_consciousness = random.choices([0, 1], weights=[0.85, 0.15])[0]

            if silent_struggle or cyanosis or lost_consciousness:
                quick_critical = 1
                breathing_difficulty = 1
                consciousness_level = 2 if lost_consciousness else 1
                urgency = "HIGH"
            elif severity_score >= 2:
                urgency = "MODERATE"
            else:
                urgency = "LOW"

        elif cat == "burns":
            facial_or_airway = random.choices([0, 1], weights=[0.8, 0.2])[0]
            chemical_electrical = random.choices([0, 1], weights=[0.85, 0.15])[0]
            charred_deep = random.choices([0, 1], weights=[0.75, 0.25])[0]

            if facial_or_airway or chemical_electrical or (charred_deep and extent_affected >= 2):
                quick_critical = 1
                urgency = "HIGH"
            elif charred_deep or extent_affected == 3 or pain_level >= 8:
                urgency = "HIGH"
            elif extent_affected == 2 or severity_score == 2:
                urgency = "MODERATE"
            else:
                urgency = "LOW"

        elif cat == "injury":
            compound_open_bone = random.choices([0, 1], weights=[0.85, 0.15])[0]
            spinal_neck_head = random.choices([0, 1], weights=[0.8, 0.2])[0]
            unable_to_move = random.choices([0, 1], weights=[0.6, 0.4])[0]

            if compound_open_bone or spinal_neck_head:
                quick_critical = 1
                urgency = "HIGH"
            elif unable_to_move and severity_score >= 2:
                urgency = "MODERATE" if pain_level < 8 else "HIGH"
            elif severity_score == 2:
                urgency = "MODERATE"
            else:
                urgency = "LOW"

        records.append({
            "id": f"SP-{i+1001}",
            "category": cat,
            "age_group": age,
            "quick_critical": quick_critical,
            "severity_score": severity_score,
            "extent_affected": extent_affected,
            "duration_mins": duration_mins,
            "breathing_difficulty": breathing_difficulty,
            "consciousness_level": consciousness_level,
            "pain_level": pain_level,
            "urgency": urgency
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    out_dir = r"C:\Users\AYAZ KHAN\.gemini\antigravity-ide\scratch\safepulse\data"
    os.makedirs(out_dir, exist_ok=True)
    df = generate_emergency_dataset(1500)
    out_path = os.path.join(out_dir, "synthetic_emergency_dataset.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} records at {out_path}")
    print(df["urgency"].value_counts())
