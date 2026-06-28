// ServiceNow Employee Lifecycle Automation Engine
// Native browser script execution

// Pre-defined lookup data
window.MOCK_DEPARTMENTS = ['Engineering', 'Human Resources', 'Finance', 'IT Support', 'Facilities Management', 'Information Security'];
window.MOCK_LOCATIONS = ['New York HQ', 'San Francisco Office', 'London Branch', 'Tokyo Hub', 'Remote'];

window.MOCK_USERS = [
  { name: 'John Miller', employeeId: 'EMP082', department: 'Engineering', jobTitle: 'Software Developer', manager: 'Sarah Connor', roles: ['Employee'] },
  { name: 'Jane Smith', employeeId: 'EMP095', department: 'Finance', jobTitle: 'Senior Accountant', manager: 'Sarah Connor', roles: ['Employee'] },
  { name: 'Sarah Connor', employeeId: 'EMP005', department: 'Human Resources', jobTitle: 'HR Director', manager: 'CEO', roles: ['Manager', 'HR Admin'] },
  { name: 'Bruce Wayne', employeeId: 'EMP012', department: 'IT Support', jobTitle: 'Systems Engineer', manager: 'Sarah Connor', roles: ['IT Support'] },
  { name: 'Clark Kent', employeeId: 'EMP024', department: 'Facilities Management', jobTitle: 'Facilities Coordinator', manager: 'Sarah Connor', roles: ['Facilities Team'] },
  { name: 'Diana Prince', employeeId: 'EMP033', department: 'Information Security', jobTitle: 'Security Supervisor', manager: 'Sarah Connor', roles: ['Security Team'] }
];

// Helper: Get active user metadata by Role
function getUserByRole(role) {
    switch (role) {
        case 'Employee': return window.MOCK_USERS[0];
        case 'Manager': return window.MOCK_USERS[2];
        case 'HR Admin': return window.MOCK_USERS[2];
        case 'IT Support': return window.MOCK_USERS[3];
        case 'Facilities Team': return window.MOCK_USERS[4];
        case 'Security Team': return window.MOCK_USERS[5];
        default: return window.MOCK_USERS[2];
    }
}

