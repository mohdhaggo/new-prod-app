// Department & Role Management - No Demo Data

// Initialize empty data structure
let departments = [];

// DOM Elements
const addDeptBtn = document.getElementById('addDeptBtn');
const addDeptModal = document.getElementById('addDeptModal');
const addDeptForm = document.getElementById('addDeptForm');
const addRoleModal = document.getElementById('addRoleModal');
const addRoleForm = document.getElementById('addRoleForm');
const editDeptModal = document.getElementById('editDeptModal');
const editRoleModal = document.getElementById('editRoleModal');
const editDeptForm = document.getElementById('editDeptForm');
const editRoleForm = document.getElementById('editRoleForm');
const departmentsList = document.getElementById('departmentsList');
const statsBar = document.getElementById('statsBar');

// Alert elements
const alertPopup = document.getElementById('alertPopup');
const alertHeader = document.getElementById('alertHeader');
const alertIcon = document.getElementById('alertIcon');
const alertTitle = document.getElementById('alertTitle');
const alertMessage = document.getElementById('alertMessage');
const alertActions = document.getElementById('alertActions');

// Load departments from localStorage (if any)
function loadDepartments() {
    const saved = localStorage.getItem('departments');
    if (saved) {
        try {
            departments = JSON.parse(saved);
        } catch (e) {
            departments = [];
        }
    } else {
        departments = [];
    }
}

// Save departments to localStorage
function saveDepartments() {
    localStorage.setItem('departments', JSON.stringify(departments));
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadDepartments();
    renderStats();
    renderDepartments();
    
    // Add Department button click
    addDeptBtn.addEventListener('click', function() {
        openModal(addDeptModal);
        document.getElementById('deptName').focus();
    });
    
    // Add Department form submission
    addDeptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const deptName = document.getElementById('deptName').value;
        const deptDescription = document.getElementById('deptDescription').value;
        
        if (!deptName.trim()) {
            showAlert('Error', 'Department name is required', 'error');
            return;
        }
        
        addDepartment(deptName, deptDescription);
        
        // Reset form and close modal
        addDeptForm.reset();
        closeModal(addDeptModal);
        showAlert('Success', 'Department added successfully!', 'success');
    });
    
    // Add Role form submission
    addRoleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const deptId = parseInt(document.getElementById('roleDeptId').value);
        const roleName = document.getElementById('roleName').value;
        const roleDescription = document.getElementById('roleDescription').value;
        
        if (!roleName.trim()) {
            showAlert('Error', 'Role name is required', 'error');
            return;
        }
        
        addRole(deptId, roleName, roleDescription);
        
        // Reset form and close modal
        addRoleForm.reset();
        closeModal(addRoleModal);
        showAlert('Success', 'Role added successfully!', 'success');
    });
    
    // Edit Department form submission
    editDeptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const deptId = parseInt(document.getElementById('editDeptId').value);
        const deptName = document.getElementById('editDeptName').value;
        const deptDescription = document.getElementById('editDeptDescription').value;
        
        if (!deptName.trim()) {
            showAlert('Error', 'Department name is required', 'error');
            return;
        }
        
        updateDepartment(deptId, deptName, deptDescription);
        closeModal(editDeptModal);
        showAlert('Success', 'Department updated successfully!', 'success');
    });
    
    // Edit Role form submission
    editRoleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const roleId = parseInt(document.getElementById('editRoleId').value);
        const deptId = parseInt(document.getElementById('editRoleDeptId').value);
        const roleName = document.getElementById('editRoleName').value;
        const roleDescription = document.getElementById('editRoleDescription').value;
        
        if (!roleName.trim()) {
            showAlert('Error', 'Role name is required', 'error');
            return;
        }
        
        updateRole(deptId, roleId, roleName, roleDescription);
        closeModal(editRoleModal);
        showAlert('Success', 'Role updated successfully!', 'success');
    });
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
        
        if (e.target.classList.contains('alert-popup')) {
            closeAlert();
        }
    });
});

