// ServiceNow Workspace Component

window.initWorkspace = function(containerId, getRequests, getActiveRole, getActiveUser, onApprove, onReject, selectRequestForFlow) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let selectedRequestId = null;
    let searchQuery = '';

    function render() {
        const requests = getRequests();
        const activeRole = getActiveRole();
        const activeUser = getActiveUser();

        // Filter requests based on search query
        const filteredRequests = requests.filter(r => {
            const query = searchQuery.toLowerCase();
            return (
                r.number.toLowerCase().includes(query) ||
                r.employeeName.toLowerCase().includes(query) ||
                r.employeeId.toLowerCase().includes(query) ||
                r.department.toLowerCase().includes(query) ||
                (r.jobTitle && r.jobTitle.toLowerCase().includes(query)) ||
                r.stage.toLowerCase().includes(query)
            );
        });

        // Find currently selected request
        const selectedRequest = requests.find(r => r.id === selectedRequestId) || (filteredRequests.length > 0 ? filteredRequests[0] : null);
        if (selectedRequest && !selectedRequestId) {
            selectedRequestId = selectedRequest.id;
        }

        container.innerHTML = `
            <div class="glass-panel">
                <div class="glass-panel-header">
                    <h2 class="glass-panel-title">
                        <i data-lucide="layout-grid"></i>
                        Employee Lifecycle Workspace [u_employee_lifecycle]
                    </h2>
                </div>

                <div class="detail-grid">
                    <!-- Left Panel: Tickets List -->
                    <div class="workspace-list-column">
                        <div class="workspace-header">
                            <div class="workspace-search">
                                <i data-lucide="search"></i>
                                <input type="text" id="ws-search-input" placeholder="Search requests..." value="${searchQuery}">
                            </div>
                            <div style="font-size: 12px; color: var(--text-secondary);">
                                Showing ${filteredRequests.length} requests
                            </div>
                        </div>

                        <div class="table-responsive" style="max-height: 520px; border: 1px solid var(--border-color); border-radius: 8px;">
                            <table class="sn-table">
                                <thead>
                                    <tr>
                                        <th>Number</th>
                                        <th>Type</th>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Date</th>
                                        <th>Stage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filteredRequests.length === 0 ? `
                                        <tr>
                                            <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
                                                No lifecycle requests found.
                                            </td>
                                        </tr>
                                    ` : filteredRequests.map(r => `
                                        <tr class="ws-row ${selectedRequestId === r.id ? 'row-selected' : ''}" data-id="${r.id}" style="${selectedRequestId === r.id ? 'background: rgba(255,255,255,0.04);' : ''}">
                                            <td style="font-weight: 700; color: var(--brand-primary);">${r.number}</td>
                                            <td>
                                                <span class="ticket-type-badge ${r.type.toLowerCase()}">${r.type}</span>
                                            </td>
                                            <td>
                                                <div style="font-weight: 600;">${r.employeeName}</div>
                                                <div style="font-size: 10px; color: var(--text-muted);">${r.employeeId}</div>
                                            </td>
                                            <td>${r.department}</td>
                                            <td>${r.type === 'Onboarding' ? r.joiningDate : r.lastWorkingDay}</td>
                                            <td>
                                                <span class="stage-badge ${getStageClass(r.stage)}">
                                                    ${getStageIcon(r.stage)}
                                                    ${r.stage}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Right Panel: Selection Detail Details -->
                    <div class="workspace-detail-column">
                        ${selectedRequest ? renderDetailView(selectedRequest, activeRole, activeUser) : `
                            <div style="text-align: center; color: var(--text-muted); padding: 40px;">
                                <i data-lucide="info" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
                                <p>Select a request from the table to view lifecycle progression, tasks, approval logs, and SLAs.</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        setupListeners(filteredRequests);
        lucide.createIcons();
    }

    function getStageClass(stage) {
        switch(stage) {
            case 'Draft': return 'draft';
            case 'Awaiting Approval': return 'awaiting';
            case 'Work in Progress': return 'wip';
            case 'Closed Complete': return 'complete';
            case 'Closed Rejected': return 'rejected';
            default: return 'draft';
        }
    }

    function getStageIcon(stage) {
        switch(stage) {
            case 'Draft': return '<i data-lucide="edit-3" style="width:10px;height:10px;"></i>';
            case 'Awaiting Approval': return '<i data-lucide="clock" style="width:10px;height:10px;"></i>';
            case 'Work in Progress': return '<i data-lucide="loader" style="width:10px;height:10px;"></i>';
            case 'Closed Complete': return '<i data-lucide="check-circle" style="width:10px;height:10px;"></i>';
            case 'Closed Rejected': return '<i data-lucide="x-circle" style="width:10px;height:10px;"></i>';
            default: return '';
        }
    }

    function renderDetailView(req, activeRole, activeUser) {
        const isManager = activeRole === 'Manager';
        const isAwaitingApproval = req.stage === 'Awaiting Approval';
        const isTargetManager = req.manager === activeUser.name;
        const showApprovalAction = isAwaitingApproval && ((isManager && isTargetManager) || activeRole === 'HR Admin');

        return `
            <div class="detail-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                    <div>
                        <span style="font-size: 11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); font-weight:700;">Record Details [u_employee_lifecycle]</span>
                        <h3 style="font-size: 18px; font-weight:800; color:white;">${req.number}</h3>
                    </div>
                    <button class="btn btn-secondary btn-sm" id="btn-view-in-flow" data-id="${req.id}">
                        <i data-lucide="git-pull-request" style="width:12px;height:12px;"></i> Visual Flow
                    </button>
                </div>

                <!-- Approval Panel (Actionable) -->
                ${showApprovalAction ? `
                    <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 14px; margin-bottom: 16px; animation: pulse-glow 2s infinite;">
                        <h4 style="font-size:13.5px; font-weight:700; color:var(--color-warning); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                            <i data-lucide="user-check" style="width:16px;height:16px;"></i> Approval Required
                        </h4>
                        <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:12px;">
                            This ${req.type} request is pending your authorization. Please review the details below.
                        </p>
                        <div class="form-group" style="margin-bottom:12px;">
                            <input type="text" id="approval-comment" class="form-input" style="font-size:12px; padding:8px;" placeholder="Add comments (optional)...">
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-success btn-sm" id="btn-approve-req" data-id="${req.id}">
                                <i data-lucide="check" style="width:12px;height:12px;"></i> Approve
                            </button>
                            <button class="btn btn-danger btn-sm" id="btn-reject-req" data-id="${req.id}">
                                <i data-lucide="x" style="width:12px;height:12px;"></i> Reject
                            </button>
                        </div>
                    </div>
                ` : ''}

                <!-- Fields Grid -->
                <div class="detail-section-title">Record Fields</div>
                <div class="detail-info-list" style="margin-bottom: 16px;">
                    <div class="detail-item">
                        <span class="detail-label">Employee</span>
                        <span class="detail-val" style="font-weight:700; color:var(--brand-primary);">${req.employeeName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Employee ID</span>
                        <span class="detail-val">${req.employeeId}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Department</span>
                        <span class="detail-val">${req.department}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Job Title</span>
                        <span class="detail-val">${req.jobTitle || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Manager</span>
                        <span class="detail-val">${req.manager}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">${req.type === 'Onboarding' ? 'Joining Date' : 'Last Working Day'}</span>
                        <span class="detail-val" style="color:var(--color-info); font-weight:700;">
                            ${req.type === 'Onboarding' ? req.joiningDate : req.lastWorkingDay}
                        </span>
                    </div>
                    
                    ${req.type === 'Onboarding' ? `
                        <div class="detail-item">
                            <span class="detail-label">Location</span>
                            <span class="detail-val">${req.location}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Device Required</span>
                            <span class="detail-val">${req.laptopDesktop}</span>
                        </div>
                        <div class="detail-item span-2" style="grid-column: span 2;">
                            <span class="detail-label">Software Access</span>
                            <span class="detail-val" style="font-size:12px; color:var(--text-secondary);">${req.softwareAccess || 'None requested'}</span>
                        </div>
                        <div class="detail-item span-2" style="grid-column: span 2;">
                            <span class="detail-label">Building Access</span>
                            <span class="detail-val" style="font-size:12px; color:var(--text-secondary);">${req.buildingAccess || 'None requested'}</span>
                        </div>
                        <div class="detail-item span-2" style="grid-column: span 2;">
                            <span class="detail-label">Additional Info</span>
                            <span class="detail-val" style="font-size:12.5px; font-style:italic;">"${req.additionalRequirements || 'No notes added'}"</span>
                        </div>
                    ` : `
                        <div class="detail-item">
                            <span class="detail-label">Exit Reason</span>
                            <span class="detail-val">${req.reasonForExit}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Account Deactivation</span>
                            <span class="detail-val">${req.accountDeactivationDate}</span>
                        </div>
                        <div class="detail-item span-2" style="grid-column: span 2;">
                            <span class="detail-label">Asset Return Details</span>
                            <span class="detail-val" style="font-size:12px; color:var(--text-secondary);">${req.assetReturnDetails || 'None'}</span>
                        </div>
                    `}
                </div>

                <!-- SLA Progress -->
                ${req.stage !== 'Closed Rejected' && req.slas && req.slas.length > 0 ? `
                    <div class="detail-section-title">Active SLAs</div>
                    <div style="margin-bottom: 20px;">
                        ${req.slas.map(sla => {
                            const percent = Math.max(0, Math.min(100, (sla.remainingTime / sla.duration) * 100));
                            let fillClass = '';
                            if (sla.isBreached) fillClass = 'breached';
                            else if (sla.remainingTime < sla.duration * 0.25) fillClass = 'warning';

                            return `
                                <div class="sla-widget" style="margin-bottom:8px; padding:12px;">
                                    <div style="display:flex; justify-content:space-between; font-size:11px;">
                                        <span style="font-weight:700; color:white;">${sla.name}</span>
                                        <span style="color: ${sla.isBreached ? 'var(--color-danger)' : 'var(--text-secondary)'}; font-weight:700;">
                                            ${sla.isBreached ? 'BREACHED' : sla.stage === 'Completed' ? 'COMPLETED' : 'RUNNING'}
                                        </span>
                                    </div>
                                    
                                    ${sla.stage !== 'Completed' ? `
                                        <div class="sla-progress-bg" style="height:4px; margin:6px 0;">
                                            <div class="sla-progress-fill ${fillClass}" style="width: ${percent}%;"></div>
                                        </div>
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <span style="font-size:10px; color:var(--text-muted);">Time Remaining:</span>
                                            <span class="sla-time-val ${fillClass}" style="font-size:13px; margin:0;">
                                                ${window.formatTimeRemaining(sla.remainingTime)}
                                            </span>
                                        </div>
                                    ` : `
                                        <div class="sla-progress-bg" style="height:4px; margin:6px 0; background:rgba(255,255,255,0.02)">
                                            <div class="sla-progress-fill" style="width: 100%; background:var(--color-onboarding);"></div>
                                        </div>
                                        <div style="font-size:10px; color:var(--text-muted); text-align:right;">Completed within SLA limits</div>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}

                <!-- Tasks Listing -->
                ${req.tasks && req.tasks.length > 0 ? `
                    <div class="detail-section-title">Child Department Tasks</div>
                    <div style="margin-bottom: 20px;">
                        ${req.tasks.map(t => `
                            <div class="task-item-card">
                                <div class="task-item-left">
                                    <div class="task-dept-badge ${t.department}">${t.department}</div>
                                    <div class="task-text">
                                        <span class="task-title">${t.shortDescription}</span>
                                        <span class="task-due">State: <strong style="color: ${t.state === 'Closed Complete' ? 'var(--color-onboarding)' : 'var(--color-warning)'}">${t.state}</strong></span>
                                    </div>
                                </div>
                                <span style="font-size: 11px; font-weight:700; color:var(--text-muted);">${t.number}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Audit Log Section -->
                <div class="detail-section-title">Audit Trail & Work Notes</div>
                <div class="audit-list">
                    ${req.auditLogs && req.auditLogs.length > 0 ? req.auditLogs.map(log => `
                        <div class="audit-item ${getAuditClass(log.event)}">
                            <div class="audit-header">
                                <span>${log.event}</span>
                                <span>${log.timestamp}</span>
                            </div>
                            <div class="audit-desc">${log.description}</div>
                        </div>
                    `).reverse().join('') : `
                        <div style="text-align:center; padding:10px; font-size:11px; color:var(--text-muted);">No logs recorded.</div>
                    `}
                </div>
            </div>
        `;
    }

    function getAuditClass(event) {
        if (event.includes('Approved')) return 'success';
        if (event.includes('Rejected')) return 'danger';
        if (event.includes('SLA') || event.includes('Warning')) return 'warning';
        if (event.includes('Task Created') || event.includes('Task Completed')) return 'info';
        return '';
    }

    function setupListeners(filteredRequests) {
        // Search Input
        const searchInput = document.getElementById('ws-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                render();
                // Keep cursor focus at end of input
                const inp = document.getElementById('ws-search-input');
                inp.focus();
                inp.setSelectionRange(inp.value.length, inp.value.length);
            });
        }

        // Row Selection
        const rows = document.querySelectorAll('.ws-row');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                selectedRequestId = parseInt(row.getAttribute('data-id'));
                render();
            });
        });

        // Approve / Reject Actions
        const approveBtn = document.getElementById('btn-approve-req');
        const rejectBtn = document.getElementById('btn-reject-req');
        const commentInput = document.getElementById('approval-comment');

        if (approveBtn) {
            approveBtn.addEventListener('click', () => {
                const id = parseInt(approveBtn.getAttribute('data-id'));
                const comments = commentInput ? commentInput.value : '';
                onApprove(id, comments);
                render();
            });
        }

        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => {
                const id = parseInt(rejectBtn.getAttribute('data-id'));
                const comments = commentInput ? commentInput.value : '';
                onReject(id, comments);
                render();
            });
        }

        // View in Flow button
        const viewInFlowBtn = document.getElementById('btn-view-in-flow');
        if (viewInFlowBtn) {
            viewInFlowBtn.addEventListener('click', () => {
                const id = parseInt(viewInFlowBtn.getAttribute('data-id'));
                selectRequestForFlow(id);
            });
        }
    }

    return {
        render: render,
        selectRequest: (id) => {
            selectedRequestId = id;
            render();
        }
    };
}
