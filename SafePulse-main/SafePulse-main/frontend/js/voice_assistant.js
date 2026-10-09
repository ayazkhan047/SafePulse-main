/**
 * SafePulse Native SVG / CSS Multilingual AI Voice Assistant
 * Full voice interaction pipeline: Mic -> SpeechRecognition -> Triage Logic -> Response -> SpeechSynthesis
 * Supports: English, Hindi, Marathi, Tamil, Telugu
 * UI States: IDLE | LISTENING | PROCESSING | SPEAKING | ERROR
 */

const VoiceAssistant = {
  // State variables
  state: 'IDLE', // 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'
  currentLang: 'en-US',
  recognition: null,
  synth: window.speechSynthesis,
  activeUtterance: null,
  availableVoices: [],
  containerEl: null,
  lastError: null,
  lastTranscript: '',
  lastResponse: '',

  // Supported Languages Definition
  languages: {
    'en-US': { name: 'English', bcp47: 'en-US', fallbackPrefix: 'en' },
    'hi-IN': { name: 'हिंदी (Hindi)', bcp47: 'hi-IN', fallbackPrefix: 'hi' },
    'mr-IN': { name: 'मराठी (Marathi)', bcp47: 'mr-IN', fallbackPrefix: 'mr' },
    'ta-IN': { name: 'தமிழ் (Tamil)', bcp47: 'ta-IN', fallbackPrefix: 'ta' },
    'te-IN': { name: 'తెలుగు (Telugu)', bcp47: 'te-IN', fallbackPrefix: 'te' }
  },

  // Verified SafePulse Clinical Responses per Language
  emergencyResponses: {
    'cpr': {
      'en-US': "For CPR: Place the heel of your hand on the center of the patient's breastbone. Interlock your other hand on top. Push down hard and fast, at least 2 inches deep, at 110 beats per minute. Allow complete chest recoil between compressions. Starting the 110 BPM CPR pacing metronome now.",
      'hi-IN': "सीपीआर के लिए: अपने हाथ की हथेली मरीज की छाती के बीच में रखें। दूसरा हाथ ऊपर जोड़ें। 110 बीट्स प्रति मिनट की गति से कम से कम 2 इंच गहरा जोर से दबाएं। छाती को पूरी तरह वापस आने दें। सीपीआर क्लिकर शुरू कर रहे हैं।",
      'mr-IN': "सीपीआर साठी: रुग्णाच्या छातीच्या मध्यभागी तळहात ठेवा. दुसरा हात वर बांधा. प्रति मिनिट 110 वेगाने 2 इंच खोल दाबा. छाती पूर्णपणे वर येऊ द्या. सीपीआर पेसिंग सुरू करत आहोत.",
      'ta-IN': "சிபிஆர் செய்ய: நோயாளியின் மார்பின் மையத்தில் உங்கள் கையை வைக்கவும். நிமிடத்திற்கு 110 முறை வேகமாகவும் அழுத்தமாகவும் 2 அங்குல ஆழத்தில் அழுத்தவும். அமுக்கங்களுக்கு இடையில் மார்பு முழுமையாக உயரட்டும்.",
      'te-IN': "సిపిఆర్ కోసం: రోగి ఛాతీ మధ్యలో మీ అరచేతిని ఉంచండి. నిమిషానికి 110 బీట్ల వేగంతో 2 అంగుళాల లోతుగా గట్టిగా నొక్కండి. ప్రతీ నొక్కు మధ్య ఛాతీని పైకి రానివ్వండి."
    },
    'bleeding': {
      'en-US': "For heavy bleeding: Apply immediate, firm direct pressure with a clean cloth or sterile gauze. Do not remove soaked cloths—add more layers on top. If bleeding from an arm or leg is spurting or uncontrollable, apply a tourniquet 2 to 3 inches above the wound and call 112 or 911 immediately.",
      'hi-IN': "खून बहने पर: साफ कपड़े या गॉज से घाव पर सीधा और मजबूत दबाव डालें। भीगे कपड़े को न हटाएं, उसके ऊपर और कपड़ा लगाएं। यदि खून तेजी से बह रहा है, तो घाव से 2-3 इंच ऊपर कसकर पट्टी बांधें और तुरंत 112 पर कॉल करें।",
      'mr-IN': "जास्त रक्तस्रावासाठी: स्वच्छ कपड्याने जखमेवर थेट आणि जोरदार दाब द्या. भिजलेला कपडा काढू नका, त्यावर दुसरा थर लावा. रक्त थांबत नसल्यास जखमेच्या 2-3 इंच वर पट्टी बांधा आणि 112 वर त्वरित कॉल करा.",
      'ta-IN': "அதிக இரத்தப்போக்குக்கு: சுத்தமான துணியால் உடனடியாக உறுதியான அழுத்தத்தைப் பயன்படுத்துங்கள். நனைந்த துணியை அகற்ற வேண்டாம். இரத்தம் பீறிட்டு அடித்தால், காயத்திற்கு மேல் 2-3 அங்குலம் மேலே இறுக்கமாகக் கட்டி, உடனே 112 ஐ அழைக்கவும்.",
      'te-IN': "తీవ్రమైన రక్తస్రావం కోసం: శుభ్రమైన గుడ్డతో గాయంపై గట్టిగా ఒత్తిడి చేయండి. తడిసిన గుడ్డను తీయకండి. రక్తం ఆగకుండా చిమ్ముతుంటే, గాయానికి 2-3 అంగుళాల పైన కట్టు కట్టి వెంటనే 112 కు కాల్ చేయండి."
    },
    'burns': {
      'en-US': "For burns: Immediately cool the burn under gentle, running cool tap water for 15 to 20 minutes. Do not use ice, butter, oil, or toothpaste. Protect blisters without popping them, and cover loosely with clean cling film or sterile gauze.",
      'hi-IN': "जलने पर: जले हुए हिस्से को तुरंत 15 से 20 मिनट के लिए नल के ठंडे पानी के नीचे रखें। बर्फ, मक्खन, तेल या टूथपेस्ट का उपयोग कभी न करें। छालों को न फोड़ें और साफ कपड़े से ढकें।",
      'mr-IN': "भाजल्यावर: लगेच 15 ते 20 मिनिटे वाहत्या थंड पाण्याखाली ठेवा. बर्फ, तेल किंवा टूथपेस्ट वापरू नका. फोड फोडू नका आणि स्वच्छ कपड्याने सैल झाका.",
      'ta-IN': "தீக்காயத்திற்கு: 15 முதல் 20 நிமிடங்கள் குளிர்ந்த ஓடும் நீரில் வைக்கவும். ஐஸ், எண்ணெய் அல்லது பற்பசையைப் பயன்படுத்த வேண்டாம். கொப்புளங்களை உடைக்காதீர்கள்.",
      'te-IN': "కాలిన గాయాలకు: 15 నుండి 20 నిమిషాలు చల్లటి నీటి కింద ఉంచండి. మంచు, నూనె లేదా టూత్‌పేస్ట్‌ను ఉపయోగించవద్దు. బొబ్బలను పగలగొట్టవద్దు."
    },
    'choking': {
      'en-US': "For choking: If the person cannot speak or cough, lean them forward and deliver 5 sharp back blows between the shoulder blades. If still blocked, give 5 upward abdominal thrusts (Heimlich maneuver). If they lose consciousness, call 112 immediately and begin CPR.",
      'hi-IN': "दम घुटने पर: व्यक्ति को आगे झुकाएं और पीठ पर कंधों के बीच 5 बार जोरदार थपकी दें। फिर 5 बार पेट पर अंदर और ऊपर की ओर झटका दें। यदि वे बेहोश हो जाएं, तो तुरंत 112 पर कॉल करें और सीपीआर शुरू करें।",
      'mr-IN': "घशात अडकल्यास: व्यक्तीला पुढे झुकवून पाठीवर 5 जोराचे फटके द्या. त्यानंतर 5 पोटावर झटके द्या. बेशुद्ध झाल्यास 112 वर त्वरित कॉल करा आणि सीपीआर सुरू करा.",
      'ta-IN': "மூச்சுத் திணறல் ஏற்பட்டால்: நபரை முன்னோக்கி சாய்த்து முதுகில் 5 முறை தட்டவும். பிறகு 5 முறை அடிவயிற்றில் அழுத்தவும். மயக்கமடைந்தால், உடனே 112 ஐ அழைத்து சிபிஆர் தொடங்கவும்.",
      'te-IN': "గొంతులో ఏదైనా అడ్డుపడితే: రోగిని ముందుకు వంచి వీపుపై 5 సార్లు బలంగా కొట్టండి. అప్పటికీ రాకపోతే పొట్టపై 5 సార్లు నొక్కండి. స్పృహ కోల్పోతే వెంటనే 112 కు కాల్ చేసి సిపిఆర్ ప్రారంభించండి."
    },
    'injury': {
      'en-US': "For serious injury or fracture: Do not attempt to straighten broken bones or push exposed bones back in. Immobilize the limb in the position found using a splint or rolled towel. Apply cold compresses to reduce swelling and call 112 or visit an emergency room.",
      'hi-IN': "गंभीर चोट या हड्डी टूटने पर: हड्डी को सीधा करने की कोशिश न करें। अंग को उसी स्थिति में तौलिए या खपच्ची से स्थिर रखें। सूजन कम करने के लिए ठंडी सिकाई करें और तुरंत 112 पर कॉल करें या अस्पताल जाएं।",
      'mr-IN': "हाड मोडल्यास किंवा गंभीर दुखापतीवर: हाड सरळ करण्याचा प्रयत्न करू नका. अवयव स्थिर ठेवा. सूज कमी करण्यासाठी थंड शेक द्या आणि ताबडतोब रुग्णालयात जा.",
      'ta-IN': "எலும்பு முறிந்தால்: எலும்பை நேராக்க முயற்சிக்காதீர்கள். அதை அசைக்காமல் வைத்து உடனே மருத்துவமனைக்குச் செல்லுங்கள் அல்லது 112 ஐ அழைக்கவும்.",
      'te-IN': "ఎముక విరిగితే: ఎముకను సరిచేయడానికి ప్రయత్నించవద్దు. ఆ భాగాన్ని కదలకుండా ఉంచి వెంటనే 112 కు కాల్ చేయండి లేదా ఆసుపత్రికి వెళ్ళండి."
    },
    'sos': {
      'en-US': "Dialing emergency helpline 112. Put your phone on speakerphone now so your hands remain free to care for the patient.",
      'hi-IN': "आपातकालीन हेल्पलाइन 112 पर कॉल करें। अपने फोन को स्पीकर पर रखें ताकि आपके हाथ मरीज की देखभाल के लिए खाली रहें।",
      'mr-IN': "आपत्कालीन हेल्पलाइन 112 डायल करा. फोन स्पीकरवर ठेवा जेणेकरून तुमचे हात रुग्णाला मदत करण्यासाठी मोकळे राहतील.",
      'ta-IN': "அவசர உதவி எண் 112 ஐ அழைக்கவும். உங்கள் கைகள் நோயாளியைக் கவனிக்க ஏதுவாக ஃபோனை ஸ்பீக்கரில் வைக்கவும்.",
      'te-IN': "అత్యవసర హెల్ప్‌లైన్ 112 కు కాల్ చేయండి. రోగికి సహాయం చేయడానికి మీ చేతులు ఖాళీగా ఉండేలా ఫోన్‌ను స్పీకర్‌పై ఉంచండి."
    },
    'general': {
      'en-US': "SafePulse is active. What is the emergency? You can say Heavy Bleeding, Burns, Choking, Cardiac Emergency, or Serious Injury. Or ask: 'How do I stop bleeding?' or 'Start CPR'.",
      'hi-IN': "सेफपल्स तैयार है। क्या आपात स्थिति है? आप बोल सकते हैं: खून बहना, जलना, दम घुटना, दिल का दौरा, या गंभीर चोट। या पूछें: 'सीपीआर कैसे करें?' या 'खून कैसे रोकें?'",
      'mr-IN': "सेफपल्स सुरू आहे. काय आपत्कालीन परिस्थिती आहे? तुम्ही विचारू शकता: रक्तस्राव, भाजणे, श्वास अडकणे, हृदयविकार किंवा दुखापत.",
      'ta-IN': "சேஃப்பல்ஸ் தயாராக உள்ளது. என்ன அவசரநிலை? இரத்தப்போக்கு, தீக்காயம், மூச்சுத் திணறல், மாரடைப்பு அல்லது காயம் என்று நீங்கள் கூறலாம்.",
      'te-IN': "సేఫ్‌పల్స్ సిద్ధంగా ఉంది. అత్యవసర పరిస్థితి ఏమిటి? రక్తస్రావం, కాలిన గాయాలు, ఉక్కిరిబిక్కిరి, గుండెపోటు లేదా తీవ్ర గాయం గురించి మీరు అడగవచ్చు."
    }
  },

  init(containerEl) {
    this.containerEl = containerEl;
    this.initVoices();
    this.renderUI();
  },

  initVoices() {
    if (!this.synth) return;
    const populateVoices = () => {
      this.availableVoices = this.synth.getVoices();
    };
    populateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = populateVoices;
    }
  },

  setLanguage(langCode) {
    if (this.languages[langCode]) {
      this.currentLang = langCode;
      if (this.recognition) {
        this.recognition.lang = langCode;
      }
      this.renderUI();
    }
  },

  setState(newState, errorMsg = null) {
    this.state = newState;
    this.lastError = errorMsg;
    this.updateUIState();
  },

  renderUI() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="voice-assistant-card state-${this.state.toLowerCase()}" id="voiceCard">
        <!-- Header with State Indicator & Language Selector -->
        <div class="flex justify-between items-center" style="margin-bottom:14px;flex-wrap:wrap;gap:10px;">
          <div style="text-align:left;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="hero-badge" style="background:var(--blue-100);color:var(--blue-600);margin:0;">
                Clinical Voice Interaction
              </span>
              <!-- State Indicator Badge -->
              <span class="voice-state-badge badge-${this.state.toLowerCase()}" id="voiceStateBadge">
                ${this.state}
              </span>
            </div>
            <h4 style="font-size:18px;margin-top:4px;">SafePulse Hands-Free Voice Assistant</h4>
          </div>

          <!-- Language Selector -->
          <div style="display:flex;align-items:center;gap:6px;">
            <label for="voiceLangSelect" style="font-size:12px;font-weight:700;color:var(--text-muted);">Language:</label>
            <select id="voiceLangSelect" class="btn-secondary" style="padding:6px 10px;font-size:12.5px;border-radius:var(--radius-sm);" onchange="VoiceAssistant.setLanguage(this.value)">
              ${Object.keys(this.languages).map(code => `
                <option value="${code}" ${code === this.currentLang ? 'selected' : ''}>${this.languages[code].name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Pure Native SVG Voice Orb with Dynamic Radial Glow & Rings (NO GIF!) -->
        <div class="voice-orb-container" id="voiceOrbContainer" onclick="VoiceAssistant.handleOrbClick()">
          <svg class="svg-voice-orb" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6" />
                <stop offset="50%" stop-color="#e03145" />
                <stop offset="100%" stop-color="#8b5cf6" />
              </linearGradient>
              <radialGradient id="orbCoreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
                <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.6" />
                <stop offset="100%" stop-color="#e03145" stop-opacity="0" />
              </radialGradient>
              <filter id="orbGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- Outer Pulsing Orbit Rings -->
            <circle class="orb-ring-outer" cx="80" cy="80" r="70" fill="none" stroke="url(#orbGrad)" stroke-width="2" stroke-dasharray="8 6" opacity="0.5" />
            <circle class="orb-ring-mid" cx="80" cy="80" r="56" fill="none" stroke="rgba(37,99,235,0.4)" stroke-width="1.5" />

            <!-- Core Glowing Plasma Sphere -->
            <circle class="orb-core" cx="80" cy="80" r="44" fill="url(#orbGrad)" filter="url(#orbGlowFilter)" />
            <circle cx="80" cy="80" r="30" fill="url(#orbCoreGlow)" />

            <!-- Audio Waveform Graphic Path -->
            <path class="orb-sine-wave" d="M 48 80 Q 64 62, 80 80 T 112 80" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" />
          </svg>
        </div>

        <!-- Dynamic Audio Waveform Bars -->
        <div class="audio-wave-bars" id="audioWaveBars">
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
        </div>

        <!-- User Spoken Transcript Box -->
        <div style="text-align:left;margin-bottom:12px;">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;">
            User Transcript:
          </div>
          <div class="voice-transcript-box" id="voiceTranscriptBox">
            ${this.lastTranscript ? `"${this.lastTranscript}"` : 'Press the microphone or speak "What should I do?"'}
          </div>
        </div>

        <!-- Assistant Clinical Response Box -->
        <div style="text-align:left;margin-bottom:16px;">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;">
            SafePulse Guidance Response:
          </div>
          <div class="voice-response-box" id="voiceResponseBox">
            ${this.lastResponse ? this.lastResponse : 'Assistant response will appear here and be spoken aloud.'}
          </div>
        </div>

        <!-- Controls & Action Buttons -->
        <div class="flex items-center justify-between" style="flex-wrap:wrap;gap:10px;">
          <div style="display:flex;gap:10px;align-items:center;">
            <button id="btnVoiceMic" class="btn-primary" style="padding:10px 20px;font-size:14px;" onclick="VoiceAssistant.startInteraction()">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z"/></svg>
              <span id="btnMicLabel">${this.state === 'LISTENING' ? 'Listening... Tap to Cancel' : 'Speak to Assistant'}</span>
            </button>

            <!-- Stop Speaking Button (Shown when speaking) -->
            <button id="btnStopSpeaking" class="btn-secondary ${this.state === 'SPEAKING' ? '' : 'hidden'}" style="padding:10px 16px;font-size:13px;border-color:var(--red-500);color:var(--red-500);" onclick="VoiceAssistant.stopSpeaking()">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"/></svg>
              <span>Stop Speaking</span>
            </button>

            <!-- Retry Button (Shown on error) -->
            <button id="btnRetryVoice" class="btn-secondary ${this.state === 'ERROR' ? '' : 'hidden'}" style="padding:10px 16px;font-size:13px;border-color:var(--amber-500);color:var(--amber-600);" onclick="VoiceAssistant.retry()">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Retry Microphone</span>
            </button>
          </div>

          <!-- Quick Test Simulation Input for Environments Without Mic or Automated Tests -->
          <div style="display:flex;gap:6px;align-items:center;">
            <input type="text" id="voiceTestInput" placeholder="Or type e.g. What should I do?" class="btn-secondary" style="padding:8px 12px;font-size:13px;border-radius:var(--radius-sm);max-width:240px;cursor:text;" onkeydown="if(event.key==='Enter') VoiceAssistant.simulateSpokenText(this.value);" />
            <button class="btn-secondary" style="padding:8px 12px;font-size:13px;" onclick="const el=document.getElementById('voiceTestInput'); if(el) VoiceAssistant.simulateSpokenText(el.value);">
              Send
            </button>
          </div>
        </div>

        <!-- Error Message Bar -->
        ${this.lastError ? `
          <div class="voice-error-banner" id="voiceErrorBanner" style="margin-top:14px;padding:10px 14px;background:var(--red-100);border:1px solid var(--red-500);border-radius:var(--radius-sm);color:var(--red-600);font-size:13px;text-align:left;">
            <b>Error:</b> ${this.lastError}
          </div>
        ` : ''}
      </div>
    `;
  },

  updateUIState() {
    const card = document.getElementById('voiceCard');
    const badge = document.getElementById('voiceStateBadge');
    const micLabel = document.getElementById('btnMicLabel');
    const stopBtn = document.getElementById('btnStopSpeaking');
    const retryBtn = document.getElementById('btnRetryVoice');
    const transcriptBox = document.getElementById('voiceTranscriptBox');
    const responseBox = document.getElementById('voiceResponseBox');

    if (card) {
      card.className = `voice-assistant-card state-${this.state.toLowerCase()}`;
    }

    if (badge) {
      badge.className = `voice-state-badge badge-${this.state.toLowerCase()}`;
      badge.textContent = this.state;
    }

    if (micLabel) {
      if (this.state === 'LISTENING') micLabel.textContent = 'Listening... (Tap to Stop)';
      else if (this.state === 'PROCESSING') micLabel.textContent = 'Processing Query...';
      else if (this.state === 'SPEAKING') micLabel.textContent = 'Speaking...';
      else micLabel.textContent = 'Speak to Assistant';
    }

    if (stopBtn) {
      if (this.state === 'SPEAKING') stopBtn.classList.remove('hidden');
      else stopBtn.classList.add('hidden');
    }

    if (retryBtn) {
      if (this.state === 'ERROR') retryBtn.classList.remove('hidden');
      else retryBtn.classList.add('hidden');
    }

    if (transcriptBox && this.lastTranscript) {
      transcriptBox.innerHTML = `"${this.lastTranscript}"`;
    }

    if (responseBox && this.lastResponse) {
      responseBox.textContent = this.lastResponse;
    }
  },

  handleOrbClick() {
    if (this.state === 'SPEAKING') {
      this.stopSpeaking();
    } else if (this.state === 'LISTENING') {
      this.cancelListening();
    } else {
      this.startInteraction();
    }
  },

  async startInteraction() {
    // If speaking, stop speaking first
    if (this.state === 'SPEAKING') {
      this.stopSpeaking();
      return;
    }

    // If already listening, cancel
    if (this.state === 'LISTENING') {
      this.cancelListening();
      return;
    }

    // Step 1: Check browser speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.setState('ERROR', 'Web Speech Recognition is not supported in this browser. Please use Chrome, Edge, or the text simulation input.');
      return;
    }

    // Step 2: Request Microphone Permission via MediaDevices
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release test stream
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.warn('[Voice Assistant] getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.setState('ERROR', 'Microphone permission was denied. Please allow microphone access in your browser address bar.');
        return;
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        this.setState('ERROR', 'No microphone hardware found on this system. You can test voice responses using the input box.');
        return;
      }
      // If error is not critical, continue to try SpeechRecognition directly
    }

    // Step 3: Initialize SpeechRecognition instance
    try {
      if (this.recognition) {
        try { this.recognition.abort(); } catch (e) {}
      }

      this.recognition = new SpeechRecognition();
      this.recognition.lang = this.currentLang;
      this.recognition.continuous = false; // Single utterance mode is most reliable
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      // Event Handlers
      this.recognition.onstart = () => {
        this.setState('LISTENING');
        const box = document.getElementById('voiceTranscriptBox');
        if (box) box.textContent = 'Listening for your voice... (Say: "What should I do?")';
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          const box = document.getElementById('voiceTranscriptBox');
          if (box) box.textContent = `"${currentText}"`;
        }

        if (finalTranscript) {
          this.processUserTranscript(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[Voice Assistant] Recognition error event:', event.error);
        if (event.error === 'no-speech') {
          // No speech detected, safely return to IDLE without getting stuck
          this.setState('IDLE');
          const box = document.getElementById('voiceTranscriptBox');
          if (box) box.textContent = 'No speech detected. Press the microphone button to try again.';
        } else if (event.error === 'not-allowed') {
          this.setState('ERROR', 'Microphone permission denied. Please enable microphone permissions in your browser.');
        } else if (event.error === 'audio-capture') {
          this.setState('ERROR', 'No microphone was found or microphone is busy.');
        } else if (event.error === 'network') {
          this.setState('ERROR', 'Network error during speech recognition. Ensure you are connected.');
        } else {
          this.setState('ERROR', `Recognition error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        // If recognition ends while in LISTENING without a final result
        if (this.state === 'LISTENING') {
          this.setState('IDLE');
        }
      };

      // Step 4: Start recognition
      this.recognition.start();

    } catch (e) {
      console.error('[Voice Assistant] Failed to start recognition:', e);
      this.setState('ERROR', `Failed to start microphone: ${e.message}`);
    }
  },

  cancelListening() {
    if (this.recognition) {
      try { this.recognition.abort(); } catch (e) {}
    }
    this.setState('IDLE');
  },

  retry() {
    this.lastError = null;
    this.setState('IDLE');
    this.startInteraction();
  },

  // Process user speech & route through SafePulse triage/guidance logic
  processUserTranscript(transcript) {
    this.lastTranscript = transcript;
    this.setState('PROCESSING');

    // Simulate micro-delay for realistic natural processing
    setTimeout(() => {
      const response = this.generateClinicalResponse(transcript);
      this.lastResponse = response;
      this.speakResponse(response);
    }, 250);
  },

  // Simulates spoken text directly for automated tests and headless environments
  simulateSpokenText(text) {
    if (!text || !text.trim()) return;
    this.processUserTranscript(text.trim());
  },

  // Clinical Response Generation aligned with SafePulse PRD Knowledge
  generateClinicalResponse(rawText) {
    const text = rawText.toLowerCase().trim();
    const activeCat = SafePulseState.activeCategory;
    const lang = this.currentLang;

    // 1. CPR / Cardiac Specific Intent
    if (
      text.includes('cpr') ||
      text.includes('chest compression') ||
      text.includes('heart beat') ||
      (activeCat === 'cardiac' && (text.includes('what should i do') || text.includes('help') || text.includes('steps'))) ||
      text.includes('दिल') || text.includes('हृदय') || text.includes('मराठी') && text.includes('छाती')
    ) {
      // Trigger CPR Metronome if user asks to start CPR
      setTimeout(() => {
        const visual = document.getElementById('metronomeVisualizer');
        if (typeof AudioMetronome !== 'undefined' && !AudioMetronome.isRunning) {
          AudioMetronome.start(visual);
          const btnText = document.getElementById('metronomeBtnText');
          if (btnText) btnText.textContent = "Stop CPR Clicker";
        }
      }, 500);

      // If on home, switch to cardiac
      if (!activeCat) {
        SafePulseApp.startCategoryAssessment('cardiac');
      }

      return this.emergencyResponses.cpr[lang] || this.emergencyResponses.cpr['en-US'];
    }

    // 2. Heavy Bleeding Specific Intent
    if (
      text.includes('bleed') ||
      text.includes('blood') ||
      text.includes('wound') ||
      text.includes('cut') ||
      (activeCat === 'bleeding' && (text.includes('what should i do') || text.includes('stop') || text.includes('pressure'))) ||
      text.includes('खून') || text.includes('रक्त') || text.includes('இரத்தம்') || text.includes('రక్తం')
    ) {
      if (!activeCat) {
        SafePulseApp.startCategoryAssessment('bleeding');
      }
      return this.emergencyResponses.bleeding[lang] || this.emergencyResponses.bleeding['en-US'];
    }

    // 3. Burns Specific Intent
    if (
      text.includes('burn') ||
      text.includes('fire') ||
      text.includes('scald') ||
      text.includes('hot water') ||
      (activeCat === 'burns' && (text.includes('what should i do') || text.includes('cool') || text.includes('ice'))) ||
      text.includes('जल') || text.includes('भाज') || text.includes('தீ') || text.includes('కాలిన')
    ) {
      if (!activeCat) {
        SafePulseApp.startCategoryAssessment('burns');
      }
      return this.emergencyResponses.burns[lang] || this.emergencyResponses.burns['en-US'];
    }

    // 4. Choking Specific Intent
    if (
      text.includes('chok') ||
      text.includes('throat') ||
      text.includes('cannot breathe') ||
      text.includes('heimlich') ||
      (activeCat === 'choking' && text.includes('what should i do')) ||
      text.includes('दम') || text.includes('श्वास') || text.includes('திணறல்') || text.includes('ఉక్కిరి')
    ) {
      if (!activeCat) {
        SafePulseApp.startCategoryAssessment('choking');
      }
      return this.emergencyResponses.choking[lang] || this.emergencyResponses.choking['en-US'];
    }

    // 5. Serious Injury / Fracture Intent
    if (
      text.includes('bone') ||
      text.includes('fracture') ||
      text.includes('break') ||
      text.includes('fall') ||
      text.includes('sprain') ||
      (activeCat === 'injury' && text.includes('what should i do')) ||
      text.includes('हड्डी') || text.includes('हाड') || text.includes('எலும்பு') || text.includes('గాయం')
    ) {
      if (!activeCat) {
        SafePulseApp.startCategoryAssessment('injury');
      }
      return this.emergencyResponses.injury[lang] || this.emergencyResponses.injury['en-US'];
    }

    // 6. Direct Emergency Call / SOS Intent
    if (
      text.includes('call') ||
      text.includes('ambulance') ||
      text.includes('112') ||
      text.includes('911') ||
      text.includes('emergency service') ||
      text.includes('हेल्पलाइन') || text.includes('मदत') || text.includes('உதவி')
    ) {
      window.location.href = 'tel:112';
      return this.emergencyResponses.sos[lang] || this.emergencyResponses.sos['en-US'];
    }

    // 7. Contextual "What should I do?" when inside an active category assessment
    if (activeCat && (text.includes('what should i do') || text.includes('what to do') || text.includes('help me'))) {
      if (activeCat === 'bleeding') return this.emergencyResponses.bleeding[lang] || this.emergencyResponses.bleeding['en-US'];
      if (activeCat === 'burns') return this.emergencyResponses.burns[lang] || this.emergencyResponses.burns['en-US'];
      if (activeCat === 'choking') return this.emergencyResponses.choking[lang] || this.emergencyResponses.choking['en-US'];
      if (activeCat === 'cardiac') return this.emergencyResponses.cpr[lang] || this.emergencyResponses.cpr['en-US'];
      if (activeCat === 'injury') return this.emergencyResponses.injury[lang] || this.emergencyResponses.injury['en-US'];
    }

    // 8. Default Triage Assistance
    return this.emergencyResponses.general[lang] || this.emergencyResponses.general['en-US'];
  },

  // Text-To-Speech Output via Web Speech Synthesis API
  speakResponse(text) {
    if (typeof SafePulseState !== 'undefined' && SafePulseState.isVoiceMuted) {
      this.setState('IDLE');
      return;
    }

    if (!this.synth) {
      this.setState('IDLE');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    this.setState('SPEAKING');

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.lang = this.currentLang;

    // Pick best matching installed voice for selected language
    if (this.availableVoices.length > 0) {
      const langConfig = this.languages[this.currentLang];
      // 1st Priority: Exact BCP-47 match (e.g. 'hi-IN')
      let matchedVoice = this.availableVoices.find(v => v.lang === langConfig.bcp47 || v.lang.replace('_', '-') === langConfig.bcp47);
      // 2nd Priority: Prefix match (e.g. 'hi')
      if (!matchedVoice && langConfig.fallbackPrefix) {
        matchedVoice = this.availableVoices.find(v => v.lang.startsWith(langConfig.fallbackPrefix));
      }
      // 3rd Priority: Any Indian voice (en-IN) as natural regional fallback
      if (!matchedVoice) {
        matchedVoice = this.availableVoices.find(v => v.lang.includes('IN') || v.lang.includes('en'));
      }
      if (matchedVoice) {
        utter.voice = matchedVoice;
      }
    }

    utter.onstart = () => {
      this.setState('SPEAKING');
    };

    utter.onend = () => {
      this.activeUtterance = null;
      this.setState('IDLE');
    };

    utter.onerror = (e) => {
      console.warn('[Voice Assistant] TTS error:', e);
      this.activeUtterance = null;
      this.setState('IDLE');
    };

    this.activeUtterance = utter;
    this.synth.speak(utter);
  },

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.activeUtterance = null;
    this.setState('IDLE');
  },

  speak(text) {
    this.speakResponse(text);
  }
};

window.VoiceAssistant = VoiceAssistant;
