-- Migration: Add sort_order field to products table
-- This allows admins to control the display order of products

-- Add sort_order column with default value of 0
ALTER TABLE products ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Create index for better query performance when ordering by sort_order
CREATE INDEX idx_products_sort_order ON products(sort_order);

-- Note: Run products_backfill_sort_order.sql after this to set initial values