// Initial Database State (stored in localStorage if empty)
const INITIAL_REQUESTS = [
  {
    id: 1,
    number: 'REQ0001001',
    type: 'Onboarding',
    stage: 'Closed Complete',
    employeeName: 'Alice Johnson',
    employeeId: 'EMP291',
    department: 'Engineering',
    jobTitle: 'Frontend Developer',
    manager: 'Sarah Connor',
    joiningDate: '2026-06-01',
    location: 'San Francisco Office',
    laptopDesktop: 'MacBook Pro 14',
    softwareAccess: 'Office 365, Slack, GitHub',
    buildingAccess: 'Main Lobby Entrance, Parking Garage',
    additionalRequirements: 'Requires dual monitor setup at desk.',
    emailAccount: true,
    slas: [
      { id: 101, name: 'Overall Onboarding Completion', duration: 172800, remainingTime: 0, isBreached: false, stage: 'Completed' }
    ],
    tasks: [
      { id: 201, number: 'TSK00101', department: 'HR', shortDescription: 'Review documentation & payroll setup', description: 'Validate signed contract and set up tax profiles.', state: 'Closed Complete' },
      { id: 202, number: 'TSK00102', department: 'IT', shortDescription: 'Provision email & laptop hardware', description: 'Configure active directory, email access, and issue MacBook MBP-2026-N291.', state: 'Closed Complete', serialNumber: 'MBP-2026-N291' },
      { id: 203, number: 'TSK00103', department: 'Facilities', shortDescription: 'Allocate workspace desk', description: 'Allocate cubicle and coordinate chair configuration.', state: 'Closed Complete', deskId: 'Floor 3 - Desk 42' },
      { id: 204, number: 'TSK00104', department: 'Security', shortDescription: 'Activate security badge access', description: 'Generate RFID card and approve entrance levels.', state: 'Closed Complete', badgeNumber: 'BDG-0021' }
    ],
    auditLogs: [
      { timestamp: '2026-06-01 09:00:00', event: 'Request Created', description: 'Submitted by HR Admin.' },
      { timestamp: '2026-06-01 10:15:00', event: 'Approved', description: 'Manager Sarah Connor approved the request.' },
      { timestamp: '2026-06-01 14:00:00', event: 'Task Completed', description: 'HR task resolved.' },
      { timestamp: '2026-06-02 11:20:00', event: 'Task Completed', description: 'IT task resolved.' },
      { timestamp: '2026-06-02 14:30:00', event: 'Task Completed', description: 'Facilities task resolved.' },
      { timestamp: '2026-06-02 16:00:00', event: 'Task Completed', description: 'Security task resolved.' },
      { timestamp: '2026-06-02 16:00:10', event: 'Request Closed', description: 'All tasks complete. Automatic lifecycle closure.' }
    ]
  },
  {
    id: 2,
    number: 'REQ0001002',
    type: 'Onboarding',
    stage: 'Work in Progress',
    employeeName: 'Robert Davis',
    employeeId: 'EMP304',
    department: 'Finance',
    jobTitle: 'Financial Analyst',
    manager: 'Sarah Connor',
    joiningDate: '2026-07-02',
    location: 'New York HQ',
    laptopDesktop: 'ThinkPad T14',
    softwareAccess: 'Office 365, Slack, SAP Accounts',
    buildingAccess: 'Main Lobby Entrance',
    additionalRequirements: 'Workspace close to the finance department.',
    emailAccount: true,
    slas: [
      { id: 102, name: 'Overall Onboarding Completion', duration: 300, remainingTime: 210, isBreached: false, status: 'In Progress' }
    ],
    tasks: [
      { id: 205, number: 'TSK00105', department: 'HR', shortDescription: 'Review documentation & payroll setup', description: 'Validate signed contract and benefits setup.', state: 'Closed Complete' },
      { id: 206, number: 'TSK00106', department: 'IT', shortDescription: 'Provision email & laptop hardware', description: 'Configure active directory, email access, and issue ThinkPad.', state: 'Work in Progress' },
      { id: 207, number: 'TSK00107', department: 'Facilities', shortDescription: 'Allocate workspace desk', description: 'Allocate cubicle and coordinate details.', state: 'Open' },
      { id: 208, number: 'TSK00108', department: 'Security', shortDescription: 'Activate security badge access', description: 'Generate RFID card and approve entry.', state: 'Open' }
    ],
    auditLogs: [
      { timestamp: '2026-06-25 10:00:00', event: 'Request Created', description: 'Submitted by Manager Sarah Connor.' },
      { timestamp: '2026-06-25 10:05:00', event: 'Approved', description: 'Manager Sarah Connor approved the request.' },
      { timestamp: '2026-06-26 12:00:00', event: 'Task Completed', description: 'HR task resolved by Fulfiller.' }
    ]
  }
];

class StateManager {
    constructor() {
        this.requests = JSON.parse(localStorage.getItem('sn_lifecycle_requests')) || INITIAL_REQUESTS;
        this.notifications = JSON.parse(localStorage.getItem('sn_notifications')) || [
            { id: 501, title: 'Workflow Notification', desc: 'Onboarding request REQ0001001 was closed successfully.', timestamp: '1 hour ago', read: false },
            { id: 502, title: 'Approval Assigned', desc: 'Onboarding REQ0001002 requires manager approval.', timestamp: '30 mins ago', read: false }
        ];
        this.activeRole = localStorage.getItem('sn_active_role') || 'Manager';
        this.activeUser = getUserByRole(this.activeRole);
        this.activeTab = 'catalog';
        this.activeFlowRequestId = null;
        this.subscribers = [];
        
        // Speed up factor: 1 real second = 100 simulated seconds (for SLA clock ticking observation)
        this.timeSpeedFactor = 100;

        // Initialize SLA Timer
        setInterval(() => this.tickSlas(), 1000);
    }

    save() {
        localStorage.setItem('sn_lifecycle_requests', JSON.stringify(this.requests));
        localStorage.setItem('sn_notifications', JSON.stringify(this.notifications));
        localStorage.setItem('sn_active_role', this.activeRole);
    }

    subscribe(fn) {
        this.subscribers.push(fn);
    }

    notify() {
        this.subscribers.forEach(fn => fn());
    }

    // Role switcher
    setRole(role) {
        this.activeRole = role;
        this.activeUser = getUserByRole(role);
        this.save();
        this.notify();
    }

    // Tab switching routing
    setTab(tab) {
        this.activeTab = tab;
        this.notify();
    }

