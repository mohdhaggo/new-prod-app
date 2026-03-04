-- Seed data for testing
USE rodeo_drive_crm;

-- Insert departments
INSERT INTO departments (name, description) VALUES
('Management', 'Executive and administrative management'),
('Service', 'Vehicle service and maintenance department'),
('Sales', 'Vehicle sales and customer acquisition'),
('Quality Control', 'Quality assurance and inspection');

-- Insert roles
INSERT INTO roles (department_id, name, description) VALUES
(1, 'Administrator', 'Full system access'),
(1, 'Manager', 'Department management access'),
(2, 'Service Advisor', 'Front-line service management'),
(2, 'Technician', 'Vehicle service technician'),
(3, 'Sales Representative', 'Customer sales and inquiries'),
(4, 'Quality Inspector', 'Service quality inspection');

-- Insert admin user (password: Admin@123)
INSERT INTO users (
    employee_id, email, password_hash, first_name, last_name, 
    mobile, department_id, role_id, is_active, has_dashboard_access
) VALUES (
    'EMP001',
    'admin@rodeodrive.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'System',
    'Administrator',
    '+971 50 123 4567',
    1,
    1,
    TRUE,
    TRUE
);

-- Insert sample customer
INSERT INTO customers (
    customer_number, first_name, last_name, mobile, email,
    address_line1, city, lead_source, customer_since
) VALUES (
    'CUST-2024-0001',
    'Ahmed',
    'Hassan',
    '+971 50 123 4567',
    'ahmed@example.com',
    'Villa 45, Al Barsha',
    'Dubai',
    'walk-in',
    '2024-01-15'
);

-- Insert sample vehicle
INSERT INTO vehicles (
    vehicle_number, customer_id, make, model, year, 
    color, plate_number, vin, vehicle_type
) VALUES (
    'VEH-2024-0001',
    1,
    'Toyota',
    'Camry',
    2023,
    'Silver',
    'DXB-12345',
    'JTDKBRFU9H3045678',
    'Sedan'
);

-- Insert permissions/modules
INSERT INTO permissions (module_name, display_name, description, sort_order) VALUES
('dashboard', 'Dashboard', 'Main dashboard access', 1),
('customers', 'Customers', 'Customer management', 2),
('vehicles', 'Vehicles', 'Vehicle management', 3),
('job_orders', 'Job Orders', 'Job order management', 4),
('departments', 'Departments', 'Department management', 5),
('roles', 'Roles', 'Role management', 6),
('users', 'Users', 'User management', 7),
('payments', 'Payments', 'Payment management', 8),
('reports', 'Reports', 'Reports and analytics', 9);

-- Grant full permissions to Administrator role (role_id = 1)
INSERT INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete, can_approve)
SELECT 1, id, TRUE, TRUE, TRUE, TRUE, TRUE
FROM permissions;