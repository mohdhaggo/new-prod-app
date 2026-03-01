-- Rodeo Drive CRM Database Schema
-- MySQL 8.0+

-- Drop database if exists (for fresh install)
DROP DATABASE IF EXISTS rodeo_drive_crm;
CREATE DATABASE rodeo_drive_crm;
USE rodeo_drive_crm;

-- =====================================================
-- 1. CORE TABLES (Departments, Roles, Users)
-- =====================================================

-- Departments table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_per_department (department_id, name)
);

-- Users table (System Users)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20),
    department_id INT,
    role_id INT,
    line_manager_id INT,
    profile_picture VARCHAR(500),
    
    -- Status flags
    is_active BOOLEAN DEFAULT TRUE,
    has_dashboard_access BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    last_login_at TIMESTAMP NULL,
    password_changed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    
    -- Constraints
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (line_manager_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_email (email),
    INDEX idx_employee_id (employee_id),
    INDEX idx_department (department_id),
    INDEX idx_role (role_id),
    INDEX idx_line_manager (line_manager_id)
);

-- Password reset tokens
CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token)
);

-- =====================================================
-- 2. PERMISSIONS & ACCESS CONTROL
-- =====================================================

-- Modules/Permissions list
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_module_id INT NULL,
    sort_order INT DEFAULT 0,
    icon VARCHAR(50),
    route VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_module_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Role-based permissions
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    can_view BOOLEAN DEFAULT TRUE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_approve BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- =====================================================
-- 3. CUSTOMER MANAGEMENT
-- =====================================================

-- Customers table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Personal Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    alternate_mobile VARCHAR(20),
    email VARCHAR(255),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'UAE',
    postal_code VARCHAR(20),
    
    -- Lead Source
    lead_source ENUM('walk-in', 'refer', 'social', 'other') DEFAULT 'walk-in',
    lead_details JSON, -- Stores referrer details or social platform info
    
    -- Metadata
    customer_since DATE,
    profile_photo VARCHAR(500),
    notes TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason TEXT,
    
    -- Tracking
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_customer_number (customer_number),
    INDEX idx_mobile (mobile),
    INDEX idx_email (email),
    INDEX idx_name_search (first_name, last_name),
    INDEX idx_lead_source (lead_source),
    FULLTEXT idx_fulltext (first_name, last_name, mobile, email)
);

-- =====================================================
-- 4. VEHICLE MANAGEMENT
-- =====================================================

-- Vehicles table
CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    
    -- Vehicle Details
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(50),
    plate_number VARCHAR(50) NOT NULL,
    vin VARCHAR(17) UNIQUE,
    engine_number VARCHAR(50),
    vehicle_type ENUM('Sedan', 'SUV', 'Hatchback', 'Truck', 'Coupe', 'Other') DEFAULT 'Sedan',
    
    -- Registration
    registration_date DATE,
    registration_expiry DATE,
    insurance_policy_number VARCHAR(100),
    insurance_expiry DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_vehicle_number (vehicle_number),
    INDEX idx_plate (plate_number),
    INDEX idx_vin (vin),
    INDEX idx_customer (customer_id),
    INDEX idx_make_model (make, model),
    FULLTEXT idx_vehicle_search (make, model, plate_number, vin)
);

-- =====================================================
-- 5. SERVICE MANAGEMENT (Job Orders)
-- =====================================================

-- Job Orders table
CREATE TABLE job_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id INT NOT NULL,
    customer_id INT NOT NULL,
    
    -- Order Details
    order_type ENUM('New Job Order', 'Service Order', 'Repair', 'Maintenance') DEFAULT 'Service Order',
    service_advisor_id INT,
    technician_id INT,
    
    -- Dates
    created_date DATE NOT NULL,
    promised_date DATE,
    started_date DATE,
    completed_date DATE,
    delivered_date DATE,
    
    -- Status
    work_status ENUM('New Request', 'Inprogress', 'Quality Check', 'Ready', 'Completed', 'Cancelled') DEFAULT 'New Request',
    payment_status ENUM('Unpaid', 'Partially Paid', 'Fully Paid') DEFAULT 'Unpaid',
    priority ENUM('Low', 'Normal', 'High', 'Urgent') DEFAULT 'Normal',
    
    -- Financial
    estimated_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    grand_total DECIMAL(10,2),
    
    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,
    
    -- Tracking
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_advisor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_job_number (job_number),
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (work_status),
    INDEX idx_dates (created_date, completed_date)
);