    // Tick down SLAs
    tickSlas() {
        let stateChanged = false;
        this.requests.forEach(req => {
            if (req.stage !== 'Closed Complete' && req.stage !== 'Closed Rejected') {
                req.slas.forEach(sla => {
                    if (sla.status === 'In Progress' && sla.remainingTime > 0) {
                        sla.remainingTime = Math.max(0, sla.remainingTime - this.timeSpeedFactor);
                        stateChanged = true;

                        // Check warning threshold (25% remaining)
                        if (sla.remainingTime <= (sla.duration * 0.25) && !sla.triggeredWarning) {
                            sla.triggeredWarning = true;
                            this.addNotification('SLA Warning Alert', `${req.number}: SLA "${sla.name}" is at 25% warning threshold!`);
                            this.addAuditLog(req.id, 'SLA Warning Escalation', 'System warning: SLA breached warning threshold (25% time remaining).');
                        }

                        // Check Breach
                        if (sla.remainingTime === 0 && !sla.isBreached) {
                            sla.isBreached = true;
                            this.addNotification('SLA Breach Warning', `${req.number}: SLA "${sla.name}" has breached its deadline!`);
                            this.addAuditLog(req.id, 'SLA Breach Incident', 'System Incident: SLA failed response deadline. Escalating to assignment managers.');
                        }
                    }
                });
            }
        });

        if (stateChanged) {
            this.save();
            this.notify();
        }
    }

    // Add Audit Log
    addAuditLog(requestId, event, description) {
        const req = this.requests.find(r => r.id === requestId);
        if (req) {
            const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
            req.auditLogs.push({
                timestamp: time,
                event: event,
                description: description,
                user: this.activeUser.name
            });
            this.save();
        }
    }

    // Add Notification
    addNotification(title, desc) {
        this.notifications.unshift({
            id: Date.now() + Math.random(),
            title: title,
            desc: desc,
            timestamp: 'Just Now',
            read: false
        });
        this.save();
        this.notify();
    }

    // Submit request (Triggers Flow Designer Flow)
    submitRequest(data) {
        const lastNumber = this.requests.length > 0 
            ? parseInt(this.requests[this.requests.length - 1].number.replace('REQ000', '')) 
            : 1000;
        
        const newNum = 'REQ000' + (lastNumber + 1);
        const reqId = Date.now();

        // Calculate dynamic SLA target (e.g. 300 seconds for manager approval in simulator)
        const slaDuration = 300; 

        const newRequest = {
            id: reqId,
            number: newNum,
            type: data.type,
            stage: 'Awaiting Approval',
            employeeName: data.employeeName,
            employeeId: data.employeeId,
            department: data.department,
            jobTitle: data.jobTitle,
            manager: data.manager,
            joiningDate: data.joiningDate || '',
            lastWorkingDay: data.lastWorkingDay || '',
            location: data.location || '',
            laptopDesktop: data.laptopDesktop || '',
            softwareAccess: data.softwareAccess || '',
            buildingAccess: data.buildingAccess || '',
            additionalRequirements: data.additionalRequirements || '',
            assetReturnDetails: data.assetReturnDetails || '',
            accountDeactivationDate: data.accountDeactivationDate || '',
            reasonForExit: data.reasonForExit || '',
            slas: [
                { id: Date.now(), name: 'Manager Approval SLA', duration: slaDuration, remainingTime: slaDuration, isBreached: false, status: 'In Progress' }
            ],
            tasks: [],
            auditLogs: []
        };

        this.requests.push(newRequest);
        this.addAuditLog(reqId, 'Request Created', `Employee ${data.type} request created in u_employee_lifecycle for ${data.employeeName}. Stage: Awaiting Approval.`);
        this.addNotification('Request Submitted', `${newNum} submitted successfully. Awaiting Manager Approval.`);
        
        // Auto-navigate to workspace to watch execution
        this.activeTab = 'workspace';
        this.activeFlowRequestId = reqId;
        this.save();
        this.notify();
    }

