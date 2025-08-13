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
-- Using actual UUIDs from the database after products and orders have been created
INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES
  ('72fc1c62-415c-4015-a67d-7dda952efb9d', 'dd5ba695-0fd7-41b8-b261-e810ba7d7fdd', 2, 1200), -- Sarah's order: 2 Classic Caramel Apples
  ('715fa43b-fba0-40d2-8da0-8038927673d0', '16b60e4a-23e2-4eed-bcab-a58536cc33ab', 1, 1200), -- Mike's order: 1 Chocolate Drizzle Delight
  ('d782d1d1-48d8-4789-ac06-5cfc3befe81a', '16b60e4a-23e2-4eed-bcab-a58536cc33ab', 2, 1200), -- Emily's order: 2 Chocolate Drizzle Delights
  ('d782d1d1-48d8-4789-ac06-5cfc3befe81a', '95aee6b2-eeee-48e2-bacd-789ea2789b30', 1, 1200); -- Emily's order: 1 Cinnamon Sugar Crunch