-- Job Order Services (Line items)
CREATE TABLE job_order_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_order_id INT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    technician_id INT,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (job_order_id) REFERENCES job_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Job Order Parts used
CREATE TABLE job_order_parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_order_id INT NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(255),
    FOREIGN KEY (job_order_id) REFERENCES job_orders(id) ON DELETE CASCADE
);

-- =====================================================
-- 6. INSPECTION MODULE
-- =====================================================

-- Inspections table
CREATE TABLE inspections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inspection_number VARCHAR(50) UNIQUE NOT NULL,
    job_order_id INT,
    vehicle_id INT NOT NULL,
    inspector_id INT,
    
    -- Inspection Details
    inspection_date DATE NOT NULL,
    inspection_type ENUM('Pre-service', 'Post-service', 'Quality Check', 'Vehicle Receiving') DEFAULT 'Pre-service',
    
    -- Findings
    exterior_condition TEXT,
    interior_condition TEXT,
    mechanical_notes TEXT,
    odometer_reading INT,
    fuel_level INT, -- Percentage
    
    -- Photos
    photos JSON, -- Store array of photo paths
    
    -- Result
    is_passed BOOLEAN,
    recommendation TEXT,
    
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_order_id) REFERENCES job_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_inspection_number (inspection_number),
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_job_order (job_order_id)
);

-- =====================================================
-- 7. QUALITY CHECK MODULE
-- =====================================================

-- Quality Checks table
CREATE TABLE quality_checks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    check_number VARCHAR(50) UNIQUE NOT NULL,
    job_order_id INT NOT NULL,
    checker_id INT,
    
    check_date DATE NOT NULL,
    check_type ENUM('Pre-delivery', 'Post-service', 'Final Inspection') DEFAULT 'Post-service',
    
    -- Checklist items stored as JSON
    checklist_items JSON,
    passed_items INT DEFAULT 0,
    failed_items INT DEFAULT 0,
    total_items INT DEFAULT 0,
    
    -- Result
    is_passed BOOLEAN,
    remarks TEXT,
    rework_required BOOLEAN DEFAULT FALSE,
    rework_notes TEXT,
    
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_order_id) REFERENCES job_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (checker_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_check_number (check_number),
    INDEX idx_job_order (job_order_id)
);

-- =====================================================
-- 8. PAYMENT & INVOICE MODULE
-- =====================================================

-- Invoices table
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    job_order_id INT NOT NULL,
    customer_id INT NOT NULL,
    
    -- Invoice Details
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    balance_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    
    -- Status
    status ENUM('Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled') DEFAULT 'Draft',
    payment_status ENUM('Unpaid', 'Partially Paid', 'Fully Paid') DEFAULT 'Unpaid',
    
    -- PDF
    pdf_path VARCHAR(500),
    
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_order_id) REFERENCES job_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_customer (customer_id),
    INDEX idx_job_order (job_order_id),
    INDEX idx_status (status)
);

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id INT NOT NULL,
    
    -- Payment Details
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Cheque', 'Online') NOT NULL,
    reference_number VARCHAR(100),
    
    -- Cheque details (if applicable)
    cheque_number VARCHAR(50),
    cheque_date DATE,
    bank_name VARCHAR(100),
    
    -- Status
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Completed',
    notes TEXT,
    
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_payment_number (payment_number),
    INDEX idx_invoice (invoice_id)
);

-- =====================================================
-- 9. EXIT PERMIT MODULE
-- =====================================================