    // Manager Approval
    approveRequest(id, comments) {
        const req = this.requests.find(r => r.id === id);
        if (req && req.stage === 'Awaiting Approval') {
            req.stage = 'Work in Progress';
            
            // Mark approval SLA complete
            const appSla = req.slas.find(s => s.name === 'Manager Approval SLA');
            if (appSla) appSla.status = 'Completed';

            this.addAuditLog(id, 'Approved', `Manager ${this.activeUser.name} approved request. Comments: "${comments || 'No comment'}"`);
            this.addNotification('Approval Granted', `${req.number} approved. Flow Designer starting tasks creation...`);

            // Flow Designer automatically generates Department Tasks
            this.createTasksForRequest(req);
            
            // Add Overall Completion SLA (e.g. 500 seconds for tasks)
            const overallSla = 500;
            req.slas.push({
                id: Date.now() + 1,
                name: `Overall ${req.type} SLA`,
                duration: overallSla,
                remainingTime: overallSla,
                isBreached: false,
                status: 'In Progress'
            });

            this.addAuditLog(id, 'Flow Action', 'Flow Designer: Evaluated variables and dispatched child u_department_task records (No Business Rules/Script Includes used).');
            this.save();
            this.notify();
        }
    }

    // Manager Rejection
    rejectRequest(id, comments) {
        const req = this.requests.find(r => r.id === id);
        if (req && req.stage === 'Awaiting Approval') {
            req.stage = 'Closed Rejected';
            
            // Mark SLA complete/cancelled
            const appSla = req.slas.find(s => s.name === 'Manager Approval SLA');
            if (appSla) appSla.status = 'Completed';

            this.addAuditLog(id, 'Rejected', `Manager ${this.activeUser.name} rejected request. Reason: "${comments || 'No comment'}"`);
            this.addNotification('Request Rejected', `${req.number} rejected by manager.`);
            this.save();
            this.notify();
        }
    }

    // Generate Tasks based on type (Onboarding / Offboarding)
    // Completed entirely by the mock Flow Designer Engine simulating ServiceNow Vancouver Flow
    createTasksForRequest(req) {
        const taskIdBase = Date.now();
        
        if (req.type === 'Onboarding') {
            req.tasks = [
                { id: taskIdBase, number: 'TSK00' + (req.id % 1000 + 1), department: 'HR', shortDescription: 'Payroll and documentation check', description: 'Collect signed documents, initiate payroll setup, and register employee profile.', state: 'Open' },
                { id: taskIdBase + 1, number: 'TSK00' + (req.id % 1000 + 2), department: 'IT', shortDescription: 'Configure account & device provisioning', description: `Set up user Active Directory account, email account, and configure hardware device (${req.laptopDesktop}).`, state: 'Open' },
                { id: taskIdBase + 2, number: 'TSK00' + (req.id % 1000 + 3), department: 'Facilities', shortDescription: 'Allocate physical workspace', description: `Allocate cubicle/desk space at location (${req.location}).`, state: 'Open' },
                { id: taskIdBase + 3, number: 'TSK00' + (req.id % 1000 + 4), department: 'Security', shortDescription: 'Issue employee security access card', description: `Generate security card badge and configure access to: ${req.buildingAccess}.`, state: 'Open' }
            ];
        } else {
            // Offboarding tasks
            req.tasks = [
                { id: taskIdBase, number: 'TSK00' + (req.id % 1000 + 1), department: 'IT', shortDescription: 'Revoke digital access & recover assets', description: `Deactivate Active Directory, suspend corporate email account, and recover corporate asset hardware: ${req.assetReturnDetails}.`, state: 'Open' },
                { id: taskIdBase + 1, number: 'TSK00' + (req.id % 1000 + 2), department: 'Security', shortDescription: 'Disable ID badge and physical credentials', description: 'Deactivate physical access keys, parking permissions, and retrieve security card badge.', state: 'Open' },
                { id: taskIdBase + 2, number: 'TSK00' + (req.id % 1000 + 3), department: 'HR', shortDescription: 'Payroll closure & employee exit record archive', description: 'Process final paycheck, close benefits packages, and archive record for legal compliance.', state: 'Open' }
            ];
        }
    }

