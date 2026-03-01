(function() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorContainer = document.getElementById('errorContainer');

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Remove any existing error messages
    function clearError() {
        errorContainer.innerHTML = '';
        emailInput.classList.remove('error');
        passwordInput.classList.remove('error');
    }

    // Display a nice error message
    function showError(message, field = 'both') {
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-text';
        errorDiv.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            ${message}
        `;
        errorContainer.appendChild(errorDiv);

        // Highlight relevant fields
        if (field === 'email' || field === 'both') {
            emailInput.classList.add('error');
        }
        if (field === 'password' || field === 'both') {
            passwordInput.classList.add('error');
        }
    }

    // Validate email format
    function isValidEmail(email) {
        return emailRegex.test(email);
    }

    // Validation
    function validateForm(email, password) {
        if (!email.trim()) {
            showError('Email address is required', 'email');
            return false;
        }
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address', 'email');
            return false;
        }
        if (!password.trim()) {
            showError('Password is required', 'password');
            return false;
        }
        if (password.length < 4) {
            showError('Password must be at least 4 characters', 'password');
            return false;
        }
        return true;
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // no page reload

        // Clear previous errors
        clearError();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Validate credentials
        if (!validateForm(email, password)) {
            return; // error already shown
        }

        // Show loading state
        const submitButton = form.querySelector('.login-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Signing in...';
        submitButton.disabled = true;

        // Simulate API call (replace with actual authentication)
        setTimeout(() => {
            // In a real application, you would make an API call here
            // For demo purposes, we'll redirect to dashboard after "successful" login
            
            // You can replace this with actual authentication logic
            const mockAuthentication = true; // This should come from your backend
            
            if (mockAuthentication) {
                // Show success message
                const successDiv = document.createElement('div');
                successDiv.className = 'error-text';
                successDiv.style.backgroundColor = '#f0fdf4';
                successDiv.style.color = '#10b981';
                successDiv.style.borderColor = '#dcfce7';
                successDiv.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17L4 12" stroke="#10b981"/>
                    </svg>
                    Login successful! Redirecting...
                `;
                errorContainer.appendChild(successDiv);

                // Redirect to dashboard after short delay
                setTimeout(() => {
                    window.location.href = 'dashboard/dashboard.html';
                }, 1500);
            } else {
                // Show error message (this would come from your backend)
                showError('Invalid email or password', 'both');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        }, 1000);
    });

    // Remove field error state when user starts typing
    emailInput.addEventListener('input', function() {
        emailInput.classList.remove('error');
        clearError();
    });

    passwordInput.addEventListener('input', function() {
        passwordInput.classList.remove('error');
        clearError();
    });

    // Also clear when field is focused
    emailInput.addEventListener('focus', function() {
        emailInput.classList.remove('error');
    });

    passwordInput.addEventListener('focus', function() {
        passwordInput.classList.remove('error');
    });

    // Handle logo fallback
    const companyLogo = document.getElementById('companyLogo');
    const defaultLogo = document.querySelector('.default-logo');
    
    if (companyLogo) {
        if (companyLogo.complete && companyLogo.naturalHeight === 0) {
            // Image failed to load
            companyLogo.style.display = 'none';
            defaultLogo.style.display = 'flex';
        } else {
            companyLogo.onerror = function() {
                companyLogo.style.display = 'none';
                defaultLogo.style.display = 'flex';
            };
        }
    }
})();