# Deployment Guide: ServiceNow Employee Onboarding & Offboarding System

This document outlines the step-by-step procedure to import, configure, and activate the Automated Employee Lifecycle System on a ServiceNow instance (Vancouver / Washington DC releases recommended).

---

## Prerequisites

1.  **ServiceNow Instance Access**: Admin privileges on target development/staging instances.
2.  **Plugins Active**:
    *   `com.glideapp.servicecatalog` (Service Catalog Core)
    *   `com.glide.hub.integration` (IntegrationHub - required for automated IAM actions)
    *   `com.snc.sla` (Service Level Agreement Engine)
    *   `com.glide.hub.flow_designer` (Flow Designer Engine)

---

## Phase 1: Retrieve and Commit Update Set

All database schema settings, forms, scripts, flows, and security policies are packaged into a single ServiceNow Update Set.

1.  **Retrieve Update Set XML**:
    *   Navigate to **System Update Sets** > **Retrieved Update Sets** in the filter navigator.
    *   Click the **Import Update Set from XML** related link.
    *   Select the packaged XML file (`Update_Set_Employee_Lifecycle_Automation_v1.0.xml`) and upload.
2.  **Preview Update Set**:
    *   Open the retrieved update set record named `Employee Lifecycle Automation - v1.0`.
    *   Click **Preview Update Set**.
    *   Resolve any conflicts or collisions (most typically related to standard schema choices or location reference updates) and set to "Accept Remote Update" if required.
3.  **Commit Update Set**:
    *   Click **Commit Update Set**.
    *   Ensure status updates to `Committed`.

---

## Phase 2: Schema & Form Layout Verification

Verify that custom tables have been created successfully:

1.  **Verify Tables**:
    *   Navigate to **System Definition** > **Tables**.
    *   Search for the following custom tables and check their fields:
        *   `u_employee_lifecycle_request` (Employee Lifecycle Request)
        *   `u_department_task` (Department Task)
        *   `u_asset_assignment` (Asset Assignment)
        *   `u_lifecycle_audit_log` (Audit Log)
2.  **Forms & Lists layout**:
    *   Verify that form and list layouts are correctly rendered for Onboarding and Offboarding views on the `u_employee_lifecycle_request` table.

---

## Phase 3: Flow Designer Activation

The backend workflows run on Flow Designer. These must be checked and activated.

1.  **Open Flow Designer**:
    *   Navigate to **Process Automation** > **Flow Designer**.
2.  **Verify & Activate Onboarding Flow**:
    *   Search for flow: `Employee Onboarding Flow`.
    *   Open the flow. Verify trigger parameters (matches `u_employee_lifecycle_request` with type = Onboarding, stage = Awaiting Approval).
    *   Review manager approval routing and task creation steps.
    *   Click **Activate** in the upper-right corner.
3.  **Verify & Activate Offboarding Flow**:
    *   Search for flow: `Employee Offboarding Flow`.
    *   Review steps (account revocation, asset collection, final payroll processing).
    *   Click **Activate**.

---

## Phase 4: Configure SLA Definitions

SLA definitions govern the operational deadlines. These must be configured in the SLA Engine.

1.  **Configure Manager Approval SLA**:
    *   Navigate to **Service Level Management** > **SLA Definitions**.
    *   Click **New**.
    *   Set fields:
        *   **Name**: Onboarding Manager Approval SLA
        *   **Table**: `u_employee_lifecycle_request`
        *   **Duration**: 24 Hours
        *   **Start Condition**: `u_stage == 'Awaiting Approval'`
        *   **Stop Condition**: `u_stage != 'Awaiting Approval'`
    *   Click **Submit**.
2.  **Configure Department Task SLAs**:
    *   Create a new SLA Definition:
        *   **Name**: IT Task Provisioning SLA
        *   **Table**: `u_department_task`
        *   **Duration**: 2 Days
        *   **Start Condition**: `u_department == 'IT' AND u_state == 'Open'`
        *   **Stop Condition**: `u_state IN ('Closed Complete', 'Closed Incomplete')`
    *   Repeat similarly for HR (2 days), Facilities (2 days), and Security (1 day) tasks.

---

## Phase 5: Notifications Configuration

Verify email triggers are operational:

1.  **Verify Email Templates**:
    *   Navigate to **System Notification** > **Email** > **Notifications**.
    *   Ensure templates for:
        *   `Onboarding.RequestSubmitted`
        *   `Onboarding.ApprovalRequired`
        *   `Onboarding.FulfillmentTasksCreated`
        *   `Offboarding.AssetCollectionNotice`
        *   `Lifecycle.SLABreachWarning`
    *   Are set to status: **Active**.

---

## Phase 6: Set Up Dashboard and Reports

Activate reporting widgets:

1.  **Import Portal Widget / Dashboard**:
    *   Navigate to **Self-Service** > **Dashboards**.
    *   Select **Employee Lifecycle Overview Dashboard**.
    *   Add widgets for:
        *   Interactive scorecard counts of active lifecycle tickets.
        *   Bar charts grouped by task department (`u_department_task.u_department`).
        *   SLA Breach compliance trend gauge.
        *   System Audit logs grid.
