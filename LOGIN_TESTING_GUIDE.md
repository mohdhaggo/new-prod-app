# Testing Login and Navigation

## Problem
After successful login, the page is not navigating to the dashboard.

## Solution Applied

### 1. Updated Login to Use API
- Modified `login.html` to load `login.js` as an ES6 module
- Updated `login.js` to import and use `api-service.js` for authentication
- Added automatic redirect check (if already logged in, redirects to dashboard)

### 2. Fixed API URL Configuration
- Updated `api-service.js` to handle flexible API URLs
- Works whether PHP server runs from root or backend directory
- Updated backend API router to handle both `/api` and `/backend/api` paths

### 3. Created API Test Page
- Created `test-api.html` to help debug API connectivity
- Test connection, login, and navigation separately
- Provides clear error messages

---

## Quick Start - Test the Login

### Step 1: Start the Backend Server

**Option A: Run from backend directory (Recommended)**
```powershell
cd backend
php -S localhost:8080
```
API will be available at: `http://localhost:8080/api`

**Option B: Run from root directory**
```powershell
php -S localhost:8080
```
API will be available at: `http://localhost:8080/backend/api`

### Step 2: Open API Test Page

Open in browser: `http://localhost:8080/frontend/test-api.html`

Or if running from backend directory, open: `frontend/test-api.html` directly in VS Code Live Server

### Step 3: Test the Connection

1. Click **"Test Connection"** button - should show "Backend is running"
2. Click **"Test Login"** button - should show successful login with token
3. Click **"Navigate to Dashboard"** - should redirect to dashboard

### Step 4: Test Login Page

Open: `http://localhost:8080/frontend/login.html`

**Default Test Credentials:**
- Email: `admin@rodeodrive.com`
- Password: `admin123`

After clicking "Sign in to dashboard", you should:
1. See "Login successful! Redirecting..." message
2. Be redirected to dashboard within 1 second

---

## Troubleshooting

### Issue: "Backend connection failed"

**Check:**
- Is PHP server running? Run: `cd backend && php -S localhost:8080`
- Is port 8080 already in use?
- Check PHP version: `php -v` (requires PHP 7.4+)

**Solution:**
```powershell
# Kill any process using port 8080
netstat -ano | findstr :8080
# Then kill the process ID shown

# Start fresh
cd backend
php -S localhost:8080
```

### Issue: "CORS Error" in browser console

**Check:**
- Open browser DevTools (F12) → Console
- Look for CORS-related errors

**Solution:**
- CORS is already enabled in `backend/src/Middleware.php`
- Make sure you're accessing via `http://localhost:8080` not `file://`

### Issue: "Login error" or "Invalid credentials"

**Check:**
- Is database set up? Run: `mysql -u root -p < database/schema.sql`
- Are there users in the database? Run: `mysql -u root -p < database/seed.sql`

**Solution:**
```sql
-- Check if users exist
USE rodeo_drive_crm;
SELECT * FROM users;

-- If empty, run seed file
SOURCE database/seed.sql;
```

### Issue: "Not navigating to dashboard"

**Check browser console (F12) for errors:**

1. **Module not found error:**
   - Make sure `api-service.js` exists in the `frontend` folder
   - Check that script tag has `type="module"`

2. **Token not saved:**
   - Open DevTools → Application → Local Storage
   - Check if `auth_token` is present
   - If missing, login might have failed

3. **Dashboard path incorrect:**
   - Make sure `dashboard/dashboard.html` exists
   - Check file path is correct relative to login.html

**Solution:**
```javascript
// Check in browser console
console.log(apiService.isAuthenticated()); // Should be true after login
console.log(localStorage.getItem('auth_token')); // Should show token
```

### Issue: "Module script failed to load"

**This happens when opening HTML files directly with `file://` protocol**

**Solution - Use one of these methods:**

**Method 1: Use PHP built-in server (Recommended)**
```powershell
# From project root
php -S localhost:8080

# Then open: http://localhost:8080/frontend/login.html
```

**Method 2: Use VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click on `login.html`
3. Select "Open with Live Server"

**Method 3: Use Python server**
```powershell
# Python 3
python -m http.server 8080

# Then open: http://localhost:8080/frontend/login.html
```

---

## Testing Checklist

- [ ] Backend server is running
- [ ] Database is set up with users
- [ ] API test page shows connection success
- [ ] Can login with test credentials
- [ ] Token is saved in localStorage
- [ ] Redirects to dashboard after login
- [ ] Dashboard loads without errors

---

## File Changes Made

1. **frontend/login.html** - Added `type="module"` to script tag
2. **frontend/login.js** - Integrated with API service
3. **frontend/api-service.js** - Flexible API URL configuration
4. **backend/api/index.php** - Handle both URL formats
5. **frontend/test-api.html** - NEW - API testing tool

---

## Next Steps After Login Works

Once login and navigation are working:

1. **Update other frontend pages** to use API service
2. **Implement logout functionality** in dashboard
3. **Add token refresh** for expired tokens
4. **Implement role-based UI** hiding/showing based on permissions
5. **Replace all localStorage** calls with API calls

---

## Default Test Users

These should be in your database after running `seed.sql`:

| Email | Password | Role |
|-------|----------|------|
| admin@rodeodrive.com | admin123 | Admin |
| manager@rodeodrive.com | manager123 | Manager |
| technician@rodeodrive.com | tech123 | Technician |

---

## Quick Commands Reference

```powershell
# Start backend API server
cd backend
php -S localhost:8080

# Check PHP version
php -v

# Test database connection
cd backend
php -r "require 'config/database.php'; \$db = new Database(); \$conn = \$db->getConnection(); echo \$conn ? 'Connected!' : 'Failed';"

# Run setup script
cd backend
php setup.php

# View PHP errors
# Check: backend/logs/ folder
```

---

**If you're still having issues, open the test page (`test-api.html`) first to diagnose the problem!**