    // Update departmental task state & fulfillment details
    updateTask(taskId, newState, details) {
        let parentRequest = null;
        let task = null;

        // Traverse to find task
        for (let r of this.requests) {
            if (r.tasks) {
                task = r.tasks.find(t => t.id === taskId);
                if (task) {
                    parentRequest = r;
                    break;
                }
            }
        }

        if (task && parentRequest) {
            task.state = newState;
            
            // Save fulfillment inputs to task fields for record preservation
            if (newState === 'Closed Complete') {
                Object.assign(task, details);
                this.addAuditLog(parentRequest.id, 'Task Completed', `${task.department} Task "${task.shortDescription}" completed by ${this.activeUser.name}.`);
                this.addNotification('Task Completed', `${task.number} fulfilled successfully.`);
                
                // If it was IT Task and we assigned serial number, simulate update to Asset Assignment
                if (details.serialNumber) {
                    this.addAuditLog(parentRequest.id, 'Asset Assigned', `Asset tag linked to employee profile. Serial: ${details.serialNumber}`);
                }
                if (details.deskId) {
                    this.addAuditLog(parentRequest.id, 'Facilities Allocated', `Desk location confirmed at: ${details.deskId}`);
                }
                if (details.badgeNumber) {
                    this.addAuditLog(parentRequest.id, 'Badge Issued', `RFID Badge ${details.badgeNumber} generated with clearance: ${details.clearanceLevel}`);
                }

                // Check if all other tasks are complete -> Trigger Auto Request Closure
                // Triggers inside the Flow Designer engine directly (No Business Rules!)
                const allTasksComplete = parentRequest.tasks.every(t => t.state === 'Closed Complete' || t.state === 'Closed Incomplete');
                if (allTasksComplete) {
                    parentRequest.stage = 'Closed Complete';
                    
                    // Mark Overall Completion SLA as completed
                    const overallSla = parentRequest.slas.find(s => s.name.includes('Overall'));
                    if (overallSla) overallSla.stage = 'Completed';

                    // Deactivate employee record if Offboarding is completed
                    if (parentRequest.type === 'Offboarding') {
                        const targetUser = window.MOCK_USERS.find(u => u.name === parentRequest.employeeName);
                        if (targetUser) {
                            targetUser.active = false;
                            this.addAuditLog(parentRequest.id, 'Record Deactivated', `sys_user record of ${parentRequest.employeeName} flagged active=false, locked_out=true.`);
                        }
                    }

                    this.addAuditLog(parentRequest.id, 'Request Closed Complete', `All departmental tasks resolved. Parent request automatically closed by Flow Designer.`);
                    this.addNotification('Request Closed Complete', `${parentRequest.number} closed complete. Automation workflow ended.`);
                }
            } else {
                // E.g. Work in Progress
                this.addAuditLog(parentRequest.id, 'Task Work in Progress', `${task.department} Task "${task.shortDescription}" state set to Work in Progress by ${this.activeUser.name}.`);
            }
            this.save();
            this.notify();
        }
    }
}

