-- Add refund_due status to orders table
-- This allows admins to mark orders that need refunds (e.g., when prices are changed on completed Stripe orders)

-- Drop existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint with refund_due status
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refund_due'));

