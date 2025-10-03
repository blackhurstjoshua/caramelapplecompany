-- Create order_items table (junction table for orders and products)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL, -- Price at time of order in cents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert seed data for order items
-- Using your actual product IDs and realistic pricing
INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES
  -- Sarah's order: 1 Classic Caramel Apple = $14.00 subtotal (discounted price)
  (
    (SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE email = 'sarah.johnson@email.com')),
    '4e29e5ee-977d-4a2d-b9a5-f3e2de139bf7', -- Classic Caramel Apple
    1, 
    1400 -- $14.00 (discounted from $23.00)
  ),
  -- Mike's order: 1 Classic Caramel Apple = $12.00 subtotal (discounted price)
  (
    (SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE email = 'mike.chen@email.com')),
    '4e29e5ee-977d-4a2d-b9a5-f3e2de139bf7', -- Classic Caramel Apple
    1,
    1200 -- $12.00 (discounted from $23.00)
  ),
  -- Emily's order: 1 Classic Caramel Apple = $18.00 subtotal (discounted price)
  (
    (SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE email = 'emily.rodriguez@email.com')),
    '4e29e5ee-977d-4a2d-b9a5-f3e2de139bf7', -- Classic Caramel Apple
    1,
    1800 -- $18.00 (discounted from $23.00)
  );