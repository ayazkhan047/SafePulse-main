"""
SafePulse Verified Emergency Guidance & Knowledge Base
Provides clinical-grade first-aid guidance, do's/don'ts, priority questions,
and emergency categories according to the PRD specifications.
"""

from typing import Dict, Any, List

EMERGENCY_DATA: Dict[str, Dict[str, Any]] = {
    "bleeding": {
        "id": "bleeding",
        "name": "Heavy Bleeding",
        "short_name": "Bleeding",
        "icon": "droplet",
        "color": "#e03145",
        "description": "Rapid blood loss, lacerations, puncture wounds, arterial bleeding",
        "quick_questions": [
            {
                "id": "q_spurting",
                "text": "Is the blood spurting, pumping rhythmically, or pooling rapidly?",
                "subtext": "Arterial bleeding can cause critical shock within 2 to 3 minutes.",
                "critical_trigger": "yes"
            },
            {
                "id": "q_shock",
                "text": "Is the person becoming pale, cold, sweaty, dizzy, or losing consciousness?",
                "subtext": "Indicates signs of severe hemorrhagic shock.",
                "critical_trigger": "yes"
            },
            {
                "id": "q_neck_groin",
                "text": "Is the wound located on the neck, armpit, or groin area where a standard bandage cannot hold?",
                "subtext": "Junctional wounds require specialized wound packing immediately.",
                "critical_trigger": "yes"
            }
        ],
        "detailed_questions": [
            {
                "id": "extent",
                "text": "Location and extent of the wound",
                "help_text": "Select the primary area affected",
                "type": "select",
                "options": [
                    {"label": "Small cut or scrape (minor)", "value": 1},
                    {"label": "Deep laceration on arm or leg", "value": 2},
                    {"label": "Large wound or multiple lacerations", "value": 3}
                ],
                "default": 2
            },
            {
                "id": "severity",
                "text": "How much blood has been lost so far?",
                "help_text": "Estimate based on dressings or surface",
                "type": "select",
                "options": [
                    {"label": "Minor oozing / controlled with light cloth", "value": 1},
                    {"label": "Soaked through 1-2 cloths / steadily dripping", "value": 2},
                    {"label": "Multiple cloths soaked / heavy pooling on floor", "value": 3}
                ],
                "default": 2
            },
            {
                "id": "duration",
                "text": "How many minutes ago did the bleeding start?",
                "type": "range",
                "options": [
                    {"label": "Under 5 minutes", "value": 3},
                    {"label": "5 to 15 minutes", "value": 10},
                    {"label": "More than 15 minutes", "value": 25}
                ],
                "default": 10
            },
            {
                "id": "age_group",
                "text": "Age group of the injured person",
                "type": "select",
                "options": [
                    {"label": "Child (under 12)", "value": "child"},
                    {"label": "Adult (12 - 64)", "value": "adult"},
                    {"label": "Elderly (65+)", "value": "elderly"}
                ],
                "default": "adult"
            }
        ],
        "guidance": {
            "LOW": {
                "headline": "Minor Bleeding — Clean & Dress",
                "primary_directive": "Clean the wound with mild soap and water, apply direct pressure with a clean cloth until bleeding stops, then apply an antiseptic adhesive bandage.",
                "steps": [
                    {"step_number": 1, "title": "Wash Hands & Clean Area", "instruction": "Wash your hands thoroughly or wear disposable gloves if available.", "action_type": "standard"},
                    {"step_number": 2, "title": "Apply Gentle Direct Pressure", "instruction": "Place a clean pad or sterile gauze over the cut and press firmly for 3 to 5 minutes.", "action_type": "compress"},
                    {"step_number": 3, "title": "Rinse & Disinfect", "instruction": "Rinse under clean tap water to remove dirt. Pat dry gently around edges.", "action_type": "standard"},
                    {"step_number": 4, "title": "Bandage & Monitor", "instruction": "Apply a sterile dressing or adhesive bandage. Watch for signs of infection (redness, pus, swelling).", "action_type": "standard"}
                ],
                "dos": ["Wash hands before touching wound", "Keep dressing clean and dry", "Check tetanus vaccination status"],
                "donts": ["Do not scrub the open wound aggressively", "Do not remove dressings once clotted", "Do not apply harsh chemicals like pure bleach or spirit into open cuts"]
            },
            "MODERATE": {
                "headline": "Moderate Bleeding — Constant Pressure & Medical Assessment",
                "primary_directive": "Maintain continuous direct pressure without peeking for at least 10 minutes. Elevate the wounded limb if possible. Seek professional medical care for stitches or wound closure.",
                "steps": [
                    {"step_number": 1, "title": "Direct Firm Pressure", "instruction": "Place thick sterile gauze or clean cloth directly over the wound and apply firm, continuous pressure with both hands.", "action_type": "compress"},
                    {"step_number": 2, "title": "Do NOT Remove Soaked Dressings", "instruction": "If blood soaks through, add another layer on top. Do NOT peel off the base layer as it disrupts clot formation.", "warning": "Never pull away clotted dressings.", "action_type": "compress"},
                    {"step_number": 3, "title": "Elevate Wounded Limb", "instruction": "If the wound is on an arm or leg, raise it above heart level while keeping steady pressure applied.", "action_type": "standard"},
                    {"step_number": 4, "title": "Seek Medical Evaluation", "instruction": "Visit an urgent care center or clinic within 6 hours if the wound is deeper than 1/4 inch or gaping open.", "action_type": "standard"}
                ],
                "dos": ["Keep pressure continuous for full 10 minutes without lifting", "Layer new dressings over old ones", "Keep patient warm and calm"],
                "donts": ["Do NOT take off bandages to check bleeding", "Do NOT apply a tourniquet for normal bleeding that stops with pressure", "Do NOT allow the person to stand or walk if lightheaded"]
            },
            "HIGH": {
                "headline": "Critical Hemorrhage — Immediate Life-Threatening Alert",
                "primary_directive": "CALL 112 / 911 IMMEDIATELY. Apply maximum two-handed direct pressure or a commercial/improvised tourniquet 2-3 inches above the wound on limbs. Treat for hemorrhagic shock.",
                "steps": [
                    {"step_number": 1, "title": "Call Emergency Services (112 / 911)", "instruction": "Put phone on speaker immediately. State: 'Severe uncontrolled bleeding, patient in critical condition.'", "action_type": "standard"},
                    {"step_number": 2, "title": "Two-Handed Deep Pressure", "instruction": "Use your full body weight pressing down through a thick cloth directly into the source of the bleeding.", "action_type": "compress"},
                    {"step_number": 3, "title": "Tourniquet for Severe Limb Bleeding", "instruction": "If bleeding is from an arm or leg and cannot be stopped, apply a tourniquet 2 to 3 inches above the wound (never over a joint). Tighten until the bleeding halts.", "warning": "Note exact time of tourniquet application.", "action_type": "compress"},
                    {"step_number": 4, "title": "Prevent Shock", "instruction": "Lay the patient flat, elevate legs 12 inches if no spinal trauma, and cover with a blanket or coat to preserve body heat.", "action_type": "airway"}
                ],
                "dos": ["Call 112/911 before doing anything else", "Use full body weight for pressure", "Cover patient with warm blanket"],
                "donts": ["Do NOT loosen or remove a tourniquet once applied", "Do NOT give food or water (patient may need emergency surgery)", "Do NOT leave the patient unattended"]
            }
        }
    },
    "burns": {
        "id": "burns",
        "name": "Burns",
        "short_name": "Burns",
        "icon": "flame",
        "color": "#e8761c",
        "description": "Thermal, chemical, electrical, or scald burns to skin and tissue",
        "quick_questions": [
            {
                "id": "q_burn_airway",
                "text": "Did the burn affect the face, mouth, throat, neck, or is there soot around the nostrils?",
                "subtext": "Airway swelling can cause sudden respiratory failure.",
                "critical_trigger": "yes"
            },
            {
                "id": "q_burn_source",
                "text": "Was the burn caused by high-voltage electricity, explosion, or strong industrial chemicals?",
                "subtext": "Electrical burns can cause hidden internal tissue and cardiac damage.",
                "critical_trigger": "yes"
            },
            {
                "id": "q_burn_charred",
                "text": "Is the skin white, leathery, charred black, or numb to the touch over a large area?",
                "subtext": "Indicates a full-thickness (3rd degree) burn requiring immediate emergency burn care.",
                "critical_trigger": "yes"
            }
        ],
        "detailed_questions": [
            {
                "id": "extent",
                "text": "Approximate size of the burned area",
                "help_text": "One palm size is roughly 1% of body area",
                "type": "select",
                "options": [
                    {"label": "Smaller than the palm of a hand (<1%)", "value": 1},
                    {"label": "Between 1 and 3 palm sizes (moderate)", "value": 2},
                    {"label": "Larger than 3 palm sizes or entire limb/chest", "value": 3}
                ],
                "default": 1
            },
            {
                "id": "severity",
                "text": "Appearance of the burn",
                "type": "select",
                "options": [
                    {"label": "Red, painful, no blisters (1st degree)", "value": 1},
                    {"label": "Red with fluid-filled blisters (2nd degree)", "value": 2},
                    {"label": "Charred black or waxy white skin (3rd degree)", "value": 3}
                ],
                "default": 2
            },
            {
                "id": "duration",
                "text": "How many minutes ago did the burn happen?",
                "type": "range",
                "options": [
                    {"label": "Under 10 minutes", "value": 5},
                    {"label": "10 to 30 minutes", "value": 15},
                    {"label": "More than 30 minutes", "value": 45}
                ],
                "default": 15
            },
            {
                "id": "age_group",
                "text": "Age group of the person",
                "type": "select",
                "options": [
                    {"label": "Child (under 12)", "value": "child"},
                    {"label": "Adult (12 - 64)", "value": "adult"},
                    {"label": "Elderly (65+)", "value": "elderly"}
                ],
                "default": "adult"
            }
        ],
        "guidance": {
            "LOW": {
                "headline": "Minor Superficial Burn — Cool & Protect",
                "primary_directive": "Cool the burn under gentle, running cool tap water for 15-20 minutes. Do not use ice. Apply pure aloe vera or burn gel, and protect with a sterile non-stick dressing.",
                "steps": [
                    {"step_number": 1, "title": "Cool with Running Water", "instruction": "Immediately hold under cool (not freezing) running tap water for 15 to 20 minutes to draw out heat.", "action_type": "cool"},
                    {"step_number": 2, "title": "Remove Tight Items", "instruction": "Gently take off rings, watches, or tight clothing near the burn before swelling begins.", "action_type": "standard"},
                    {"step_number": 3, "title": "Moisturize & Protect", "instruction": "Apply pure aloe vera gel or petroleum jelly. Cover loosely with sterile plastic cling film or clean non-stick gauze.", "action_type": "standard"}
                ],
                "dos": ["Use clean cool running tap water for 20 minutes", "Remove jewelry near the burn immediately", "Keep the dressing clean and loose"],
                "donts": ["Do NOT use ice, iced water, or freezing compresses", "Do NOT use butter, toothpaste, oil, or turmeric", "Do NOT pop any small blisters"]
            },
            "MODERATE": {
                "headline": "Partial-Thickness Burn — Cool, Cover & Seek Medical Attention",
                "primary_directive": "Cool with cool running water for 20 minutes. Cover loosely with sterile cling wrap or clean non-adherent dressing. Seek medical care at an urgent care or emergency room.",
                "steps": [
                    {"step_number": 1, "title": "Cool Gently for 20 Minutes", "instruction": "Run cool tap water over the burn. Never submerge large parts of body in cold water as it triggers hypothermia.", "action_type": "cool"},
                    {"step_number": 2, "title": "Protect Blisters Intact", "instruction": "Leave blisters completely intact. Blister skin is the body's natural sterile biological barrier against infection.", "warning": "Popping blisters increases infection risk drastically.", "action_type": "standard"},
                    {"step_number": 3, "title": "Cover with Clean Cling Film", "instruction": "Lay clean kitchen cling wrap loosely over the burn (do not wrap tightly around a limb). It protects nerve endings and prevents drying.", "action_type": "standard"},
                    {"step_number": 4, "title": "Seek Medical Evaluation", "instruction": "Blisters spanning across joints or larger than 2 inches require professional burn clinic care.", "action_type": "standard"}
                ],
                "dos": ["Cool with running water for full 20 minutes", "Cover loosely with clean cling wrap", "Keep patient comfortable and hydrated"],
                "donts": ["Do NOT break or puncture blisters", "Do NOT use cotton wool or fluffy dressings that stick to skin", "Do NOT apply greasy ointments before doctor examines"]
            },
            "HIGH": {
                "headline": "Severe Critical Burn — Call Emergency Services Now (112 / 911)",
                "primary_directive": "CALL 112 / 911 IMMEDIATELY. Protect airway. Do not pull clothes stuck to skin. Cover with clean, dry, sterile sheets. Keep patient warm to prevent shock.",
                "steps": [
                    {"step_number": 1, "title": "Call 112 / 911 Now", "instruction": "Report major burn emergency. Put dispatcher on speakerphone.", "action_type": "standard"},
                    {"step_number": 2, "title": "Check Airway & Breathing", "instruction": "Watch chest rise. If smoke inhalation is suspected or breathing is noisy/raspy, ensure airway remains open.", "action_type": "airway"},
                    {"step_number": 3, "title": "Do NOT Peel Stuck Clothing", "instruction": "Cut away loose clothing around the burn, but NEVER pull clothing adhered to melted or charred skin.", "action_type": "standard"},
                    {"step_number": 4, "title": "Cover with Clean Dry Sheet", "instruction": "Drape a clean, dry sheet or sterile burn dressing over the patient. Keep patient warm to prevent severe hypothermic shock.", "action_type": "standard"}
                ],
                "dos": ["Call 112/911 immediately", "Monitor breathing continuously", "Keep the patient warm with a clean blanket"],
                "donts": ["Do NOT immerse extensive burns in cold water (causes hypothermia)", "Do NOT peel burned clothing stuck to flesh", "Do NOT give anything by mouth"]
            }
        }
    },
    "choking": {
        "id": "choking",
        "name": "Choking",
        "short_name": "Choking",
        "icon": "wind",
        "color": "#12a66f",
        "description": "Foreign body airway obstruction in conscious or unconscious persons",
        "quick_questions": [
            {
                "id": "q_choke_complete",
                "text": "Is the person completely unable to speak, cry, cough forcefully, or breathe?",
                "subtext": "Complete airway obstruction leads to brain hypoxia within 4 minutes.",
                "critical_trigger": "yes"
            },
            {
                "id": "q_choke_cyanosis",
                "text": "Are their lips, fingernails, or skin turning blue, purple, or gray?",
                "subtext": "Indicates acute lack of oxygen in bloodstream.",
                "critical_trigger": "yes"
            },
            {
                "id": "q_choke_unconscious",
                "text": "Has the person collapsed or lost consciousness?",
                "subtext": "Requires immediate CPR with airway foreign object checks.",
                "critical_trigger": "yes"
            }
        ],
        "detailed_questions": [
            {
                "id": "severity",
                "text": "How effectively can the person cough or make noise?",
                "type": "select",
                "options": [
                    {"label": "Can cough loudly and speak in short phrases (Partial obstruction)", "value": 1},
                    {"label": "Only weak, wheezing coughs / cannot speak clearly", "value": 2},
                    {"label": "Zero sound / clutching throat with two hands (Heimlich sign)", "value": 3}
                ],
                "default": 2
            },
            {
                "id": "age_group",
                "text": "Age and physical profile of the choking person",
                "type": "select",
                "options": [
                    {"label": "Infant (under 1 year)", "value": "child"},
                    {"label": "Child or Adult", "value": "adult"},
                    {"label": "Pregnant woman or Wheelchair user", "value": "elderly"}
                ],
                "default": "adult"
            }
        ],
        "guidance": {
            "LOW": {
                "headline": "Mild Airway Obstruction — Encourage Forceful Coughing",
                "primary_directive": "Do NOT deliver back slaps if the person is coughing forcefully. Stay beside them and encourage them to keep coughing to clear the blockage naturally.",
                "steps": [
                    {"step_number": 1, "title": "Encourage Coughing", "instruction": "Ask: 'Are you choking?' If they can answer or cough forcefully, tell them: 'Keep coughing! Cough it out!'", "action_type": "standard"},
                    {"step_number": 2, "title": "Stay Beside Patient", "instruction": "Do not hit them on the back while they are coughing well, as it can dislodge object deeper into airway.", "action_type": "standard"},
                    {"step_number": 3, "title": "Watch for Deterioration", "instruction": "Be ready to intervene immediately if their cough becomes silent, weak, or lips turn dusky blue.", "action_type": "standard"}
                ],
                "dos": ["Encourage persistent forceful coughing", "Keep the person calm", "Stay alert for any sudden airway blockage"],
                "donts": ["Do NOT give water to drink (it enters the lungs)", "Do NOT perform back blows if the cough is loud and effective", "Do NOT stick blind fingers into mouth"]
            },
            "MODERATE": {
                "headline": "Severe Obstruction — Alternate 5 Back Blows & 5 Abdominal Thrusts",
                "primary_directive": "Deliver 5 sharp back blows between shoulder blades. If clear airway is not restored, deliver 5 abdominal thrusts (Heimlich maneuver). Repeat cycle continuously.",
                "steps": [
                    {"step_number": 1, "title": "Lean Patient Forward", "instruction": "Stand slightly behind and to the side of the person. Support their chest with one hand and lean them well forward.", "action_type": "standard"},
                    {"step_number": 2, "title": "5 Sharp Back Blows", "instruction": "Deliver up to 5 firm blows between the shoulder blades using the heel of your hand.", "action_type": "compress"},
                    {"step_number": 3, "title": "5 Abdominal Thrusts (Heimlich)", "instruction": "Place fist thumb-side against upper abdomen (above navel, below ribcage). Grasp fist with other hand and pull sharply inward and upward.", "action_type": "compress"},
                    {"step_number": 4, "title": "Cycle Until Cleared", "instruction": "Alternate 5 back blows and 5 abdominal thrusts until the object pops out or person speaks.", "action_type": "compress"}
                ],
                "dos": ["Lean person forward so object falls out rather than deeper", "Pull inward and upward with distinct sharp thrusts", "Call emergency services if not cleared after 1 cycle"],
                "donts": ["Do NOT perform abdominal thrusts on infants under 1 year (use back slaps & chest thrusts)", "Do NOT slap back while person is standing upright", "Do NOT hesitate to escalate"]
            },
            "HIGH": {
                "headline": "Complete Choking or Unconscious — Emergency CPR + 112 / 911",
                "primary_directive": "CALL 112 / 911 ON SPEAKER IMMEDIATELY. Lower person carefully to flat floor. Begin CPR compressions. Each time airway is opened to give breaths, look for object.",
                "steps": [
                    {"step_number": 1, "title": "Call 112 / 911 Immediately", "instruction": "Shout: 'Person choking, collapsed and unconscious!' Put phone on speaker.", "action_type": "standard"},
                    {"step_number": 2, "title": "Lower to Hard Flat Surface", "instruction": "Gently guide patient to the floor onto their back. Clear surroundings.", "action_type": "standard"},
                    {"step_number": 3, "title": "Start Chest Compressions (100-120 BPM)", "instruction": "Interlock hands on center of chest. Push down 2 to 2.4 inches hard and fast. Follow the SafePulse audio metronome beat.", "action_type": "cpr"},
                    {"step_number": 4, "title": "Look in Mouth Before Breaths", "instruction": "Open the mouth. If you clearly see the foreign object, sweep it out with one hooked finger. If not visible, NEVER do a blind sweep. Continue CPR.", "action_type": "airway"}
                ],
                "dos": ["Call 112/911 at once", "Push hard and fast in center of chest", "Only remove object if clearly visible"],
                "donts": ["Do NOT perform blind finger sweeps", "Do NOT give up on CPR until medical responders arrive", "Do NOT leave patient on soft mattress"]
            }
        }
    },
    "cardiac": {
        "id": "cardiac",
        "name": "Cardiac Emergency",
        "short_name": "Cardiac",
        "icon": "heart-pulse",
        "color": "#d91e36",
        "description": "Suspected heart attack, angina, or sudden cardiac arrest",
        "quick_questions": [
            {
                "id": "q_cardiac_unresponsive",
                "text": "Is the person unresponsive and NOT breathing normally (gasping or no breath)?",
                "subtext": "Signs of sudden cardiac arrest requiring instant CPR and AED.",
                "critical_trigger": "yes"
            },
            {
                "id": "q_cardiac_crushing",
                "text": "Is there severe crushing chest pressure radiating to the left arm, jaw, neck, or back with cold sweats?",
                "subtext": "Classic hallmark signs of acute myocardial infarction (heart attack).",
                "critical_trigger": "yes"
            },
            {
                "id": "q_cardiac_collapse",
                "text": "Did the person collapse suddenly with lips turning blue or gray?",
                "subtext": "Cardiac electrical collapse requires defibrillation within 3-5 minutes.",
                "critical_trigger": "yes"
            }
        ],
        "detailed_questions": [
            {
                "id": "severity",
                "text": "Description of chest discomfort",
                "type": "select",
                "options": [
                    {"label": "Mild discomfort or fluttering that resolves with rest", "value": 1},
                    {"label": "Moderate tight squeezing pressure lasting > 10 minutes", "value": 2},
                    {"label": "Crushing elephant-on-chest pressure accompanied by nausea / dizzy", "value": 3}
                ],
                "default": 2
            },
            {
                "id": "breathing",
                "text": "Breathing state",
                "type": "select",
                "options": [
                    {"label": "Normal breathing", "value": 0},
                    {"label": "Noticeably short of breath or panting", "value": 1}
                ],
                "default": 1
            },
            {
                "id": "age_group",
                "text": "Patient age group and medical history",
                "type": "select",
                "options": [
                    {"label": "Under 40 with no known heart history", "value": "adult"},
                    {"label": "40 to 65 or history of diabetes/blood pressure", "value": "adult"},
                    {"label": "Elderly (65+) or known cardiac patient", "value": "elderly"}
                ],
                "default": "elderly"
            }
        ],
        "guidance": {
            "LOW": {
                "headline": "Mild Chest Discomfort — Rest & Clinical Assessment",
                "primary_directive": "Have the person stop all exertion and sit in a comfortable resting position. Loosen tight collar and clothes. If symptoms do not resolve within 5 minutes, treat as potential emergency.",
                "steps": [
                    {"step_number": 1, "title": "Immediate Rest", "instruction": "Sit the person upright or in a 'W' position with knees bent and back supported.", "action_type": "standard"},
                    {"step_number": 2, "title": "Loosen Clothing", "instruction": "Unbutton collar, loosen tie, and ensure fresh air circulation around patient.", "action_type": "standard"},
                    {"step_number": 3, "title": "Monitor Constantly", "instruction": "Stay with person. If pain increases, radiates, or shortness of breath begins, immediately call 112/911.", "action_type": "standard"}
                ],
                "dos": ["Rest quietly in comfortable seated position", "Keep calm and breathe slowly", "Have emergency contact on standby"],
                "donts": ["Do NOT walk around or climb stairs", "Do NOT drive yourself to the clinic", "Do NOT dismiss chest pain as mere indigestion"]
            },
            "MODERATE": {
                "headline": "Suspected Angina / Heart Attack — Call Helpline & Rest Calmly",
                "primary_directive": "Call emergency medical services immediately. Place patient in semi-reclined 'W' position. If conscious and not allergic, assist with chewable Aspirin (300mg) if advised.",
                "steps": [
                    {"step_number": 1, "title": "Call 112 / 911 Now", "instruction": "Explain: 'Patient experiencing persistent chest pressure and shortness of breath.'", "action_type": "standard"},
                    {"step_number": 2, "title": "Rest in 'W' Seated Position", "instruction": "Sit patient on floor leaning back against wall with knees bent. This reduces cardiac workload.", "action_type": "standard"},
                    {"step_number": 3, "title": "Aspirin Consideration", "instruction": "If the patient is conscious, alert, not allergic to aspirin, and not bleeding, have them slowly chew one 300mg soluble aspirin tablet.", "warning": "Do not give if allergic or having internal bleeding.", "action_type": "standard"},
                    {"step_number": 4, "title": "Locate Nearest AED", "instruction": "Send a bystander to look for an Automated External Defibrillator (AED) in the building.", "action_type": "standard"}
                ],
                "dos": ["Keep patient seated with knees bent", "Call 112/911 without delay", "Loosen tight clothes around neck and waist"],
                "donts": ["Do NOT let patient walk or exert themselves", "Do NOT give food or drink", "Do NOT leave the patient alone"]
            },
            "HIGH": {
                "headline": "Cardiac Arrest Alert — Immediate CPR & AED Protocol",
                "primary_directive": "CALL 112 / 911 IMMEDIATELY. Start continuous chest compressions at 100-120 BPM. Send bystander for AED. Do not stop until paramedics take over.",
                "steps": [
                    {"step_number": 1, "title": "Call 112 / 911 & Put on Speaker", "instruction": "Tell dispatcher: 'Cardiac arrest! Patient collapsed, unresponsive, not breathing!'", "action_type": "standard"},
                    {"step_number": 2, "title": "Hand Placement in Center of Chest", "instruction": "Place heel of one hand on lower half of breastbone. Lock other hand on top with fingers interlaced.", "action_type": "cpr"},
                    {"step_number": 3, "title": "Compress Hard & Fast (100–120 BPM)", "instruction": "Push down at least 2 inches (5 cm). Allow complete chest recoil between strokes. Follow the SafePulse audio clicker.", "action_type": "cpr"},
                    {"step_number": 4, "title": "Attach AED As Soon As It Arrives", "instruction": "Power on AED immediately and follow voice prompts. Do not stop CPR while pads are being applied.", "action_type": "cpr"}
                ],
                "dos": ["Push hard and fast in center of chest", "Follow the 110 BPM metronome rhythm", "Switch compressor every 2 minutes if someone can help"],
                "donts": ["Do NOT delay CPR to check for pulse if person is unresponsive and not breathing normally", "Do NOT stop compressions except when AED is analyzing", "Do NOT bend elbows while compressing"]
            }
        }
    },
    "injury": {
        "id": "injury",
        "name": "Serious Injury",
        "short_name": "Injury",
        "icon": "bone",
        "color": "#6f63e0",
        "description": "Fractures, dislocations, head/spine trauma, and severe musculoskeletal injury",
        "quick_questions": [
            {
                "id": "q_injury_compound",
                "text": "Is there a bone visibly protruding through the skin (compound fracture)?",
                "subtext": "Open fractures carry extreme risk of osteomyelitis infection and severe blood loss.",
                "critical_trigger": "yes"
            },
            {
                "id": "q_injury_spine",
                "text": "Was there a fall from height, traffic collision, or suspected injury to head, neck, or spine with numbness?",
                "subtext": "Spinal cord injury risk requires strict spinal immobilization.",
                "critical_trigger": "yes"
            },
            {
                "id": "q_injury_circulation",
                "text": "Is the injured limb cold, pale, gray, or has lost all pulse/sensation below the injury?",
                "subtext": "Indicates compromised blood supply requiring urgent orthopedic surgical care.",
                "critical_trigger": "yes"
            }
        ],
        "detailed_questions": [
            {
                "id": "severity",
                "text": "Visible deformity and pain level",
                "type": "select",
                "options": [
                    {"label": "Mild sprain / swelling / can bear slight weight", "value": 1},
                    {"label": "Moderate pain / visible swelling / unable to bear weight", "value": 2},
                    {"label": "Severe deformity / unnatural limb angle / intense pain", "value": 3}
                ],
                "default": 2
            },
            {
                "id": "extent",
                "text": "Injury location",
                "type": "select",
                "options": [
                    {"label": "Finger, toe, or wrist", "value": 1},
                    {"label": "Arm, ankle, or knee", "value": 2},
                    {"label": "Hip, thigh (femur), shoulder, or back", "value": 3}
                ],
                "default": 2
            },
            {
                "id": "age_group",
                "text": "Age group of the person",
                "type": "select",
                "options": [
                    {"label": "Child (under 12)", "value": "child"},
                    {"label": "Adult (12 - 64)", "value": "adult"},
                    {"label": "Elderly (65+)", "value": "elderly"}
                ],
                "default": "adult"
            }
        ],
        "guidance": {
            "LOW": {
                "headline": "Mild Sprain or Strain — R.I.C.E. Protocol",
                "primary_directive": "Follow the R.I.C.E protocol: Rest the injured joint, apply Ice wrapped in a towel for 15 minutes, Compress gently with an elastic bandage, and Elevate above heart level.",
                "steps": [
                    {"step_number": 1, "title": "Rest", "instruction": "Stop activity and protect the injured joint from bearing weight.", "action_type": "standard"},
                    {"step_number": 2, "title": "Ice (Cold Therapy)", "instruction": "Apply cold pack wrapped in a cloth for 15-20 minutes every 2-3 hours to reduce swelling.", "action_type": "cool"},
                    {"step_number": 3, "title": "Compression", "instruction": "Wrap an elastic bandage smoothly around the joint. Do not wrap so tightly that it cuts off circulation.", "action_type": "compress"},
                    {"step_number": 4, "title": "Elevation", "instruction": "Prop up the limb on pillows to help fluid drain away from the injury.", "action_type": "standard"}
                ],
                "dos": ["Rest the injured joint immediately", "Wrap ice in cloth before applying to skin", "Elevate limb when sitting or lying down"],
                "donts": ["Do NOT apply ice directly on bare skin", "Do NOT apply heat during the first 48 hours", "Do NOT walk on a swollen ankle"]
            },
            "MODERATE": {
                "headline": "Suspected Fracture / Dislocation — Immobilize & Hospital Evaluation",
                "primary_directive": "Support and immobilize the limb in the position found. Apply a temporary splint using rolled cardboard, magazines, or triangular bandage. Transport to hospital emergency department for X-ray.",
                "steps": [
                    {"step_number": 1, "title": "Immobilize in Position Found", "instruction": "Do NOT try to straighten or push deformed bone back into place. Support with rolled towels or splint.", "warning": "Never realign broken bones.", "action_type": "standard"},
                    {"step_number": 2, "title": "Apply Cold Compress", "instruction": "Place an ice pack wrapped in a towel around the injury site to reduce internal bleeding and swelling.", "action_type": "cool"},
                    {"step_number": 3, "title": "Check Peripheral Pulse & Warmth", "instruction": "Ensure toes or fingers remain pink, warm, and have sensation. If they turn blue or cold, loosen splints.", "action_type": "standard"},
                    {"step_number": 4, "title": "Transport to Emergency Room", "instruction": "Take the patient to nearest trauma clinic or emergency hospital for radiography.", "action_type": "standard"}
                ],
                "dos": ["Support joints above and below the fracture", "Keep patient warm and calm", "Remove rings before swelling traps them"],
                "donts": ["Do NOT attempt to force or straighten a crooked limb", "Do NOT massage the injured bone", "Do NOT give oral painkillers that thin blood without medical consent"]
            },
            "HIGH": {
                "headline": "Critical Trauma / Open Fracture / Spinal Alert — Call 112 / 911",
                "primary_directive": "CALL 112 / 911 IMMEDIATELY. Do NOT move the patient if head/neck injury is suspected. Cover open wounds with sterile dressings without pushing bone. Keep patient completely still.",
                "steps": [
                    {"step_number": 1, "title": "Call 112 / 911 Immediately", "instruction": "State: 'Critical trauma with severe fracture / possible spine injury.'", "action_type": "standard"},
                    {"step_number": 2, "title": "Keep Head & Spine Perfectly Still", "instruction": "If neck or spine injury is possible, hold the patient's head on both sides so they do not twist or turn.", "action_type": "standard"},
                    {"step_number": 3, "title": "Cover Exposed Bone with Sterile Dressing", "instruction": "Place sterile gauze or clean dry cloth loosely over protruding bone to prevent infection. Never push bone inward.", "action_type": "compress"},
                    {"step_number": 4, "title": "Prevent Shock", "instruction": "Cover the patient with a blanket. Keep them calm and talk soothingly while waiting for ambulance.", "action_type": "standard"}
                ],
                "dos": ["Keep head and neck aligned and immobilized", "Cover open bone with sterile dressing", "Keep patient warm"],
                "donts": ["Do NOT move patient unless there is immediate danger (e.g. fire)", "Do NOT push protruding bones back in", "Do NOT remove a motorcycle helmet unless airway is blocked"]
            }
        }
    }
}