// Render statistics
function renderStats() {
    const totalDepartments = departments.length;
    let totalRoles = 0;
    
    departments.forEach(dept => {
        totalRoles += dept.roles.length;
    });
    
    const avgRoles = totalDepartments > 0 ? (totalRoles / totalDepartments).toFixed(1) : 0;
    
    statsBar.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${totalDepartments}</div>
            <div class="stat-label">Departments</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${totalRoles}</div>
            <div class="stat-label">Total Roles</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${avgRoles}</div>
            <div class="stat-label">Avg Roles/Dept</div>
        </div>
    `;
}

// Render departments and their roles
function renderDepartments() {
    renderStats();
    
    if (departments.length === 0) {
        departmentsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-building"></i>
                <h3>No Departments Yet</h3>
                <p>Click "Add New Department" to create your first department</p>
            </div>
        `;
        return;
    }
    
    let departmentsHTML = '<div class="departments-container">';
    
    departments.forEach(dept => {
        let rolesHTML = '';
        
        if (dept.roles.length === 0) {
            rolesHTML = `
                <div class="no-roles">
                    <i class="fas fa-user-tag"></i>
                    <p>No roles in this department yet. Click "Add Role" to create one.</p>
                </div>
            `;
        } else {
            dept.roles.forEach((role, index) => {
                rolesHTML += `
                    <div class="role-item" data-role-id="${role.id}">
                        <div class="role-info">
                            <h4>
                                <span class="role-number">${index + 1}</span>
                                <i class="fas fa-user-tie role-icon"></i>
                                <span class="role-title">${role.name}</span>
                            </h4>
                            <p>${role.description || 'No description provided'}</p>
                        </div>
                        <div class="role-actions">
                            <button class="btn btn-secondary btn-xsmall edit-role-btn" 
                                    data-dept-id="${dept.id}" 
                                    data-role-id="${role.id}"
                                    title="Edit Role">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-danger btn-xsmall delete-role-btn" 
                                    data-dept-id="${dept.id}" 
                                    data-role-id="${role.id}"
                                    title="Delete Role">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        departmentsHTML += `
            <div class="department-item" data-dept-id="${dept.id}">
                <div class="department-header">
                    <div class="department-title">
                        <i class="fas fa-building"></i>
                        ${dept.name}
                        <span class="role-count">${dept.roles.length} role${dept.roles.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="department-actions">
                        <button class="btn btn-success btn-small add-role-to-dept-btn" data-dept-id="${dept.id}">
                            <i class="fas fa-plus"></i> Add Role
                        </button>
                        <button class="btn btn-secondary btn-small edit-dept-btn" data-dept-id="${dept.id}" title="Edit Department">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small delete-dept-btn" data-dept-id="${dept.id}" title="Delete Department">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="department-body">
                    <div class="department-description">
                        ${dept.description || '<i>No description provided</i>'}
                    </div>
                    <div class="roles-section">
                        <div class="roles-header">
                            <div class="roles-title">
                                <i class="fas fa-user-tag"></i>
                                Department Roles (${dept.roles.length})
                            </div>
                        </div>
                        <div class="roles-list">
                            ${rolesHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    departmentsHTML += '</div>';
    departmentsList.innerHTML = departmentsHTML;
    
    // Attach event listeners to buttons
    document.querySelectorAll('.add-role-to-dept-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const deptId = parseInt(this.getAttribute('data-dept-id'));
            openAddRoleModal(deptId);
        });
    });
    
    document.querySelectorAll('.edit-dept-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const deptId = parseInt(this.getAttribute('data-dept-id'));
            openEditDeptModal(deptId);
        });
    });
    
    document.querySelectorAll('.delete-dept-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const deptId = parseInt(this.getAttribute('data-dept-id'));
            deleteDepartment(deptId);
        });
    });
    
    document.querySelectorAll('.edit-role-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const deptId = parseInt(this.getAttribute('data-dept-id'));
            const roleId = parseInt(this.getAttribute('data-role-id'));
            openEditRoleModal(deptId, roleId);
        });
    });
    
    document.querySelectorAll('.delete-role-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const deptId = parseInt(this.getAttribute('data-dept-id'));
            const roleId = parseInt(this.getAttribute('data-role-id'));
            deleteRole(deptId, roleId);
        });
    });
}

// Add a new department
function addDepartment(name, description) {
    const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1;
    
    departments.push({
        id: newId,
        name: name,
        description: description,
        roles: []
    });
    
    saveDepartments();
    renderDepartments();
}

// Open Add Role modal
function openAddRoleModal(deptId) {
    const dept = departments.find(d => d.id === deptId);
    
    if (!dept) return;
    
    document.getElementById('roleDeptId').value = dept.id;
    
    // Set placeholder for department context
    const roleNameInput = document.getElementById('roleName');
    roleNameInput.placeholder = `Enter role name for ${dept.name}`;
    roleNameInput.focus();
    
    openModal(addRoleModal);
}

// Add a new role to a department
function addRole(deptId, name, description) {
    const deptIndex = departments.findIndex(d => d.id === deptId);
    
    if (deptIndex === -1) return;
    
    // Generate unique role ID
    let allRoleIds = [];
    departments.forEach(dept => {
        dept.roles.forEach(role => {
            allRoleIds.push(role.id);
        });
    });
    
    const newRoleId = allRoleIds.length > 0 ? Math.max(...allRoleIds) + 1 : 101;
    
    departments[deptIndex].roles.push({
        id: newRoleId,
        name: name,
        description: description
    });
    
    saveDepartments();
    renderDepartments();
}

