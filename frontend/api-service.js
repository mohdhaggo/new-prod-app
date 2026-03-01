// API Service for Frontend
// This module handles all API communication and replaces localStorage usage

const API_BASE_URL = 'http://localhost:8080/backend/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('auth_token');
        this.user = null;
    }

    // Set authorization token
    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    // Remove authorization token
    removeToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    // Get authorization headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success) {
            this.setToken(response.data.token);
            this.user = response.data.user;
            // Store user and permissions
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('permissions', JSON.stringify(response.data.permissions));
        }

        return response;
    }

    async logout() {
        this.removeToken();
        this.user = null;
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
    }

    async getCurrentUser() {
        const response = await this.request('/auth/me');
        if (response.success) {
            this.user = response.data.user;
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('permissions', JSON.stringify(response.data.permissions));
        }
        return response;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Get stored user
    getUser() {
        if (this.user) return this.user;
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    }

    // Customer methods
    async getCustomers(page = 1, limit = 50, filters = {}) {
        const params = new URLSearchParams({ page, limit, ...filters });
        return await this.request(`/customers?${params}`);
    }

    async getCustomer(id) {
        return await this.request(`/customers/${id}`);
    }

    async getCustomerDetails(id) {
        return await this.request(`/customers/${id}/details`);
    }

    async createCustomer(data) {
        return await this.request('/customers', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateCustomer(id, data) {
        return await this.request(`/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteCustomer(id) {
        return await this.request(`/customers/${id}`, {
            method: 'DELETE'
        });
    }

    async searchCustomers(term) {
        return await this.request(`/customers?search=${encodeURIComponent(term)}`);
    }

    // Vehicle methods
    async getVehicles(page = 1, limit = 50, filters = {}) {
        const params = new URLSearchParams({ page, limit, ...filters });
        return await this.request(`/vehicles?${params}`);
    }

    async getVehicle(id) {
        return await this.request(`/vehicles/${id}`);
    }

    async getVehicleDetails(id) {
        return await this.request(`/vehicles/${id}/details`);
    }

    async createVehicle(data) {
        return await this.request('/vehicles', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateVehicle(id, data) {
        return await this.request(`/vehicles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteVehicle(id) {
        return await this.request(`/vehicles/${id}`, {
            method: 'DELETE'
        });
    }

    // Job Order methods
    async getJobOrders(page = 1, limit = 50, filters = {}) {
        const params = new URLSearchParams({ page, limit, ...filters });
        return await this.request(`/job-orders?${params}`);
    }

    async getJobOrder(id) {
        return await this.request(`/job-orders/${id}`);
    }

    async getJobOrderDetails(id) {
        return await this.request(`/job-orders/${id}/details`);
    }

    async createJobOrder(data) {
        return await this.request('/job-orders', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateJobOrder(id, data) {
        return await this.request(`/job-orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async updateJobOrderStatus(id, status) {
        return await this.request(`/job-orders/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({ status })
        });
    }

    async addService(jobOrderId, serviceData) {
        return await this.request(`/job-orders/${jobOrderId}/services`, {
            method: 'POST',
            body: JSON.stringify(serviceData)
        });
    }

    async getDashboardStats() {
        return await this.request('/job-orders/dashboard');
    }

    // Payment methods
    async getPayments(page = 1, limit = 50, filters = {}) {
        const params = new URLSearchParams({ page, limit, ...filters });
        return await this.request(`/payments?${params}`);
    }

    async createPayment(data) {
        return await this.request('/payments', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getJobOrderPayments(jobOrderId) {
        return await this.request(`/payments?job_order_id=${jobOrderId}`);
    }

    async getPaymentSummary(startDate, endDate) {
        const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
        return await this.request(`/payments/summary?${params}`);
    }

    // User methods
    async getUsers(page = 1, limit = 50, filters = {}) {
        const params = new URLSearchParams({ page, limit, ...filters });
        return await this.request(`/users?${params}`);
    }

    async getUser(id) {
        return await this.request(`/users/${id}`);
    }

    async createUser(data) {
        return await this.request('/users', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateUser(id, data) {
        return await this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async changePassword(userId, oldPassword, newPassword) {
        return await this.request(`/users/${userId}/password`, {
            method: 'POST',
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
        });
    }

    // Report methods
    async getRevenueReport(startDate, endDate, groupBy = 'day') {
        const params = new URLSearchParams({ start_date: startDate, end_date: endDate, group_by: groupBy });
        return await this.request(`/reports/revenue?${params}`);
    }

    async getCustomerReport(startDate = null, endDate = null) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        return await this.request(`/reports/customers?${params}`);
    }

    async getDashboardSummary() {
        return await this.request('/reports/dashboard');
    }

    // Notification methods
    async getNotifications(page = 1, unreadOnly = false) {
        const params = new URLSearchParams({ page, unread: unreadOnly ? '1' : '0' });
        return await this.request(`/notifications?${params}`);
    }

    async getUnreadCount() {
        return await this.request('/notifications/unread-count');
    }

    async markNotificationRead(id) {
        return await this.request(`/notifications/${id}/read`, {
            method: 'PUT'
        });
    }

    async markAllRead() {
        return await this.request('/notifications/mark-all-read', {
            method: 'PUT'
        });
    }

    // File upload method
    async uploadFiles(files, type = 'all', subdir = 'temp') {
        const formData = new FormData();
        
        if (Array.isArray(files)) {
            files.forEach((file, index) => {
                formData.append(`file${index}`, file);
            });
        } else {
            formData.append('file', files);
        }

        const url = `${API_BASE_URL}/upload?type=${type}&subdir=${subdir}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
