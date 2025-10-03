-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_cents INTEGER NOT NULL, -- Total in cents (pennies)
  subtotal_cents INTEGER NOT NULL DEFAULT 0, -- Subtotal in cents (before delivery fee)
  retrieval_method VARCHAR(20) NOT NULL DEFAULT 'pickup' CHECK (retrieval_method IN ('pickup', 'delivery')),
  delivery_fee_cents INTEGER NOT NULL DEFAULT 0, -- Delivery fee in cents
  payment_method VARCHAR(20) NOT NULL DEFAULT 'pickup' CHECK (payment_method IN ('pickup', 'stripe')),
  address JSONB, -- Delivery address as JSON (null for pickup)
  customizations TEXT, -- Custom instructions/modifications
  delivery_specifications TEXT, -- Delivery address, time, special instructions (legacy - use address field)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert seed data for orders
-- Note: customer_id values will need to be retrieved from customers table after insertion
INSERT INTO orders (
  customer_id, 
  order_date, 
  status, 
  total_cents, 
  subtotal_cents,
  retrieval_method,
  delivery_fee_cents,
  payment_method,
  address,
  customizations, 
  delivery_specifications
) VALUES
  (
    (SELECT id FROM customers WHERE email = 'sarah.johnson@email.com'), 
    '2024-11-25T14:30:00Z', 
    'completed', 
    2400, -- $24.00 total
    1400, -- $14.00 subtotal
    'delivery',
    1000, -- $10.00 delivery fee
    'pickup',
    '{"addressLine1": "123 Main St", "city": "Springfield", "state": "IL", "zip": "62701"}'::jsonb,
    'Extra pecans on caramel apples', 
    '123 Main St, Springfield. Deliver between 2-4 PM'
  ),
  (
    (SELECT id FROM customers WHERE email = 'mike.chen@email.com'), 
    '2024-11-28T10:15:00Z', 
    'processing', 
    2200, -- $22.00 total
    1200, -- $12.00 subtotal
    'delivery',
    1000, -- $10.00 delivery fee
    'stripe',
    '{"addressLine1": "456 Oak Ave", "city": "Springfield", "state": "IL", "zip": "62702"}'::jsonb,
    NULL, 
    '456 Oak Ave, Springfield. Leave at front door if no answer'
  ),
  (
    (SELECT id FROM customers WHERE email = 'emily.rodriguez@email.com'), 
    '2024-11-30T16:45:00Z', 
    'pending', 
    1800, -- $18.00 total
    1800, -- $18.00 subtotal (no delivery fee)
    'pickup',
    0, -- No delivery fee
    'pickup',
    NULL, -- No address for pickup
    'Light chocolate drizzle', 
    NULL -- No delivery specifications for pickup
  );