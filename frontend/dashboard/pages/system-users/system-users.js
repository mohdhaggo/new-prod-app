// ============================================
// USER MANAGEMENT SYSTEM - NO DEMO DATA
// ============================================

// Initialize empty users array
let usersData = [];

// Departments and roles
const departments = [
    "IT", "HR", "Finance", "Marketing", "Sales", 
    "Operations", "Customer Support", "Research & Development"
];

const roles = [
    "Administrator", "Manager", "Supervisor", "Team Lead", 
    "Developer", "Accountant", "Marketing Manager", "Sales Executive",
    "Support Specialist", "Analyst"
];

// ============================================
// APPLICATION STATE & CONFIGURATION
// ============================================
let currentSearchQuery = '';
let currentSearchResults = [];
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let userToDelete = null;
let activeDropdown = null;
let isEditing = false;
let editingUser = null;
let currentPasswordResetEmail = null;

// ============================================
// DOM ELEMENT REFERENCES
// ============================================
const smartSearchInput = document.getElementById('smartSearchInput');
const tableBody = document.getElementById('tableBody');
const searchStats = document.getElementById('searchStats');
const emptyState = document.getElementById('emptyState');
const createUserBtn = document.getElementById('createUserBtn');
const pageSizeSelect = document.getElementById('pageSizeSelect');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageNumbers = document.getElementById('pageNumbers');
const paginationContainer = document.getElementById('paginationContainer');
const closeDetailsScreen = document.getElementById('closeDetailsScreen');
const detailsScreen = document.getElementById('detailsScreen');
const statsBar = document.getElementById('statsBar');

// Create form elements
const userFormModal = document.getElementById('userFormModal');
const closeFormBtn = document.getElementById('closeFormBtn');
const formTitle = document.getElementById('formTitle');
const employeeIdInput = document.getElementById('employeeId');
const employeeNameInput = document.getElementById('employeeName');
const emailInput = document.getElementById('email');
const mobileInput = document.getElementById('mobile');
const departmentSelect = document.getElementById('department');
const roleSelect = document.getElementById('role');
const lineManagerSelect = document.getElementById('lineManager');
const userIdInput = document.getElementById('userId');
const userForm = document.getElementById('userForm');

// Edit form elements
const editUserModal = document.getElementById('editUserModal');
const closeEditFormBtn = document.getElementById('closeEditFormBtn');
const editEmployeeIdInput = document.getElementById('editEmployeeId');
const editEmployeeNameInput = document.getElementById('editEmployeeName');
const editEmailInput = document.getElementById('editEmail');
const editMobileInput = document.getElementById('editMobile');
const editDepartmentSelect = document.getElementById('editDepartment');
const editRoleSelect = document.getElementById('editRole');
const editLineManagerSelect = document.getElementById('editLineManager');
const editUserIdInput = document.getElementById('editUserId');
const editUserForm = document.getElementById('editUserForm');

// Alert elements
const alertPopup = document.getElementById('alertPopup');
const alertHeader = document.getElementById('alertHeader');
const alertIcon = document.getElementById('alertIcon');
const alertTitle = document.getElementById('alertTitle');
const alertMessage = document.getElementById('alertMessage');
const alertActions = document.getElementById('alertActions');

// ============================================
// LOAD DATA FROM LOCALSTORAGE
// ============================================
function loadUsersFromStorage() {
    const saved = localStorage.getItem('systemUsers');
    if (saved) {
        try {
            usersData = JSON.parse(saved);
        } catch (e) {
            usersData = [];
        }
    } else {
        usersData = [];
    }
    
    // Update search results
    currentSearchResults = [...usersData];
    
    // Sort by Employee ID
    sortUsersByEmployeeId();
    
    // Update UI
    calculateTotalPages();
    renderTable();
    renderStats();
    updateEmptyState();
}

// Save users to localStorage
function saveUsersToStorage() {
    localStorage.setItem('systemUsers', JSON.stringify(usersData));
}

// Sort users by Employee ID
function sortUsersByEmployeeId() {
    currentSearchResults.sort((a, b) => {
        const numA = parseInt(a.employeeId.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.employeeId.replace(/\D/g, '')) || 0;
        return numA - numB;
    });
}

