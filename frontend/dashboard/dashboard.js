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
    // Get user data from session storage (set during login)
    const userData = sessionStorage.getItem('user');
    
    if (!userData) {
        // Redirect to login if not authenticated
        window.location.href = '../login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userData);
    } catch (e) {
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
        userNameElement.textContent = currentUser.name || 'User';
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = currentUser.role || 'Staff';
    }
    
    if (userAvatarElement) {
        // Get initials from name
        const initials = (currentUser.name || 'U')
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
    
    // Show loading state
    container.innerHTML = '<div class="loading-spinner"></div>';
    
    // In a real application, you would load the actual page content here
    // For now, we'll show a placeholder based on the page
    setTimeout(() => {
        container.innerHTML = getPageContent(page);
    }, 300);
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
            // Clear session
            sessionStorage.removeItem('user');
            
            // Show logout message
            alert('Logging out...');
            
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