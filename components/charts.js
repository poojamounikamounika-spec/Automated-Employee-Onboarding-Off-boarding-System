// ============================================================
// charts.js — Analytics & Reporting Dashboard using Canvas API
// ============================================================

function renderCharts(container, params = {}) {
  const { CHART_DATA, requests } = window.APP_DATA;

  // Compute live stats
  const total = requests.length;
  const onboarding = requests.filter(r => r.type === 'onboarding').length;
  const offboarding = requests.filter(r => r.type === 'offboarding').length;
  const completed = requests.filter(r => r.status === 'completed').length;
  const pending = requests.filter(r => r.approvalStatus === 'pending').length;
  const onTrack = requests.filter(r => r.slaStatus === 'on_track').length;
  const atRisk = requests.filter(r => r.slaStatus === 'at_risk').length;

  container.innerHTML = `
    <div class="view-header">
      <div>
        <h1 class="view-title">Reports & Analytics</h1>
        <p class="view-subtitle">Data-driven insights into employee lifecycle performance</p>
      </div>
      <div class="report-date">📅 As of ${new Date().toLocaleDateString('en-IN', {year:'numeric',month:'long',day:'numeric'})}</div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card" style="--accent:#7C3AED">
        <div class="kpi-icon">📋</div>
        <div class="kpi-value" data-target="${total}">0</div>
        <div class="kpi-label">Total Requests</div>
        <div class="kpi-sub">${onboarding} Onboarding · ${offboarding} Offboarding</div>
      </div>
      <div class="kpi-card" style="--accent:#10B981">
        <div class="kpi-icon">✅</div>
        <div class="kpi-value" data-target="${completed}">0</div>
        <div class="kpi-label">Completed</div>
        <div class="kpi-sub">${Math.round((completed/total)*100)}% completion rate</div>
      </div>
      <div class="kpi-card" style="--accent:#F59E0B">
        <div class="kpi-icon">⏳</div>
        <div class="kpi-value" data-target="${pending}">0</div>
        <div class="kpi-label">Pending Approvals</div>
        <div class="kpi-sub">Awaiting manager action</div>
      </div>
      <div class="kpi-card" style="--accent:#06B6D4">
        <div class="kpi-icon">🎯</div>
        <div class="kpi-value" data-target="${Math.round((onTrack/total)*100)}">0</div>
        <div class="kpi-label">SLA On Track</div>
        <div class="kpi-sub" style="color:#F59E0B">${atRisk} at risk</div>
        <div class="kpi-unit">%</div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="charts-row">
      <div class="chart-card glass-card">
        <div class="chart-title">📈 Monthly Request Volume</div>
        <canvas id="chart-monthly" width="460" height="220"></canvas>
      </div>
      <div class="chart-card glass-card">
        <div class="chart-title">🎯 SLA Compliance</div>
        <canvas id="chart-sla" width="240" height="240"></canvas>
        <div class="donut-legend">
          <div class="legend-item"><span class="legend-dot" style="background:#10B981"></span> On Track</div>
          <div class="legend-item"><span class="legend-dot" style="background:#F59E0B"></span> At Risk</div>
          <div class="legend-item"><span class="legend-dot" style="background:#F43F5E"></span> Breached</div>
        </div>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="charts-row">
      <div class="chart-card glass-card">
        <div class="chart-title">🏢 Dept Task Completion Rate</div>
        <canvas id="chart-dept" width="380" height="200"></canvas>
      </div>
      <div class="chart-card glass-card">
        <div class="chart-title">📊 Request Status Distribution</div>
        <canvas id="chart-status" width="280" height="200"></canvas>
        <div class="donut-legend">
          ${CHART_DATA.requestStatus.labels.map((l,i)=>`
          <div class="legend-item"><span class="legend-dot" style="background:${CHART_DATA.requestStatus.colors[i]}"></span> ${l}</div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- SLA Table -->
    <div class="glass-card" style="margin-top:24px;padding:24px">
      <div class="chart-title">⏱️ SLA Tracking per Request</div>
      <table class="lifecycle-table" style="margin-top:16px">
        <thead>
          <tr>
            <th>Request ID</th><th>Employee</th><th>Type</th><th>Department</th><th>Progress</th><th>SLA Status</th>
          </tr>
        </thead>
        <tbody>
          ${requests.map(r => `
          <tr class="table-row">
            <td class="mono">${r.id}</td>
            <td>${r.employeeName}</td>
            <td><span class="type-badge type-${r.type}">${r.type}</span></td>
            <td>${r.department}</td>
            <td>
              <div class="progress-cell">
                <div class="progress-bar-mini">
                  <div class="progress-fill-mini" style="width:${r.completionPercent}%;background:${r.completionPercent===100?'#10B981':'#7C3AED'}"></div>
                </div>
                <span class="progress-num">${r.completionPercent}%</span>
              </div>
            </td>
            <td><span class="sla-badge ${r.slaStatus==='on_track'?'sla-good':r.slaStatus==='at_risk'?'sla-risk':'sla-breach'}">${r.slaStatus.replace('_',' ')}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Animate KPI counters
  document.querySelectorAll('.kpi-value[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const unit = el.nextElementSibling?.classList?.contains('kpi-unit') ? '%' : '';
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 30);
  });

  // Draw charts after DOM ready
  requestAnimationFrame(() => {
    drawBarChart('chart-monthly');
    drawDonutChart('chart-sla', [62, 25, 13], ['#10B981', '#F59E0B', '#F43F5E'], 'SLA');
    drawHorizontalBar('chart-dept');
    drawDonutChart('chart-status', CHART_DATA.requestStatus.values, CHART_DATA.requestStatus.colors, 'Status');
  });
}

function drawBarChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = window.APP_DATA.CHART_DATA.monthly;
  const W = canvas.width, H = canvas.height;
  const pad = { top: 20, right: 20, bottom: 36, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...data.onboarding, ...data.offboarding) + 2;
  const barW = (chartW / data.labels.length) * 0.35;
  const gap = (chartW / data.labels.length) * 0.1;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal - (maxVal/4)*i), pad.left - 6, y + 4);
  }

  data.labels.forEach((label, i) => {
    const slotX = pad.left + (chartW / data.labels.length) * i + gap;
    const x1 = slotX;
    const x2 = slotX + barW + gap / 2;

    // Onboarding bar
    const h1 = (data.onboarding[i] / maxVal) * chartH;
    const grad1 = ctx.createLinearGradient(0, pad.top + chartH - h1, 0, pad.top + chartH);
    grad1.addColorStop(0, '#7C3AED'); grad1.addColorStop(1, '#5B21B6');
    ctx.fillStyle = grad1;
    animateBar(ctx, x1, pad.top + chartH, barW, h1);

    // Offboarding bar
    const h2 = (data.offboarding[i] / maxVal) * chartH;
    const grad2 = ctx.createLinearGradient(0, pad.top + chartH - h2, 0, pad.top + chartH);
    grad2.addColorStop(0, '#F43F5E'); grad2.addColorStop(1, '#BE123C');
    ctx.fillStyle = grad2;
    animateBar(ctx, x2, pad.top + chartH, barW, h2);

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(label, slotX + barW, pad.top + chartH + 20);
  });

  // Legend
  ctx.fillStyle = '#7C3AED'; ctx.fillRect(W - 120, 4, 10, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '11px Inter'; ctx.textAlign = 'left';
  ctx.fillText('Onboarding', W - 106, 13);
  ctx.fillStyle = '#F43F5E'; ctx.fillRect(W - 120, 22, 10, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('Offboarding', W - 106, 31);
}

function animateBar(ctx, x, baseY, w, h) {
  let progress = 0;
  const color = ctx.fillStyle;
  function frame() {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, baseY - progress * h, w, progress * h, [4, 4, 0, 0]) : ctx.rect(x, baseY - progress * h, w, progress * h);
    ctx.fill();
    if (progress < 1) { progress = Math.min(1, progress + 0.06); requestAnimationFrame(frame); }
  }
  requestAnimationFrame(frame);
}

function drawDonutChart(canvasId, values, colors, label) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2, r = Math.min(cx, cy) - 16;
  const total = values.reduce((a, b) => a + b, 0);
  let startAngle = -Math.PI / 2;
  let progress = 0;

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    progress = Math.min(1, progress + 0.04);
    let angle = startAngle;
    values.forEach((val, i) => {
      const slice = (val / total) * Math.PI * 2 * progress;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      angle += slice;
    });
    // Inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#0D1224';
    ctx.fill();
    // Center text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(total, cx, cy + 6);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px Inter';
    ctx.fillText(label, cx, cy + 20);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function drawHorizontalBar(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = window.APP_DATA.CHART_DATA.deptTaskCompletion;
  const W = canvas.width, H = canvas.height;
  const pad = { top: 10, right: 60, bottom: 10, left: 90 };
  const barH = Math.floor((H - pad.top - pad.bottom) / data.labels.length) - 8;
  const chartW = W - pad.left - pad.right;
  const deptColors2 = { IT: '#06B6D4', HR: '#7C3AED', Facilities: '#F59E0B', Security: '#F43F5E' };

  ctx.clearRect(0, 0, W, H);
  data.labels.forEach((label, i) => {
    const y = pad.top + i * (barH + 8);
    const color = deptColors2[label] || '#7C3AED';

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(pad.left, y, chartW, barH, 4) : ctx.rect(pad.left, y, chartW, barH);
    ctx.fill();

    let prog = 0;
    const target = data.values[i] / 100;
    (function animBar() {
      prog = Math.min(target, prog + 0.03);
      const grad = ctx.createLinearGradient(pad.left, 0, pad.left + chartW, 0);
      grad.addColorStop(0, color); grad.addColorStop(1, color + '99');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(pad.left, y, chartW * prog, barH, 4) : ctx.rect(pad.left, y, chartW * prog, barH);
      ctx.fill();
      if (prog < target) requestAnimationFrame(animBar);
    })();

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '12px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(label, pad.left - 8, y + barH / 2 + 4);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(data.values[i] + '%', pad.left + chartW + 6, y + barH / 2 + 4);
  });
}

window.renderCharts = renderCharts;
