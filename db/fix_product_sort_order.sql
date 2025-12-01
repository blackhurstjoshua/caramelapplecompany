-- Fix any corrupted sort_order values by renumbering all products
-- This ensures no duplicates and proper sequential ordering

-- Renumber all products based on their current sort_order and created_at
WITH ordered_products AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC) as new_order
  FROM products
)
UPDATE products
SET sort_order = ordered_products.new_order,
    updated_at = NOW()
FROM ordered_products
WHERE products.id = ordered_products.id;

-- Verify the fix - this should show a clean sequence: 1, 2, 3, 4, etc.
SELECT 
  sort_order,
  name,
  is_active,
  created_at
FROM products 
ORDER BY sort_order ASC;

-- Check for any duplicates (should return 0 rows)
SELECT 
  sort_order, 
  COUNT(*) as count
FROM products 
GROUP BY sort_order 
HAVING COUNT(*) > 1;

