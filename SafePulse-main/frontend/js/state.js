/**
 * SafePulse Central Reactive State Store
 */

const SafePulseState = {
  currentView: 'home', // 'home' | 'wizard' | 'critical' | 'result' | 'firstaid' | 'analytics' | 'history'
  activeCategory: null,
  categoryInfo: null,
  quickStepIndex: 0,
  quickAnswers: {},
  detailedAnswers: {
    severity: 2,
    extent: 2,
    duration: 10,
    breathing: 0,
    age_group: 'adult',
    pain_level: 5
  },
  latestResult: null,
  isOffline: !navigator.onLine,
  isDarkMode: localStorage.getItem('safepulse_theme') === 'dark',
  isVoiceMuted: localStorage.getItem('safepulse_voice_muted') === 'true',
  history: JSON.parse(localStorage.getItem('safepulse_history') || '[]'),
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(l => l(this));
  },

  setView(viewName) {
    this.currentView = viewName;
    this.notify();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setCategory(catId, catInfo) {
    this.activeCategory = catId;
    this.categoryInfo = catInfo;
    this.quickStepIndex = 0;
    this.quickAnswers = {};
    this.detailedAnswers = {
      severity: 2,
      extent: 2,
      duration: 10,
      breathing: 0,
      age_group: 'adult',
      pain_level: 5
    };
    this.notify();
  },

  setQuickAnswer(qid, val) {
    this.quickAnswers[qid] = val;
    this.notify();
  },

  setDetailedAnswer(field, val) {
    this.detailedAnswers[field] = val;
    // ponytail: form controls own their DOM, notify here kills slider drag
  },

  setResult(result) {
    this.latestResult = result;
    // Persist to local history
    const entry = {
      id: result.assessment_id,
      timestamp: result.timestamp || new Date().toISOString(),
      category: result.category,
      category_name: result.category_name,
      urgency: result.urgency,
      score: result.score,
      is_critical: result.is_critical,
      mode: result.mode
    };
    this.history.unshift(entry);
    if (this.history.length > 50) this.history.pop();
    localStorage.setItem('safepulse_history', JSON.stringify(this.history));
    this.notify();
  },

  clearHistory() {
    this.history = [];
    localStorage.removeItem('safepulse_history');
    this.notify();
  },

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('safepulse_theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('safepulse_theme', 'light');
    }
    this.notify();
  },

  setOnlineStatus(online) {
    this.isOffline = !online;
    this.notify();
  },

  toggleVoiceMute() {
    this.isVoiceMuted = !this.isVoiceMuted;
    localStorage.setItem('safepulse_voice_muted', this.isVoiceMuted ? 'true' : 'false');
    if (this.isVoiceMuted && typeof VoiceAssistant !== 'undefined') {
      VoiceAssistant.stopSpeaking();
    }
    this.notify();
  }
};

window.SafePulseState = SafePulseState;