def get_all_categories() -> List[Dict[str, Any]]:
    return [
        {
            "id": data["id"],
            "name": data["name"],
            "short_name": data["short_name"],
            "icon": data["icon"],
            "color": data["color"],
            "description": data["description"]
        }
        for data in EMERGENCY_DATA.values()
    ]

def get_category_questions(category_id: str) -> Dict[str, Any]:
    cat = EMERGENCY_DATA.get(category_id)
    if not cat:
        return {}
    return {
        "id": cat["id"],
        "name": cat["name"],
        "quick_questions": cat["quick_questions"],
        "detailed_questions": cat["detailed_questions"]
    }

def get_category_guidance(category_id: str, urgency: str) -> Dict[str, Any]:
    cat = EMERGENCY_DATA.get(category_id.lower().strip(), EMERGENCY_DATA["bleeding"])
    urg_key = urgency.upper().strip() if urgency else "HIGH"
    guidance = cat["guidance"].get(urg_key, cat["guidance"]["HIGH"])
    return {
        "category": cat["id"],
        "category_name": cat["name"],
        "urgency": urg_key,
        "headline": guidance["headline"],
        "primary_directive": guidance["primary_directive"],
        "steps": guidance["steps"],
        "dos": guidance["dos"],
        "donts": guidance["donts"],
        "call_helpline_now": (urg_key == "HIGH"),
        "helpline_numbers": {
            "Emergency Helpline (India)": "112",
            "Ambulance (India)": "108",
            "US / International": "911"
        }
    }

