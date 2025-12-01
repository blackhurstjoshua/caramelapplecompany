-- Make sort_order nullable to allow using NULL as a temporary value during swaps
-- This enables a simple 3-step atomic swap without conflicts

ALTER TABLE products 
ALTER COLUMN sort_order DROP NOT NULL;

-- Verify the change
\d products;

