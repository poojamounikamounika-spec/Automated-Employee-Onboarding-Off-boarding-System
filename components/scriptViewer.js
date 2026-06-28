// ServiceNow Script Viewer Component

window.initScriptViewer = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let selectedScriptId = window.SERVICENOW_SCRIPTS[0].id;
    let typeFilter = 'All';

    function render() {
        const filteredScripts = typeFilter === 'All' 
            ? window.SERVICENOW_SCRIPTS 
            : window.SERVICENOW_SCRIPTS.filter(s => s.type === typeFilter);

        // Find active script
        let activeScript = filteredScripts.find(s => s.id === selectedScriptId);
        if (!activeScript && filteredScripts.length > 0) {
            activeScript = filteredScripts[0];
            selectedScriptId = activeScript.id;
        }

        const scriptTypes = ['All', 'Catalog Client Script', 'Business Rule', 'Access Control List (ACL)', 'Flow Designer Script Step'];

        container.innerHTML = `
            <div class="glass-panel" style="margin-bottom:0;">
                <div class="glass-panel-header" style="margin-bottom:15px; padding-bottom:8px;">
                    <h2 class="glass-panel-title">
                        <i data-lucide="code-2"></i>
                        ServiceNow Production Scripts Library
                    </h2>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <span style="font-size:11px; color:var(--text-secondary); font-weight:600;">Filter:</span>
                        <select id="script-type-filter" class="form-select" style="font-size:11px; padding:4px 8px;">
                            ${scriptTypes.map(type => `
                                <option value="${type}" ${type === typeFilter ? 'selected' : ''}>${type}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="script-workspace">
                    <!-- Left Column: Scripts list -->
                    <div class="script-list">
                        ${filteredScripts.length === 0 ? `
                            <div style="text-align:center; padding:20px; font-size:12px; color:var(--text-muted);">No scripts found.</div>
                        ` : filteredScripts.map(s => `
                            <div class="script-list-item ${s.id === selectedScriptId ? 'active' : ''}" data-id="${s.id}">
                                <div class="script-list-title">${s.name}</div>
                                <div class="script-list-type">${s.type}</div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Right Column: Code viewer -->
                    <div class="script-viewer-panel">
                        ${activeScript ? `
                            <div class="script-viewer-header">
                                <div class="script-viewer-meta">
                                    <h3>${activeScript.name}</h3>
                                    <span>Table: <strong>${activeScript.table}</strong> | Target: <strong>${activeScript.field || 'Insert/Update'}</strong></span>
                                </div>
                                <button class="btn btn-secondary btn-sm btn-copy" id="btn-copy-script" data-id="${activeScript.id}">
                                    <i data-lucide="copy" style="width:12px;height:12px;"></i> Copy Code
                                </button>
                            </div>
                            
                            <div style="background: rgba(0,0,0,0.2); padding:10px 16px; border-bottom: 1px solid var(--border-color); font-size:12.5px; color:var(--text-secondary); line-height:1.4;">
                                <strong>Description:</strong> ${activeScript.description}
                            </div>

                            <div class="script-code-container">
                                <pre class="script-code-pre"><code id="code-content">${escapeHtml(activeScript.code)}</code></pre>
                            </div>
                        ` : `
                            <div style="text-align: center; color: var(--text-muted); padding: 80px;">
                                <i data-lucide="file-code-2" style="width: 48px; height: 48px; margin-bottom: 12px; opacity:0.5;"></i>
                                <p>Select a script configuration on the left list to view code details.</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        setupListeners(filteredScripts);
        lucide.createIcons();
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupListeners(filteredScripts) {
        // Dropdown filter
        const filterSelect = document.getElementById('script-type-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                typeFilter = e.target.value;
                render();
            });
        }

        // List selection
        const items = document.querySelectorAll('.script-list-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                selectedScriptId = item.getAttribute('data-id');
                render();
            });
        });

        // Copy button
        const copyBtn = document.getElementById('btn-copy-script');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const scriptId = copyBtn.getAttribute('data-id');
                const script = window.SERVICENOW_SCRIPTS.find(s => s.id === scriptId);
                if (script) {
                    navigator.clipboard.writeText(script.code).then(() => {
                        copyBtn.innerHTML = `<i data-lucide="check" style="width:12px;height:12px;color:var(--color-onboarding);"></i> Copied!`;
                        lucide.createIcons();
                        setTimeout(() => {
                            copyBtn.innerHTML = `<i data-lucide="copy" style="width:12px;height:12px;"></i> Copy Code`;
                            lucide.createIcons();
                        }, 2000);
                    }).catch(err => {
                        console.error('Could not copy text: ', err);
                    });
                }
            });
        }
    }

    return {
        render: render
    };
}
