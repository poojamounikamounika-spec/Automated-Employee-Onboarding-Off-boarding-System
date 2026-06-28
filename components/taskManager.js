// ============================================================
// taskManager.js — Task Board (IT, Facilities, Security, HR)
// ============================================================

function renderTaskManager(container, params = {}) {
  const { requests, currentUser } = window.APP_DATA;

  const deptColors = {
    IT: '#06B6D4',
    HR: '#7C3AED',
    Facilities: '#F59E0B',
    Security: '#F43F5E',
  };

  const statusCols = [
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'in_progress', label: 'In Progress', icon: '🔄' },
    { id: 'completed', label: 'Completed', icon: '✅' },
  ];

  let filterDept = 'all';

  // Flatten all tasks from all approved requests
  function getAllTasks() {
    const tasks = [];
    requests.forEach(req => {
      if (req.approvalStatus === 'approved' || req.status === 'completed') {
        req.tasks.forEach(t => {
          tasks.push({ ...t, requestId: req.id, requestType: req.type, employeeName: req.employeeName, department: req.department });
        });
      }
    });
    return tasks;
  }

  function getFilteredTasks() {
    const all = getAllTasks();
    if (filterDept === 'all') return all;
    return all.filter(t => t.dept === filterDept);
  }

  function render() {
    const tasks = getFilteredTasks();
    const counts = { pending: 0, in_progress: 0, completed: 0 };
    tasks.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-title">Task Board</h1>
          <p class="view-subtitle">Departmental fulfillment tasks — IT, HR, Facilities, Security</p>
        </div>
        <div class="dept-filters">
          ${['all', 'IT', 'HR', 'Facilities', 'Security'].map(d => `
            <button class="dept-filter-btn ${filterDept === d ? 'active' : ''}"
              style="${filterDept === d && d !== 'all' ? `background:${deptColors[d]};border-color:${deptColors[d]}` : ''}"
              onclick="window._tbFilterDept('${d}')">
              ${d === 'all' ? '🗂️ All Depts' : d}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="task-stats-row">
        <div class="task-stat-card" style="border-color:#F59E0B">
          <span class="task-stat-num" style="color:#F59E0B">${counts.pending}</span>
          <span class="task-stat-label">Pending</span>
        </div>
        <div class="task-stat-card" style="border-color:#06B6D4">
          <span class="task-stat-num" style="color:#06B6D4">${counts.in_progress}</span>
          <span class="task-stat-label">In Progress</span>
        </div>
        <div class="task-stat-card" style="border-color:#10B981">
          <span class="task-stat-num" style="color:#10B981">${counts.completed}</span>
          <span class="task-stat-label">Completed</span>
        </div>
        <div class="task-stat-card" style="border-color:#7C3AED">
          <span class="task-stat-num" style="color:#7C3AED">${tasks.length}</span>
          <span class="task-stat-label">Total Tasks</span>
        </div>
      </div>

      <div class="kanban-board">
        ${statusCols.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return `
          <div class="kanban-col" id="kanban-${col.id}" data-status="${col.id}"
            ondragover="event.preventDefault()" ondrop="window._tbDrop(event, '${col.id}')">
            <div class="kanban-col-header">
              <div class="kanban-col-title">
                <span>${col.icon}</span>
                <span>${col.label}</span>
                <span class="kanban-count">${colTasks.length}</span>
              </div>
            </div>
            <div class="kanban-cards" id="cards-${col.id}">
              ${colTasks.map(t => renderTaskCard(t)).join('')}
              ${colTasks.length === 0 ? `<div class="kanban-empty">Drop tasks here</div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- Task Detail Modal -->
      <div id="task-modal" class="modal-overlay" style="display:none" onclick="window._tbCloseModal(event)">
        <div class="modal-box" style="max-width:480px" id="task-modal-box"></div>
      </div>
    `;
  }

  function renderTaskCard(t) {
    const deptColor = deptColors[t.dept] || '#7C3AED';
    const typeIcon = t.requestType === 'onboarding' ? '🟢' : '🔴';
    return `
      <div class="kanban-card" draggable="true" id="card-${t.id}"
        ondragstart="window._tbDragStart(event, '${t.id}')"
        onclick="window._tbOpenTask('${t.id}')">
        <div class="kc-header">
          <div class="kc-dept" style="background:${deptColor}22;color:${deptColor};border:1px solid ${deptColor}44">${t.dept}</div>
          <div class="kc-type">${typeIcon}</div>
        </div>
        <div class="kc-name">${t.name}</div>
        <div class="kc-employee">${typeIcon} ${t.employeeName}</div>
        <div class="kc-footer">
          <div class="kc-assignee">
            <div class="assignee-avatar">${t.assignee.split(' ').map(n=>n[0]).join('')}</div>
            <span>${t.assignee.split(' ')[0]}</span>
          </div>
          <div class="kc-due ${isDueSoon(t.dueDate) ? 'due-soon' : ''}">📅 ${t.dueDate}</div>
        </div>
        <div class="kc-req-id">${t.requestId}</div>
        ${t.status !== 'completed' ? `
        <button class="kc-complete-btn" onclick="event.stopPropagation();window._tbCompleteTask('${t.id}','${t.requestId}')">
          ${t.status === 'pending' ? '▶ Start' : '✓ Complete'}
        </button>` : ''}
      </div>
    `;
  }

  function isDueSoon(dateStr) {
    if (!dateStr) return false;
    const diff = new Date(dateStr) - new Date();
    return diff >= 0 && diff < 2 * 24 * 60 * 60 * 1000;
  }

  window._tbFilterDept = (dept) => { filterDept = dept; render(); };

  window._tbDragStart = (e, taskId) => { e.dataTransfer.setData('taskId', taskId); };

  window._tbDrop = (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    let found = false;
    window.APP_DATA.requests.forEach(req => {
      const task = req.tasks.find(t => t.id === taskId);
      if (task) {
        const old = task.status;
        task.status = newStatus;
        found = true;
        updateRequestProgress(req);
        window.NotificationSystem.show(`Task moved to ${newStatus.replace('_', ' ')}`, 'task');
      }
    });
    if (found) render();
  };

  window._tbCompleteTask = (taskId, requestId) => {
    const req = window.APP_DATA.requests.find(r => r.id === requestId);
    if (!req) return;
    const task = req.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === 'pending') {
      task.status = 'in_progress';
      window.NotificationSystem.show(`Task started: ${task.name}`, 'task');
    } else if (task.status === 'in_progress') {
      task.status = 'completed';
      window.NotificationSystem.show(`Task completed: ${task.name}`, 'success');
    }
    updateRequestProgress(req);
    render();
  };

  function updateRequestProgress(req) {
    if (req.tasks.length === 0) return;
    const done = req.tasks.filter(t => t.status === 'completed').length;
    req.completionPercent = Math.round((done / req.tasks.length) * 100);
    if (req.completionPercent === 100) {
      req.status = 'completed';
      req.updatedAt = new Date().toISOString();
      window.NotificationSystem.show(`🎉 Request ${req.id} fully completed!`, 'success', 6000);
    }
  }

  window._tbOpenTask = (taskId) => {
    let foundTask = null, foundReq = null;
    window.APP_DATA.requests.forEach(req => {
      const t = req.tasks.find(t => t.id === taskId);
      if (t) { foundTask = t; foundReq = req; }
    });
    if (!foundTask) return;
    const box = document.getElementById('task-modal-box');
    box.innerHTML = `
      <div class="modal-header">
        <div>
          <h3 class="modal-title">${foundTask.name}</h3>
          <p class="modal-sub">${foundReq.id} · ${foundReq.employeeName}</p>
        </div>
        <button class="modal-close" onclick="document.getElementById('task-modal').style.display='none'">✕</button>
      </div>
      <div class="modal-grid" style="margin-top:16px">
        <div class="detail-field"><label>Department</label><span class="dept-badge" style="color:${deptColors[foundTask.dept]}">${foundTask.dept}</span></div>
        <div class="detail-field"><label>Status</label><span class="task-status-label task-${foundTask.status}">${foundTask.status.replace('_',' ')}</span></div>
        <div class="detail-field"><label>Assignee</label><span>${foundTask.assignee}</span></div>
        <div class="detail-field"><label>Due Date</label><span class="mono">${foundTask.dueDate}</span></div>
        <div class="detail-field"><label>Request Type</label><span class="type-badge type-${foundReq.type}">${foundReq.type}</span></div>
        <div class="detail-field"><label>Employee</label><span>${foundReq.employeeName} (${foundReq.department})</span></div>
      </div>
      <div style="margin-top:20px;display:flex;gap:12px">
        ${foundTask.status === 'pending' ? `<button class="btn-primary" onclick="window._tbCompleteTask('${foundTask.id}','${foundReq.id}');document.getElementById('task-modal').style.display='none'">▶ Start Task</button>` : ''}
        ${foundTask.status === 'in_progress' ? `<button class="btn-approve" onclick="window._tbCompleteTask('${foundTask.id}','${foundReq.id}');document.getElementById('task-modal').style.display='none'">✓ Mark Complete</button>` : ''}
        <button class="btn-secondary" onclick="document.getElementById('task-modal').style.display='none'">Close</button>
      </div>
    `;
    document.getElementById('task-modal').style.display = 'flex';
  };

  window._tbCloseModal = (e) => {
    if (e.target.id === 'task-modal') document.getElementById('task-modal').style.display = 'none';
  };

  render();
}

window.renderTaskManager = renderTaskManager;
