# User Guide: ServiceNow Employee Lifecycle Automation System

This guide outlines how users, managers, and fulfillment agents interact with the Automated Onboarding & Offboarding System.

---

## 1. Submitting Lifecycle Requests (Portal View)

Onboarding and Offboarding are initiated via the self-service Service Catalog.

### Submitting an Onboarding Request
1.  Navigate to the **Service Catalog** tab.
2.  Click **Order Now** on the **Employee Onboarding Request** card.
3.  Fill out the required employee details:
    *   **Employee Name & ID** (Mandatory).
    *   **Department & Job Title** (Mandatory).
    *   **Manager**: Select the designated supervisor. This user will receive approval actions.
    *   **Joining Date**: Must be in the future (validated by catalog client scripts).
    *   **Location & Required Device**: Select target facilities and hardware profiles.
    *   **Access Selections**: Check boxes to request default applications (Slack, Office 365, GitHub) and physical building entry levels.
    *   **Additional Requirements**: Add any special desktop needs or payroll notes.
4.  Click **Submit Request**. The ticket is generated (e.g. `REQ0001003`) and enters `Awaiting Approval` stage.

### Submitting an Offboarding Request
1.  Click **Order Now** on the **Employee Offboarding Request** card.
2.  Select the employee to offboard from the dropdown selector.
    *   *ServiceNow feature*: Selection auto-populates the Employee ID, Department, and Manager fields automatically using database lookups.
3.  Fill out exit details:
    *   **Last Working Day**: Exit date must be today or in the future.
    *   **Reason for Exit**: Resignation, retirement, contract ended, or termination.
    *   **Asset Return Details**: Enter serial numbers of corporate laptops, mobile devices, and access keys that must be returned.
    *   **Account Deactivation Date**: Automatically sets to match the last working day.
4.  Click **Initiate Offboarding**.

---

## 2. Managing Approvals (Manager View)

Once submitted, requests route to the designated manager for authorization.

1.  Select **Manager** as your Active Role in the top navigation.
2.  Navigate to the **Request Workspace** tab.
3.  Select the pending ticket from the list (marked in yellow badge as `Awaiting Approval`).
4.  Review the form fields.
5.  In the approval block:
    *   Type optional comments.
    *   Click **Approve** (to launch provisioning tasks) or **Reject** (to cancel the ticket and close it).

---

## 3. Resolving Fulfillment Tasks (Fulfillment View)

Once approved, the Flow Designer generates departmental tasks. Fulfillers check these on the **My Tasks** board.

1.  Switch to your respective operational role (e.g., **IT Support**, **Facilities Team**, **Security Team**, or **HR Admin**).
2.  Navigate to the **My Tasks** tab.
3.  The task board groups tickets into columns: **Open**, **Work in Progress**, and **Closed Complete**.
4.  To work on a task:
    *   Click the task card.
    *   Click **Start Work** (sets state to `Work in Progress` so others know it is active).
    *   Perform required actions (e.g., set up accounts, configure laptop, prepare badge).
    *   Enter fulfillment metrics in the task form (e.g., assign asset serial numbers, cubicle desk numbers, badge IDs).
    *   Click **Complete Task**.
5.  *Automation*: When the final task is completed, the Flow Designer automatically changes the parent request's stage to `Closed Complete` and archives the records.

---

## 4. Monitoring Analytics and SLAs (Dashboard View)

The Dashboard provides visual metrics of all processes:

1.  Navigate to the **Service Dashboard** tab.
2.  Review widgets:
    *   **Active Onboardings / Offboardings**: Live volume tracker.
    *   **SLA Compliance**: Success rate against deadlines. If a task SLA breaches, the percentage drops.
    *   **Workload Distribution**: Bar charts showing outstanding tasks grouped by HR, IT, Facilities, and Security.
    *   **Monthly Trends**: Trend chart tracking hire volumes vs exits.
    *   **System Audit Log**: Real-time compliance registry displaying timestamps, events, and who completed them.
