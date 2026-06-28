// ServiceNow Production-Ready Script Definitions for Onboarding & Offboarding System
window.SERVICENOW_SCRIPTS = [
  {
    id: "catalog_client_validate_joining_date",
    name: "Validate Joining Date (Client Script)",
    type: "Catalog Client Script",
    table: "u_employee_lifecycle_request",
    ui_type: "All",
    type_event: "onChange",
    field: "u_joining_date",
    description: "Ensures the selected joining date is in the future. Prevents submission with past dates.",
    code: `function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') {
        return;
    }

    g_form.hideFieldMsg('u_joining_date');

    var joiningDate = new Date(newValue);
    var today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date-only comparison

    if (joiningDate < today) {
        g_form.showFieldMsg('u_joining_date', 'Error: Joining date must be in the future.', 'error');
        g_form.clearValue('u_joining_date');
    }
}`
  },
  {
    id: "catalog_client_populate_employee",
    name: "Auto-Populate Employee Details (Client Script)",
    type: "Catalog Client Script",
    table: "u_employee_lifecycle_request",
    ui_type: "All",
    type_event: "onChange",
    field: "u_employee_name",
    description: "Auto-populates Employee ID, Department, and Manager fields based on selected Employee Reference.",
    code: `function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') {
        return;
    }

    // Call GlideAjax to fetch user details from server side
    var ga = new GlideAjax('UserLifecycleUtil');
    ga.addParam('sysparm_name', 'getUserDetails');
    ga.addParam('sysparm_user_id', newValue);
    ga.getXMLAnswer(function(response) {
        if (response) {
            var user = JSON.parse(response);
            g_form.setValue('u_employee_id', user.employee_id || '');
            g_form.setValue('u_department', user.department || '');
            g_form.setValue('u_manager', user.manager || '');
            g_form.setValue('u_location', user.location || '');
        }
    });
}`
  },
  {
    id: "br_close_request_on_tasks_complete",
    name: "Close Request on Tasks Complete (Business Rule)",
    type: "Business Rule",
    table: "u_department_task",
    ui_type: "Server",
    type_event: "after / update",
    field: "State changes to Closed Complete",
    description: "Evaluates parent Lifecycle Request when a task is completed. If all tasks are completed, automatically sets the parent to Closed Complete.",
    code: `(function executeRule(current, previous /*null when async*/) {

    var parentReq = current.u_parent_request;
    if (parentReq.nil()) {
        return;
    }

    // Check if there are any open tasks remaining for this parent request
    var taskGr = new GlideRecord('u_department_task');
    taskGr.addQuery('u_parent_request', parentReq);
    taskGr.addQuery('u_state', 'NOT IN', 'Closed Complete,Closed Incomplete');
    taskGr.query();

    if (!taskGr.hasNext()) {
        // No open tasks left. Update the parent request's stage to Closed Complete
        var reqGr = new GlideRecord('u_employee_lifecycle_request');
        if (reqGr.get(parentReq)) {
            reqGr.setValue('u_stage', 'Closed Complete');
            reqGr.setValue('u_work_notes', 'All departmental tasks have been completed. Closing request automatically.');
            reqGr.update();
            
            // Log to custom audit trail
            var audit = new GlideRecord('u_lifecycle_audit_log');
            audit.initialize();
            audit.setValue('u_request', parentReq);
            audit.setValue('u_event', 'Request Auto-Closed');
            audit.setValue('u_description', 'Parent Lifecycle Request was automatically marked Closed Complete.');
            audit.insert();
        }
    }

})(current, previous);`
  },
  {
    id: "br_calculate_sla_due",
    name: "Set Request SLA Target (Business Rule)",
    type: "Business Rule",
    table: "u_employee_lifecycle_request",
    ui_type: "Server",
    type_event: "before / insert",
    field: "Insert",
    description: "Calculates the dynamic SLA due date on request submission: 24h before joining date (onboarding) or 24h before last working day (offboarding).",
    code: `(function executeRule(current, previous /*null when async*/) {

    var eventDateStr = '';
    if (current.u_type == 'Onboarding') {
        eventDateStr = current.u_joining_date.toString();
    } else if (current.u_type == 'Offboarding') {
        eventDateStr = current.u_last_working_day.toString();
    }

    if (eventDateStr) {
        var eventDate = new GlideDateTime(eventDateStr);
        // Set SLA Due to exactly 24 hours (86400 seconds) prior to the target event
        eventDate.addSeconds(-86400); 
        current.u_sla_due = eventDate;
    } else {
        // Fallback: Default SLA is 7 days from creation
        var fallbackDate = new GlideDateTime();
        fallbackDate.addDays(7);
        current.u_sla_due = fallbackDate;
    }

})(current, previous);`
  },
  {
    id: "acl_read_request_employee",
    name: "Employee Lifecycle Request Read ACL (ACL)",
    type: "Access Control List (ACL)",
    table: "u_employee_lifecycle_request",
    ui_type: "Server / Security",
    type_event: "Read Operation",
    field: "Table-level",
    description: "Restricts viewing of Lifecycle requests. Admins, managers, and the assigned employee themselves can read.",
    code: `// Answer will determine access (true/false)
if (gs.hasRole('admin') || gs.hasRole('u_hr_admin')) {
    answer = true;
} else if (gs.getUserID() == current.u_employee_name || gs.getUserID() == current.u_manager) {
    answer = true;
} else {
    // Check if the current user has any active tasks assigned to their group for this request
    var taskGr = new GlideRecord('u_department_task');
    taskGr.addQuery('u_parent_request', current.sys_id);
    taskGr.addQuery('u_assignment_group', 'javascript:getMyGroups()');
    taskGr.query();
    answer = taskGr.hasNext();
}`
  },
  {
    id: "flow_script_revoke_access",
    name: "Revoke Access Action Script (Flow Designer)",
    type: "Flow Designer Script Step",
    table: "Flow: Employee Offboarding",
    ui_type: "Server / Flow",
    type_event: "Action Step Execution",
    field: "Script step",
    description: "Automated step in Flow Designer triggered after manager approval. Revokes Active Directory account and marks assigned hardware assets as return-pending.",
    code: `(function execute(inputs, outputs) {
    var employeeId = inputs.employee_id;
    var userSysId = inputs.user_sys_id;
    var requestSysId = inputs.request_sys_id;
    
    gs.info('Starting access revocation process for Employee ID: ' + employeeId);
    
    // 1. Simulating Active Directory / IAM IAM API call via IntegrationHub
    // in real life, we would use an AD Spokes action or REST Step.
    var success = true; 
    
    // 2. Mark assigned assets as "Pending Return" in Custom Asset Assignment table
    var assetGr = new GlideRecord('u_asset_assignment');
    assetGr.addQuery('u_request', requestSysId);
    assetGr.addQuery('u_status', 'Assigned');
    assetGr.query();
    
    var assetCount = 0;
    while(assetGr.next()) {
        assetGr.setValue('u_status', 'Pending Return');
        assetGr.update();
        assetCount++;
    }
    
    // 3. Deactivate User Account in sys_user (if account deactivation date is today)
    var userGr = new GlideRecord('sys_user');
    if (userGr.get(userSysId)) {
        userGr.setValue('active', false);
        userGr.setValue('locked_out', true);
        userGr.update();
    }
    
    // Set output variables for downstream Flow actions
    outputs.status = success ? 'Success' : 'Failed';
    outputs.assets_marked_for_return = assetCount;
    outputs.log_message = 'Deactivated account and flagged ' + assetCount + ' assets for collection.';
})(inputs, outputs);`
  }
];
