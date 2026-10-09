/**
 * SafePulse Priority-First Triage Assessment Wizard
 * Implements Phase 1 High-Priority Safety Gate & Phase 2 Detailed Assessment
 */

const TriageWizard = {
  container: null,

  init(containerEl) {
    this.container = containerEl;
    this.bindKeyboardShortcuts();
    this.bindVoiceEvents();
  },

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (SafePulseState.currentView !== 'wizard') return;
      if (e.key === 'y' || e.key === 'Y') {
        const yesBtn = document.getElementById('btnAnswerYes');
        if (yesBtn) yesBtn.click();
      } else if (e.key === 'n' || e.key === 'N') {
        const noBtn = document.getElementById('btnAnswerNo');
        if (noBtn) noBtn.click();
      }
    });
  },

  bindVoiceEvents() {
    window.addEventListener('safepulse:voice_action', (e) => {
      if (SafePulseState.currentView !== 'wizard') return;
      const act = e.detail.action;
      if (act === 'yes') {
        const yesBtn = document.getElementById('btnAnswerYes');
        if (yesBtn) yesBtn.click();
      } else if (act === 'no') {
        const noBtn = document.getElementById('btnAnswerNo');
        if (noBtn) noBtn.click();
      } else if (act === 'repeat') {
        this.speakCurrentQuestion();
      }
    });
  },

  render() {
    if (!this.container) return;
    const cat = SafePulseState.categoryInfo;
    if (!cat) {
      SafePulseState.setView('home');
      return;
    }

    const quickQuestions = cat.quick_questions || [];
    const stepIdx = SafePulseState.quickStepIndex;

    // PHASE 1: HIGH-PRIORITY QUESTIONS
    if (stepIdx < quickQuestions.length) {
      const q = quickQuestions[stepIdx];
      const progressPct = Math.round(((stepIdx + 1) / (quickQuestions.length + 1)) * 100);

      this.container.innerHTML = `
        <div class="wizard-box">
          <div class="wizard-progress">
            <span class="wizard-step-label">Step 1 of 2: High-Priority Safety Check</span>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${progressPct}%;"></div>
            </div>
            <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;">${stepIdx + 1}/${quickQuestions.length}</span>
          </div>

          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span class="hero-badge" style="background:var(--red-100);color:var(--red-600);margin:0;">Critical Red-Flag Check</span>
            <span style="font-size:13px;color:var(--text-muted);font-weight:600;">${cat.name}</span>
          </div>

          <h3 class="question-title">${q.text}</h3>
          <p class="question-subtext">${q.subtext || 'Answer immediately to determine if emergency services must be dispatched now.'}</p>

          <div class="quick-answer-buttons">
            <button id="btnAnswerYes" class="btn-choice yes" onclick="TriageWizard.answerQuick('${q.id}', 'yes')">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>YES</span>
              <small style="font-size:11px;font-weight:500;opacity:0.8;">(or Press 'Y')</small>
            </button>

            <button id="btnAnswerNo" class="btn-choice no" onclick="TriageWizard.answerQuick('${q.id}', 'no')">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              <span>NO</span>
              <small style="font-size:11px;font-weight:500;opacity:0.8;">(or Press 'N')</small>
            </button>
          </div>

          <div class="flex justify-between items-center" style="border-top:1px solid var(--border-subtle);padding-top:18px;">
            <button class="btn-secondary" style="padding:8px 16px;font-size:13px;" onclick="SafePulseState.setView('home')">
              &larr; Choose Different Emergency
            </button>
            <button class="btn-secondary" style="padding:8px 16px;font-size:13px;" onclick="TriageWizard.speakCurrentQuestion()">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
              Read Aloud
            </button>
          </div>
        </div>
      `;

      this.speakCurrentQuestion();
      return;
    }

    // PHASE 2: DETAILED ASSESSMENT (When all quick questions answered NO)
    this.renderDetailedPhase(cat);
  },

  speakCurrentQuestion() {
    const cat = SafePulseState.categoryInfo;
    const quickQuestions = cat.quick_questions || [];
    const stepIdx = SafePulseState.quickStepIndex;
    if (stepIdx < quickQuestions.length) {
      const q = quickQuestions[stepIdx];
      VoiceAssistant.speak(`${q.text}. Answer Yes or No.`);
    }
  },

  async answerQuick(questionId, answer) {
    SafePulseState.setQuickAnswer(questionId, answer);
    const cat = SafePulseState.categoryInfo;
    const currentQ = cat.quick_questions[SafePulseState.quickStepIndex];
    const trigger = (currentQ.critical_trigger || 'yes').toLowerCase();

    // PRIORITY-FIRST CIRCUIT BREAKER:
    // If user answered YES to a critical question, IMMEDIATELY escalate!
    if (answer.toLowerCase() === trigger) {
      const result = await SafePulseAPI.assessTriage(
        SafePulseState.activeCategory,
        SafePulseState.quickAnswers,
        {},
        cat
      );
      SafePulseState.setResult(result);
      SafePulseState.setView('critical');
      return;
    }

    // If answer is NO, proceed to next quick question
    SafePulseState.quickStepIndex += 1;
    this.render();
  },

  renderDetailedPhase(cat) {
    const detailed = cat.detailed_questions || [];

    this.container.innerHTML = `
      <div class="wizard-box">
        <div class="wizard-progress">
          <span class="wizard-step-label">Step 2 of 2: Detailed Assessment</span>
          <div class="progress-track">
            <div class="progress-fill" style="width: 90%;"></div>
          </div>
          <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;">Features</span>
        </div>

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span class="hero-badge" style="background:var(--blue-100);color:var(--blue-600);margin:0;">No Critical Indicators Reported</span>
          <span style="font-size:13px;color:var(--text-muted);font-weight:600;">${cat.name}</span>
        </div>

        <h3 class="question-title" style="font-size:24px;">Gathering Specific Scenario Details</h3>
        <p class="question-subtext">These clinical inputs are transformed into a feature vector for the ML Urgency Classification Model.</p>

        <form id="detailedForm" onsubmit="TriageWizard.submitDetailed(event)">
          ${detailed.map(q => `
            <div style="margin-bottom:22px;">
              <label style="display:block;font-weight:700;font-size:15px;margin-bottom:6px;">${q.text}</label>
              ${q.help_text ? `<p style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">${q.help_text}</p>` : ''}

              <div class="option-list">
                ${(q.options || []).map(opt => `
                  <label class="option-item ${SafePulseState.detailedAnswers[q.id] == opt.value ? 'selected' : ''}">
                    <input type="radio" name="${q.id}" value="${opt.value}"
                      ${SafePulseState.detailedAnswers[q.id] == opt.value ? 'checked' : ''}
                      onchange="TriageWizard.selectDetailedOption('${q.id}', '${opt.value}', this)"
                      style="display:none;" />
                    <span style="width:18px;height:18px;border-radius:50%;border:2px solid currentColor;display:inline-flex;align-items:center;justify-content:center;font-size:10px;">
                      ${SafePulseState.detailedAnswers[q.id] == opt.value ? '&#9679;' : ''}
                    </span>
                    <span>${opt.label}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}

          <div style="margin-bottom:24px;">
            <label style="display:block;font-weight:700;font-size:15px;margin-bottom:6px;">
              Patient Pain / Distress Level (1 to 10): <span id="painDisplay" style="color:var(--red-500);font-family:var(--font-mono);">${SafePulseState.detailedAnswers.pain_level || 5}</span>
            </label>
            <input type="range" min="1" max="10" value="${SafePulseState.detailedAnswers.pain_level || 5}" id="painSlider" style="width:100%;accent-color:var(--red-500);"
              oninput="document.getElementById('painDisplay').textContent = this.value; SafePulseState.setDetailedAnswer('pain_level', parseInt(this.value));" />
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:4px;">
              <span>1 (Mild Discomfort)</span>
              <span>5 (Moderate Pain)</span>
              <span>10 (Unbearable)</span>
            </div>
          </div>

          <div class="flex justify-between items-center" style="border-top:1px solid var(--border-subtle);padding-top:20px;">
            <button type="button" class="btn-secondary" onclick="SafePulseState.quickStepIndex = 0; TriageWizard.render();">
              &larr; Back to Quick Check
            </button>
            <button type="submit" class="btn-primary" style="padding:14px 28px;">
              <span>Calculate Urgency Pathway</span>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        </form>
      </div>
    `;

    VoiceAssistant.speak("Please select the details to calculate the urgency level.");
  },

  selectDetailedOption(field, value, radioEl) {
    SafePulseState.setDetailedAnswer(field, isNaN(value) ? value : Number(value));
    const parent = radioEl.closest('.option-list');
    if (parent) {
      parent.querySelectorAll('.option-item').forEach(el => {
        el.classList.remove('selected');
        const dot = el.querySelector('span');
        if (dot) dot.innerHTML = '';
      });
      const selectedItem = radioEl.closest('.option-item');
      if (selectedItem) {
        selectedItem.classList.add('selected');
        const dot = selectedItem.querySelector('span');
        if (dot) dot.innerHTML = '&#9679;';
      }
    }
  },

  async submitDetailed(e) {
    if (e) e.preventDefault();
    const cat = SafePulseState.categoryInfo;

    const result = await SafePulseAPI.assessTriage(
      SafePulseState.activeCategory,
      SafePulseState.quickAnswers,
      SafePulseState.detailedAnswers,
      cat
    );

    SafePulseState.setResult(result);
    SafePulseState.setView('result');
  }
};

window.TriageWizard = TriageWizard;
