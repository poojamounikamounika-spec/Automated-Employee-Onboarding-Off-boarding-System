// ============================================================
// mockData.js — Seed data for Employee Lifecycle System
// ============================================================

const DEPARTMENTS = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal', 'Security'];
const ASSETS = ['Laptop', 'Mobile Phone', 'Access Card', 'Headset', 'Monitor', 'Desk Phone'];
const ACCESS_SYSTEMS = ['Active Directory', 'Office 365', 'Slack', 'Jira', 'Salesforce', 'GitHub', 'VPN', 'SAP'];

const ROLES = {
  HR: { id: 'hr', label: 'HR Admin', icon: '👥', color: '#7C3AED' },
  MANAGER: { id: 'manager', label: 'Manager', icon: '🏢', color: '#06B6D4' },
  IT: { id: 'it', label: 'IT Team', icon: '💻', color: '#10B981' },
  FACILITIES: { id: 'facilities', label: 'Facilities', icon: '🏗️', color: '#F59E0B' },
  SECURITY: { id: 'security', label: 'Security', icon: '🔒', color: '#F43F5E' },
  EMPLOYEE: { id: 'employee', label: 'Employee', icon: '👤', color: '#8B5CF6' },
};

const MOCK_USERS = [
  { id: 'U001', name: 'Sarah Mitchell', dept: 'Engineering', role: 'manager', email: 'sarah.m@company.com', avatar: 'SM' },
  { id: 'U002', name: 'James Patel', dept: 'Human Resources', role: 'hr', email: 'james.p@company.com', avatar: 'JP' },
  { id: 'U003', name: 'Lisa Chen', dept: 'Finance', role: 'manager', email: 'lisa.c@company.com', avatar: 'LC' },
  { id: 'U004', name: 'Marcus Webb', dept: 'IT', role: 'it', email: 'marcus.w@company.com', avatar: 'MW' },
  { id: 'U005', name: 'Priya Sharma', dept: 'Security', role: 'security', email: 'priya.s@company.com', avatar: 'PS' },
  { id: 'U006', name: 'Tom Rivera', dept: 'Facilities', role: 'facilities', email: 'tom.r@company.com', avatar: 'TR' },
];

