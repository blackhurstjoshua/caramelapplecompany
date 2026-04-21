-- Row Level Security — run this entire file once in the Supabase SQL Editor.
--
-- What RLS does: once enabled, every row access must pass a policy. With no policies,
-- nobody (except the service role / dashboard) can read or write that table via the API.
--
-- Prerequisites:
-- 1) Set SUPABASE_SERVICE_ROLE_KEY in your server env (SvelteKit checkout uses it).
-- 2) Ensure each admin has a row in public.profiles with role = 'admin' (see backfill below).

-- ---------------------------------------------------------------------------
-- profiles (admin flags — do not use JWT user_metadata for authorization)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Drop existing policies so this script is re-runnable
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles',
        'customers',
        'orders',
        'order_items',
        'products',
        'stores',
        'schedule'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname,
      r.schemaname,
      r.tablename
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_service_role_all"
  ON public.profiles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- customers / orders / order_items — no anon access (checkout uses service role)
-- ---------------------------------------------------------------------------
CREATE POLICY "customers_admin_all"
  ON public.customers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "orders_admin_all"
  ON public.orders FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "order_items_admin_all"
  ON public.order_items FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- products — public catalog reads active only; admins see and edit everything
-- ---------------------------------------------------------------------------
CREATE POLICY "products_public_read_active"
  ON public.products FOR SELECT TO anon
  USING (is_active = true);

-- Logged-in sessions use the authenticated role; catalog browsing only needs active rows.
CREATE POLICY "products_read_active_authenticated"
  ON public.products FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "products_admin_all"
  ON public.products FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- stores & schedule — public read; admin writes
-- ---------------------------------------------------------------------------
CREATE POLICY "stores_public_read"
  ON public.stores FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "stores_admin_write"
  ON public.stores FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "schedule_public_read"
  ON public.schedule FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "schedule_admin_write"
  ON public.schedule FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Harden SECURITY DEFINER RPC (only real admins, not anonymous callers)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_order_with_items(
  p_order_id UUID,
  p_order_updates JSONB,
  p_items JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subtotal INTEGER;
  v_delivery_fee INTEGER;
  v_tax INTEGER;
  v_result JSONB;
  v_item JSONB;
  v_id UUID;
  v_product_id UUID;
  v_quantity INTEGER;
  v_unit_price INTEGER;
  v_snapshot JSONB;
  v_notes TEXT;
  v_op TEXT;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  UPDATE orders SET
    delivery_date    = COALESCE((p_order_updates->>'delivery_date')::date, delivery_date),
    status           = COALESCE(p_order_updates->>'status', status),
    retrieval_method = COALESCE(p_order_updates->>'retrieval_method', retrieval_method),
    payment_method   = COALESCE(p_order_updates->>'payment_method', payment_method),
    address          = COALESCE(p_order_updates->'address', address),
    customizations   = COALESCE(p_order_updates->>'customizations', customizations),
    delivery_fee_cents = COALESCE((p_order_updates->>'delivery_fee_cents')::integer, delivery_fee_cents),
    updated_at       = NOW()
  WHERE id = p_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb)) LOOP
    v_op := v_item->>'op';

    IF v_op = 'delete' THEN
      v_id := (v_item->>'id')::uuid;
      DELETE FROM order_items WHERE id = v_id AND order_id = p_order_id;

    ELSIF v_op = 'upsert' THEN
      v_id := NULLIF(v_item->>'id', '')::uuid;
      v_product_id := (v_item->>'product_id')::uuid;
      v_quantity := COALESCE((v_item->>'quantity')::int, 1);
      v_unit_price := COALESCE((v_item->>'unit_price_cents')::int, 0);
      v_snapshot := v_item->'product_snapshot';
      v_notes := v_item->>'item_notes';

      IF v_snapshot IS NULL THEN
        SELECT jsonb_strip_nulls(jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'image_path', p.image_path,
          'price_cents', p.price_cents
        )) INTO v_snapshot
        FROM products p
        WHERE p.id = v_product_id;
      END IF;

      IF v_id IS NULL THEN
        INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents, product_snapshot, item_notes)
        VALUES (p_order_id, v_product_id, v_quantity, v_unit_price, v_snapshot, v_notes);
      ELSE
        UPDATE order_items
        SET product_id = v_product_id,
            quantity = v_quantity,
            unit_price_cents = v_unit_price,
            product_snapshot = v_snapshot,
            item_notes = v_notes
        WHERE id = v_id AND order_id = p_order_id;
      END IF;
    END IF;
  END LOOP;

  SELECT COALESCE(SUM(quantity * unit_price_cents), 0) INTO v_subtotal
  FROM order_items
  WHERE order_id = p_order_id;

  SELECT delivery_fee_cents INTO v_delivery_fee
  FROM orders
  WHERE id = p_order_id;

  IF p_order_updates ? 'tax_cents' THEN
    v_tax := COALESCE((p_order_updates->>'tax_cents')::integer, 0);
  ELSE
    v_tax := ROUND(v_subtotal * 0.08);
  END IF;

  UPDATE orders
  SET subtotal_cents = v_subtotal,
      tax_cents = v_tax,
      total_cents = v_subtotal + v_delivery_fee + v_tax,
      updated_at = NOW()
  WHERE id = p_order_id;

  SELECT to_jsonb(o) || jsonb_build_object(
    'order_items', (
      SELECT jsonb_agg(
        to_jsonb(oi) - 'products' || jsonb_build_object('product', to_jsonb(p))
      )
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = o.id
    )
  )
  INTO v_result
  FROM orders o
  WHERE o.id = p_order_id;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.update_order_with_items(UUID, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_order_with_items(UUID, JSONB, JSONB) TO authenticated;

-- ---------------------------------------------------------------------------
-- Backfill profiles for admins (one-time; safe to re-run)
-- Matches users that already have role = admin in auth metadata.
-- ---------------------------------------------------------------------------
INSERT INTO public.profiles (id, email, role)
SELECT u.id, u.email::text, 'admin'
FROM auth.users u
WHERE COALESCE(u.raw_app_meta_data->>'role', u.raw_user_meta_data->>'role') = 'admin'
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    role = 'admin',
    updated_at = NOW();
