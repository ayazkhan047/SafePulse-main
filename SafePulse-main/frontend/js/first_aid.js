/**
 * SafePulse First-Aid Guidance & Interactive CPR Metronome Module
 */

const FirstAidView = {
  container: null,
  currentGuidance: null,

  init(containerEl) {
    this.container = containerEl;
    this.bindVoiceEvents();
  },

  bindVoiceEvents() {
    window.addEventListener('safepulse:voice_action', (e) => {
      if (SafePulseState.currentView !== 'firstaid') return;
      const act = e.detail.action;
      if (act === 'toggle_metronome') {
        const btn = document.getElementById('btnToggleMetronome');
        if (btn) btn.click();
      } else if (act === 'repeat') {
        this.narrateSteps();
      }
    });
  },

  async render(categoryId, urgency) {
    if (!this.container) return;
    const cat = categoryId || this.currentCategory || SafePulseState.activeCategory || 'bleeding';
    const urg = urgency || this.currentUrgency || (SafePulseState.latestResult ? SafePulseState.latestResult.urgency : 'HIGH');
    this.currentCategory = cat;
    this.currentUrgency = urg;

    this.container.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <p style="font-size:16px;">Loading verified emergency first-aid protocols...</p>
      </div>
    `;

    try {
      const guidance = await SafePulseAPI.getGuidance(cat, urg);
      this.currentGuidance = guidance;
      this.renderContent(guidance);
    } catch (e) {
      console.error('Failed to load guidance:', e);
      this.container.innerHTML = `<p style="color:var(--red-500);text-align:center;">Guidance could not be loaded. Please ensure SafePulse is initialized.</p>`;
    }
  },

  renderContent(g) {
    const isCardiacOrChoking = (g.category === 'cardiac' || g.category === 'choking');
    const categories = [
      { id: 'bleeding', name: 'Heavy Bleeding' },
      { id: 'burns', name: 'Burns' },
      { id: 'choking', name: 'Choking' },
      { id: 'cardiac', name: 'Cardiac / CPR' },
      { id: 'injury', name: 'Serious Injury' }
    ];
    const urgencies = ['HIGH', 'MODERATE', 'LOW'];

    this.container.innerHTML = `
      <div class="result-hud">
        <!-- Category & Urgency Quick Switcher -->
        <div style="background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:14px 18px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <span style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Category:</span>
            ${categories.map(c => `
              <button class="btn-secondary ${c.id === g.category ? 'active' : ''}" style="padding:6px 12px;font-size:12.5px;border-radius:var(--radius-full);${c.id === g.category ? 'background:var(--blue-500);color:#fff;border-color:var(--blue-500);' : ''}" onclick="FirstAidView.render('${c.id}', '${g.urgency}')">
                ${c.name}
              </button>
            `).join('')}
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <span style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Urgency:</span>
            ${urgencies.map(u => `
              <button class="btn-secondary" style="padding:5px 10px;font-size:12px;border-radius:var(--radius-sm);${u === g.urgency ? 'font-weight:800;border-width:2px;' : 'opacity:0.75;'}${u === 'HIGH' ? 'border-color:var(--red-500);color:var(--red-500);' : u === 'MODERATE' ? 'border-color:var(--amber-500);color:var(--amber-500);' : 'border-color:var(--green-500);color:var(--green-500);'}" onclick="FirstAidView.render('${g.category}', '${u}')">
                ${u}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="hud-card" style="border-top: 5px solid ${g.urgency === 'HIGH' ? 'var(--red-500)' : g.urgency === 'MODERATE' ? 'var(--amber-500)' : 'var(--green-500)'};">
          <div class="hud-header">
            <div>
              <span class="hero-badge" style="background:var(--surface-alt);color:var(--text-secondary);margin-bottom:6px;">
                Verified Clinical Guidance &bull; ${g.category_name}
              </span>
              <h2 style="font-size:26px;">${g.headline}</h2>
            </div>
            <span class="urgency-badge ${g.urgency}">${g.urgency} URGENCY</span>
          </div>


          <div style="background:var(--surface-alt);border-radius:var(--radius-md);padding:18px 22px;margin-bottom:24px;">
            <p style="font-size:15.5px;font-weight:600;color:var(--text-primary);line-height:1.5;">
              ${g.primary_directive}
            </p>
          </div>

          ${g.call_helpline_now ? `
            <div style="background:var(--red-100);border:1px solid var(--red-500);border-radius:var(--radius-md);padding:18px 20px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
              <div>
                <b style="color:var(--red-600);font-size:16px;display:block;">EMERGENCY HELPLINE REQUIRED</b>
                <span style="font-size:13px;color:var(--red-600);">Call 112 (India) or 911 (International). Put phone on speakerphone.</span>
              </div>
              <a href="tel:112" class="btn-sos" style="padding:10px 20px;font-size:15px;">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                Call 112 Now
              </a>
            </div>
          ` : ''}

          <!-- First Aid Step List -->
          <h3 style="font-size:20px;margin-bottom:12px;">Step-by-Step Response Protocol</h3>
          <div class="steps-container">
            ${g.steps.map(step => `
              <div class="step-card">
                <div class="step-number-bubble">${step.step_number}</div>
                <div class="step-body" style="flex-grow:1;">
                  <h4>${step.title}</h4>
                  <p>${step.instruction}</p>
                  ${step.warning ? `<div class="step-warning">&#9888; ${step.warning}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- CPR Audio Metronome Component if relevant -->
          ${isCardiacOrChoking ? `
            <div class="metronome-box" id="metronomeSection">
              <span class="hero-badge" style="background:var(--red-100);color:var(--red-600);">Audio Resuscitation Assistance</span>
              <h3 style="font-size:22px;margin:8px 0 6px;">CPR Chest Compression Metronome</h3>
              <p style="font-size:14px;color:var(--text-muted);max-width:540px;margin:0 auto 16px;">
                American Heart Association recommends 100 to 120 compressions per minute. Compress hard and fast to the beat.
              </p>

              <div class="metronome-visualizer" id="metronomeVisualizer">
                <span class="metronome-bpm">110</span>
                <span class="metronome-unit">BPM Pace</span>
              </div>

              <div style="display:flex;justify-content:center;gap:12px;margin-top:14px;">
                <button id="btnToggleMetronome" class="btn-primary" style="padding:12px 24px;" onclick="FirstAidView.toggleMetronome()">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span id="metronomeBtnText">Start 110 BPM Clicker</span>
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Do's and Don'ts Checklist -->
          <div class="dos-donts-grid">
            <div class="checklist-card dos">
              <h4 style="color:var(--green-600);">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                Crucial DO's
              </h4>
              <ul class="checklist-items">
                ${g.dos.map(item => `
                  <li>
                    <svg width="16" height="16" fill="var(--green-500)" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="checklist-card donts">
              <h4 style="color:var(--red-600);">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                Dangerous DON'Ts
              </h4>
              <ul class="checklist-items">
                ${g.donts.map(item => `
                  <li>
                    <svg width="16" height="16" fill="var(--red-500)" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
                    <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex justify-between items-center" style="border-top:1px solid var(--border-subtle);padding-top:24px;margin-top:28px;">
            <button class="btn-secondary" onclick="SafePulseState.setView('home')">
              &larr; Back to Dashboard
            </button>
            <div style="display:flex;gap:10px;">
              <button class="btn-secondary" onclick="FirstAidView.narrateSteps()">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                Read Steps Aloud
              </button>
              <button class="btn-secondary" style="border-color:var(--amber-500);color:var(--amber-600);" onclick="PhantomEngine.startVisualStrobe()">
                &#9889; SOS Visual Strobe
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    VoiceAssistant.speak(`${g.headline}. ${g.primary_directive}`);
  },

  toggleMetronome() {
    const visual = document.getElementById('metronomeVisualizer');
    const isNowRunning = AudioMetronome.toggle(visual);
    const btnText = document.getElementById('metronomeBtnText');
    if (btnText) {
      btnText.textContent = isNowRunning ? "Stop CPR Clicker" : "Start 110 BPM Clicker";
    }
  },

  narrateSteps() {
    if (!this.currentGuidance) return;
    const text = this.currentGuidance.steps.map(s => `Step ${s.step_number}: ${s.title}. ${s.instruction}`).join('. ');
    VoiceAssistant.speak(text);
  }
};

window.FirstAidView = FirstAidView;
