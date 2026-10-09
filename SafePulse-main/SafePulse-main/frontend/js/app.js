/**
 * SafePulse Main Application Controller
 * Handles SPA navigation, views, offline protocol hooks & event delegation
 */

const SafePulseApp = {
  categories: [],

  async init() {
    console.log('[SafePulse] Initializing Data-Driven Emergency Response System');

    // 1. Initialize State & Theme
    if (SafePulseState.isDarkMode) {
      document.body.classList.add('dark-mode');
    }

    // 2. Setup Connectivity Listeners
    window.addEventListener('online', () => {
      SafePulseState.setOnlineStatus(true);
      this.updateProtocolBadge();
    });
    window.addEventListener('offline', () => {
      SafePulseState.setOnlineStatus(false);
      this.updateProtocolBadge();
    });

    // 3. Register Service Worker for Phantom Protocol
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('[Phantom Protocol] Service Worker registered successfully.');
      }).catch(err => {
        console.warn('[Phantom Protocol] Service Worker registration failed:', err);
      });
    }

    // 4. Initialize Edge Engines & Submodules
    await PhantomEngine.init();
    TriageWizard.init(document.getElementById('wizardView'));
    FirstAidView.init(document.getElementById('firstAidView'));
    AnalyticsView.init(document.getElementById('analyticsView'));

    // 5. Fetch Categories
    this.categories = await SafePulseAPI.getEmergencies();

    // 6. Subscribe to State Changes for View Routing
    SafePulseState.subscribe((state) => {
      this.handleStateChange(state);
    });

    // 7. Initial Render
    this.renderHome();
    this.updateProtocolBadge();

    // 8. Bind global voice navigation events
    window.addEventListener('safepulse:voice_action', (e) => {
      const act = e.detail.action;
      if (act === 'select_category' && e.detail.category) {
        this.startCategoryAssessment(e.detail.category);
      } else if (act === 'sos') {
        window.location.href = 'tel:112';
      }
    });
  },

  updateProtocolBadge() {
    const badge = document.getElementById('protocolBadge');
    if (!badge) return;
    if (SafePulseState.isOffline) {
      badge.className = 'protocol-pill offline';
      badge.innerHTML = `<span class="dot"></span><span>PHANTOM PROTOCOL (OFFLINE EDGE)</span>`;
    } else {
      badge.className = 'protocol-pill';
      badge.innerHTML = `<span class="dot"></span><span>SYSTEM ONLINE (ML CLOUD ACTIVE)</span>`;
    }
  },

  handleStateChange(state) {
    const screens = ['homeView', 'wizardView', 'criticalView', 'resultView', 'firstAidView', 'analyticsView', 'historyView'];
    screens.forEach(s => {
      const el = document.getElementById(s);
      if (el) el.classList.add('hidden');
    });

    const activeId = state.currentView === 'firstaid' ? 'firstAidView' : `${state.currentView}View`;
    const activeEl = document.getElementById(activeId);
    if (activeEl) {
      activeEl.classList.remove('hidden');
    }

    // Trigger subview renderers
    if (state.currentView !== 'firstaid' && typeof AudioMetronome !== 'undefined' && AudioMetronome.isRunning) {
      AudioMetronome.stop();
    }

    if (state.currentView === 'home') {
      this.renderHome();
    } else if (state.currentView === 'wizard') {
      TriageWizard.render();
    } else if (state.currentView === 'critical') {
      this.renderCriticalAlert();
    } else if (state.currentView === 'result') {
      this.renderResultHUD();
    } else if (state.currentView === 'firstaid') {
      FirstAidView.render();
    } else if (state.currentView === 'analytics') {
      AnalyticsView.render();
    } else if (state.currentView === 'history') {
      this.renderHistory();
    }

    // Update active nav tabs
    document.querySelectorAll('.nav-link').forEach(link => {
      const view = link.getAttribute('data-view');
      if (view === state.currentView) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  renderHome() {
    const container = document.getElementById('homeView');
    if (!container) return;

    container.innerHTML = `
      <!-- Hero Banner -->
      <section class="hero-banner">
        <div class="hero-content">
          <div class="hero-badge">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/></svg>
            Priority-First Emergency Response
          </div>
          <h2>Immediate, Clinical Triage Guidance When Seconds Count.</h2>
          <p>
            SafePulse removes cognitive panic during critical medical events. Answer a few high-priority questions to receive real-time urgency classification, verified first-aid instructions, and automatic escalation pathways.
          </p>
          <div class="hero-actions">
            <button class="btn-sos" onclick="SafePulseApp.startCategoryAssessment('cardiac')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <span>Instant Cardiac / CPR Assessment</span>
            </button>
            <button class="btn-secondary" onclick="SafePulseState.setView('analytics')">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <span>View ML Model Analytics</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Category Selection Title -->
      <div class="section-title">
        <div>
          <h3>Select an Emergency Category</h3>
          <p>Choose the closest scenario to initiate priority-first triage</p>
        </div>
      </div>

      <!-- 5 Emergency Categories Grid -->
      <div class="category-grid">
        ${this.categories.map(cat => `
          <div class="category-card" style="--cat-color: ${cat.color}; --cat-bg: ${cat.color}15;" onclick="SafePulseApp.startCategoryAssessment('${cat.id}')">
            <div class="category-icon-box">
              ${this.getCategoryIconSvg(cat.icon)}
            </div>
            <h4>${cat.name}</h4>
            <p>${cat.description}</p>
            <span class="category-action-link">
              Start Assessment &rarr;
            </span>
          </div>
        `).join('')}
      </div>

      <!-- Hands-free Native SVG Voice Assistant Box (NO GIF!) -->
      <div id="voiceAssistantContainer"></div>
    `;

    // Mount Voice Assistant inside home screen
    VoiceAssistant.init(document.getElementById('voiceAssistantContainer'));
  },

  getCategoryIconSvg(iconName) {
    if (iconName === 'droplet') {
      return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>`;
    } else if (iconName === 'flame') {
      return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>`;
    } else if (iconName === 'wind') {
      return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/></svg>`;
    } else if (iconName === 'heart-pulse') {
      return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`;
    } else {
      return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`;
    }
  },

  async startCategoryAssessment(catId) {
    try {
      const qData = await SafePulseAPI.getCategoryQuestions(catId);
      SafePulseState.setCategory(catId, qData);
      SafePulseState.setView('wizard');
    } catch (e) {
      console.error('Failed to load questions:', e);
      alert('Could not load assessment questions. Please try again.');
    }
  },

  // Priority-First Safety Gate Escalation Screen
  renderCriticalAlert() {
    const container = document.getElementById('criticalView');
    const r = SafePulseState.latestResult;
    if (!container || !r) return;

    container.innerHTML = `
      <div class="critical-alert-box">
        <div class="critical-header">
          <div class="critical-header-icon">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div>
            <span class="hero-badge" style="background:var(--red-500);color:#fff;margin:0;">IMMEDIATE CRITICAL ESCALATION</span>
            <h3 style="margin-top:4px;">High-Priority Emergency Detected</h3>
          </div>
        </div>

        <div class="critical-body">
          <p style="font-weight:700;font-size:17px;color:var(--red-600);">
            ${r.critical_reason || 'Severe life-threatening clinical sign detected during priority screening.'}
          </p>
          <p>
            <b>Do NOT spend time answering further questions.</b> Put your mobile phone on speakerphone immediately and call emergency services. Administer the direct life-saving steps below while responders are in route.
          </p>
        </div>

        <div class="critical-actions">
          <a href="tel:112" class="btn-critical-call">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            CALL 112 (INDIA)
          </a>
          <a href="tel:911" class="btn-critical-call" style="background:var(--red-600);">
            CALL 911 (US / INT'L)
          </a>
          <button class="btn-primary" style="background:var(--text-primary);" onclick="SafePulseState.setView('firstaid')">
            <span>View Immediate Step-by-Step Actions</span>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>
    `;

    VoiceAssistant.speak("Critical emergency detected. Call emergency services immediately. Put the phone on speakerphone.");
  },

  // Urgency Result HUD
  async renderResultHUD() {
    const container = document.getElementById('resultView');
    const r = SafePulseState.latestResult;
    if (!container || !r) return;

    const meterPos = Math.round(r.score * 100);
    const smsPayload = await PhantomEngine.generateDistressPayload(r);

    container.innerHTML = `
      <div class="result-hud">
        <div class="hud-card">
          <div class="hud-header">
            <div>
              <span class="hero-badge" style="background:var(--surface-alt);color:var(--text-secondary);margin-bottom:6px;">
                Assessment ID: ${r.assessment_id} &bull; ${r.mode}
              </span>
              <h2 style="font-size:26px;">Triage Assessment Complete</h2>
              <p style="font-size:14px;color:var(--text-muted);">${r.category_name} Scenario</p>
            </div>
            <span class="urgency-badge ${r.urgency}">${r.urgency} URGENCY</span>
          </div>

          <!-- Continuous Urgency Probability Gauge -->
          <div class="urgency-meter-wrap">
            <div class="flex justify-between items-center" style="margin-bottom:6px;font-size:13.5px;font-weight:700;">
              <span>Calculated Urgency Index</span>
              <span style="font-family:var(--font-mono);color:var(--text-primary);">${r.score.toFixed(2)} / 1.00 (Confidence: ${(r.confidence * 100).toFixed(0)}%)</span>
            </div>
            <div class="urgency-meter-track">
              <div class="urgency-meter-pointer" style="left: ${meterPos}%;"></div>
            </div>
            <div class="meter-labels">
              <span>LOW (<0.35)</span>
              <span>MODERATE (0.35 - 0.70)</span>
              <span>HIGH (>0.70)</span>
            </div>
          </div>

          <!-- Clinical Directive -->
          <div style="background:var(--surface-alt);border-radius:var(--radius-md);padding:18px;margin:20px 0;">
            <b style="font-size:15px;display:block;margin-bottom:4px;color:var(--text-primary);">Primary Clinical Recommendation:</b>
            <p style="font-size:14.5px;color:var(--text-secondary);">${r.primary_action}</p>
            <p style="font-size:13px;color:var(--text-muted);margin-top:6px;"><b>Escalation Advice:</b> ${r.medical_escalation}</p>
          </div>

          <!-- Recommended Response Pathways -->
          <h3 style="font-size:18px;margin-bottom:10px;">Recommended Response Pathways:</h3>
          <div class="pathway-list">
            ${r.recommended_pathway.map(step => `
              <div class="pathway-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>${step}</span>
              </div>
            `).join('')}
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center" style="border-top:1px solid var(--border-subtle);padding-top:24px;margin-top:24px;flex-wrap:wrap;gap:12px;">
            <button class="btn-secondary" onclick="SafePulseState.setView('home')">
              &larr; Return to Dashboard
            </button>
            <button class="btn-primary" style="padding:14px 28px;" onclick="SafePulseState.setView('firstaid')">
              <span>View Full Step-by-Step Guidance</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        </div>

        <!-- Phantom Protocol Offline Distress Beacon Card -->
        <div class="phantom-beacon-box">
          <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:8px;">
            <div>
              <span class="phantom-tag">&#9889; Phantom Protocol SOS Beacon</span>
              <h4 style="font-size:17px;">Offline Emergency Distress SMS Payload</h4>
              <p style="font-size:13px;color:var(--text-muted);">
                When mobile data and web connectivity are lost, native cellular SMS and GPS beacons function.
              </p>
            </div>
            <button class="btn-secondary" style="font-size:12.5px;padding:8px 14px;" onclick="SafePulseApp.copySmsPayload()">
              Copy SMS Text
            </button>
          </div>

          <div class="sms-payload-box" id="smsPayloadBox">${smsPayload}</div>

          <div class="flex gap-sm">
            <a href="sms:112?body=${encodeURIComponent(smsPayload)}" class="btn-secondary" style="font-size:13px;padding:10px 16px;">
              Open Native SMS App
            </a>
            <button class="btn-secondary" style="font-size:13px;padding:10px 16px;border-color:var(--amber-500);color:var(--amber-600);" onclick="PhantomEngine.startVisualStrobe()">
              Activate Night Visual Strobe
            </button>
          </div>
        </div>
      </div>
    `;

    VoiceAssistant.speak(`Urgency classified as ${r.urgency}. ${r.primary_action}`);
  },

  copySmsPayload() {
    const box = document.getElementById('smsPayloadBox');
    if (box) {
      navigator.clipboard.writeText(box.textContent);
      alert('Emergency SMS payload copied to clipboard!');
    }
  },

  renderHistory() {
    const container = document.getElementById('historyView');
    if (!container) return;
    const history = SafePulseState.history;

    container.innerHTML = `
      <div style="max-width:840px;margin:30px auto 0;">
        <div class="flex justify-between items-center" style="margin-bottom:20px;">
          <div>
            <h2 style="font-size:26px;">Local Assessment Audit Vault</h2>
            <p style="font-size:14px;color:var(--text-muted);">Stored privately on this device's local storage.</p>
          </div>
          ${history.length > 0 ? `
            <button class="btn-secondary" style="font-size:13px;padding:8px 16px;" onclick="SafePulseState.clearHistory()">
              Clear Local History
            </button>
          ` : ''}
        </div>

        ${history.length === 0 ? `
          <div class="hud-card" style="text-align:center;padding:48px 24px;">
            <p style="font-size:16px;margin-bottom:16px;">No emergency assessments recorded yet.</p>
            <button class="btn-primary" onclick="SafePulseState.setView('home')">Start First Assessment</button>
          </div>
        ` : `
          <div class="hud-card" style="padding:0;overflow:hidden;">
            <table class="cm-table" style="text-align:left;">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Emergency Type</th>
                  <th>Urgency</th>
                  <th>Score</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                ${history.map(item => `
                  <tr>
                    <td style="font-family:var(--font-mono);font-size:12px;">${new Date(item.timestamp).toLocaleString()}</td>
                    <td><b>${item.category_name}</b></td>
                    <td><span class="urgency-badge ${item.urgency}" style="padding:4px 10px;font-size:11px;">${item.urgency}</span></td>
                    <td style="font-family:var(--font-mono);">${item.score}</td>
                    <td style="font-size:11px;color:var(--text-muted);">${item.mode}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        <div style="margin-top:20px;text-align:center;">
          <button class="btn-secondary" onclick="SafePulseState.setView('home')">
            &larr; Back to Dashboard
          </button>
        </div>
      </div>
    `;
  }
};

window.SafePulseApp = SafePulseApp;

// Auto-bootstrap when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  SafePulseApp.init();
});