// Open edit department modal
function openEditDeptModal(deptId) {
    const dept = departments.find(d => d.id === deptId);
    
    if (!dept) return;
    
    document.getElementById('editDeptId').value = dept.id;
    document.getElementById('editDeptName').value = dept.name;
    document.getElementById('editDeptDescription').value = dept.description || '';
    
    openModal(editDeptModal);
}

// Open edit role modal
function openEditRoleModal(deptId, roleId) {
    const dept = departments.find(d => d.id === deptId);
    
    if (!dept) return;
    
    const role = dept.roles.find(r => r.id === roleId);
    
    if (!role) return;
    
    document.getElementById('editRoleId').value = role.id;
    document.getElementById('editRoleDeptId').value = dept.id;
    document.getElementById('editRoleName').value = role.name;
    document.getElementById('editRoleDescription').value = role.description || '';
    
    openModal(editRoleModal);
}

// Update department
function updateDepartment(deptId, name, description) {
    const deptIndex = departments.findIndex(d => d.id === deptId);
    
    if (deptIndex === -1) return;
    
    departments[deptIndex].name = name;
    departments[deptIndex].description = description;
    
    saveDepartments();
    renderDepartments();
}

// Update role
function updateRole(deptId, roleId, name, description) {
    const deptIndex = departments.findIndex(d => d.id === deptId);
    
    if (deptIndex === -1) return;
    
    const roleIndex = departments[deptIndex].roles.findIndex(r => r.id === roleId);
    
    if (roleIndex === -1) return;
    
    departments[deptIndex].roles[roleIndex].name = name;
    departments[deptIndex].roles[roleIndex].description = description;
    
    saveDepartments();
    renderDepartments();
}

// Delete department
function deleteDepartment(deptId) {
    const deptIndex = departments.findIndex(d => d.id === deptId);
    
    if (deptIndex === -1) return;
    
    const deptName = departments[deptIndex].name;
    
    showAlert(
        'Confirm Delete',
        `Are you sure you want to delete the department "${deptName}"? This will also delete all roles in this department.`,
        'warning',
        [
            {
                text: 'Cancel',
                class: 'alert-btn-secondary',
                action: closeAlert
            },
            {
                text: 'Delete',
                class: 'alert-btn-danger',
                action: function() {
                    departments.splice(deptIndex, 1);
                    saveDepartments();
                    renderDepartments();
                    closeAlert();
                    showAlert('Success', `Department "${deptName}" deleted successfully!`, 'success');
                }
            }
        ]
    );
}

// Delete role
function deleteRole(deptId, roleId) {
    const deptIndex = departments.findIndex(d => d.id === deptId);
    
    if (deptIndex === -1) return;
    
    const roleIndex = departments[deptIndex].roles.findIndex(r => r.id === roleId);
    
    if (roleIndex === -1) return;
    
    const roleName = departments[deptIndex].roles[roleIndex].name;
    
    showAlert(
        'Confirm Delete',
        `Are you sure you want to delete the role "${roleName}"?`,
        'warning',
        [
            {
                text: 'Cancel',
                class: 'alert-btn-secondary',
                action: closeAlert
            },
            {
                text: 'Delete',
                class: 'alert-btn-danger',
                action: function() {
                    departments[deptIndex].roles.splice(roleIndex, 1);
                    saveDepartments();
                    renderDepartments();
                    closeAlert();
                    showAlert('Success', `Role "${roleName}" deleted successfully!`, 'success');
                }
            }
        ]
    );
}

// Show alert popup
function showAlert(title, message, type, buttons = null) {
    // Set alert type and styling
    alertHeader.className = `alert-header ${type}`;
    
    // Set icon based on type
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    alertIcon.innerHTML = icon;
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    
    // Clear previous buttons
    alertActions.innerHTML = '';
    
    // Add buttons
    if (buttons && buttons.length > 0) {
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `alert-btn ${btn.class}`;
            button.textContent = btn.text;
            button.addEventListener('click', btn.action);
            alertActions.appendChild(button);
        });
    } else {
        // Default OK button
        const okButton = document.createElement('button');
        okButton.className = `alert-btn alert-btn-primary`;
        okButton.textContent = 'OK';
        okButton.addEventListener('click', closeAlert);
        alertActions.appendChild(okButton);
    }
    
    // Show alert
    alertPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Auto-close success alerts after 3 seconds
    if (type === 'success' && (!buttons || buttons.length === 0)) {
        setTimeout(closeAlert, 3000);
    }
}

// Close alert
function closeAlert() {
    alertPopup.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Open modal
function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Export functions for global use
window.toggleSidebar = toggleSidebar;
window.refreshPage = refreshPage;
window.createNew = createNew;