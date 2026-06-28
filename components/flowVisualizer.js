// ServiceNow Flow Designer Execution Visualizer Component

window.initFlowVisualizer = function(containerId, getRequests, getActiveRequestId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let selectedRequestId = getActiveRequestId();

    function render() {
        const requests = getRequests();
        
        // Handle fallback selected request if none active
        if (!selectedRequestId && requests.length > 0) {
            selectedRequestId = requests[0].id;
        }

        const selectedRequest = requests.find(r => r.id === selectedRequestId);

        container.innerHTML = `
            <div class="glass-panel" style="min-height: 580px;">
                <div class="glass-panel-header">
                    <h2 class="glass-panel-title">
                        <i data-lucide="git-pull-request"></i>
                        Flow Designer: Dynamic Engine Visualizer
                    </h2>
                    <div class="flow-selector-bar">
                        <label for="flow-request-select" style="font-size:12px; color:var(--text-secondary); font-weight:600;">Selected Execution:</label>
                        <select id="flow-request-select" class="form-select" style="font-size:12px; padding:6px 10px; width:200px;">
                            ${requests.length === 0 ? `
                                <option value="">-- No Executions --</option>
                            ` : requests.map(r => `
                                <option value="${r.id}" ${r.id === selectedRequestId ? 'selected' : ''}>${r.number} (${r.employeeName})</option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                ${!selectedRequest ? `
                    <div style="text-align: center; color: var(--text-muted); padding: 80px;">
                        <i data-lucide="git-branch" style="width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.5;"></i>
                        <p style="font-size:15px; font-weight:600;">No active Flow Designer executions found.</p>
                        <p style="font-size:13px; margin-top:6px;">Go to the "Service Catalog" tab and order a request to trigger the automation engine.</p>
                    </div>
                ` : `
                    <div class="flow-visualizer-container">
                        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.15); border:1px solid var(--border-color); padding:10px 16px; border-radius:8px; font-size:13px;">
                            <div>Active Flow: <strong style="color:var(--brand-primary);">${selectedRequest.type === 'Onboarding' ? 'Employee Onboarding Process Flow' : 'Employee Offboarding Process Flow'}</strong></div>
                            <div>Execution Status: <span class="stage-badge ${getStageClass(selectedRequest.stage)}" style="padding:2px 6px;">${selectedRequest.stage}</span></div>
                        </div>

                        <div class="flow-canvas" id="flow-canvas-svg-container">
                            ${selectedRequest.type === 'Onboarding' ? renderOnboardingFlowSvg(selectedRequest) : renderOffboardingFlowSvg(selectedRequest)}
                        </div>
                    </div>
                `}
            </div>
        `;

        setupListeners();
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

    // Renders the Onboarding Flow Diagram
    function renderOnboardingFlowSvg(req) {
        // Stage flags to determine color coding of nodes
        const stage = req.stage;
        
        const isApprovalActive = stage === 'Awaiting Approval';
        const isApprovalCompleted = stage !== 'Awaiting Approval' && stage !== 'Draft';
        const isApproved = stage === 'Work in Progress' || stage === 'Closed Complete';
        const isRejected = stage === 'Closed Rejected';

        // Check task states for parallel steps
        const hrTask = req.tasks.find(t => t.department === 'HR');
        const itTask = req.tasks.find(t => t.department === 'IT');
        const facTask = req.tasks.find(t => t.department === 'Facilities');
        const secTask = req.tasks.find(t => t.department === 'Security');

        const getTaskNodeState = (t) => {
            if (!isApproved) return 'pending'; // Awaiting manager approval first
            if (t.state === 'Open') return 'open';
            if (t.state === 'Work in Progress') return 'active';
            if (t.state === 'Closed Complete') return 'completed';
            return 'pending';
        };

        const hrState = getTaskNodeState(hrTask);
        const itState = getTaskNodeState(itTask);
        const facState = getTaskNodeState(facTask);
        const secState = getTaskNodeState(secTask);

        const isWaitCompleted = isApproved && req.tasks.every(t => t.state === 'Closed Complete');
        const isWaitActive = isApproved && !isWaitCompleted;

        const isCloseCompleted = stage === 'Closed Complete';
        const isCloseRejectedCompleted = stage === 'Closed Rejected';
        
        return `
            <svg class="flow-svg" viewBox="0 0 850 480" xmlns="http://www.w3.org/2000/svg">
                <!-- SVG Arrow Marker Definitions -->
                <defs>
                    <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" class="flow-marker" />
                    </marker>
                    <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" class="flow-marker active" />
                    </marker>
                    <marker id="arrow-completed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" class="flow-marker completed" />
                    </marker>
                </defs>

                <!-- Connection Lines -->
                <!-- Trigger -> Manager Approval -->
                <line x1="120" y1="210" x2="180" y2="210" class="flow-link-line completed" marker-end="url(#arrow-completed)" />
                
                <!-- Manager Approval -> Decision Diamond -->
                <line x1="280" y1="210" x2="330" y2="210" class="flow-link-line ${isApprovalCompleted ? 'completed' : isApprovalActive ? 'active' : ''}" marker-end="${isApprovalCompleted ? 'url(#arrow-completed)' : isApprovalActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}" />
                
                <!-- Decision YES -> Task Dispatcher (Parallel splits) -->
                <line x1="390" y1="210" x2="430" y2="210" class="flow-link-line ${isApproved ? 'completed' : ''}" marker-end="${isApproved ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />
                
                <!-- Decision NO (Rejection Branch) -->
                <path d="M 360,240 L 360,340 L 440,340" fill="none" class="flow-link-line ${isRejected ? 'completed' : ''}" marker-end="${isRejected ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />

                <!-- Parallel Task Splitting Lines -->
                <!-- Split -> HR Task -->
                <path d="M 430,210 L 430,70 L 460,70" fill="none" class="flow-link-line ${isApproved ? 'completed' : ''}" marker-end="${isApproved ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />
                <!-- Split -> IT Task -->
                <path d="M 430,210 L 430,160 L 460,160" fill="none" class="flow-link-line ${isApproved ? 'completed' : ''}" marker-end="${isApproved ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />
                <!-- Split -> Facilities Task -->
                <path d="M 430,210 L 430,250 L 460,250" fill="none" class="flow-link-line ${isApproved ? 'completed' : ''}" marker-end="${isApproved ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />
                <!-- Split -> Security Task -->
                <path d="M 430,210 L 430,340 L 460,340" fill="none" class="flow-link-line ${isApproved ? 'completed' : ''}" marker-end="${isApproved ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />

                <!-- Merging Task Lines -> Join Wait Node -->
                <!-- HR Task -> Join -->
                <path d="M 590,70 L 620,70 L 620,210" fill="none" class="flow-link-line ${hrState === 'completed' ? 'completed' : ''}" />
                <!-- IT Task -> Join -->
                <path d="M 590,160 L 610,160 L 610,210" fill="none" class="flow-link-line ${itState === 'completed' ? 'completed' : ''}" />
                <!-- Facilities Task -> Join -->
                <path d="M 590,250 L 610,250 L 610,210" fill="none" class="flow-link-line ${facState === 'completed' ? 'completed' : ''}" />
                <!-- Security Task -> Join -->
                <path d="M 590,340 L 620,340 L 620,210" fill="none" class="flow-link-line ${secState === 'completed' ? 'completed' : ''}" />
                
                <!-- Join Node -> Wait Node -->
                <line x1="620" y1="210" x2="650" y2="210" class="flow-link-line ${isWaitCompleted ? 'completed' : isWaitActive ? 'active' : ''}" marker-end="${isWaitCompleted ? 'url(#arrow-completed)' : isWaitActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}" />
                
                <!-- Wait Node -> Auto Close Complete -->
                <line x1="740" y1="210" x2="770" y2="210" class="flow-link-line ${isCloseCompleted ? 'completed' : ''}" marker-end="${isCloseCompleted ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />

                <!-- Node: Trigger -->
                <g class="flow-node">
                    <rect x="20" y="180" width="100" height="60" class="flow-node-rect completed" />
                    <text x="70" y="210" text-anchor="middle" class="flow-node-title">1. Trigger</text>
                    <text x="70" y="225" text-anchor="middle" class="flow-node-type">Catalog Order</text>
                </g>

                <!-- Node: Ask Manager Approval -->
                <g class="flow-node">
                    <rect x="180" y="180" width="100" height="60" class="flow-node-rect ${isApprovalActive ? 'active' : isApprovalCompleted ? 'completed' : ''}" />
                    <text x="230" y="208" text-anchor="middle" class="flow-node-title">2. Approval</text>
                    <text x="230" y="220" text-anchor="middle" class="flow-node-type">Ask Manager</text>
                    <text x="230" y="232" text-anchor="middle" class="flow-node-type" style="fill:var(--text-muted); font-size:8px;">${req.manager}</text>
                </g>

                <!-- Decision Diamond (Approved?) -->
                <g class="flow-node">
                    <polygon points="360,180 390,210 360,240 330,210" fill="#1e293b" stroke="${isApprovalCompleted ? 'var(--color-onboarding)' : 'var(--border-color)'}" stroke-width="2" />
                    <text x="360" y="213" text-anchor="middle" style="fill:white; font-size:10px; font-weight:700;">Approved?</text>
                    <text x="382" y="200" style="fill:var(--color-onboarding); font-size:10px; font-weight:700;">Yes</text>
                    <text x="365" y="260" style="fill:var(--color-offboarding); font-size:10px; font-weight:700;">No</text>
                </g>

                <!-- Node: HR Task -->
                <g class="flow-node">
                    <rect x="460" y="40" width="130" height="60" class="flow-node-rect ${getNodeClass(hrState)}" />
                    <text x="525" y="68" text-anchor="middle" class="flow-node-title">3a. HR Task</text>
                    <text x="525" y="80" text-anchor="middle" class="flow-node-type">Profile & Docs</text>
                    <text x="525" y="92" text-anchor="middle" class="flow-node-type" style="fill:${hrState === 'completed' ? 'var(--color-onboarding)' : 'var(--color-warning)'}">${hrState.toUpperCase()}</text>
                </g>

                <!-- Node: IT Task -->
                <g class="flow-node">
                    <rect x="460" y="130" width="130" height="60" class="flow-node-rect ${getNodeClass(itState)}" />
                    <text x="525" y="158" text-anchor="middle" class="flow-node-title">3b. IT Task</text>
                    <text x="525" y="170" text-anchor="middle" class="flow-node-type">Device & Mail</text>
                    <text x="525" y="182" text-anchor="middle" class="flow-node-type" style="fill:${itState === 'completed' ? 'var(--color-onboarding)' : 'var(--color-warning)'}">${itState.toUpperCase()}</text>
                </g>

                <!-- Node: Facilities Task -->
                <g class="flow-node">
                    <rect x="460" y="220" width="130" height="60" class="flow-node-rect ${getNodeClass(facState)}" />
                    <text x="525" y="248" text-anchor="middle" class="flow-node-title">3c. Facilities Task</text>
                    <text x="525" y="260" text-anchor="middle" class="flow-node-type">Desk Allocation</text>
                    <text x="525" y="272" text-anchor="middle" class="flow-node-type" style="fill:${facState === 'completed' ? 'var(--color-onboarding)' : 'var(--color-warning)'}">${facState.toUpperCase()}</text>
                </g>

                <!-- Node: Security Task -->
                <g class="flow-node">
                    <rect x="460" y="310" width="130" height="60" class="flow-node-rect ${getNodeClass(secState)}" />
                    <text x="525" y="338" text-anchor="middle" class="flow-node-title">3d. Security Task</text>
                    <text x="525" y="350" text-anchor="middle" class="flow-node-type">Badge Provision</text>
                    <text x="525" y="362" text-anchor="middle" class="flow-node-type" style="fill:${secState === 'completed' ? 'var(--color-onboarding)' : 'var(--color-warning)'}">${secState.toUpperCase()}</text>
                </g>

                <!-- Node: Rejection Flow End -->
                <g class="flow-node">
                    <rect x="440" y="310" width="120" height="60" class="flow-node-rect ${isCloseRejectedCompleted ? 'completed' : 'skipped'}" style="stroke: ${isCloseRejectedCompleted ? 'var(--color-offboarding)' : ''}" />
                    <text x="500" y="340" text-anchor="middle" class="flow-node-title" style="fill: ${isCloseRejectedCompleted ? 'var(--color-offboarding)' : ''}">Rejected End</text>
                    <text x="500" y="355" text-anchor="middle" class="flow-node-type">Stage: Closed Reject</text>
                </g>

                <!-- Node: Wait for Tasks -->
                <g class="flow-node">
                    <rect x="650" y="180" width="90" height="60" class="flow-node-rect ${isWaitCompleted ? 'completed' : isWaitActive ? 'active' : ''}" />
                    <text x="695" y="210" text-anchor="middle" class="flow-node-title">4. Wait</text>
                    <text x="695" y="225" text-anchor="middle" class="flow-node-type">Join All Tasks</text>
                </g>

                <!-- Node: End and Close -->
                <g class="flow-node">
                    <rect x="770" y="180" width="70" height="60" class="flow-node-rect ${isCloseCompleted ? 'completed' : ''}" />
                    <text x="805" y="210" text-anchor="middle" class="flow-node-title">5. End</text>
                    <text x="805" y="225" text-anchor="middle" class="flow-node-type">Closed Comp.</text>
                </g>
            </svg>
        `;
    }

    // Renders the Offboarding Flow Diagram
    function renderOffboardingFlowSvg(req) {
        const stage = req.stage;
        
        const isApprovalActive = stage === 'Awaiting Approval';
        const isApprovalCompleted = stage !== 'Awaiting Approval' && stage !== 'Draft';
        const isApproved = stage === 'Work in Progress' || stage === 'Closed Complete';
        const isRejected = stage === 'Closed Rejected';

        // Check task states for parallel steps
        const hrTask = req.tasks.find(t => t.department === 'HR');
        const itTask = req.tasks.find(t => t.department === 'IT');
        const secTask = req.tasks.find(t => t.department === 'Security');

        const getTaskNodeState = (t) => {
            if (!t) return 'pending';
            if (!isApproved) return 'pending';
            if (t.state === 'Open') return 'open';
            if (t.state === 'Work in Progress') return 'active';
            if (t.state === 'Closed Complete') return 'completed';
            return 'pending';
        };

        const hrState = getTaskNodeState(hrTask);
        const itState = getTaskNodeState(itTask);
        const secState = getTaskNodeState(secTask);

        const isWaitCompleted = isApproved && req.tasks.every(t => t.state === 'Closed Complete');
        const isWaitActive = isApproved && !isWaitCompleted;

        const isCloseCompleted = stage === 'Closed Complete';
        const isCloseRejectedCompleted = stage === 'Closed Rejected';

        return `
            <svg class="flow-svg" viewBox="0 0 850 480" xmlns="http://www.w3.org/2000/svg">
                <!-- SVG Arrow Marker Definitions -->
                <defs>
                    <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" class="flow-marker" />
                    </marker>
                    <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" class="flow-marker active" />
                    </marker>
                    <marker id="arrow-completed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" class="flow-marker completed" />
                    </marker>
                </defs>

                <!-- Connection Lines -->
                <line x1="120" y1="210" x2="180" y2="210" class="flow-link-line completed" marker-end="url(#arrow-completed)" />
                <line x1="280" y1="210" x2="330" y2="210" class="flow-link-line ${isApprovalCompleted ? 'completed' : isApprovalActive ? 'active' : ''}" marker-end="${isApprovalCompleted ? 'url(#arrow-completed)' : isApprovalActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}" />
                <line x1="390" y1="210" x2="440" y2="210" class="flow-link-line ${isApproved ? 'completed' : ''}" marker-end="${isApproved ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />
                
                <!-- Decision NO (Rejection Branch) -->
                <path d="M 360,240 L 360,340 L 440,340" fill="none" class="flow-link-line ${isRejected ? 'completed' : ''}" marker-end="${isRejected ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />

                <!-- Parallel Offboarding Splitting -->
                <path d="M 440,210 L 440,80 L 470,80" fill="none" class="flow-link-line ${isApproved ? 'completed' : ''}" marker-end="${isApproved ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />
                <path d="M 440,210 L 440,210 L 470,210" fill="none" class="flow-link-line ${isApproved ? 'completed' : ''}" marker-end="${isApproved ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />
                <path d="M 440,210 L 440,330 L 470,330" fill="none" class="flow-link-line ${isApproved ? 'completed' : ''}" marker-end="${isApproved ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />

                <!-- Merging Task Lines -->
                <path d="M 600,80 L 630,80 L 630,210" fill="none" class="flow-link-line ${hrState === 'completed' ? 'completed' : ''}" />
                <path d="M 600,210 L 630,210" fill="none" class="flow-link-line ${itState === 'completed' ? 'completed' : ''}" />
                <path d="M 600,330 L 630,330 L 630,210" fill="none" class="flow-link-line ${secState === 'completed' ? 'completed' : ''}" />

                <line x1="630" y1="210" x2="660" y2="210" class="flow-link-line ${isWaitCompleted ? 'completed' : isWaitActive ? 'active' : ''}" marker-end="${isWaitCompleted ? 'url(#arrow-completed)' : isWaitActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}" />
                <line x1="750" y1="210" x2="780" y2="210" class="flow-link-line ${isCloseCompleted ? 'completed' : ''}" marker-end="${isCloseCompleted ? 'url(#arrow-completed)' : 'url(#arrow-default)'}" />

                <!-- Node: Trigger -->
                <g class="flow-node">
                    <rect x="20" y="180" width="100" height="60" class="flow-node-rect completed" />
                    <text x="70" y="210" text-anchor="middle" class="flow-node-title">1. Trigger</text>
                    <text x="70" y="225" text-anchor="middle" class="flow-node-type">Catalog Order</text>
                </g>

                <!-- Node: Ask Manager Approval -->
                <g class="flow-node">
                    <rect x="180" y="180" width="100" height="60" class="flow-node-rect ${isApprovalActive ? 'active' : isApprovalCompleted ? 'completed' : ''}" />
                    <text x="230" y="208" text-anchor="middle" class="flow-node-title">2. Approval</text>
                    <text x="230" y="220" text-anchor="middle" class="flow-node-type">Ask Manager</text>
                </g>

                <!-- Decision Diamond -->
                <g class="flow-node">
                    <polygon points="360,180 390,210 360,240 330,210" fill="#1e293b" stroke="${isApprovalCompleted ? 'var(--color-onboarding)' : 'var(--border-color)'}" stroke-width="2" />
                    <text x="360" y="213" text-anchor="middle" style="fill:white; font-size:10px; font-weight:700;">Approved?</text>
                </g>

                <!-- Node: HR Offboarding Task -->
                <g class="flow-node">
                    <rect x="470" y="50" width="130" height="60" class="flow-node-rect ${getNodeClass(hrState)}" />
                    <text x="535" y="78" text-anchor="middle" class="flow-node-title">3a. HR Offboard</text>
                    <text x="535" y="90" text-anchor="middle" class="flow-node-type">Documentation & Payroll</text>
                    <text x="535" y="102" text-anchor="middle" class="flow-node-type" style="fill:${hrState === 'completed' ? 'var(--color-onboarding)' : 'var(--color-warning)'}">${hrState.toUpperCase()}</text>
                </g>

                <!-- Node: IT Revocation & Recovery Task -->
                <g class="flow-node">
                    <rect x="470" y="180" width="130" height="60" class="flow-node-rect ${getNodeClass(itState)}" />
                    <text x="535" y="208" text-anchor="middle" class="flow-node-title">3b. IT Revocation</text>
                    <text x="535" y="220" text-anchor="middle" class="flow-node-type">IAM & Assets Recovery</text>
                    <text x="535" y="232" text-anchor="middle" class="flow-node-type" style="fill:${itState === 'completed' ? 'var(--color-onboarding)' : 'var(--color-warning)'}">${itState.toUpperCase()}</text>
                </g>

                <!-- Node: Security Badge Collection Task -->
                <g class="flow-node">
                    <rect x="470" y="300" width="130" height="60" class="flow-node-rect ${getNodeClass(secState)}" />
                    <text x="535" y="328" text-anchor="middle" class="flow-node-title">3c. Security Revoke</text>
                    <text x="535" y="340" text-anchor="middle" class="flow-node-type">Card & Access Revoke</text>
                    <text x="535" y="352" text-anchor="middle" class="flow-node-type" style="fill:${secState === 'completed' ? 'var(--color-onboarding)' : 'var(--color-warning)'}">${secState.toUpperCase()}</text>
                </g>

                <!-- Node: Rejection End -->
                <g class="flow-node">
                    <rect x="440" y="310" width="120" height="60" class="flow-node-rect ${isCloseRejectedCompleted ? 'completed' : 'skipped'}" style="stroke: ${isCloseRejectedCompleted ? 'var(--color-offboarding)' : ''}" />
                    <text x="500" y="340" text-anchor="middle" class="flow-node-title" style="fill: ${isCloseRejectedCompleted ? 'var(--color-offboarding)' : ''}">Rejected End</text>
                </g>

                <!-- Node: Wait Node -->
                <g class="flow-node">
                    <rect x="660" y="180" width="90" height="60" class="flow-node-rect ${isWaitCompleted ? 'completed' : isWaitActive ? 'active' : ''}" />
                    <text x="705" y="210" text-anchor="middle" class="flow-node-title">4. Wait</text>
                    <text x="705" y="225" text-anchor="middle" class="flow-node-type">Join All Tasks</text>
                </g>

                <!-- Node: End -->
                <g class="flow-node">
                    <rect x="780" y="180" width="70" height="60" class="flow-node-rect ${isCloseCompleted ? 'completed' : ''}" />
                    <text x="815" y="210" text-anchor="middle" class="flow-node-title">5. End</text>
                    <text x="815" y="225" text-anchor="middle" class="flow-node-type">Closed Comp.</text>
                </g>
            </svg>
        `;
    }

    function getNodeClass(taskState) {
        if (taskState === 'completed') return 'completed';
        if (taskState === 'active') return 'active';
        if (taskState === 'open') return 'pending';
        return '';
    }

    function setupListeners() {
        const select = document.getElementById('flow-request-select');
        if (select) {
            select.addEventListener('change', (e) => {
                selectedRequestId = parseInt(e.target.value);
                render();
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
