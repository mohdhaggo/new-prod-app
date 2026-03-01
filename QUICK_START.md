# Quick Start Guide - Testing the API

## Prerequisites
- PHP 7.4+ installed
- MySQL 8.0+ running
- Database created and seeded

## Step 1: Run Setup Script

```bash
cd backend
php setup.php
```

This will check your environment and create necessary directories.

## Step 2: Start PHP Development Server

```bash
cd backend
php -S localhost:8080
```

The API will be available at `http://localhost:8080/api`

## Step 3: Test Authentication

### Login Request
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rodeodrive.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "email": "admin@rodeodrive.com",
      "first_name": "Admin",
      "last_name": "User"
    },
    "permissions": { ... }
  }
}
```

Save the token for subsequent requests!

## Step 4: Test Protected Endpoints

Replace `YOUR_TOKEN` with the token from login response.

### Get Customers
```bash
curl http://localhost:8080/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Customer
```bash
curl -X POST http://localhost:8080/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "mobile": "+974-1234-5678",
    "email": "john@example.com",
    "lead_source": "walk-in"
  }'
```

### Get Dashboard Stats
```bash
curl http://localhost:8080/api/job-orders/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Reports
```bash
curl "http://localhost:8080/api/reports/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Step 5: Test File Upload

```bash
curl -X POST "http://localhost:8080/api/upload?type=image&subdir=profiles" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

## Using Postman

### Import Collection

Create a new collection with these settings:

**Base URL Variable:**
- Variable: `baseUrl`
- Value: `http://localhost:8080/api`

**Authorization:**
- Type: Bearer Token
- Token: `{{token}}`

### Sample Requests:

1. **Login** (No Auth Required)
   - POST `{{baseUrl}}/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@rodeodrive.com",
       "password": "admin123"
     }
     ```
   - Save token to `{{token}}` variable in Tests tab:
     ```javascript
     pm.environment.set("token", pm.response.json().data.token);
     ```

2. **Get Customers**
   - GET `{{baseUrl}}/customers`
   - Auth: Bearer Token

3. **Create Job Order**
   - POST `{{baseUrl}}/job-orders`
   - Auth: Bearer Token
   - Body (JSON):
     ```json
     {
       "vehicle_id": 1,
       "customer_id": 1,
       "order_type": "Service Order",
       "priority": "Normal"
     }
     ```

## Frontend Integration

### Update your HTML files to include the API service:

```html
<!-- Add to your HTML -->
<script type="module">
  import apiService from './api-service.js';
  
  // Now you can use apiService in your code
  async function loadCustomers() {
    try {
      const response = await apiService.getCustomers();
      console.log(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  }
</script>
```

### Replace Login Logic

**Old (localStorage):**
```javascript
// Don't do this anymore
localStorage.setItem('user', JSON.stringify(userData));
```

**New (API):**
```javascript
import apiService from './api-service.js';

const response = await apiService.login(email, password);
// Token and user info stored automatically
```

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** The API already has CORS enabled in Middleware.php. If you still get CORS errors:
- Check that your frontend is served from a web server (not `file://`)
- Update allowed origins in Middleware.php if needed

### Issue: Token Invalid/Expired
**Solution:** 
- Tokens expire after 24 hours
- Re-login to get a new token
- Implement token refresh in production

### Issue: 404 Not Found
**Solution:**
- Make sure .htaccess is in place
- Enable mod_rewrite in Apache
- Check that URL rewriting is working

### Issue: Permission Denied
**Solution:**
- Make sure you're logged in with correct role
- Check user permissions in database
- Admin users should have full permissions

## Testing Checklist

- [ ] Authentication works (login/token validation)
- [ ] Can create customers
- [ ] Can create vehicles
- [ ] Can create job orders
- [ ] Can record payments
- [ ] Can upload files
- [ ] Can view reports
- [ ] Notifications appear
- [ ] Activity logging works

## Production Deployment

When deploying to production:

1. **Update Configuration:**
   - Set `APP_ENV = 'production'` in config.php
   - Set `APP_DEBUG = false`
   - Update JWT secret key in Auth.php
   
2. **Configure Email:**
   - Install PHPMailer: `composer require phpmailer/phpmailer`
   - Update EmailNotification.php with SMTP settings

3. **Security:**
   - Use HTTPS only
   - Set proper CORS origins
   - Implement rate limiting
   - Regular security updates

4. **Database:**
   - Use strong password for database user
   - Regular backups
   - Monitor slow queries

5. **Monitoring:**
   - Set up error logging
   - Monitor API response times
   - Track failed login attempts

## Learn More

- **Full API Documentation:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Implementation Details:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Database Schema:** [database/schema.sql](database/schema.sql)

## Support

If you encounter issues:
1. Check PHP error logs
2. Check browser console for frontend errors
3. Verify database connection
4. Review API_DOCUMENTATION.md for correct endpoints
5. Run setup.php to verify environment

---

**Happy Coding! 🚀**
