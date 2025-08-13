-- Create customers table (without total_orders)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert seed data for customers (without total_orders)
INSERT INTO customers (name, email, phone, join_date) VALUES
  ('Sarah Johnson', 'sarah.johnson@email.com', '(555) 123-4567', '2024-10-15T10:30:00Z'),
  ('Mike Chen', 'mike.chen@email.com', '(555) 234-5678', '2024-11-02T14:20:00Z'),
  ('Emily Rodriguez', 'emily.rodriguez@email.com', '(555) 345-6789', '2024-11-20T09:15:00Z');