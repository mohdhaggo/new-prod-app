# Database Setup Guide

## Issue: Database Connection Failed

The development server is running but cannot connect to the MySQL database.

**Error:** `Access denied for user 'root'@'localhost'`

## Quick Fix Options:

### Option 1: Use Root with Password (Recommended for Dev)

1. Open `backend/config/database.php`
2. Update line 7 with your MySQL root password:
   ```php
   private $password = 'YOUR_MYSQL_ROOT_PASSWORD';
   ```

### Option 2: Create Dedicated Database User

Run this MySQL command to create the rodeo_app user:

```sql
-- Connect to MySQL as root first
mysql -u root -p

-- Then run these commands:
CREATE USER IF NOT EXISTS 'rodeo_app'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON rodeo_drive_crm.* TO 'rodeo_app'@'localhost';
FLUSH PRIVILEGES;
```

Then update `backend/config/database.php`:
```php
private $username = 'rodeo_app';
private $password = 'SecurePassword123!';
```

### Option 3: Setup Full Database

Run the complete database setup:

```powershell
# Navigate to project root
cd c:\Users\M.Haggo\Desktop\new-prod-app

# Run the schema (creates database, tables, and user)
mysql -u root -p < database/schema.sql

# Load sample data
mysql -u root -p rodeo_drive_crm < database/seed.sql
```

## Testing Connection

After fixing the credentials, test with:

```powershell
# From project directory
php -r "try { \$pdo = new PDO('mysql:host=localhost;dbname=rodeo_drive_crm', 'root', 'YOUR_PASSWORD'); echo 'Connection successful!'; } catch(Exception \$e) { echo 'Error: ' . \$e->getMessage(); }"
```

## Current Server Status

✅ PHP Development Server: Running on port 8080  
❌ Database Connection: Failed - needs credentials  
✅ API Router: Working  
✅ CORS: Enabled  

## Next Steps

1. Fix database credentials in `backend/config/database.php`
2. Optionally run `database/schema.sql` to create all tables
3. Optionally run `database/seed.sql` to add test data
4. Test at: http://localhost:8080/frontend/test-api.html
