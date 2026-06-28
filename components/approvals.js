// ============================================================
// approvals.js — Manager Approval Console
// ============================================================

function renderApprovals(container, params = {}) {
  const { requests, currentUser } = window.APP_DATA;

  function getPending() {
    return requests.filter(r => r.approvalStatus === 'pending');
  }

  function render() {
    const pending = getPending();
    const approved = requests.filter(r => r.approvalStatus === 'approved');
    const rejected = requests.filter(r => r.approvalStatus === 'rejected');

    container.innerHTML = `
      <div class="view-header">
        <div>
          <h1 class="view-title">Manager Approval Console</h1>
          <p class="view-subtitle">Review and act on pending onboarding/offboarding requests</p>
        </div>
        <div class="approval-stats">
          <div class="approval-stat">
            <span class="stat-num pending-color">${pending.length}</span>
            <span class="stat-lbl">Pending</span>
          </div>
          <div class="approval-stat">
            <span class="stat-num approved-color">${approved.length}</span>
            <span class="stat-lbl">Approved</span>
          </div>
          <div class="approval-stat">
            <span class="stat-num rejected-color">${rejected.length}</span>
            <span class="stat-lbl">Rejected</span>
          </div>
        </div>
      </div>

      ${pending.length > 0 ? `
      <div class="section-label-lg">⏳ Pending Your Approval</div>
      <div class="approval-cards">
        ${pending.map(r => renderApprovalCard(r, true)).join('')}
      </div>` : `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>All caught up!</h3>
        <p>No pending approvals at this time.</p>
      </div>`}

      <div class="section-label-lg" style="margin-top:32px">📋 Approval History</div>
      <div class="approval-cards">
        ${[...approved, ...rejected].map(r => renderApprovalCard(r, false)).join('')}
      </div>

      <!-- Comment Modal -->
      <div id="approve-modal" class="modal-overlay" style="display:none" onclick="window._closeApproveModal(event)">
        <div class="modal-box" style="max-width:480px" id="approve-modal-box"></div>
      </div>
    `;
  }

  function renderApprovalCard(r, isPending) {
    const date = r.type === 'onboarding' ? r.joiningDate : r.exitDate;
    const dateLabel = r.type === 'onboarding' ? 'Joining Date' : 'Exit Date';
    const urgency = isPending && r.slaStatus === 'at_risk' ? 'card-urgent' : '';
    return `
      <div class="approval-card glass-card ${urgency}">
        <div class="approval-card-top">
          <div class="approval-emp">
            <div class="emp-avatar large">${r.employeeName.split(' ').map(n=>n[0]).join('')}</div>
            <div>
              <div class="approval-emp-name">${r.employeeName}</div>
              <div class="approval-emp-meta">${r.department} · ${r.employeeId}</div>
            </div>
          </div>
          <div class="approval-badges">
            <span class="type-badge type-${r.type}">${r.type === 'onboarding' ? '🟢 Onboarding' : '🔴 Offboarding'}</span>
            ${r.slaStatus === 'at_risk' ? '<span class="sla-badge sla-risk pulse">⚡ At Risk</span>' : ''}
          </div>
        </div>

        <div class="approval-details">
          <div class="detail-pair"><span class="dp-label">Request ID</span><span class="dp-value mono">${r.id}</span></div>
          <div class="detail-pair"><span class="dp-label">Manager</span><span class="dp-value">${r.manager}</span></div>
          <div class="detail-pair"><span class="dp-label">${dateLabel}</span><span class="dp-value mono">${date || '—'}</span></div>
          <div class="detail-pair"><span class="dp-label">Submitted</span><span class="dp-value">${new Date(r.createdAt).toLocaleDateString()}</span></div>
        </div>

        <div class="approval-assets">
          <div class="assets-row">
            <span class="dp-label">Assets:</span>
            ${r.assets.map(a => `<span class="mini-tag">${a}</span>`).join('')}
          </div>
          <div class="assets-row">
            <span class="dp-label">Access:</span>
            ${r.accessSystems.slice(0,3).map(a => `<span class="mini-tag mini-access">${a}</span>`).join('')}
            ${r.accessSystems.length > 3 ? `<span class="mini-tag">+${r.accessSystems.length-3} more</span>` : ''}
          </div>
        </div>

        <div class="activity-timeline">
          <div class="timeline-item">
            <div class="timeline-dot dot-blue"></div>
            <div class="timeline-content">
              <span class="tl-event">Request Submitted</span>
              <span class="tl-time">${new Date(r.createdAt).toLocaleString()}</span>
            </div>
          </div>
          ${r.approvalStatus !== 'pending' ? `
          <div class="timeline-item">
            <div class="timeline-dot ${r.approvalStatus === 'approved' ? 'dot-green' : 'dot-red'}"></div>
            <div class="timeline-content">
              <span class="tl-event">${r.approvalStatus === 'approved' ? '✅ Approved by ' : '❌ Rejected by '}${r.manager}</span>
              <span class="tl-time">${new Date(r.updatedAt).toLocaleString()}</span>
            </div>
          </div>` : ''}
        </div>

        ${isPending ? `
        <div class="approval-actions">
          <button class="btn-approve" onclick="window._approveRequest('${r.id}')">
            ✅ Approve
          </button>
          <button class="btn-reject" onclick="window._rejectRequest('${r.id}')">
            ❌ Reject
          </button>
        </div>` : `
        <div class="approval-result ${r.approvalStatus}">
          ${r.approvalStatus === 'approved' ? '✅ Approved' : '❌ Rejected'}
          ${r.comments ? ` — "${r.comments}"` : ''}
        </div>`}
      </div>
    `;
  }

  window._approveRequest = (id) => {
    const box = document.getElementById('approve-modal-box');
    box.innerHTML = `
      <h3 style="color:#10B981;margin:0 0 16px">Approve Request</h3>
      <p style="color:#aaa;margin:0 0 12px;font-size:14px">Request <strong style="color:#fff">${id}</strong> will be approved and tasks will be auto-generated for all departments.</p>
      <textarea id="approve-comment" class="modal-textarea" placeholder="Add a comment (optional)..."></textarea>
      <div style="display:flex;gap:12px;margin-top:16px">
        <button class="btn-approve" style="flex:1" onclick="window._confirmApprove('${id}')">Confirm Approve</button>
        <button class="btn-secondary" style="flex:1" onclick="document.getElementById('approve-modal').style.display='none'">Cancel</button>
      </div>
    `;
    document.getElementById('approve-modal').style.display = 'flex';
  };

  window._rejectRequest = (id) => {
    const box = document.getElementById('approve-modal-box');
    box.innerHTML = `
      <h3 style="color:#F43F5E;margin:0 0 16px">Reject Request</h3>
      <p style="color:#aaa;margin:0 0 12px;font-size:14px">Please provide a reason for rejecting request <strong style="color:#fff">${id}</strong>.</p>
      <textarea id="approve-comment" class="modal-textarea" placeholder="Reason for rejection (required)..."></textarea>
      <div style="display:flex;gap:12px;margin-top:16px">
        <button class="btn-reject" style="flex:1" onclick="window._confirmReject('${id}')">Confirm Reject</button>
        <button class="btn-secondary" style="flex:1" onclick="document.getElementById('approve-modal').style.display='none'">Cancel</button>
      </div>
    `;
    document.getElementById('approve-modal').style.display = 'flex';
  };

  window._confirmApprove = (id) => {
    const comment = document.getElementById('approve-comment').value;
    const req = window.APP_DATA.requests.find(r => r.id === id);
    if (req) {
      req.approvalStatus = 'approved';
      req.status = 'approved';
      req.comments = comment;
      req.updatedAt = new Date().toISOString();
      req.completionPercent = 10;
      // Auto-generate tasks if empty
      if (req.tasks.length === 0) {
        req.tasks = generateDefaultTasks(req);
      }
    }
    document.getElementById('approve-modal').style.display = 'none';
    window.NotificationSystem.show(`Request ${id} approved! Tasks auto-generated for all departments.`, 'success');
    render();
  };

  window._confirmReject = (id) => {
    const comment = document.getElementById('approve-comment').value;
    if (!comment.trim()) {
      window.NotificationSystem.show('Please provide a rejection reason.', 'error');
      return;
    }
    const req = window.APP_DATA.requests.find(r => r.id === id);
    if (req) {
      req.approvalStatus = 'rejected';
      req.status = 'rejected';
      req.comments = comment;
      req.updatedAt = new Date().toISOString();
    }
    document.getElementById('approve-modal').style.display = 'none';
    window.NotificationSystem.show(`Request ${id} rejected.`, 'error');
    render();
  };

  window._closeApproveModal = (e) => {
    if (e.target.id === 'approve-modal') document.getElementById('approve-modal').style.display = 'none';
  };

  function generateDefaultTasks(req) {
    const base = [
      { dept: 'IT', name: req.type === 'onboarding' ? 'Laptop Setup & Configuration' : 'Access Revocation', assignee: 'Marcus Webb' },
      { dept: 'IT', name: req.type === 'onboarding' ? 'Account Creation (AD/O365)' : 'Device Recovery & Wipe', assignee: 'Marcus Webb' },
      { dept: 'HR', name: req.type === 'onboarding' ? 'Send Offer & Documents' : 'Exit Interview & Documentation', assignee: 'James Patel' },
      { dept: 'Facilities', name: req.type === 'onboarding' ? 'Desk & Workstation Assignment' : 'Desk Clearance & Key Return', assignee: 'Tom Rivera' },
      { dept: 'Security', name: req.type === 'onboarding' ? 'Badge Issuance & Building Access' : 'Badge Deactivation', assignee: 'Priya Sharma' },
    ];
    return base.map((t, i) => ({
      id: `T${Date.now()}${i}`,
      dept: t.dept,
      name: t.name,
      status: 'pending',
      assignee: t.assignee,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
  }

  render();
}

window.renderApprovals = renderApprovals;
