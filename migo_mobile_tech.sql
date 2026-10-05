-- MIGO MOBILE TECH COMPANY - MySQL DATABASE

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS migo_mobile_tech;
USE migo_mobile_tech;


-- TABLE 1: USER (People who sign up)
CREATE TABLE IF NOT EXISTS user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    gender VARCHAR(10),
    phone_number VARCHAR(20),
    date_registered DATE
);

-- TABLE 2: REGISTRATION_FORM (Sign up process)
CREATE TABLE IF NOT EXISTS registration_form (
    form_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_date DATE,
    form_status VARCHAR(50)  -- 'pending' or 'completed'
);


-- TABLE 3: ACCOUNT (Login details)
CREATE TABLE IF NOT EXISTS account (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100),
    password VARCHAR(100),
    account_status VARCHAR(50),  -- 'active' or 'inactive'
    date_created DATE,
    form_id INT,
    FOREIGN KEY (form_id) REFERENCES registration_form(form_id) ON DELETE SET NULL
);


-- TABLE 4: EMAIL_ADDRESS (User emails)
CREATE TABLE IF NOT EXISTS email_address (
    email_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100),
    verification_status VARCHAR(50),  -- 'verified' or 'unverified'
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);


-- TABLE 5: TELEGRAM_NUMBER (User telegram)
CREATE TABLE IF NOT EXISTS telegram_number (
    telegram_id INT PRIMARY KEY AUTO_INCREMENT,
    telegram_number VARCHAR(50),
    verification_status VARCHAR(50),  -- 'verified' or 'unverified'
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);


-- TABLE 6: SUPPLIER (Companies we buy from)
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(150),
    branch_location VARCHAR(200),
    contact_number VARCHAR(20)
);


-- TABLE 7: GADGET (Phones we sell)
CREATE TABLE IF NOT EXISTS gadget (
    gadget_id INT PRIMARY KEY AUTO_INCREMENT,
    gadget_name VARCHAR(150),
    branch VARCHAR(100),
    model VARCHAR(100),
    unit_price DECIMAL(10, 2),
    quantity_in_stock INT,
    supplier_id INT,
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE SET NULL
);


-- TABLE 8: CUSTOMER (People who buy from us)
CREATE TABLE IF NOT EXISTS customer (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(150),
    address VARCHAR(200),
    phone_number VARCHAR(20),
    customer_type VARCHAR(50)  -- 'retail' or 'wholesale'
);


-- TABLE 9: SALES_ORDER (Customer orders)
CREATE TABLE IF NOT EXISTS sales_order (
    sales_order_id INT PRIMARY KEY AUTO_INCREMENT,
    order_date DATE,
    order_status VARCHAR(50),  -- 'pending', 'shipped', 'delivered'
    total_amount DECIMAL(12, 2),
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE SET NULL
);


-- TABLE 10: ORDER_ITEMS (Items in each order)
CREATE TABLE IF NOT EXISTS order_items (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    gadget_id INT,
    order_date DATE,
    quantity_ordered INT,
    sub_total DECIMAL(12, 2),
    sales_order_id INT,
    FOREIGN KEY (gadget_id) REFERENCES gadget(gadget_id) ON DELETE SET NULL,
    FOREIGN KEY (sales_order_id) REFERENCES sales_order(sales_order_id) ON DELETE CASCADE
);


-- TABLE 11: PAYMENT (Money received)
CREATE TABLE IF NOT EXISTS payment (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    payment_amount DECIMAL(12, 2),
    payment_date DATE,
    payment_method VARCHAR(50),  -- 'cash', 'card', 'bank transfer'
    sales_order_id INT,
    FOREIGN KEY (sales_order_id) REFERENCES sales_order(sales_order_id) ON DELETE SET NULL
);


-- TABLE 12: TECHNICIAN (People who fix phones)
CREATE TABLE IF NOT EXISTS technician (
    technician_id INT PRIMARY KEY AUTO_INCREMENT,
    technician_name VARCHAR(150),
    skill_specialization VARCHAR(200),
    contact_number VARCHAR(20),
    employment_date DATE
);


-- TABLE 13: REPAIR_PROCESS (Repair jobs)
CREATE TABLE IF NOT EXISTS repair_process (
    repair_id INT PRIMARY KEY AUTO_INCREMENT,
    repair_type VARCHAR(100),
    repair_status VARCHAR(50),  -- 'pending', 'in progress', 'completed'
    repair_start_date DATE,
    repair_end_date DATE,
    technician_id INT,
    FOREIGN KEY (technician_id) REFERENCES technician(technician_id) ON DELETE SET NULL
);


-- TABLE 14: REPAIR_RECEIPT (Repair invoice)
CREATE TABLE IF NOT EXISTS repair_receipt (
    receipt_id INT PRIMARY KEY AUTO_INCREMENT,
    receipt_date DATE,
    repair_status VARCHAR(50),
    repair_description TEXT,
    repair_id INT,
    FOREIGN KEY (repair_id) REFERENCES repair_process(repair_id) ON DELETE CASCADE
);


-- TABLE 15: TECHNICIAN_RECEIPT (Who did the repair)
CREATE TABLE IF NOT EXISTS technician_receipt (
    receipt_id INT PRIMARY KEY AUTO_INCREMENT,
    technician_id INT,
    assignment_date DATE,
    work_status VARCHAR(50),  -- 'assigned', 'completed'
    repair_id INT,
    FOREIGN KEY (technician_id) REFERENCES technician(technician_id) ON DELETE SET NULL,
    FOREIGN KEY (repair_id) REFERENCES repair_process(repair_id) ON DELETE CASCADE
);

-- END OF DATABASE SCHEMA
