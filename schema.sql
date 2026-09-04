-- Taste of Thanjai POS - MySQL Database Schema
-- Database Name: biller

CREATE DATABASE IF NOT EXISTS biller;
USE biller;

-- 1. Table for Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    type ENUM('veg', 'nonveg') NOT NULL DEFAULT 'veg',
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table for Orders Header
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    date DATETIME NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment VARCHAR(50) NOT NULL DEFAULT 'UPI',
    status VARCHAR(50) NOT NULL DEFAULT 'Paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table for Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    qty INT NOT NULL DEFAULT 1,
    line_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Menu Items if empty
INSERT IGNORE INTO menu_items (id, name, category, price, type) VALUES
('vd-dosa', 'Dosa', 'Veg Dosas', 30.00, 'veg'),
('vd-roast', 'Roast', 'Veg Dosas', 40.00, 'veg'),
('vd-rava', 'Rava Dosa', 'Veg Dosas', 50.00, 'veg'),
('vd-onion', 'Onion Dosa', 'Veg Dosas', 50.00, 'veg'),
('vd-oothappam', 'Onion Oothappam', 'Veg Dosas', 60.00, 'veg'),
('vd-ghee', 'Ghee Roast', 'Veg Dosas', 60.00, 'veg'),
('vd-podi', 'Podi Dosa', 'Veg Dosas', 60.00, 'veg'),
('vd-guntur', 'Guntur Kaara Dosa', 'Veg Dosas', 60.00, 'veg'),
('vd-ghee-rava', 'Ghee Rava Dosa', 'Veg Dosas', 70.00, 'veg'),
('vd-ghee-podi', 'Ghee Podi Dosa', 'Veg Dosas', 70.00, 'veg'),
('vd-poond', 'Poond(u) Podi Dosa', 'Veg Dosas', 70.00, 'veg'),
('vd-murungai', 'Murungai Podi Dosa', 'Veg Dosas', 70.00, 'veg'),
('vd-curry', 'Curry Leaves Podi Dosa', 'Veg Dosas', 70.00, 'veg'),
('vd-butter', 'Butter Dosa', 'Veg Dosas', 80.00, 'veg'),
('vd-poond-dosa', 'Poond(u) Dosa', 'Veg Dosas', 80.00, 'veg'),
('vd-mushroom', 'Mushroom Dosa', 'Veg Dosas', 80.00, 'veg'),
('nv-chicken', 'Chicken Kari Dosa', 'Non-Veg Dosas', 100.00, 'nonveg'),
('nv-prawn', 'Prawn Dosa', 'Non-Veg Dosas', 120.00, 'nonveg'),
('nv-prawn-half', 'Prawn Half Boil Dosa', 'Non-Veg Dosas', 130.00, 'nonveg'),
('nv-half', 'Half Boil Dosa', 'Non-Veg Dosas', 50.00, 'nonveg'),
('nv-egg', 'Egg Dosa', 'Non-Veg Dosas', 50.00, 'nonveg'),
('nv-kaara', 'Kaara Egg Dosa', 'Non-Veg Dosas', 60.00, 'nonveg'),
('vi-idly', 'Idly', 'Veg Idly', 10.00, 'veg'),
('vi-poond', 'Poond(u) Podi Idly', 'Veg Idly', 20.00, 'veg'),
('vi-curry', 'Curry Leaves Podi Idly', 'Veg Idly', 20.00, 'veg'),
('vi-mini', 'Mini Idly Bowl (16 pcs)', 'Veg Idly', 50.00, 'veg'),
('nvi-chicken', 'Chicken Kari Idly', 'Non-Veg Idly', 25.00, 'nonveg'),
('nvi-egg', 'Egg Kothu Idly', 'Non-Veg Idly', 50.00, 'nonveg'),
('nvi-kothu', 'Chicken Kothu Idly', 'Non-Veg Idly', 60.00, 'nonveg'),
('ch-normal', 'Normal Chapathi', 'Chapathi', 15.00, 'veg'),
('ch-egg', 'Egg Chapathi', 'Chapathi', 25.00, 'nonveg'),
('ch-kothu', 'Kothu Chapathi', 'Chapathi', 40.00, 'veg'),
('ch-chicken', 'Chicken Kothu Chapathi', 'Chapathi', 50.00, 'nonveg');
