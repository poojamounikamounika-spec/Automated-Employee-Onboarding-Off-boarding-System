# Test Cases: ServiceNow Employee Onboarding & Offboarding System

This document maps out the test suite used to validate the catalog forms, script client rules, flow automations, SLA engine, security permissions, and dashboards.

---

## 1. Catalog Form Validations (Client Scripts)

| Test ID | Test Scenario | Input Data | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :---: |
| **TC-VAL-001** | Submit Onboarding with a past Joining Date | Joining Date: `2020-01-01` | Form throws field error message: "Joining date must be in the future" and clears value. Prevents submission. | Pass |
| **TC-VAL-002** | Submit Offboarding with a past Last Working Day | Last Working Day: `2020-01-01` | Form displays catalog validation message: "Last working day cannot be in the past." Prevents submission. | Pass |
| **TC-VAL-003** | Auto-populate Employee details on Offboarding select | Selected Employee: `John Miller` | Employee ID, Department, and Manager fields auto-populate instantly. Default asset list is generated. | Pass |
| **TC-VAL-004** | Form field visibility rules on Onboarding | Request Type: `Onboarding` | Onboarding parameters (Device, locations, building access) become visible. Offboarding exit reason is hidden. | Pass |
| **TC-VAL-005** | Validate required inputs | Empty Name or ID fields | Browser validation intercepts submission; highlights missing fields as red. | Pass |

---

## 2. Integration & Flow Automations (Flow Designer)

| Test ID | Test Scenario | Execution Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :---: |
| **TC-FLW-001** | Manager Approval workflow initiation | Submit new Onboarding. Log in as designated Manager. | Flow enters "Manager Approval" step. Request stage updates to "Awaiting Approval". Approval SLA starts ticking. | Pass |
| **TC-FLW-002** | Request approval progression | Manager clicks "Approve" with comments. | Stage updates to "Work in Progress". Approval SLA stops. Overall SLA begins. HR, IT, Facilities, and Security tasks are created. | Pass |
| **TC-FLW-003** | Request rejection progression | Manager clicks "Reject" with comments. | Stage updates to "Closed Rejected". No task records are created. Request closed. | Pass |
| **TC-FLW-004** | Task fulfillment dependencies | Complete HR and IT tasks. Verify remaining tasks. | Parent request remains in "Work in Progress". Flow Designer wait condition blocks closure until all are completed. | Pass |
| **TC-FLW-005** | Automatic Request Closure | Complete last remaining task (Security). | Stage of parent request automatically updates to "Closed Complete". Overall SLA stops. Audit log record is appended. | Pass |

---

## 3. SLA Deadlines & Escalations

| Test ID | Test Scenario | Execution Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :---: |
| **TC-SLA-001** | SLA Start & Tick | Submit request, approve. Select ticket details. | SLA timer begins counting down. Visual progress bar starts reducing width. | Pass |
| **TC-SLA-002** | SLA Warning Escalation | Wait until SLA remaining time is <= 25% duration. | System triggers SLA Warning notification: "SLA is at 25% warning threshold". Audit log records warning event. | Pass |
| **TC-SLA-003** | SLA Breach Escalation | Wait until SLA countdown reaches `00:00`. | SLA highlights in red with status "BREACHED". SLA breach notification is sent to department manager. | Pass |
| **TC-SLA-004** | SLA Completion | Resolve task before deadline. | SLA status transitions to "Completed" and freezes. Progress bar locks at 100% green. | Pass |

---

## 4. Role-Based Access Control (ACLs)

| Test ID | Test Scenario | Active User / Role | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :---: |
| **TC-SEC-001** | Request visibility for Employees | Role: `Employee` | Can only view request list where Employee Name matches current session ID. Other tickets are hidden. | Pass |
| **TC-SEC-002** | Task visibility for Fulfillers | Role: `IT Support` | Fulfiller can see IT tasks, but cannot see HR/Facilities/Security task details or complete them. | Pass |
| **TC-SEC-003** | Admin global read-write | Role: `HR Admin` | Fulfiller sees all tickets, tasks, audits, and can modify/complete all tasks. | Pass |
| **TC-SEC-004** | Fulfiller field restriction | Role: `Facilities Team` | Fulfiller can modify desk assignment values, but is restricted from editing IT asset serial codes or user account fields. | Pass |
