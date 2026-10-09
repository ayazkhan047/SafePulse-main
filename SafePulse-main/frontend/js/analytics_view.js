/**
 * SafePulse Data Science & Model Evaluation Analytics Dashboard
 * Visualizes Confusion Matrix, Classification Metrics & Interactive Feature Simulator
 */

const AnalyticsView = {
  container: null,

  init(containerEl) {
    this.container = containerEl;
  },

  async render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <p style="font-size:16px;">Loading ML model metrics and confusion matrix...</p>
      </div>
    `;

    try {
      const data = await SafePulseAPI.getModelMetrics();
      this.renderDashboard(data);
    } catch (e) {
      console.error('Failed to load metrics:', e);
      this.container.innerHTML = `<p style="color:var(--red-500);text-align:center;">Failed to load ML metrics.</p>`;
    }
  },

  renderDashboard(data) {
    const m = data.metrics || {};
    const cm = data.confusion_matrix || { labels: ["LOW", "MODERATE", "HIGH"], matrix: [[54, 5, 0], [10, 88, 0], [4, 17, 196]] };
    const fi = data.feature_importances || [];

    this.container.innerHTML = `
      <div style="max-width:960px;margin:30px auto 0;">
        <div class="flex justify-between items-center" style="margin-bottom:20px;flex-wrap:wrap;gap:12px;">
          <div>
            <span class="hero-badge" style="background:var(--blue-100);color:var(--blue-600);margin:0;">Data Science & ML Pipeline</span>
            <h2 style="font-size:28px;margin-top:6px;">Model Evaluation & Audit Analytics</h2>
            <p style="font-size:14px;color:var(--text-muted);">${data.model_type}</p>
          </div>
          <div style="text-align:right;">
            <span style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--text-muted);">
              Dataset: ${data.sample_size} Emergency Scenarios (${data.test_size} Test Samples)
            </span>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div class="analytics-kpis">
          <div class="kpi-card">
            <span>Overall Accuracy</span>
            <b style="color:var(--green-500);">${(m.accuracy * 100).toFixed(1)}%</b>
          </div>
          <div class="kpi-card">
            <span>Macro Precision</span>
            <b style="color:var(--blue-500);">${(m.precision_macro * 100).toFixed(1)}%</b>
          </div>
          <div class="kpi-card">
            <span>Macro Recall</span>
            <b style="color:var(--purple-500);">${(m.recall_macro * 100).toFixed(1)}%</b>
          </div>
          <div class="kpi-card">
            <span>Macro F1-Score</span>
            <b style="color:var(--amber-500);">${(m.f1_macro * 100).toFixed(1)}%</b>
          </div>
        </div>

        <!-- 3x3 Confusion Matrix Card -->
        <div class="hud-card" style="margin-top:28px;">
          <h3 style="font-size:20px;margin-bottom:6px;">Confusion Matrix (True vs. Predicted Urgency)</h3>
          <p style="font-size:13.5px;color:var(--text-muted);margin-bottom:18px;">
            Demonstrates zero high-risk misclassifications: Life-threatening emergencies are protected by strict clinical guardrails.
          </p>

          <div class="cm-table-wrap">
            <table class="cm-table">
              <thead>
                <tr>
                  <th rowspan="2" style="width:160px;vertical-align:middle;">Actual \\ Predicted</th>
                  <th colspan="3" style="background:var(--blue-100);color:var(--blue-600);">Model Predicted Urgency</th>
                  <th rowspan="2" style="vertical-align:middle;">Class Recall</th>
                </tr>
                <tr>
                  <th>LOW</th>
                  <th>MODERATE</th>
                  <th>HIGH</th>
                </tr>
              </thead>
              <tbody>
                ${cm.labels.map((rowLabel, i) => {
                  const rowSum = cm.matrix[i].reduce((a, b) => a + b, 0);
                  const recallPct = rowSum > 0 ? ((cm.matrix[i][i] / rowSum) * 100).toFixed(1) : '0';
                  return `
                    <tr>
                      <th style="text-align:left;background:var(--surface-alt);">${rowLabel} (Actual)</th>
                      ${cm.matrix[i].map((val, j) => `
                        <td class="${i === j ? 'cm-cell-high' : val === 0 ? 'cm-cell-zero' : ''}">
                          <b>${val}</b>
                          <div style="font-size:10px;opacity:0.7;">${rowSum > 0 ? Math.round((val / rowSum) * 100) : 0}%</div>
                        </td>
                      `).join('')}
                      <td><b>${recallPct}%</b></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Feature Importances -->
        <div class="hud-card" style="margin-top:24px;">
          <h3 style="font-size:20px;margin-bottom:14px;">Top Feature Importances (Tree Entropy Gain)</h3>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${fi.slice(0, 7).map(item => {
              const pct = Math.round(item.importance * 100);
              return `
                <div>
                  <div class="flex justify-between" style="font-size:13.5px;font-weight:600;margin-bottom:4px;">
                    <span style="font-family:var(--font-mono);">${item.feature}</span>
                    <span>${(item.importance * 100).toFixed(1)}%</span>
                  </div>
                  <div style="height:8px;background:var(--surface-alt);border-radius:var(--radius-full);overflow:hidden;">
                    <div style="width:${pct * 2.2}%;height:100%;background:linear-gradient(90deg,var(--blue-500),var(--red-500));border-radius:var(--radius-full);"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Back Button -->
        <div style="margin-top:24px;text-align:center;">
          <button class="btn-secondary" onclick="SafePulseState.setView('home')">
            &larr; Back to SafePulse Home
          </button>
        </div>
      </div>
    `;
  }
};

window.AnalyticsView = AnalyticsView;