// Global helper: format remaining seconds in nice visual layout (mm:ss)
window.formatTimeRemaining = function(seconds) {
    if (seconds <= 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
        return `${hrs}h ${mins}m`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Instantiate state engine
const AppState = new StateManager();

// Expose state getters globally
window.getRequests = () => AppState.requests;
window.getActiveRole = () => AppState.activeRole;
window.getActiveUser = () => AppState.activeUser;
window.getActiveRequestId = () => AppState.activeFlowRequestId;

// Setup DOM elements and hooks
document.addEventListener('DOMContentLoaded', () => {
    // Instantiate all components
    const portal = window.initPortal('tab-catalog', (data) => AppState.submitRequest(data));
    
    const workspace = window.initWorkspace(
        'tab-workspace', 
        () => AppState.requests, 
        () => AppState.activeRole,
        () => AppState.activeUser,
        (id, comments) => AppState.approveRequest(id, comments),
        (id, comments) => AppState.rejectRequest(id, comments),
        (id) => {
            AppState.activeFlowRequestId = id;
            AppState.setTab('flow');
        }
    );

    const taskManager = window.initTaskManager(
        'tab-tasks',
        () => AppState.requests,
        () => AppState.activeRole,
        (taskId, newState, details) => AppState.updateTask(taskId, newState, details)
    );

    const flowVisualizer = window.initFlowVisualizer(
        'tab-flow',
        () => AppState.requests,
        () => AppState.activeFlowRequestId
    );

    const dashboard = window.initDashboard(
        'tab-dashboard',
        () => AppState.requests
    );

    const scriptViewer = window.initScriptViewer('tab-scripts');

    // Subscribe elements to state updates
    AppState.subscribe(() => {
        // Re-render only active components
        if (AppState.activeTab === 'workspace') workspace.render();
        else if (AppState.activeTab === 'tasks') taskManager.render();
        else if (AppState.activeTab === 'flow') {
            flowVisualizer.selectRequest(AppState.activeFlowRequestId);
            flowVisualizer.render();
        }
        else if (AppState.activeTab === 'dashboard') dashboard.render();
        else if (AppState.activeTab === 'scripts') scriptViewer.render();

        updateTaskBadge();
        updateNotificationUI();
        updateUserBadge();
    });

    // Sidebar tab clicks
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.getAttribute('data-tab');
            AppState.setTab(tab);

            // Hide all tab panels
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            // Show selected
            document.getElementById(`tab-${tab}`).classList.add('active');
        });
    });

    // Role Selector Change
    const roleSelect = document.getElementById('current-role');
    if (roleSelect) {
        roleSelect.value = AppState.activeRole;
        roleSelect.addEventListener('change', (e) => {
            AppState.setRole(e.target.value);
        });
    }

    // Notifications toggle
    const bellBtn = document.getElementById('notification-bell-btn');
    const drawer = document.getElementById('notification-drawer');
    const closeBtn = document.getElementById('notification-close-btn');
    const overlay = document.getElementById('overlay');

    if (bellBtn && drawer && closeBtn && overlay) {
        bellBtn.addEventListener('click', () => {
            drawer.classList.add('active');
            overlay.classList.add('active');
            // Mark all read
            AppState.notifications.forEach(n => n.read = true);
            AppState.save();
            updateNotificationUI();
        });

        closeBtn.addEventListener('click', closeDrawer);
        overlay.addEventListener('click', closeDrawer);
    }

    function closeDrawer() {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    }

    // Initialize UI badges
    updateTaskBadge();
    updateNotificationUI();
    updateUserBadge();

    // Renders the portal on initial load
    portal.render();

    function updateTaskBadge() {
        let allTasks = [];
        AppState.requests.forEach(r => {
            if (r.tasks) {
                r.tasks.forEach(t => allTasks.push(t));
            }
        });
        
        let activeRoleTasks = [];
        if (AppState.activeRole === 'HR Admin') activeRoleTasks = allTasks.filter(t => t.department === 'HR' && t.state !== 'Closed Complete');
        else if (AppState.activeRole === 'IT Support') activeRoleTasks = allTasks.filter(t => t.department === 'IT' && t.state !== 'Closed Complete');
        else if (AppState.activeRole === 'Facilities Team') activeRoleTasks = allTasks.filter(t => t.department === 'Facilities' && t.state !== 'Closed Complete');
        else if (AppState.activeRole === 'Security Team') activeRoleTasks = allTasks.filter(t => t.department === 'Security' && t.state !== 'Closed Complete');
        else if (AppState.activeRole === 'Manager') activeRoleTasks = []; // manager approves requests, has no tasks
        else activeRoleTasks = allTasks.filter(t => t.state !== 'Closed Complete'); // admin sees all

        const badge = document.getElementById('my-tasks-count');
        if (badge) {
            badge.innerText = activeRoleTasks.length;
        }
    }

    function updateNotificationUI() {
        const countBadge = document.getElementById('notification-count');
        const listContainer = document.getElementById('notification-list');
        
        const unread = AppState.notifications.filter(n => !n.read).length;
        if (countBadge) {
            countBadge.innerText = unread;
            countBadge.style.display = unread === 0 ? 'none' : 'block';
        }

        if (listContainer) {
            listContainer.innerHTML = AppState.notifications.length === 0 ? `
                <div style="text-align:center; padding:30px; font-size:12px; color:var(--text-muted);">No notifications yet.</div>
            ` : AppState.notifications.map(n => `
                <div class="notification-item" style="${!n.read ? 'border-left: 3px solid var(--brand-primary); background: rgba(255,255,255,0.03);' : ''}">
                    <div class="notification-item-header">
                        <span>${n.title}</span>
                        <span class="notification-time">${n.timestamp}</span>
                    </div>
                    <div class="notification-desc">${n.desc}</div>
                </div>
            `).join('');
        }
    }

    function updateUserBadge() {
        const avatar = document.getElementById('active-user-avatar');
        const name = document.getElementById('active-user-name');
        const label = document.getElementById('active-user-role-label');

        if (avatar && name && label) {
            const user = AppState.activeUser;
            avatar.innerText = user.name.split(' ').map(n => n[0]).join('');
            name.innerText = user.name;
            label.innerText = AppState.activeRole;
        }
    }
});
