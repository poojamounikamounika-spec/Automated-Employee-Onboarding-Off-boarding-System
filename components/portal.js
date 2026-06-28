// ServiceNow Service Catalog Portal Component

window.initPortal = function(containerId, onSubmitRequest) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let currentCatalogItem = null; // 'onboarding', 'offboarding', or null (grid view)
    let formErrors = {};

    function render() {
        if (!currentCatalogItem) {
            renderCatalogGrid();
        } else if (currentCatalogItem === 'onboarding') {
            renderOnboardingForm();
        } else if (currentCatalogItem === 'offboarding') {
            renderOffboardingForm();
        }
        lucide.createIcons();
    }

    function renderCatalogGrid() {
        container.innerHTML = `
            <div class="glass-panel">
                <div class="glass-panel-header">
                    <h2 class="glass-panel-title">
                        <i data-lucide="shopping-bag"></i>
                        Self-Service Catalog Portal
                    </h2>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 14px;">
                    Welcome to the ServiceNow Employee Lifecycle Portal. Please select a service catalog item below to submit a lifecycle request.
                </p>
                
                <div class="catalog-container">
                    <div class="catalog-card onboard" id="btn-cat-onboard">
                        <div class="catalog-card-icon">
                            <i data-lucide="user-plus"></i>
                        </div>
                        <h3>Employee Onboarding Request</h3>
                        <p>Initiate the onboarding process for a new employee. Automatically coordinates Manager approval, HR documentation, IT equipment provisioning, email setup, and security access cards.</p>
                        <div class="catalog-card-meta">
                            <span>SLA: Complete by Joining Date</span>
                            <span style="color: var(--color-onboarding); font-weight: 700;">Order Now &rarr;</span>
                        </div>
                    </div>

                    <div class="catalog-card offboard" id="btn-cat-offboard">
                        <div class="catalog-card-icon">
                            <i data-lucide="user-minus"></i>
                        </div>
                        <h3>Employee Offboarding Request</h3>
                        <p>Initiate the offboarding process for an exiting employee. Automatically triggers manager approval, IAM account deactivations, VPN/Email revoking, asset return collections, and payroll closure.</p>
                        <div class="catalog-card-meta">
                            <span>SLA: Complete by Last Day</span>
                            <span style="color: var(--color-offboarding); font-weight: 700;">Order Now &rarr;</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-cat-onboard').addEventListener('click', () => {
            currentCatalogItem = 'onboarding';
            formErrors = {};
            render();
        });

        document.getElementById('btn-cat-offboard').addEventListener('click', () => {
            currentCatalogItem = 'offboarding';
            formErrors = {};
            render();
        });
    }

    function renderOnboardingForm() {
        container.innerHTML = `
            <div class="glass-panel form-container">
                <div class="glass-panel-header">
                    <h2 class="glass-panel-title">
                        <i data-lucide="user-plus" style="color: var(--color-onboarding)"></i>
                        Catalog Item: Employee Onboarding Request
                    </h2>
                    <button class="btn btn-secondary btn-sm" id="btn-back-to-catalog">
                        <i data-lucide="arrow-left"></i> Back to Catalog
                    </button>
                </div>
                
                <form id="onboarding-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="required" for="onboard-emp-name">Employee Name</label>
                            <input type="text" id="onboard-emp-name" class="form-input" placeholder="e.g. John Miller" required>
                        </div>
                        <div class="form-group">
                            <label class="required" for="onboard-emp-id">Employee ID</label>
                            <input type="text" id="onboard-emp-id" class="form-input" placeholder="e.g. EMP412" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="required" for="onboard-dept">Department</label>
                            <select id="onboard-dept" class="form-select" required>
                                <option value="">-- Select Department --</option>
                                ${window.MOCK_DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="required" for="onboard-job-title">Job Title</label>
                            <input type="text" id="onboard-job-title" class="form-input" placeholder="e.g. Software Engineer" required>
                        </div>

                        <div class="form-group">
                            <label class="required" for="onboard-manager">Manager (Approver)</label>
                            <select id="onboard-manager" class="form-select" required>
                                <option value="">-- Select Manager --</option>
                                ${window.MOCK_USERS.filter(u => u.roles.includes('Manager')).map(m => `<option value="${m.name}">${m.name} (${m.department})</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="required" for="onboard-joining-date">Joining Date</label>
                            <input type="date" id="onboard-joining-date" class="form-input" required>
                            <div id="error-joining-date" class="field-msg-error" style="display:none;"></div>
                        </div>

                        <div class="form-group">
                            <label class="required" for="onboard-location">Location</label>
                            <select id="onboard-location" class="form-select" required>
                                <option value="">-- Select Location --</option>
                                ${window.MOCK_LOCATIONS.map(l => `<option value="${l}">${l}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="required" for="onboard-device">Required Device</label>
                            <select id="onboard-device" class="form-select" required>
                                <option value="MacBook Pro 14">MacBook Pro 14"</option>
                                <option value="ThinkPad T14">ThinkPad T14</option>
                                <option value="Dell Precision Desktop">Dell Precision Desktop</option>
                                <option value="BYOD - Bring Your Own Device">BYOD - Bring Your Own Device</option>
                            </select>
                        </div>

                        <div class="form-group span-2">
                            <label>Software Access Permissions</label>
                            <div class="form-checkbox-group">
                                <label class="checkbox-label"><input type="checkbox" name="software" value="Office 365" checked> Office 365</label>
                                <label class="checkbox-label"><input type="checkbox" name="software" value="Slack" checked> Slack</label>
                                <label class="checkbox-label"><input type="checkbox" name="software" value="GitHub"> GitHub</label>
                                <label class="checkbox-label"><input type="checkbox" name="software" value="Jira / Confluence"> Jira / Confluence</label>
                                <label class="checkbox-label"><input type="checkbox" name="software" value="AWS Cloud Access"> AWS Cloud Console</label>
                                <label class="checkbox-label"><input type="checkbox" name="software" value="VPN Tunnel Client" checked> Cisco VPN</label>
                            </div>
                        </div>

                        <div class="form-group span-2">
                            <label>Building & Facility Access</label>
                            <div class="form-checkbox-group">
                                <label class="checkbox-label"><input type="checkbox" name="building" value="Main Lobby Entrance" checked> Main Lobby Entrance</label>
                                <label class="checkbox-label"><input type="checkbox" name="building" value="Parking Garage" checked> Parking Garage</label>
                                <label class="checkbox-label"><input type="checkbox" name="building" value="Data Center Server Room"> Data Center Server Room</label>
                                <label class="checkbox-label"><input type="checkbox" name="building" value="Executive Floor Access"> Executive Floor Access</label>
                            </div>
                        </div>

                        <div class="form-group span-2">
                            <label for="onboard-requirements">Additional Requirements</label>
                            <textarea id="onboard-requirements" class="form-textarea" rows="3" placeholder="Provide any additional requests, desk configurations, or onboarding notes..."></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="btn-form-cancel">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="btn-form-submit">
                            <i data-lucide="check-circle-2"></i> Submit Request
                        </button>
                    </div>
                </form>
            </div>
        `;

        setupOnboardingListeners();
    }

    function renderOffboardingForm() {
        container.innerHTML = `
            <div class="glass-panel form-container">
                <div class="glass-panel-header">
                    <h2 class="glass-panel-title">
                        <i data-lucide="user-minus" style="color: var(--color-offboarding)"></i>
                        Catalog Item: Employee Offboarding Request
                    </h2>
                    <button class="btn btn-secondary btn-sm" id="btn-back-to-catalog">
                        <i data-lucide="arrow-left"></i> Back to Catalog
                    </button>
                </div>
                
                <form id="offboarding-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="required" for="offboard-emp-select">Select Employee to Offboard</label>
                            <select id="offboard-emp-select" class="form-select" required>
                                <option value="">-- Choose Employee --</option>
                                ${window.MOCK_USERS.filter(u => u.roles.includes('Employee')).map(e => `<option value="${e.name}">${e.name} (${e.jobTitle})</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="required" for="offboard-emp-id">Employee ID</label>
                            <input type="text" id="offboard-emp-id" class="form-input" readonly placeholder="Select employee to auto-populate">
                        </div>

                        <div class="form-group">
                            <label class="required" for="offboard-dept">Department</label>
                            <input type="text" id="offboard-dept" class="form-input" readonly placeholder="Select employee to auto-populate">
                        </div>
                        <div class="form-group">
                            <label class="required" for="offboard-manager">Manager</label>
                            <input type="text" id="offboard-manager" class="form-input" readonly placeholder="Select employee to auto-populate">
                        </div>

                        <div class="form-group">
                            <label class="required" for="offboard-last-day">Last Working Day</label>
                            <input type="date" id="offboard-last-day" class="form-input" required>
                            <div id="error-last-day" class="field-msg-error" style="display:none;"></div>
                        </div>
                        <div class="form-group">
                            <label class="required" for="offboard-exit-reason">Reason for Exit</label>
                            <select id="offboard-exit-reason" class="form-select" required>
                                <option value="">-- Choose Reason --</option>
                                <option value="Resignation">Resignation</option>
                                <option value="Retirement">Retirement</option>
                                <option value="Contract Ended">Contract Ended</option>
                                <option value="Termination">Termination</option>
                            </select>
                        </div>

                        <div class="form-group span-2">
                            <label class="required" for="offboard-asset-return">Asset Return Details</label>
                            <textarea id="offboard-asset-return" class="form-textarea" rows="2" placeholder="List assets to recover (e.g. ThinkPad Serial #4211A, Office Keys, Security Badge)" required></textarea>
                        </div>

                        <div class="form-group">
                            <label class="required" for="offboard-deactivate-date">Account Deactivation Date</label>
                            <input type="date" id="offboard-deactivate-date" class="form-input" required>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="btn-form-cancel">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="btn-form-submit">
                            <i data-lucide="alert-triangle"></i> Initiate Offboarding
                        </button>
                    </div>
                </form>
            </div>
        `;

        setupOffboardingListeners();
    }

    function setupOnboardingListeners() {
        document.getElementById('btn-back-to-catalog').addEventListener('click', backToGrid);
        document.getElementById('btn-form-cancel').addEventListener('click', backToGrid);

        const joiningDateInput = document.getElementById('onboard-joining-date');
        const errorDiv = document.getElementById('error-joining-date');

        // Catalog Client Script Simulation: Validate Joining Date
        joiningDateInput.addEventListener('change', (e) => {
            const val = e.target.value;
            if (!val) {
                errorDiv.style.display = 'none';
                delete formErrors.joiningDate;
                return;
            }

            const joiningDate = new Date(val);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (joiningDate < today) {
                errorDiv.innerHTML = `<i data-lucide="x-circle" style="width:12px;height:12px;"></i> Catalog Validation Error: Joining date must be in the future.`;
                errorDiv.style.display = 'flex';
                lucide.createIcons();
                formErrors.joiningDate = "Joining date must be in the future";
            } else {
                errorDiv.style.display = 'none';
                delete formErrors.joiningDate;
            }
        });

        document.getElementById('onboarding-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (Object.keys(formErrors).length > 0) {
                alert("Please resolve form validation errors before submitting.");
                return;
            }

            const softwareCheckboxes = document.querySelectorAll('input[name="software"]:checked');
            const buildingCheckboxes = document.querySelectorAll('input[name="building"]:checked');

            const payload = {
                type: 'Onboarding',
                employeeName: document.getElementById('onboard-emp-name').value,
                employeeId: document.getElementById('onboard-emp-id').value,
                department: document.getElementById('onboard-dept').value,
                jobTitle: document.getElementById('onboard-job-title').value,
                manager: document.getElementById('onboard-manager').value,
                joiningDate: document.getElementById('onboard-joining-date').value,
                location: document.getElementById('onboard-location').value,
                laptopDesktop: document.getElementById('onboard-device').value,
                emailAccount: true,
                softwareAccess: Array.from(softwareCheckboxes).map(c => c.value).join(', '),
                buildingAccess: Array.from(buildingCheckboxes).map(c => c.value).join(', '),
                additionalRequirements: document.getElementById('onboard-requirements').value
            };

            onSubmitRequest(payload);
            backToGrid();
        });
    }

    function setupOffboardingListeners() {
        document.getElementById('btn-back-to-catalog').addEventListener('click', backToGrid);
        document.getElementById('btn-form-cancel').addEventListener('click', backToGrid);

        const empSelect = document.getElementById('offboard-emp-select');
        const empIdInput = document.getElementById('offboard-emp-id');
        const deptInput = document.getElementById('offboard-dept');
        const managerInput = document.getElementById('offboard-manager');

        // Catalog Client Script Simulation: Auto Populate employee info on change
        empSelect.addEventListener('change', (e) => {
            const name = e.target.value;
            if (!name) {
                empIdInput.value = '';
                deptInput.value = '';
                managerInput.value = '';
                return;
            }

            const user = window.MOCK_USERS.find(u => u.name === name);
            if (user) {
                empIdInput.value = user.employeeId;
                deptInput.value = user.department;
                managerInput.value = user.manager;
                
                // Set default asset return details based on their job/department to simulate smart catalog
                let defaultAssets = "Standard Laptop (MacBook Pro/ThinkPad)";
                if (user.department === 'IT Support' || user.department === 'Engineering') {
                    defaultAssets += ", Hardware Security Token (YubiKey), Office Access Card";
                } else {
                    defaultAssets += ", Corporate Access Card";
                }
                document.getElementById('offboard-asset-return').value = defaultAssets;
            }
        });

        const lastDayInput = document.getElementById('offboard-last-day');
        const errorDiv = document.getElementById('error-last-day');
        const deactivateInput = document.getElementById('offboard-deactivate-date');

        // Catalog Client Script Simulation: Validate Last Working Day
        lastDayInput.addEventListener('change', (e) => {
            const val = e.target.value;
            if (!val) {
                errorDiv.style.display = 'none';
                delete formErrors.lastDay;
                return;
            }

            const lastDay = new Date(val);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (lastDay < today) {
                errorDiv.innerHTML = `<i data-lucide="x-circle" style="width:12px;height:12px;"></i> Catalog Validation Error: Last working day cannot be in the past.`;
                errorDiv.style.display = 'flex';
                lucide.createIcons();
                formErrors.lastDay = "Last working day cannot be in the past";
            } else {
                errorDiv.style.display = 'none';
                delete formErrors.lastDay;
                // Auto-set account deactivation date to match last working day
                deactivateInput.value = val;
            }
        });

        document.getElementById('offboarding-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (Object.keys(formErrors).length > 0) {
                alert("Please resolve form validation errors before submitting.");
                return;
            }

            const payload = {
                type: 'Offboarding',
                employeeName: empSelect.value,
                employeeId: empIdInput.value,
                department: deptInput.value,
                manager: managerInput.value,
                lastWorkingDay: lastDayInput.value,
                reasonForExit: document.getElementById('offboard-exit-reason').value,
                assetReturnDetails: document.getElementById('offboard-asset-return').value,
                accountDeactivationDate: deactivateInput.value,
                jobTitle: 'Employee' // fallback
            };

            onSubmitRequest(payload);
            backToGrid();
        });
    }

    function backToGrid() {
        currentCatalogItem = null;
        render();
    }

    // Initial render
    render();
}
