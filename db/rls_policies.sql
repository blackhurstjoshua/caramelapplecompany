-- Row Level Security Policies for Caramel Apple Company

-- Enable RLS on tables that need protection
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Leave schedule unrestricted (public read-only data)
-- ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================
-- CUSTOMERS TABLE POLICIES
-- ======================

-- Admins can do everything with customers
CREATE POLICY "Admins can manage customers" ON customers
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Website can create customers (for new orders)
CREATE POLICY "Website can create customers" ON customers
  FOR INSERT TO anon
  WITH CHECK (true);

-- ======================
-- ORDERS TABLE POLICIES  
-- ======================

-- Admins can do everything with orders
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Website can create orders
CREATE POLICY "Website can create orders" ON orders
  FOR INSERT TO anon
  WITH CHECK (true);

-- ======================
-- ORDER_ITEMS TABLE POLICIES
-- ======================

-- Admins can do everything with order items
CREATE POLICY "Admins can manage order_items" ON order_items
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Website can create order items
CREATE POLICY "Website can create order_items" ON order_items
  FOR INSERT TO anon
  WITH CHECK (true);

-- ======================
-- PRODUCTS TABLE POLICIES
-- ======================

-- Admins can do everything with products
CREATE POLICY "Admins can manage products" ON products
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Website can read products (for displaying catalog)
CREATE POLICY "Public can view products" ON products
  FOR SELECT TO anon
  USING (is_active = true);

-- ======================
-- SCHEDULE TABLE POLICIES
-- ======================

-- Schedule stays unrestricted for now (public data)
-- But if you want to restrict editing:

ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;

-- Public can read schedule
CREATE POLICY "Public can view schedule" ON schedule
  FOR SELECT TO anon
  USING (true);

-- Only admins can modify schedule
CREATE POLICY "Admins can manage schedule" ON schedule
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update schedule" ON schedule
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete schedule" ON schedule
  FOR DELETE TO authenticated
  USING (is_admin());
