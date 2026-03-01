// Updated login.js to use API instead of localStorage
import apiService from './api-service.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const loginButton = document.querySelector('.login-btn');

    // Check if user is already logged in
    if (apiService.isAuthenticated()) {
        window.location.href = 'dashboard/dashboard.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Clear previous errors
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';

        // Validation
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }

        // Disable button during login
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        try {
            // Call API login
            const response = await apiService.login(email, password);

            if (response.success) {
                // Login successful - token and user info are stored automatically
                showSuccess('Login successful! Redirecting...');
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard/dashboard.html';
                }, 1000);
            } else {
                showError(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            // Re-enable button
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.style.color = '#dc3545';
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.style.color = '#28a745';
    }
});