// ============================================
// INITIALIZATION
// ============================================
function initializeApp() {
    // Load users from localStorage
    loadUsersFromStorage();
    
    // Populate department and role dropdowns
    populateDropdowns();
    populateLineManagerDropdowns();
    
    // Set up event listeners
    smartSearchInput.addEventListener('input', handleSearchInput);
    createUserBtn.addEventListener('click', openCreateForm);
    pageSizeSelect.addEventListener('change', handlePageSizeChange);
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    closeDetailsScreen.addEventListener('click', closeDetailsView);
    
    // Create form event listeners
    closeFormBtn.addEventListener('click', () => closeModal(userFormModal));
    userForm.addEventListener('submit', saveUser);
    
    // Edit form event listeners
    closeEditFormBtn.addEventListener('click', () => closeModal(editUserModal));
    editUserForm.addEventListener('submit', saveEditUser);
    
    // Close modals when clicking outside
    userFormModal.addEventListener('click', (e) => {
        if (e.target === userFormModal) {
            closeModal(userFormModal);
        }
    });
    
    editUserModal.addEventListener('click', (e) => {
        if (e.target === editUserModal) {
            closeModal(editUserModal);
        }
    });
    
    detailsScreen.addEventListener('click', (e) => {
        if (e.target === detailsScreen) {
            closeDetailsView();
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.action-dropdown-container')) {
            closeAllDropdowns();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Render statistics - centered
function renderStats() {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(u => u.status === 'active').length;
    const inactiveUsers = usersData.filter(u => u.status === 'inactive').length;
    
    statsBar.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${totalUsers}</div>
            <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${activeUsers}</div>
            <div class="stat-label">Active Users</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${inactiveUsers}</div>
            <div class="stat-label">Inactive Users</div>
        </div>
    `;
}

// Populate department and role dropdowns
function populateDropdowns() {
    // Populate department dropdowns
    [departmentSelect, editDepartmentSelect].forEach(select => {
        select.innerHTML = '<option value="">Select Department</option>';
        departments.forEach(dept => {
            select.innerHTML += `<option value="${dept}">${dept}</option>`;
        });
    });
    
    // Populate role dropdowns
    [roleSelect, editRoleSelect].forEach(select => {
        select.innerHTML = '<option value="">Select Role</option>';
        roles.forEach(role => {
            select.innerHTML += `<option value="${role}">${role}</option>`;
        });
    });
}

// Populate line manager dropdowns with existing users
function populateLineManagerDropdowns() {
    const managerOptions = '<option value="not_available">Not Available</option>';
    
    // Get all active users as potential line managers
    const managers = usersData.filter(u => u.status === 'active');
    
    let options = managerOptions;
    managers.forEach(manager => {
        options += `<option value="${manager.id}">${manager.name} (${manager.employeeId})</option>`;
    });
    
    // Populate both create and edit line manager dropdowns
    lineManagerSelect.innerHTML = options;
    editLineManagerSelect.innerHTML = options;
}

// Update empty state visibility
function updateEmptyState() {
    if (usersData.length === 0) {
        emptyState.style.display = 'block';
        document.querySelector('.table-wrapper').style.display = 'none';
        paginationContainer.style.display = 'none';
        searchStats.textContent = 'No users found';
    } else if (currentSearchResults.length === 0) {
        emptyState.style.display = 'block';
        document.querySelector('.table-wrapper').style.display = 'none';
        paginationContainer.style.display = 'none';
        searchStats.textContent = 'No matching users found';
    } else {
        emptyState.style.display = 'none';
        document.querySelector('.table-wrapper').style.display = 'block';
    }
}

// ============================================
// DROPDOWN FUNCTIONS
// ============================================
function toggleDropdown(dropdownId, userId) {
    const dropdown = document.getElementById(`dropdown-${dropdownId}`);
    const container = dropdown.closest('.action-dropdown-container');
    const button = document.querySelector(`[onclick="toggleDropdown('${dropdownId}', '${userId}')"]`);
    
    if (!dropdown) return;
    
    // Check if this dropdown is already open
    const isCurrentlyOpen = dropdown.classList.contains('show');
    
    // Close all other dropdowns first
    closeAllDropdowns();
    
    // If it wasn't open before, open it now (toggle behavior)
    if (!isCurrentlyOpen) {
        dropdown.classList.add('show');
        if (button) button.classList.add('active');
        if (container) container.classList.add('dropdown-open');
        activeDropdown = dropdown;
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.action-dropdown-menu').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    
    document.querySelectorAll('.btn-action-dropdown').forEach(button => {
        button.classList.remove('active');
    });
    
    document.querySelectorAll('.action-dropdown-container').forEach(container => {
        container.classList.remove('dropdown-open');
    });
    
    activeDropdown = null;
}

function createDropdownMenu(userId) {
    return `
        <div class="action-dropdown-container">
            <button class="btn-action-dropdown" onclick="toggleDropdown('${userId}', '${userId}')">
                <i class="fas fa-cogs"></i> Actions <i class="fas fa-chevron-down"></i>
            </button>
            <div class="action-dropdown-menu" id="dropdown-${userId}">
                <button class="dropdown-item view" onclick="openDetailsView('${userId}'); closeAllDropdowns();">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item delete" onclick="deleteUser('${userId}'); closeAllDropdowns();">
                    <i class="fas fa-trash"></i> Delete User
                </button>
            </div>
        </div>
    `;
}

// ============================================
// PAGINATION FUNCTIONS
// ============================================
function calculateTotalPages() {
    totalPages = Math.ceil(currentSearchResults.length / pageSize);
    if (totalPages === 0) totalPages = 1;
    if (currentPage > totalPages) currentPage = totalPages;
}

function getPaginatedData() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return currentSearchResults.slice(startIndex, endIndex);
}

function handlePageSizeChange() {
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    calculateTotalPages();
    renderTable();
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        renderTable();
    }
}

function renderPagination() {
    pageNumbers.innerHTML = '';
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn';
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToPage(i));
        pageNumbers.appendChild(pageBtn);
    }
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// ============================================
// SMART SEARCH IMPLEMENTATION
// ============================================
function handleSearchInput(event) {
    const query = event.target.value;
    currentSearchQuery = query;
    
    if (!query.trim()) {
        currentSearchResults = [...usersData];
    } else {
        currentSearchResults = performSmartSearch(query);
    }
    
    currentPage = 1;
    calculateTotalPages();
    renderTable();
    updateEmptyState();
}

function performSmartSearch(query) {
    const terms = query.toLowerCase().split(' ').filter(term => term.trim());
    let results = [...usersData];
    
    terms.forEach(term => {
        results = results.filter(user => matchesTerm(user, term));
    });
    
    return results;
}

function matchesTerm(user, term) {
    return (
        user.employeeId.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.mobile.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.status.toLowerCase().includes(term) ||
        user.dashboardAccess.toLowerCase().includes(term)
    );
}

// ============================================
// TABLE RENDERING
// ============================================
function renderTable() {
    tableBody.innerHTML = '';
    
    if (currentSearchResults.length === 0) {
        updateEmptyState();
        return;
    }
    
    const paginatedData = getPaginatedData();
    
    paginatedData.forEach(user => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', user.id);
        
        // Get line manager name
        let lineManagerName = 'Not Available';
        if (user.lineManager && user.lineManager !== 'not_available') {
            const manager = usersData.find(u => u.id === user.lineManager);
            lineManagerName = manager ? manager.name : 'Unknown';
        }
        
        row.innerHTML = `
            <td>${highlightSearchMatches(user.employeeId, currentSearchQuery)}</td>
            <td>${highlightSearchMatches(user.name, currentSearchQuery)}</td>
            <td>${highlightSearchMatches(user.email, currentSearchQuery)}</td>
            <td>${highlightSearchMatches(user.mobile, currentSearchQuery)}</td>
            <td><span class="dept-badge">${user.department}</span></td>
            <td><span class="role-badge">${user.role}</span></td>
            <td>
                ${lineManagerName}
                ${user.lineManager && user.lineManager !== 'not_available' ? '<span class="line-manager-badge">Manager</span>' : ''}
            </td>
            <td><span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
            <td><span class="status-badge ${user.dashboardAccess === 'allowed' ? 'access-allowed' : 'access-blocked'}">${user.dashboardAccess.charAt(0).toUpperCase() + user.dashboardAccess.slice(1)}</span></td>
            <td>${createDropdownMenu(user.id)}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    updateSearchStats();
    renderPagination();
    renderStats();
    updateEmptyState();
}

function highlightSearchMatches(text, query) {
    if (!query || !text) {
        return text;
    }
    
    const terms = query.toLowerCase().split(' ')
        .filter(term => term.trim());
    
    if (terms.length === 0) {
        return text;
    }
    
    let result = text.toString();
    const textLower = result.toLowerCase();
    
    terms.forEach(term => {
        if (term && textLower.includes(term)) {
            const regex = new RegExp(`(${term})`, 'gi');
            result = result.replace(regex, '<span class="search-highlight">$1</span>');
        }
    });
    
    return result;
}

function updateSearchStats() {
    const totalCount = currentSearchResults.length;
    
    if (totalCount === 0) {
        searchStats.textContent = 'No users found';
    } else if (totalCount === usersData.length && !currentSearchQuery) {
        searchStats.textContent = `Showing all ${totalCount} users`;
    } else {
        searchStats.textContent = `Found ${totalCount} users`;
        if (currentSearchQuery) {
            searchStats.innerHTML += ` <span style="color: #3498db;">(Filtered by: "${currentSearchQuery}")</span>`;
        }
    }
}

// ============================================
// DETAILS VIEW IMPLEMENTATION
// ============================================
function openDetailsView(userId) {
    const user = usersData.find(u => u.id === userId);
    
    if (!user) {
        showAlert('Error', 'User not found', 'error');
        return;
    }
    
    editingUser = user;
    currentPasswordResetEmail = user.passwordResetSent;
    renderDetailsView(user);
    
    document.querySelector('.container').style.display = 'none';
    detailsScreen.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDetailsView() {
    // Clear password reset status from user data when closing details
    if (editingUser) {
        const userIndex = usersData.findIndex(u => u.id === editingUser.id);
        if (userIndex !== -1) {
            usersData[userIndex].passwordResetSent = null;
        }
    }
    
    document.querySelector('.container').style.display = 'block';
    detailsScreen.style.display = 'none';
    document.body.style.overflow = 'auto';
    editingUser = null;
    currentPasswordResetEmail = null;
}

function getLineManagerName(managerId) {
    if (!managerId || managerId === 'not_available') {
        return 'Not Available';
    }
    const manager = usersData.find(u => u.id === managerId);
    return manager ? manager.name : 'Unknown';
}

function renderDetailsView(user) {
    const detailsGrid = document.getElementById('detailsGrid');
    detailsGrid.innerHTML = '';
    
    // Get line manager name
    const lineManagerName = getLineManagerName(user.lineManager);
    
    // User Information Card
    const userInfoCard = document.createElement('div');
    userInfoCard.className = 'detail-card';
    userInfoCard.innerHTML = `
        <div class="detail-card-header">
            <h3><i class="fas fa-user-circle"></i> User Information</h3>
            <div class="card-header-actions">
                <button class="btn-edit-header" onclick="openEditForm('${user.id}')">
                    <i class="fas fa-edit"></i> Edit User
                </button>
            </div>
        </div>
        <div class="card-content">
            <div class="info-item">
                <span class="info-label">Employee ID</span>
                <span class="info-value">${user.employeeId}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Employee Name</span>
                <span class="info-value">${user.name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email Address</span>
                <span class="info-value">${user.email}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Mobile Number</span>
                <span class="info-value">${user.mobile}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Department</span>
                <span class="info-value">${user.department}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Role</span>
                <span class="info-value">${user.role}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Line Manager</span>
                <span class="info-value">${lineManagerName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Created Date</span>
                <span class="info-value">${user.createdDate || 'Not specified'}</span>
            </div>
        </div>
    `;
    detailsGrid.appendChild(userInfoCard);
    
    // Status and Access Card
    const statusCard = document.createElement('div');
    statusCard.className = 'detail-card';
    statusCard.innerHTML = `
        <div class="detail-card-header">
            <h3><i class="fas fa-cog"></i> Account Settings</h3>
        </div>
        <div class="card-content">
            <div class="info-item">
                <span class="info-label">User Status</span>
                <span class="info-value">
                    <label class="toggle-label">
                        <div class="toggle-switch-large" id="userStatusContainer">
                            <input type="checkbox" id="userStatusToggle" ${user.status === 'active' ? 'checked' : ''}>
                            <span class="toggle-slider-large"></span>
                        </div>
                        ${user.status === 'active' ? 'Active' : 'Inactive'}
                    </label>
                </span>
            </div>
            <div class="info-item">
                <span class="info-label">Dashboard Access</span>
                <span class="info-value">
                    <label class="toggle-label">
                        <div class="toggle-switch-large ${user.status === 'inactive' ? 'toggle-disabled' : ''}" id="dashboardAccessContainer">
                            <input type="checkbox" id="dashboardAccessToggle" 
                                ${user.dashboardAccess === 'allowed' ? 'checked' : ''}
                                ${user.status === 'inactive' ? 'disabled' : ''}>
                            <span class="toggle-slider-large"></span>
                        </div>
                        ${user.dashboardAccess === 'allowed' ? 'Allowed' : 'Blocked'}
                    </label>
                </span>
            </div>
        </div>
    `;
    detailsGrid.appendChild(statusCard);
    
    // Password Management Card
    const passwordCard = document.createElement('div');
    passwordCard.className = 'detail-card';
    passwordCard.innerHTML = `
        <div class="detail-card-header">
            <h3><i class="fas fa-key"></i> Password Management</h3>
        </div>
        <div class="reset-password-section">
            <div class="reset-password-container">
                <div class="reset-password-info">
                    <h4>Reset User Password</h4>
                    <p>Generate a temporary password for the user.</p>
                </div>
                <button class="btn-reset-password" onclick="resetPassword('${user.id}')" id="resetPasswordBtn" ${currentPasswordResetEmail ? 'disabled' : ''}>
                    <i class="fas fa-key"></i> Reset Password
                </button>
            </div>
            
            ${currentPasswordResetEmail ? `
            <div class="email-sent-display" style="margin-top: 15px;">
                <div class="email-sent-box">
                    <div class="email-sent-message">
                        <i class="fas fa-check-circle"></i>
                        Password reset email sent to ${user.email}
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    `;
    detailsGrid.appendChild(passwordCard);
    
    // Set up toggle switch events
    setupToggleSwitches(user);
}

function setupToggleSwitches(user) {
    // Use setTimeout to ensure DOM elements are loaded
    setTimeout(() => {
        const userStatusToggle = document.getElementById('userStatusToggle');
        const dashboardAccessToggle = document.getElementById('dashboardAccessToggle');
        const dashboardAccessContainer = document.getElementById('dashboardAccessContainer');
        
        if (userStatusToggle) {
            userStatusToggle.addEventListener('change', function() {
                if (this.checked) {
                    // If user is active, enable dashboard access toggle
                    if (dashboardAccessContainer) {
                        dashboardAccessContainer.classList.remove('toggle-disabled');
                    }
                    if (dashboardAccessToggle) {
                        dashboardAccessToggle.disabled = false;
                    }
                    
                    // Update user data
                    editingUser.status = 'active';
                    
                    // Save changes
                    saveToggleChanges();
                } else {
                    // If user is inactive, dashboard access should be blocked
                    if (dashboardAccessToggle) {
                        dashboardAccessToggle.checked = false;
                    }
                    if (dashboardAccessContainer) {
                        dashboardAccessContainer.classList.add('toggle-disabled');
                    }
                    if (dashboardAccessToggle) {
                        dashboardAccessToggle.disabled = true;
                    }
                    
                    // Update user data
                    editingUser.status = 'inactive';
                    editingUser.dashboardAccess = 'blocked';
                    
                    // Save changes
                    saveToggleChanges();
                }
            });
        }
        
        if (dashboardAccessToggle) {
            dashboardAccessToggle.addEventListener('change', function() {
                editingUser.dashboardAccess = this.checked ? 'allowed' : 'blocked';
                saveToggleChanges();
            });
        }
    }, 100);
}

function saveToggleChanges() {
    if (!editingUser) return;
    
    // Update main users data
    const userIndex = usersData.findIndex(u => u.id === editingUser.id);
    if (userIndex !== -1) {
        usersData[userIndex] = {...editingUser};
    }
    
    // Save to localStorage
    saveUsersToStorage();
    
    // Update search results
    if (currentSearchQuery) {
        currentSearchResults = performSmartSearch(currentSearchQuery);
    } else {
        currentSearchResults = [...usersData];
    }
    
    // Update table and stats
    renderTable();
    
    showAlert('Success', 'User settings updated successfully!', 'success');
}

function generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function resetPassword(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    // Generate temporary password
    const tempPassword = generateTempPassword();
    
    // Update user's password reset status in data
    const userIndex = usersData.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        usersData[userIndex].tempPassword = tempPassword;
        usersData[userIndex].passwordResetSent = tempPassword;
    }
    
    // Update current reset status
    currentPasswordResetEmail = tempPassword;
    if (editingUser) {
        editingUser.tempPassword = tempPassword;
        editingUser.passwordResetSent = tempPassword;
    }
    
    // Re-render the details view to show the email sent message
    if (editingUser) {
        renderDetailsView(editingUser);
    }
    
    showAlert('Success', `Password reset email sent to ${user.email}!`, 'success');
    
    // Log to console (in real app, this would be sent via email)
    console.log(`Password reset email for ${user.email} with temporary password: ${tempPassword}`);
}

// ============================================
// CREATE FORM FUNCTIONS
// ============================================
function openCreateForm() {
    resetForm();
    // Refresh line manager dropdown with latest users
    populateLineManagerDropdowns();
    formTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add New User';
    openModal(userFormModal);
}

function saveUser(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateCreateForm()) {
        return;
    }
    
    // Get form values
    const employeeId = employeeIdInput.value.trim();
    const name = employeeNameInput.value.trim();
    const email = emailInput.value.trim();
    const mobile = mobileInput.value.trim();
    const department = departmentSelect.value;
    const role = roleSelect.value;
    const lineManager = lineManagerSelect.value;
    
    // Check if employee ID already exists
    if (usersData.some(u => u.employeeId === employeeId)) {
        employeeIdInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Employee ID already exists. Please use a different ID.', 'error');
        return;
    }
    
    // Generate temporary password for welcome email
    const tempPassword = generateTempPassword();
    
    // Create new user
    const newId = (usersData.length > 0 ? Math.max(...usersData.map(u => parseInt(u.id))) + 1 : 1).toString();
    
    const newUser = {
        id: newId,
        employeeId: employeeId,
        name,
        email,
        mobile,
        department,
        role,
        lineManager: lineManager,
        status: 'active',
        dashboardAccess: 'allowed',
        createdDate: new Date().toISOString().split('T')[0],
        tempPassword: tempPassword,
        passwordResetSent: null
    };
    
    usersData.push(newUser);
    
    // Save to localStorage
    saveUsersToStorage();
    
    // Refresh line manager dropdowns for other forms
    populateLineManagerDropdowns();
    
    showAlert('Success', 'User created successfully!', 'success');
    
    // Log to console (in real app, this would be sent via email)
    console.log(`Welcome email sent to ${email} with temporary password: ${tempPassword}`);
    
    // Update search results if needed
    if (currentSearchQuery) {
        currentSearchResults = performSmartSearch(currentSearchQuery);
        calculateTotalPages();
    } else {
        currentSearchResults = [...usersData];
        calculateTotalPages();
    }
    
    // Update UI and close form
    renderTable();
    closeModal(userFormModal);
}

// Validate create form
function validateCreateForm() {
    let isValid = true;
    
    // Clear previous error styles
    const inputs = [employeeIdInput, employeeNameInput, emailInput, mobileInput, departmentSelect, roleSelect];
    inputs.forEach(input => {
        if (input) input.style.borderColor = '#ddd';
    });
    
    // Validate employee ID
    if (!employeeIdInput.value.trim()) {
        employeeIdInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Employee ID is required', 'error');
        isValid = false;
        return isValid;
    }
    
    // Validate name
    if (!employeeNameInput.value.trim()) {
        employeeNameInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Employee name is required', 'error');
        isValid = false;
        return isValid;
    }
    
    // Validate email
    if (!emailInput.value.trim()) {
        emailInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Email address is required', 'error');
        isValid = false;
        return isValid;
    } else if (!isValidEmail(emailInput.value)) {
        emailInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Please enter a valid email address', 'error');
        isValid = false;
        return isValid;
    }
    
    // Validate mobile
    if (!mobileInput.value.trim()) {
        mobileInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Mobile number is required', 'error');
        isValid = false;
        return isValid;
    }
    
    // Validate department
    if (!departmentSelect.value) {
        departmentSelect.style.borderColor = '#e74c3c';
        showAlert('Error', 'Department is required', 'error');
        isValid = false;
        return isValid;
    }
    
    // Validate role
    if (!roleSelect.value) {
        roleSelect.style.borderColor = '#e74c3c';
        showAlert('Error', 'Role is required', 'error');
        isValid = false;
        return isValid;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Reset create form
function resetForm() {
    employeeIdInput.value = '';
    employeeNameInput.value = '';
    emailInput.value = '';
    mobileInput.value = '';
    departmentSelect.value = '';
    roleSelect.value = '';
    lineManagerSelect.value = 'not_available';
    userIdInput.value = '';
    
    // Clear error styles
    const inputs = [employeeIdInput, employeeNameInput, emailInput, mobileInput, departmentSelect, roleSelect];
    inputs.forEach(input => {
        if (input) input.style.borderColor = '#ddd';
    });
}

// ============================================
// EDIT FORM FUNCTIONS
// ============================================
function openEditForm(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    // Refresh line manager dropdown with latest users
    populateLineManagerDropdowns();
    
    // Fill form with user data
    editUserIdInput.value = user.id;
    editEmployeeIdInput.value = user.employeeId;
    editEmployeeNameInput.value = user.name;
    editEmailInput.value = user.email;
    editMobileInput.value = user.mobile;
    editDepartmentSelect.value = user.department;
    editRoleSelect.value = user.role;
    editLineManagerSelect.value = user.lineManager || 'not_available';
    
    openModal(editUserModal);
}

function saveEditUser(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateEditForm()) {
        return;
    }
    
    // Get form values
    const userId = editUserIdInput.value;
    const employeeId = editEmployeeIdInput.value.trim();
    const name = editEmployeeNameInput.value.trim();
    const email = editEmailInput.value.trim();
    const mobile = editMobileInput.value.trim();
    const department = editDepartmentSelect.value;
    const role = editRoleSelect.value;
    const lineManager = editLineManagerSelect.value;
    
    // Find user
    const userIndex = usersData.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    
    // Check if employee ID already exists (excluding current user)
    if (usersData.some(u => u.employeeId === employeeId && u.id !== userId)) {
        editEmployeeIdInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Employee ID already exists. Please use a different ID.', 'error');
        return;
    }
    
    // Update user
    usersData[userIndex] = {
        ...usersData[userIndex],
        employeeId,
        name,
        email,
        mobile,
        department,
        role,
        lineManager
    };
    
    // Save to localStorage
    saveUsersToStorage();
    
    // Update editing user if details view is open
    if (editingUser && editingUser.id === userId) {
        editingUser.employeeId = employeeId;
        editingUser.name = name;
        editingUser.email = email;
        editingUser.mobile = mobile;
        editingUser.department = department;
        editingUser.role = role;
        editingUser.lineManager = lineManager;
        
        // Re-render details view
        renderDetailsView(editingUser);
    }
    
    // Refresh line manager dropdowns for other forms
    populateLineManagerDropdowns();
    
    // Update search results
    if (currentSearchQuery) {
        currentSearchResults = performSmartSearch(currentSearchQuery);
    } else {
        currentSearchResults = [...usersData];
    }
    
    // Update table
    renderTable();
    
    // Close form and show notification
    closeModal(editUserModal);
    showAlert('Success', 'User details updated successfully!', 'success');
}

// Validate edit form
function validateEditForm() {
    let isValid = true;
    
    // Clear previous error styles
    const inputs = [editEmployeeIdInput, editEmployeeNameInput, editEmailInput, editMobileInput, editDepartmentSelect, editRoleSelect];
    inputs.forEach(input => {
        if (input) input.style.borderColor = '#ddd';
    });
    
    // Validate employee ID
    if (!editEmployeeIdInput.value.trim()) {
        editEmployeeIdInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Employee ID is required', 'error');
        isValid = false;
        return isValid;
    }
    
    // Validate name
    if (!editEmployeeNameInput.value.trim()) {
        editEmployeeNameInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Employee name is required', 'error');
        isValid = false;
        return isValid;
    }
    
    // Validate email
    if (!editEmailInput.value.trim()) {
        editEmailInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Email address is required', 'error');
        isValid = false;
        return isValid;
    } else if (!isValidEmail(editEmailInput.value)) {
        editEmailInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Please enter a valid email address', 'error');
        isValid = false;
        return isValid;
    }
    
    // Validate mobile
    if (!editMobileInput.value.trim()) {
        editMobileInput.style.borderColor = '#e74c3c';
        showAlert('Error', 'Mobile number is required', 'error');
        isValid = false;
        return isValid;
    }
    
    // Validate department
    if (!editDepartmentSelect.value) {
        editDepartmentSelect.style.borderColor = '#e74c3c';
        showAlert('Error', 'Department is required', 'error');
        isValid = false;
        return isValid;
    }
    
    // Validate role
    if (!editRoleSelect.value) {
        editRoleSelect.style.borderColor = '#e74c3c';
        showAlert('Error', 'Role is required', 'error');
        isValid = false;
        return isValid;
    }
    
    return isValid;
}

// ============================================
// DELETE FUNCTIONS
// ============================================
function deleteUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    userToDelete = user;
    
    showAlert(
        'Confirm Delete',
        `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
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
                action: confirmDeleteUser
            }
        ]
    );
}

function closeAlert() {
    alertPopup.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function confirmDeleteUser() {
    if (!userToDelete) return;
    
    const userId = userToDelete.id;
    
    // Check if this user is a line manager for others
    const isManager = usersData.some(u => u.lineManager === userId);
    if (isManager) {
        showAlert('Error', 'Cannot delete user because they are a line manager for other users. Please reassign those users first.', 'error');
        closeAlert();
        return;
    }
    
    // Find and remove user from data
    const userIndex = usersData.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        usersData.splice(userIndex, 1);
        
        // Save to localStorage
        saveUsersToStorage();
        
        // Close details view if it's open for this user
        if (editingUser && editingUser.id === userId) {
            closeDetailsView();
        }
        
        // Update search results
        if (currentSearchQuery) {
            currentSearchResults = performSmartSearch(currentSearchQuery);
        } else {
            currentSearchResults = [...usersData];
        }
        
        // Refresh line manager dropdowns
        populateLineManagerDropdowns();
        
        // Update UI
        calculateTotalPages();
        renderTable();
        updateEmptyState();
        
        // Close alert
        closeAlert();
        
        showAlert('Success', `User ${userToDelete.name} has been deleted successfully.`, 'success');
    }
}

// ============================================
// ALERT FUNCTIONS
// ============================================
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
        okButton.className = 'alert-btn alert-btn-primary';
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

// ============================================
// MODAL FUNCTIONS
// ============================================
function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    if (modal === userFormModal) resetForm();
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
function handleKeyboardShortcuts(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        smartSearchInput.focus();
    }
    
    if (event.key === 'Escape') {
        if (alertPopup.style.display === 'flex') {
            closeAlert();
        } else if (userFormModal.style.display === 'flex') {
            closeModal(userFormModal);
        } else if (editUserModal.style.display === 'flex') {
            closeModal(editUserModal);
        } else if (detailsScreen.style.display === 'flex') {
            closeDetailsView();
        } else {
            closeAllDropdowns();
            if (smartSearchInput.value) {
                smartSearchInput.value = '';
                handleSearchInput({ target: smartSearchInput });
            }
        }
    }
}

// ============================================
// MAKE FUNCTIONS AVAILABLE GLOBALLY
// ============================================
window.toggleDropdown = toggleDropdown;
window.closeAllDropdowns = closeAllDropdowns;
window.openDetailsView = openDetailsView;
window.openEditForm = openEditForm;
window.resetPassword = resetPassword;
window.deleteUser = deleteUser;
window.closeModal = closeModal;

// ============================================
// INITIALIZE THE APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', initializeApp);