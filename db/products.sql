-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_path VARCHAR(500), -- Path in Supabase Storage bucket
  featured BOOLEAN DEFAULT FALSE,
  price_cents INTEGER NOT NULL, -- Price in cents (pennies)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_active ON products(is_active);