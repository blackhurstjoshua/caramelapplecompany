-- Make email nullable and add constraint to ensure at least one contact method
-- This allows customers to provide either email OR phone

-- Step 1: Remove the NOT NULL constraint from email
ALTER TABLE customers 
  ALTER COLUMN email DROP NOT NULL;

-- Step 2: Add a check constraint to ensure at least one contact method exists
ALTER TABLE customers 
  ADD CONSTRAINT customers_contact_method_check 
  CHECK (
    email IS NOT NULL OR phone IS NOT NULL
  );

-- Note: The UNIQUE constraint on email remains, but PostgreSQL allows multiple NULL values
-- in a UNIQUE column, so this works fine.

