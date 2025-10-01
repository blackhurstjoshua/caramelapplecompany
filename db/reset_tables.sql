-- Reset script to drop and recreate orders-related tables
-- Run this to clean slate your order system

-- Drop tables in reverse dependency order (child tables first)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Now you can run customers.sql, orders.sql, and order_items.sql in that order
-- This ensures a clean slate with the new schema