-- Exit Permits table
CREATE TABLE exit_permits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    permit_number VARCHAR(50) UNIQUE NOT NULL,
    job_order_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    customer_id INT NOT NULL,
    
    -- Permit Details
    requested_by INT, -- User ID
    approved_by INT, -- User ID
    request_date DATE NOT NULL,
    exit_date DATE,
    expected_return_date DATE,
    actual_return_date DATE,
    
    -- Purpose
    purpose ENUM('Test Drive', 'Customer Pickup', 'Service Follow-up', 'Other') DEFAULT 'Customer Pickup',
    other_purpose TEXT,
    
    -- Status
    status ENUM('Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled') DEFAULT 'Pending',
    
    -- Vehicle Condition at Exit
    exit_odometer INT,
    exit_fuel_level INT,
    exit_notes TEXT,
    
    -- Vehicle Condition on Return
    return_odometer INT,
    return_fuel_level INT,
    return_condition TEXT,
    
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_order_id) REFERENCES job_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_permit_number (permit_number),
    INDEX idx_status (status),
    INDEX idx_dates (request_date, exit_date)
);

-- =====================================================
-- 10. SYSTEM LOGS & AUDIT
-- =====================================================

-- Activity Logs
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    record_id INT,
    old_data JSON,
    new_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_module (module, record_id),
    INDEX idx_created_at (created_at)
);

-- Login History
CREATE TABLE login_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_status ENUM('Success', 'Failed') NOT NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 11. NOTIFICATIONS
-- =====================================================

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id, is_read),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 12. SETTINGS & CONFIGURATION
-- =====================================================

-- System Settings
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('text', 'number', 'boolean', 'json', 'file') DEFAULT 'text',
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- INSERT INITIAL DATA
-- =====================================================

-- Insert default permissions/modules
INSERT INTO permissions (module_name, display_name, icon, route, sort_order) VALUES
('dashboard', 'Dashboard', 'fas fa-tachometer-alt', '/dashboard', 1),
('customers', 'Customer Management', 'fas fa-users', '/customers', 2),
('vehicles', 'Vehicle Management', 'fas fa-car', '/vehicles', 3),
('job-orders', 'Job Orders', 'fas fa-clipboard-list', '/job-order', 4),
('inspection', 'Inspection', 'fas fa-search', '/inspection', 5),
('quality-check', 'Quality Check', 'fas fa-check-double', '/quality-check', 6),
('service-execution', 'Service Execution', 'fas fa-tools', '/service-execution', 7),
('payment-invoice', 'Payment & Invoice', 'fas fa-file-invoice-dollar', '/payment-invoice', 8),
('exit-permit', 'Exit Permit', 'fas fa-sign-out-alt', '/exit-permit', 9),
('order-history', 'Order History', 'fas fa-history', '/order-history', 10),
('department-role', 'Department & Role', 'fas fa-sitemap', '/department-role', 11),
('system-users', 'System Users', 'fas fa-user-cog', '/system-users', 12),
('role-permission', 'Role Permissions', 'fas fa-shield-alt', '/role-permission', 13),
('reports', 'Reports', 'fas fa-chart-bar', '/reports', 14),
('settings', 'Settings', 'fas fa-cog', '/settings', 15);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'Rodeo Drive', 'text', 'Company Name'),
('company_logo', '/assets/company-logo.png', 'file', 'Company Logo'),
('company_email', 'info@rodeodrive.com', 'text', 'Company Email'),
('company_phone', '+971 4 123 4567', 'text', 'Company Phone'),
('company_address', 'Dubai, UAE', 'text', 'Company Address'),
('tax_rate', '5', 'number', 'VAT/Tax Rate (%)'),
('currency', 'AED', 'text', 'Currency'),
('date_format', 'DD/MM/YYYY', 'text', 'Date Format'),
('session_timeout', '30', 'number', 'Session Timeout (minutes)'),
('items_per_page', '20', 'number', 'Default Items Per Page');

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Update vehicle service count when job order is completed
DELIMITER //
CREATE TRIGGER update_vehicle_service_count
AFTER UPDATE ON job_orders
FOR EACH ROW
BEGIN
    IF NEW.work_status = 'Completed' AND OLD.work_status != 'Completed' THEN
        UPDATE vehicles 
        SET completed_services = (
            SELECT COUNT(*) FROM job_orders 
            WHERE vehicle_id = NEW.vehicle_id AND work_status = 'Completed'
        )
        WHERE id = NEW.vehicle_id;
    END IF;