const MOCK_REQUESTS = [
  {
    id: 'REQ0001001',
    type: 'onboarding',
    employeeId: 'EMP-2024-001',
    employeeName: 'Alex Johnson',
    department: 'Engineering',
    manager: 'Sarah Mitchell',
    joiningDate: '2026-07-01',
    status: 'approved',
    approvalStatus: 'approved',
    createdAt: '2026-06-20T09:00:00Z',
    updatedAt: '2026-06-21T11:30:00Z',
    assets: ['Laptop', 'Access Card', 'Headset'],
    accessSystems: ['Active Directory', 'Office 365', 'Slack', 'GitHub'],
    slaStatus: 'on_track',
    completionPercent: 75,
    comments: 'Welcome package ready.',
    tasks: [
      { id: 'T001', dept: 'IT', name: 'Laptop Setup & Config', status: 'completed', assignee: 'Marcus Webb', dueDate: '2026-06-28' },
      { id: 'T002', dept: 'IT', name: 'Account Creation (AD/O365)', status: 'completed', assignee: 'Marcus Webb', dueDate: '2026-06-28' },
      { id: 'T003', dept: 'HR', name: 'Send Offer & Documents', status: 'completed', assignee: 'James Patel', dueDate: '2026-06-25' },
      { id: 'T004', dept: 'Facilities', name: 'Desk & Workstation Assignment', status: 'in_progress', assignee: 'Tom Rivera', dueDate: '2026-06-30' },
      { id: 'T005', dept: 'Security', name: 'Badge Issuance & Building Access', status: 'pending', assignee: 'Priya Sharma', dueDate: '2026-06-30' },
    ]
  },
  {
    id: 'REQ0001002',
    type: 'offboarding',
    employeeId: 'EMP-2023-045',
    employeeName: 'Rachel Kim',
    department: 'Marketing',
    manager: 'Lisa Chen',
    exitDate: '2026-06-30',
    status: 'pending_approval',
    approvalStatus: 'pending',
    createdAt: '2026-06-22T14:00:00Z',
    updatedAt: '2026-06-22T14:00:00Z',
    assets: ['Laptop', 'Mobile Phone', 'Access Card'],
    accessSystems: ['Active Directory', 'Office 365', 'Salesforce', 'Slack'],
    slaStatus: 'at_risk',
    completionPercent: 20,
    comments: '',
    tasks: [
      { id: 'T006', dept: 'IT', name: 'Access Revocation (All Systems)', status: 'pending', assignee: 'Marcus Webb', dueDate: '2026-07-01' },
      { id: 'T007', dept: 'IT', name: 'Device Recovery & Wipe', status: 'pending', assignee: 'Marcus Webb', dueDate: '2026-07-01' },
      { id: 'T008', dept: 'HR', name: 'Exit Interview & Documentation', status: 'in_progress', assignee: 'James Patel', dueDate: '2026-06-28' },
      { id: 'T009', dept: 'Facilities', name: 'Desk Clearance & Key Return', status: 'pending', assignee: 'Tom Rivera', dueDate: '2026-07-01' },
      { id: 'T010', dept: 'Security', name: 'Badge Deactivation', status: 'pending', assignee: 'Priya Sharma', dueDate: '2026-07-01' },
    ]
  },
  {
    id: 'REQ0001003',
    type: 'onboarding',
    employeeId: 'EMP-2024-002',
    employeeName: 'David Nguyen',
    department: 'Sales',
    manager: 'Sarah Mitchell',
    joiningDate: '2026-07-08',
    status: 'approved',
    approvalStatus: 'approved',
    createdAt: '2026-06-23T10:00:00Z',
    updatedAt: '2026-06-24T09:00:00Z',
    assets: ['Laptop', 'Mobile Phone'],
    accessSystems: ['Active Directory', 'Salesforce', 'Slack'],
    slaStatus: 'on_track',
    completionPercent: 40,
    comments: 'CRM training scheduled.',
    tasks: [
      { id: 'T011', dept: 'IT', name: 'Laptop Setup & Config', status: 'in_progress', assignee: 'Marcus Webb', dueDate: '2026-07-05' },
      { id: 'T012', dept: 'IT', name: 'Account Creation', status: 'pending', assignee: 'Marcus Webb', dueDate: '2026-07-05' },
      { id: 'T013', dept: 'HR', name: 'Orientation Scheduling', status: 'completed', assignee: 'James Patel', dueDate: '2026-07-01' },
      { id: 'T014', dept: 'Facilities', name: 'Desk Assignment', status: 'pending', assignee: 'Tom Rivera', dueDate: '2026-07-07' },
      { id: 'T015', dept: 'Security', name: 'Badge Issuance', status: 'pending', assignee: 'Priya Sharma', dueDate: '2026-07-07' },
    ]
  },
  {
    id: 'REQ0001004',
    type: 'offboarding',
    employeeId: 'EMP-2022-018',
    employeeName: 'Sophia Grant',
    department: 'Finance',
    manager: 'Lisa Chen',
    exitDate: '2026-07-15',
    status: 'completed',
    approvalStatus: 'approved',
    createdAt: '2026-06-10T08:00:00Z',
    updatedAt: '2026-06-18T16:00:00Z',
    assets: ['Laptop', 'Access Card'],
    accessSystems: ['Active Directory', 'Office 365', 'SAP'],
    slaStatus: 'on_track',
    completionPercent: 100,
    comments: 'All exit formalities completed.',
    tasks: [
      { id: 'T016', dept: 'IT', name: 'Access Revocation', status: 'completed', assignee: 'Marcus Webb', dueDate: '2026-06-15' },
      { id: 'T017', dept: 'IT', name: 'Device Recovery', status: 'completed', assignee: 'Marcus Webb', dueDate: '2026-06-15' },
      { id: 'T018', dept: 'HR', name: 'Final Settlement & Documentation', status: 'completed', assignee: 'James Patel', dueDate: '2026-06-12' },
      { id: 'T019', dept: 'Facilities', name: 'Desk Clearance', status: 'completed', assignee: 'Tom Rivera', dueDate: '2026-06-14' },
      { id: 'T020', dept: 'Security', name: 'Badge Deactivation', status: 'completed', assignee: 'Priya Sharma', dueDate: '2026-06-14' },
    ]
  },
  {
    id: 'REQ0001005',
    type: 'onboarding',
    employeeId: 'EMP-2024-003',
    employeeName: 'Ethan Brooks',
    department: 'Legal',
    manager: 'Lisa Chen',
    joiningDate: '2026-07-15',
    status: 'pending_approval',
    approvalStatus: 'pending',
    createdAt: '2026-06-25T11:00:00Z',
    updatedAt: '2026-06-25T11:00:00Z',
    assets: ['Laptop', 'Access Card', 'Monitor'],
    accessSystems: ['Active Directory', 'Office 365', 'VPN'],
    slaStatus: 'on_track',
    completionPercent: 0,
    comments: '',
    tasks: []
  },
];

const MOCK_NOTIFICATIONS = [
  { id: 'N001', type: 'approval', message: 'REQ0001002 pending your approval', time: '2 hours ago', read: false, requestId: 'REQ0001002' },
  { id: 'N002', type: 'task', message: 'Task T004 due in 2 days: Desk Assignment', time: '5 hours ago', read: false, requestId: 'REQ0001001' },
  { id: 'N003', type: 'completed', message: 'REQ0001004 fully completed', time: '1 day ago', read: true, requestId: 'REQ0001004' },
  { id: 'N004', type: 'sla', message: 'REQ0001002 SLA at risk – action needed', time: '3 hours ago', read: false, requestId: 'REQ0001002' },
  { id: 'N005', type: 'task', message: 'Task T001 marked completed by Marcus Webb', time: '8 hours ago', read: true, requestId: 'REQ0001001' },
];

const CHART_DATA = {
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    onboarding: [4, 6, 5, 8, 7, 5],
    offboarding: [2, 3, 4, 3, 5, 2]
  },
  slaCompliance: {
    onTrack: 62,
    atRisk: 25,
    breached: 13
  },
  deptTaskCompletion: {
    labels: ['IT', 'HR', 'Facilities', 'Security'],
    values: [88, 92, 75, 83]
  },
  requestStatus: {
    labels: ['Completed', 'In Progress', 'Pending Approval', 'Rejected'],
    values: [40, 35, 20, 5],
    colors: ['#10B981', '#06B6D4', '#F59E0B', '#F43F5E']
  }
};

// Export for use across modules
window.APP_DATA = {
  DEPARTMENTS, ASSETS, ACCESS_SYSTEMS, ROLES,
  MOCK_USERS, MOCK_REQUESTS, MOCK_NOTIFICATIONS, CHART_DATA,
  currentUser: null,
  requests: JSON.parse(JSON.stringify(MOCK_REQUESTS)),
  notifications: JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS)),
};
