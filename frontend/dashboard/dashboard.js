// Dashboard JavaScript - No demo data

// User data (will be populated from login)
let currentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth();
    
    // Load user data
    loadUserData();
    
    // Load default page (overview)
    loadPage('overview');
    
    // Setup navigation
    setupNavigation();
    
    // Setup logout button
    setupLogout();
});

// Check authentication
function checkAuth() {
    // Get auth token and user data from local storage (set during login)
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
        // Redirect to login if not authenticated
        window.location.href = '../login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userData);
    } catch (e) {
        console.error('Error parsing user data:', e);
        window.location.href = '../login.html';
    }
}

// Load user data into sidebar
function loadUserData() {
    if (!currentUser) return;
    
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    const userAvatarElement = document.getElementById('userAvatar');
    
    if (userNameElement) {
        const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.name || 'User';
        userNameElement.textContent = fullName;
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = currentUser.role || 'Staff';
    }
    
    if (userAvatarElement) {
        // Get initials from name
        const name = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.name || 'U';
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        
        userAvatarElement.textContent = initials;
    }
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get page to load
            const page = this.getAttribute('data-page');
            
            // Load the page
            loadPage(page);
        });
    });
}

// Load page content
function loadPage(page) {
    const container = document.getElementById('pageContainer');
    
    // Pages that have their own HTML files
    const externalPages = {
        'department-role': 'pages/department-role/department-role.html',
        'system-users': 'pages/system-users/system-users.html',
        'customers': 'pages/customers/customers.html',
        'vehicles': 'pages/vehicles/vehicles.html',
        'job-order': 'pages/job-order/job-order.html',
        'inspection': 'pages/inspection/inspection.html',
        'service-execution': 'pages/service-execution/service-execution.html',
        'quality-check': 'pages/quality-check/quality-check.html',
        'payment-invoice': 'pages/payment-invoice/payment-invoice.html',
        'exit-permit': 'pages/exit-permit/exit-permit.html',
        'order-history': 'pages/order-history/order-history.html',
        'role-permission': 'pages/role-permission/role-permission.html'
    };
    
    // If this page has its own HTML file, load it in an iframe
    if (externalPages[page]) {
        container.innerHTML = `
            <iframe 
                src="${externalPages[page]}" 
                style="width: 100%; height: 100%; border: none; display: block; margin: 0; padding: 0;"
                frameborder="0"
                id="pageFrame"
            ></iframe>
        `;
    } else {
        // For overview and other pages without dedicated HTML, show placeholder content
        // Show loading state
        container.innerHTML = '<div class="loading-spinner"></div>';
        
        setTimeout(() => {
            container.innerHTML = getPageContent(page);
        }, 300);
    }
}

// Get page content (this would normally load from separate HTML files)
function getPageContent(page) {
    const pageTitles = {
        'overview': 'Dashboard Overview',
        'job-orders': 'Job Orders',
        'inspection': 'Inspection',
        'service-execution': 'Service Execution',
        'quality-check': 'Quality Check',
        'payment-invoice': 'Payment & Invoice',
        'exit-permit': 'Exit Permit',
        'order-history': 'Order History',
        'customers': 'Customers',
        'vehicles': 'Vehicles',
        'department-role': 'Department & Role',
        'system-users': 'System Users'
    };
    
    const title = pageTitles[page] || 'Page';
    
    return `
        <div class="page-header">
            <div class="header-top">
                <h1>${title}</h1>
                <div class="header-actions">
                    <button class="action-btn" onclick="refreshPage()">
                        <span>🔄</span>
                        <span>Refresh</span>
                    </button>
                    <button class="action-btn primary" onclick="createNew()">
                        <span>➕</span>
                        <span>Create New</span>
                    </button>
                </div>
            </div>
            <p>Welcome back, ${currentUser?.name || 'User'}! Manage your ${title.toLowerCase()} here.</p>
        </div>
        
        <div class="content-card">
            <div class="card-header">
                <h2>${title}</h2>
                <span class="badge">Ready</span>
            </div>
            
            <div style="text-align: center; padding: 60px 20px; color: #64748b;">
                <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                <h3 style="margin-bottom: 10px; color: #1e293b;">${title} Module</h3>
                <p style="margin-bottom: 20px;">This module is ready to be configured with your data.</p>
                <button class="action-btn primary" onclick="loadModule('${page}')">
                    Configure Module
                </button>
            </div>
        </div>
    `;
}

// Setup logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');
            
            // Redirect to login
            window.location.href = '../login.html';
        });
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Refresh current page
function refreshPage() {
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) {
        const page = activeNav.getAttribute('data-page');
        loadPage(page);
    }
}

// Create new item
function createNew() {
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) {
        const page = activeNav.getAttribute('data-page');
        alert(`Create new ${page} - This will open a creation form`);
    }
}

// Load module configuration
function loadModule(module) {
    // In a real application, this would load the actual module HTML
    // For now, we'll just show an alert
    alert(`Loading ${module} module configuration...`);
    
    // Here you would load the actual module HTML file
    // Example: window.location.href = `pages/${module}/${module}.html`;
}

// Export functions for global use
window.toggleSidebar = toggleSidebar;
window.refreshPage = refreshPage;
window.createNew = createNew;
window.loadModule = loadModule;