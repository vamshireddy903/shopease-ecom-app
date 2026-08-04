-- ============================================================
-- E-commerce schema for Amazon RDS (MySQL 8.x)
-- Run this once against your RDS database, e.g.:
--   mysql -h <rds-endpoint> -u <user> -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ecommerce;

-- ---------- USERS ----------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- PRODUCTS ----------
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  stock INT NOT NULL DEFAULT 0,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- CART ----------
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- ---------- ORDERS ----------
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PAID',
  shipping_address VARCHAR(500),
  payment_method VARCHAR(50) DEFAULT 'DUMMY',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- ORDER ITEMS ----------
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ---------- SEED DATA (sample products) ----------
INSERT INTO products (name, description, price, image_url, stock, category) VALUES
('Wireless Headphones', 'Over-ear Bluetooth headphones with noise cancellation', 2999.00, 'https://picsum.photos/seed/headphones/400/400', 50, 'Electronics'),
('Smart Watch', 'Fitness tracking smart watch with heart-rate monitor', 4999.00, 'https://picsum.photos/seed/watch/400/400', 30, 'Electronics'),
('Running Shoes', 'Lightweight running shoes for everyday training', 1899.00, 'https://picsum.photos/seed/shoes/400/400', 100, 'Footwear'),
('Backpack', 'Water-resistant 25L travel backpack', 1299.00, 'https://picsum.photos/seed/backpack/400/400', 75, 'Accessories'),
('Coffee Maker', 'Automatic drip coffee maker, 1.2L capacity', 3499.00, 'https://picsum.photos/seed/coffee/400/400', 40, 'Home'),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 899.00, 'https://picsum.photos/seed/lamp/400/400', 60, 'Home'),
('Yoga Mat', 'Non-slip eco-friendly yoga mat', 799.00, 'https://picsum.photos/seed/yoga/400/400', 90, 'Fitness'),
('Bluetooth Speaker', 'Portable waterproof Bluetooth speaker', 1999.00, 'https://picsum.photos/seed/speaker/400/400', 65, 'Electronics');
