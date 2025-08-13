-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_cents INTEGER NOT NULL, -- Total in cents (pennies)
  customizations TEXT, -- Custom instructions/modifications
  delivery_specifications TEXT, -- Delivery address, time, special instructions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert seed data for orders
-- Note: customer_id values will need to be retrieved from customers table after insertion
INSERT INTO orders (customer_id, order_date, status, total_cents, customizations, delivery_specifications) VALUES
  ((SELECT id FROM customers WHERE email = 'sarah.johnson@email.com'), '2024-11-25T14:30:00Z', 'completed', 2400, 'Extra pecans on caramel apples', '123 Main St, Springfield. Deliver between 2-4 PM'),
  ((SELECT id FROM customers WHERE email = 'mike.chen@email.com'), '2024-11-28T10:15:00Z', 'processing', 1200, NULL, '456 Oak Ave, Springfield. Leave at front door if no answer'),
  ((SELECT id FROM customers WHERE email = 'emily.rodriguez@email.com'), '2024-11-30T16:45:00Z', 'pending', 3600, 'Light chocolate drizzle', '789 Pine St, Springfield. Call upon arrival: (555) 345-6789');