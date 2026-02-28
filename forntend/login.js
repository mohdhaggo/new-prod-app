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

    // Simulate login success (since no backend)
    const successDiv = document.createElement('div');
    successDiv.className = 'error-text';
    successDiv.style.backgroundColor = 'rgba(34, 197, 94, 0.08)';
    successDiv.style.color = '#16a34a';
    successDiv.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17L4 12" stroke="#16a34a"/>
      </svg>
      Login successful! Welcome to Rodeo Drive CRM
    `;
    errorContainer.appendChild(successDiv);

    // Remove success after 3 seconds and reset
    setTimeout(() => {
      if (errorContainer.contains(successDiv)) {
        errorContainer.removeChild(successDiv);
      }
      emailInput.classList.remove('error');
      passwordInput.classList.remove('error');
    }, 3000);
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
})();