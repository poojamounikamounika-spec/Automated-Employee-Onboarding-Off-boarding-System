// ============================================================
// lifecycle.js — Employee Lifecycle Table View
// ============================================================

function renderLifecycleTable(container, params = {}) {
  const { requests } = window.APP_DATA;

  const statusConfig = {
    completed: { label: 'Completed', class: 'status-completed' },
    approved: { label: 'Approved', class: 'status-approved' },
    pending_approval: { label: 'Pending Approval', class: 'status-pending' },
    rejected: { label: 'Rejected', class: 'status-rejected' },
    in_progress: { label: 'In Progress', class: 'status-inprogress' },
  };

  const slaConfig = {
    on_track: { label: 'On Track', class: 'sla-good' },
    at_risk: { label: 'At Risk', class: 'sla-risk' },
    breached: { label: 'Breached', class: 'sla-breach' },
  };

  let filterType = 'all';
  let filterStatus = 'all';
  let searchTerm = '';

  function getFiltered() {
    return requests.filter(r => {
      const matchType = filterType === 'all' || r.type === filterType;
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      const matchSearch = !searchTerm ||
        r.employeeName.toLowerCase().includes(searchTerm) ||
        r.id.toLowerCase().includes(searchTerm) ||
        r.department.toLowerCase().includes(searchTerm);
      return matchType && matchStatus && matchSearch;
    });
  }

  function render() {
    const filtered = getFiltered();
    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-title">Employee Lifecycle Table</h1>
          <p class="view-subtitle">u_employee_lifecycle — Custom ServiceNow Table</p>
        </div>
        <button class="btn-primary" onclick="window.Router.navigate('portal')">
          + New Request
        </button>
      </div>

      <div class="filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input id="lc-search" type="text" placeholder="Search by name, ID, department..." value="${searchTerm}"
            oninput="window._lcSearch(this.value)" class="search-input"/>
        </div>
        <select class="filter-select" onchange="window._lcFilterType(this.value)">
          <option value="all">All Types</option>
          <option value="onboarding">Onboarding</option>
          <option value="offboarding">Offboarding</option>
        </select>
        <select class="filter-select" onchange="window._lcFilterStatus(this.value)">
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="approved">Approved</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="rejected">Rejected</option>
        </select>
        <div class="filter-count">${filtered.length} record${filtered.length !== 1 ? 's' : ''}</div>
      </div>

      <div class="table-wrapper">
        <table class="lifecycle-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Employee</th>
              <th>Emp ID</th>
              <th>Department</th>
              <th>Type</th>
              <th>Manager</th>
              <th>Date</th>
              <th>Status</th>
              <th>SLA</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr><td colspan="11" class="empty-row">No records found</td></tr>
            ` : filtered.map(r => {
              const sc = statusConfig[r.status] || { label: r.status, class: '' };
              const sla = slaConfig[r.slaStatus] || { label: r.slaStatus, class: '' };
              const date = r.type === 'onboarding' ? r.joiningDate : r.exitDate;
              return `
              <tr class="table-row" onclick="window._lcOpenDetail('${r.id}')">
                <td><span class="req-id">${r.id}</span></td>
                <td>
                  <div class="emp-cell">
                    <div class="emp-avatar">${r.employeeName.split(' ').map(n=>n[0]).join('')}</div>
                    <span>${r.employeeName}</span>
                  </div>
                </td>
                <td class="mono">${r.employeeId}</td>
                <td>${r.department}</td>
                <td>
                  <span class="type-badge type-${r.type}">
                    ${r.type === 'onboarding' ? '🟢 Onboarding' : '🔴 Offboarding'}
                  </span>
                </td>
                <td>${r.manager}</td>
                <td class="mono">${date || '—'}</td>
                <td><span class="status-badge ${sc.class}">${sc.label}</span></td>
                <td><span class="sla-badge ${sla.class}">${sla.label}</span></td>
                <td>
                  <div class="progress-cell">
                    <div class="progress-bar-mini">
                      <div class="progress-fill-mini" style="width:${r.completionPercent}%;background:${r.completionPercent===100?'#10B981':'#7C3AED'}"></div>
                    </div>
                    <span class="progress-num">${r.completionPercent}%</span>
                  </div>
                </td>
                <td onclick="event.stopPropagation()">
                  <button class="action-btn" onclick="window._lcOpenDetail('${r.id}')">View</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Detail Modal -->
      <div id="lc-modal" class="modal-overlay" style="display:none" onclick="window._lcCloseModal(event)">
        <div class="modal-box" id="lc-modal-box"></div>
      </div>
    `;
  }

  window._lcSearch = (val) => { searchTerm = val.toLowerCase(); render(); };
  window._lcFilterType = (val) => { filterType = val; render(); };
  window._lcFilterStatus = (val) => { filterStatus = val; render(); };
  window._lcOpenDetail = (id) => {
    const r = requests.find(x => x.id === id);
    if (!r) return;
    const modal = document.getElementById('lc-modal');
    const box = document.getElementById('lc-modal-box');
    const date = r.type === 'onboarding' ? r.joiningDate : r.exitDate;
    box.innerHTML = `
      <div class="modal-header">
        <div>
          <h2 class="modal-title">${r.id}</h2>
          <p class="modal-sub">${r.type === 'onboarding' ? '🟢 Onboarding' : '🔴 Offboarding'} — ${r.employeeName}</p>
        </div>
        <button class="modal-close" onclick="document.getElementById('lc-modal').style.display='none'">✕</button>
      </div>
      <div class="modal-grid">
        <div class="detail-field"><label>Employee ID</label><span class="mono">${r.employeeId}</span></div>
        <div class="detail-field"><label>Department</label><span>${r.department}</span></div>
        <div class="detail-field"><label>Manager</label><span>${r.manager}</span></div>
        <div class="detail-field"><label>${r.type==='onboarding'?'Joining':'Exit'} Date</label><span class="mono">${date||'—'}</span></div>
        <div class="detail-field"><label>Status</label><span class="status-badge status-${r.status}">${r.status.replace('_',' ')}</span></div>
        <div class="detail-field"><label>SLA</label><span class="sla-badge sla-${r.slaStatus === 'on_track' ? 'good' : r.slaStatus === 'at_risk' ? 'risk' : 'breach'}">${r.slaStatus.replace('_',' ')}</span></div>
      </div>
      <div class="detail-field" style="margin-top:16px"><label>Assets</label><div class="tag-list">${r.assets.map(a=>`<span class="asset-tag">${a}</span>`).join('')}</div></div>
      <div class="detail-field" style="margin-top:12px"><label>System Access</label><div class="tag-list">${r.accessSystems.map(s=>`<span class="access-tag">${s}</span>`).join('')}</div></div>
      <div style="margin-top:20px">
        <label class="section-label">Task Status</label>
        <div class="task-list-modal">
          ${r.tasks.length === 0 ? '<p style="color:#666;font-size:13px">Tasks will be created after approval.</p>' :
            r.tasks.map(t => `
            <div class="task-item-modal">
              <div class="task-dept-badge dept-${t.dept.toLowerCase()}">${t.dept}</div>
              <div class="task-info">
                <span>${t.name}</span>
                <span class="task-assignee">${t.assignee}</span>
              </div>
              <span class="task-status-dot task-${t.status}"></span>
              <span class="task-status-label">${t.status.replace('_',' ')}</span>
            </div>`).join('')}
        </div>
      </div>
      ${r.comments ? `<div class="detail-field" style="margin-top:16px"><label>Comments</label><p class="comment-text">${r.comments}</p></div>` : ''}
    `;
    modal.style.display = 'flex';
  };
  window._lcCloseModal = (e) => {
    if (e.target.id === 'lc-modal') document.getElementById('lc-modal').style.display = 'none';
  };

  render();
}

window.renderLifecycleTable = renderLifecycleTable;
