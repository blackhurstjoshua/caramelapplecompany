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

-- Insert seed data for products (from your products.json)
INSERT INTO products (name, description, image_path, featured, price_cents) VALUES
  ('Classic Caramel Apple', 'Our signature crisp apple dipped in golden caramel and rolled in chopped pecans', 'products/classic-caramel.jpg', TRUE, 1200),
  ('Chocolate Drizzle Delight', 'Fresh apple with caramel coating drizzled with rich dark chocolate', 'products/chocolate-drizzle.jpg', TRUE, 1200),
  ('Vanilla Dream', 'Sweet apple dipped in smooth vanilla coating with a hint of Madagascar vanilla bean', 'products/vanilla-dream.jpg', FALSE, 1200),
  ('Cinnamon Sugar Crunch', 'Apple dipped in caramel and rolled in cinnamon sugar with graham cracker crumbs', 'products/cinnamon-crunch.jpg', FALSE, 1200);

-- Create index for better query performance
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_active ON products(is_active);