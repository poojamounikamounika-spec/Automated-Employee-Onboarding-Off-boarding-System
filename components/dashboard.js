// ServiceNow Analytics Dashboard Component

window.initDashboard = function(containerId, getRequests) {
    const container = document.getElementById(containerId);
    if (!container) return;

    function render() {
        const requests = getRequests();

        // Calculate KPI Metrics
        const activeOnboarding = requests.filter(r => r.type === 'Onboarding' && r.stage !== 'Closed Complete' && r.stage !== 'Closed Rejected').length;
        const activeOffboarding = requests.filter(r => r.type === 'Offboarding' && r.stage !== 'Closed Complete' && r.stage !== 'Closed Rejected').length;
        const pendingApprovals = requests.filter(r => r.stage === 'Awaiting Approval').length;
        
        // SLA Calculations
        let totalSlas = 0;
        let breachedSlas = 0;
        requests.forEach(r => {
            if (r.slas) {
                r.slas.forEach(s => {
                    totalSlas++;
                    if (s.isBreached) breachedSlas++;
                });
            }
        });
        const slaComplianceRate = totalSlas === 0 ? 100 : Math.round(((totalSlas - breachedSlas) / totalSlas) * 100);

        // Departmental Workload Calculation
        const deptWorkload = { HR: 0, IT: 0, Facilities: 0, Security: 0 };
        let totalTasks = 0;
        let completedTasksCount = 0;

        requests.forEach(r => {
            if (r.tasks) {
                r.tasks.forEach(t => {
                    totalTasks++;
                    if (t.state === 'Closed Complete') completedTasksCount++;
                    if (deptWorkload[t.department] !== undefined) {
                        deptWorkload[t.department]++;
                    }
                });
            }
        });

        const taskCompletionRate = totalTasks === 0 ? 100 : Math.round((completedTasksCount / totalTasks) * 100);

        // Find maximum workload to scale chart
        const maxWorkload = Math.max(1, ...Object.values(deptWorkload));

        container.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 22px; font-weight:800; color:white; display:flex; align-items:center; gap:10px;">
                    <i data-lucide="bar-chart-2" style="color:var(--brand-primary)"></i>
                    ServiceNow Analytics & SLA Compliance Dashboard
                </h2>
                <p style="color:var(--text-secondary); font-size:13px; margin-top:4px;">
                    Real-time monitoring of operational workflows, department task fulfillment, and SLA compliance metrics.
                </p>
            </div>

            <!-- KPI Cards Grid -->
            <div class="dashboard-grid">
                <!-- KPI 1 -->
                <div class="kpi-card">
                    <div class="kpi-card-header">
                        <span>Active Onboardings</span>
                        <i data-lucide="user-plus" style="color:var(--color-onboarding);"></i>
                    </div>
                    <div class="kpi-card-value">${activeOnboarding}</div>
                    <div class="kpi-card-trend up">
                        <i data-lucide="trending-up" style="width:12px;height:12px;"></i>
                        <span>+12.4% vs last month</span>
                    </div>
                </div>

                <!-- KPI 2 -->
                <div class="kpi-card">
                    <div class="kpi-card-header">
                        <span>Active Offboardings</span>
                        <i data-lucide="user-minus" style="color:var(--color-offboarding);"></i>
                    </div>
                    <div class="kpi-card-value">${activeOffboarding}</div>
                    <div class="kpi-card-trend down">
                        <i data-lucide="trending-down" style="width:12px;height:12px;"></i>
                        <span>-4.2% vs last month</span>
                    </div>
                </div>

                <!-- KPI 3 -->
                <div class="kpi-card">
                    <div class="kpi-card-header">
                        <span>Pending Approvals</span>
                        <i data-lucide="clock" style="color:var(--color-warning);"></i>
                    </div>
                    <div class="kpi-card-value">${pendingApprovals}</div>
                    <div class="kpi-card-trend neutral">
                        <i data-lucide="minus" style="width:12px;height:12px;"></i>
                        <span>Consistent backlog</span>
                    </div>
                </div>

                <!-- KPI 4 -->
                <div class="kpi-card" style="${slaComplianceRate < 80 ? 'border-color: rgba(244,63,94,0.4);' : ''}">
                    <div class="kpi-card-header">
                        <span>SLA Compliance</span>
                        <i data-lucide="award" style="color:var(--color-info);"></i>
                    </div>
                    <div class="kpi-card-value" style="color: ${slaComplianceRate < 80 ? 'var(--color-offboarding)' : 'var(--brand-primary)'}">${slaComplianceRate}%</div>
                    <div class="kpi-card-trend ${slaComplianceRate >= 80 ? 'up' : 'down'}">
                        <i data-lucide="${slaComplianceRate >= 80 ? 'chevron-up' : 'alert-triangle'}" style="width:12px;height:12px;"></i>
                        <span>Target: 95% threshold</span>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-grid">
                <!-- Line Chart: Monthly lifecycle trends -->
                <div class="chart-card">
                    <div class="chart-title">Monthly Employee Lifecycle Trends (6-Month Range)</div>
                    <div style="position:relative; height:240px; margin-bottom:10px;">
                        <!-- Custom SVG Line Chart -->
                        <svg viewBox="0 0 500 220" width="100%" height="100%" style="overflow:visible;">
                            <!-- Chart Gridlines -->
                            <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
                            <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" />
                            <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" />
                            <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.05)" />
                            <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
                            
                            <!-- Trend Lines -->
                            <path d="M 50,150 L 130,135 L 210,105 L 290,120 L 370,85 L 450,70" fill="none" stroke="var(--color-onboarding)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(16,185,129,0.3));" />
                            <path d="M 50,170 L 130,160 L 210,165 L 290,152 L 370,145 L 450,155" fill="none" stroke="var(--color-offboarding)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(244,63,94,0.3));" />

                            <!-- Trend Nodes (Onboarding) -->
                            <circle cx="50" cy="150" r="4" fill="var(--color-onboarding)" />
                            <circle cx="130" cy="135" r="4" fill="var(--color-onboarding)" />
                            <circle cx="210" cy="105" r="4" fill="var(--color-onboarding)" />
                            <circle cx="290" cy="120" r="4" fill="var(--color-onboarding)" />
                            <circle cx="370" cy="85" r="4" fill="var(--color-onboarding)" />
                            <circle cx="450" cy="70" r="4" fill="var(--color-onboarding)" />

                            <!-- Trend Nodes (Offboarding) -->
                            <circle cx="50" cy="170" r="4" fill="var(--color-offboarding)" />
                            <circle cx="130" cy="160" r="4" fill="var(--color-offboarding)" />
                            <circle cx="210" cy="165" r="4" fill="var(--color-offboarding)" />
                            <circle cx="290" cy="152" r="4" fill="var(--color-offboarding)" />
                            <circle cx="370" cy="145" r="4" fill="var(--color-offboarding)" />
                            <circle cx="450" cy="155" r="4" fill="var(--color-offboarding)" />

                            <!-- Text Labels (Months) -->
                            <text x="50" y="195" text-anchor="middle" fill="var(--text-secondary)" font-size="10">Jan</text>
                            <text x="130" y="195" text-anchor="middle" fill="var(--text-secondary)" font-size="10">Feb</text>
                            <text x="210" y="195" text-anchor="middle" fill="var(--text-secondary)" font-size="10">Mar</text>
                            <text x="290" y="195" text-anchor="middle" fill="var(--text-secondary)" font-size="10">Apr</text>
                            <text x="370" y="195" text-anchor="middle" fill="var(--text-secondary)" font-size="10">May</text>
                            <text x="450" y="195" text-anchor="middle" fill="var(--text-secondary)" font-size="10">Jun</text>
                            
                            <!-- Y-axis scales -->
                            <text x="30" y="173" text-anchor="end" fill="var(--text-muted)" font-size="9">0</text>
                            <text x="30" y="123" text-anchor="end" fill="var(--text-muted)" font-size="9">15</text>
                            <text x="30" y="73" text-anchor="end" fill="var(--text-muted)" font-size="9">30</text>
                            <text x="30" y="23" text-anchor="end" fill="var(--text-muted)" font-size="9">45</text>
                        </svg>
                    </div>
                    <div style="display:flex; justify-content:center; gap:20px; font-size:12px;">
                        <span style="display:flex; align-items:center; gap:6px;"><span class="pie-color-dot" style="background:var(--color-onboarding);"></span> Onboarding Requests</span>
                        <span style="display:flex; align-items:center; gap:6px;"><span class="pie-color-dot" style="background:var(--color-offboarding);"></span> Offboarding Requests</span>
                    </div>
                </div>

                <!-- Column Chart: Department-wise workload and completeness -->
                <div class="chart-card">
                    <div class="chart-title">Department Workload Distribution</div>
                    
                    <div class="bar-chart-container">
                        <!-- HR Column -->
                        <div class="bar-column">
                            <span class="bar-val">${deptWorkload.HR}</span>
                            <div class="bar-rect-wrap">
                                <div class="bar-rect-fill" style="height: ${(deptWorkload.HR / maxWorkload) * 100}%; background:var(--color-onboarding);"></div>
                            </div>
                            <span class="bar-label">HR</span>
                        </div>

                        <!-- IT Column -->
                        <div class="bar-column">
                            <span class="bar-val">${deptWorkload.IT}</span>
                            <div class="bar-rect-wrap">
                                <div class="bar-rect-fill" style="height: ${(deptWorkload.IT / maxWorkload) * 100}%; background:var(--brand-secondary);"></div>
                            </div>
                            <span class="bar-label">IT</span>
                        </div>

                        <!-- Facilities Column -->
                        <div class="bar-column">
                            <span class="bar-val">${deptWorkload.Facilities}</span>
                            <div class="bar-rect-wrap">
                                <div class="bar-rect-fill" style="height: ${(deptWorkload.Facilities / maxWorkload) * 100}%; background:#a855f7;"></div>
                            </div>
                            <span class="bar-label">FAC</span>
                        </div>

                        <!-- Security Column -->
                        <div class="bar-column">
                            <span class="bar-val">${deptWorkload.Security}</span>
                            <div class="bar-rect-wrap">
                                <div class="bar-rect-fill" style="height: ${(deptWorkload.Security / maxWorkload) * 100}%; background:var(--color-warning);"></div>
                            </div>
                            <span class="bar-label">SEC</span>
                        </div>
                    </div>

                    <!-- Department task fulfillment progress list -->
                    <div class="pie-sim-container" style="margin-top: 15px;">
                        <div style="font-size:11.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Task Fulfillment Rate</div>
                        
                        <div class="pie-sim-row">
                            <span class="pie-sim-label-wrap">
                                <span class="pie-color-dot" style="background:var(--brand-primary)"></span>
                                Overall Progress
                            </span>
                            <div class="pie-progress-bar">
                                <div class="pie-progress-fill" style="width: ${taskCompletionRate}%; background:var(--brand-gradient);"></div>
                            </div>
                            <span class="pie-sim-val">${taskCompletionRate}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Historical Compliance and SLA Breach Reports -->
            <div class="glass-panel" style="margin-top: 24px; margin-bottom:0;">
                <div class="glass-panel-header" style="margin-bottom:12px; padding-bottom:8px;">
                    <h3 style="font-size:14px; font-weight:700; color:white; display:flex; align-items:center; gap:6px;">
                        <i data-lucide="shield-check" style="color:var(--color-onboarding); width:16px; height:16px;"></i>
                        System Audit & Compliance Log
                    </h3>
                </div>
                
                <div style="overflow-x:auto;">
                    <table class="sn-table" style="font-size:11.5px;">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Lifecycle Event</th>
                                <th>Authorized By</th>
                                <th>Compliance Status</th>
                                <th>Log Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Retrieve recent log events from requests to simulate dynamic auditing -->
                            ${getRecentAuditLogs(requests).map(log => `
                                <tr>
                                    <td style="color:var(--text-muted);">${log.timestamp}</td>
                                    <td style="font-weight:600; color:white;">${log.event}</td>
                                    <td>${log.user || 'System Automation'}</td>
                                    <td>
                                        <span class="stage-badge ${getAuditStatusClass(log.event)}" style="padding:1px 5px; font-size:10px;">
                                            ${log.event.includes('Rejected') || log.event.includes('Breach') ? 'Non-Compliant' : 'Compliant'}
                                        </span>
                                    </td>
                                    <td style="white-space:normal; line-height:1.3; color:var(--text-secondary);">${log.description}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function getRecentAuditLogs(requests) {
        let logs = [];
        requests.forEach(r => {
            if (r.auditLogs) {
                r.auditLogs.forEach(l => {
                    logs.push({
                        ...l,
                        requestNumber: r.number
                    });
                });
            }
        });
        // Sort by timestamp decending and take first 5
        return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5);
    }

    function getAuditStatusClass(event) {
        if (event.includes('Rejected') || event.includes('Breach')) return 'rejected';
        if (event.includes('Approved') || event.includes('Closed')) return 'complete';
        return 'draft';
    }

    return {
        render: render
    };
}
