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