END//

-- Update invoice balance when payment is made
CREATE TRIGGER update_invoice_balance
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    UPDATE invoices 
    SET paid_amount = (
        SELECT COALESCE(SUM(amount), 0) FROM payments 
        WHERE invoice_id = NEW.invoice_id AND status = 'Completed'
    ),
    payment_status = CASE 
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id AND status = 'Completed') >= total_amount THEN 'Fully Paid'
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id AND status = 'Completed') > 0 THEN 'Partially Paid'
        ELSE 'Unpaid'
    END
    WHERE id = NEW.invoice_id;
END//

DELIMITER ;

-- =====================================================
-- CREATE VIEWS
-- =====================================================

-- Customer Summary View
CREATE VIEW customer_summary AS
SELECT 
    c.id,
    c.customer_number,
    CONCAT(c.first_name, ' ', c.last_name) AS full_name,
    c.mobile,
    c.email,
    c.lead_source,
    COUNT(DISTINCT v.id) AS total_vehicles,
    COUNT(DISTINCT jo.id) AS total_job_orders,
    COUNT(DISTINCT CASE WHEN jo.work_status = 'Completed' THEN jo.id END) AS completed_services,
    MAX(jo.created_date) AS last_service_date,
    SUM(jo.grand_total) AS total_spent
FROM customers c
LEFT JOIN vehicles v ON c.id = v.customer_id AND v.is_deleted = FALSE
LEFT JOIN job_orders jo ON v.id = jo.vehicle_id
GROUP BY c.id;

-- Vehicle Summary View
CREATE VIEW vehicle_summary AS
SELECT 
    v.id,
    v.vehicle_number,
    v.make,
    v.model,
    v.year,
    v.color,
    v.plate_number,
    CONCAT(c.first_name, ' ', c.last_name) AS owner_name,
    c.mobile AS owner_mobile,
    COUNT(DISTINCT jo.id) AS total_services,
    COUNT(DISTINCT CASE WHEN jo.work_status = 'Completed' THEN jo.id END) AS completed_services,
    MAX(jo.created_date) AS last_service_date,
    MAX(jo.id) AS current_job_id
FROM vehicles v
LEFT JOIN customers c ON v.customer_id = c.id
LEFT JOIN job_orders jo ON v.id = jo.vehicle_id
WHERE v.is_deleted = FALSE
GROUP BY v.id;

-- Dashboard Stats View
CREATE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM customers WHERE is_active = TRUE) AS total_customers,
    (SELECT COUNT(*) FROM vehicles WHERE is_deleted = FALSE) AS total_vehicles,
    (SELECT COUNT(*) FROM job_orders WHERE work_status = 'Inprogress') AS jobs_in_progress,
    (SELECT COUNT(*) FROM job_orders WHERE work_status = 'Ready') AS jobs_ready,
    (SELECT COUNT(*) FROM job_orders WHERE created_date = CURDATE()) AS jobs_today,
    (SELECT COALESCE(SUM(grand_total), 0) FROM job_orders WHERE DATE(created_date) = CURDATE()) AS revenue_today,
    (SELECT COALESCE(SUM(grand_total), 0) FROM job_orders WHERE YEAR(created_date) = YEAR(CURDATE()) AND MONTH(created_date) = MONTH(CURDATE())) AS revenue_month;

-- =====================================================
-- GRANT PERMISSIONS (Adjust as needed)
-- =====================================================

-- Create application user
CREATE USER IF NOT EXISTS 'rodeo_app'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT SELECT, INSERT, UPDATE, DELETE ON rodeo_drive_crm.* TO 'rodeo_app'@'localhost';
GRANT EXECUTE ON rodeo_drive_crm.* TO 'rodeo_app'@'localhost';
FLUSH PRIVILEGES;