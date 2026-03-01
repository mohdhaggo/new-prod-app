// Dashboard authentication and API integration example
import apiService from '../api-service.js';

class Dashboard {
    constructor() {
        this.user = null;
        this.permissions = null;
        this.init();
    }

    async init() {
        // Check if user is authenticated
        if (!apiService.isAuthenticated()) {
            window.location.href = '../login.html';
            return;
        }

        try {
            // Get current user info
            const response = await apiService.getCurrentUser();
            
            if (response.success) {
                this.user = response.data.user;
                this.permissions = response.data.permissions;
                
                this.displayUserInfo();
                this.setupNavigation();
                await this.loadDashboardData();
            } else {
                // Token invalid, redirect to login
                apiService.logout();
                window.location.href = '../login.html';
            }
        } catch (error) {
            console.error('Dashboard init error:', error);
            // On error, logout and redirect to login
            apiService.logout();
            window.location.href = '../login.html';
        }
    }

    displayUserInfo() {
        // Display user name
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = `${this.user.first_name} ${this.user.last_name}`;
        }

        // Display user role
        const userRoleElement = document.getElementById('userRole');
        if (userRoleElement) {
            userRoleElement.textContent = this.user.role_name || this.user.role;
        }

        // Display profile picture
        const profilePicElement = document.getElementById('profilePic');
        if (profilePicElement && this.user.profile_picture) {
            profilePicElement.src = this.user.profile_picture;
        }
    }

    setupNavigation() {
        // Hide menu items based on permissions
        const menuItems = document.querySelectorAll('[data-module]');
        
        menuItems.forEach(item => {
            const module = item.getAttribute('data-module');
            
            if (this.permissions[module] && this.permissions[module].view) {
                item.style.display = ''; // Show
            } else {
                item.style.display = 'none'; // Hide
            }
        });

        // Setup logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Setup notification bell
        this.loadNotifications();
    }

    async loadDashboardData() {
        try {
            // Load dashboard summary
            const summaryResponse = await apiService.getDashboardSummary();
            
            if (summaryResponse.success) {
                this.displayDashboardStats(summaryResponse.data);
            }

            // Load job order stats if permission exists
            if (this.hasPermission('job_orders', 'view')) {
                const statsResponse = await apiService.getDashboardStats();
                
                if (statsResponse.success) {
                    this.displayJobOrderStats(statsResponse.data);
                }
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    displayDashboardStats(data) {
        // Display today's stats
        if (data.today) {
            const todayJobsElement = document.getElementById('todayJobs');
            if (todayJobsElement) {
                todayJobsElement.textContent = data.today.jobs_today || 0;
            }

            const todayRevenueElement = document.getElementById('todayRevenue');
            if (todayRevenueElement) {
                todayRevenueElement.textContent = `AED ${parseFloat(data.today.revenue_today || 0).toFixed(2)}`;
            }
        }

        // Display month's stats
        if (data.month) {
            const monthJobsElement = document.getElementById('monthJobs');
            if (monthJobsElement) {
                monthJobsElement.textContent = data.month.jobs_month || 0;
            }

            const monthRevenueElement = document.getElementById('monthRevenue');
            if (monthRevenueElement) {
                monthRevenueElement.textContent = `AED ${parseFloat(data.month.revenue_month || 0).toFixed(2)}`;
            }
        }

        // Display pending payments
        if (data.pending_payments) {
            const pendingPaymentsElement = document.getElementById('pendingPayments');
            if (pendingPaymentsElement) {
                pendingPaymentsElement.textContent = `${data.pending_payments.pending_count} (AED ${parseFloat(data.pending_payments.pending_amount || 0).toFixed(2)})`;
            }
        }
    }

    displayJobOrderStats(data) {
        // Display job status distribution
        if (data.by_status) {
            const statusContainer = document.getElementById('jobStatusChart');
            if (statusContainer) {
                // Clear existing content
                statusContainer.innerHTML = '';
                
                // Create simple status cards
                data.by_status.forEach(status => {
                    const card = document.createElement('div');
                    card.className = 'status-card';
                    card.innerHTML = `
                        <h4>${status.work_status}</h4>
                        <p class="count">${status.count}</p>
                    `;
                    statusContainer.appendChild(card);
                });
            }
        }
    }

    async loadNotifications() {
        try {
            // Get unread count
            const countResponse = await apiService.getUnreadCount();
            
            if (countResponse.success) {
                const badge = document.getElementById('notificationBadge');
                if (badge && countResponse.data.count > 0) {
                    badge.textContent = countResponse.data.count;
                    badge.style.display = 'inline';
                }
            }

            // Load recent notifications
            const notificationsResponse = await apiService.getNotifications(1, true);
            
            if (notificationsResponse.success) {
                this.displayNotifications(notificationsResponse.data.data);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    displayNotifications(notifications) {
        const container = document.getElementById('notificationList');
        if (!container) return;

        container.innerHTML = '';

        if (notifications.length === 0) {
            container.innerHTML = '<p class="no-notifications">No new notifications</p>';
            return;
        }

        notifications.slice(0, 5).forEach(notification => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `
                <h5>${notification.title}</h5>
                <p>${notification.message}</p>
                <span class="time">${this.formatTime(notification.created_at)}</span>
            `;
            
            item.addEventListener('click', async () => {
                await apiService.markNotificationRead(notification.id);
                if (notification.link) {
                    window.location.href = notification.link;
                }
            });
            
            container.appendChild(item);
        });
    }

    hasPermission(module, action) {
        return this.permissions && 
               this.permissions[module] && 
               this.permissions[module][action];
    }

    showNotification(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    logout() {
        apiService.logout();
        window.location.href = '../login.html';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});

export default Dashboard;
