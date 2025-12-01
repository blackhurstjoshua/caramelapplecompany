-- Migration: Backfill sort_order values for existing products
-- Sets sort_order based on created_at timestamp (oldest first)

-- Update sort_order for existing products based on creation order
WITH ordered_products AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as new_order
  FROM products
)
UPDATE products
SET sort_order = ordered_products.new_order
FROM ordered_products
WHERE products.id = ordered_products.id;

-- Verify no duplicate sort_order values exist
-- This query should return 0 rows
SELECT sort_order, COUNT(*) 
FROM products 
GROUP BY sort_order 
HAVING COUNT(*) > 1;

