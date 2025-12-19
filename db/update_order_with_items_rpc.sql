-- RPC function for transactional order and order_items updates
-- This function allows admins to update order header fields and 
-- add/update/delete order items in a single atomic transaction

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
  -- 1) Update order header (only allowed fields)
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

  -- 2) Apply item operations
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

      -- If snapshot not provided, snapshot from current product fields
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
        -- Insert new item
        INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents, product_snapshot, item_notes)
        VALUES (p_order_id, v_product_id, v_quantity, v_unit_price, v_snapshot, v_notes);
      ELSE
        -- Update existing item
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

  -- 3) Recalculate totals
  SELECT COALESCE(SUM(quantity * unit_price_cents), 0) INTO v_subtotal
  FROM order_items
  WHERE order_id = p_order_id;

  -- Get current delivery fee (may have been updated in step 1)
  SELECT delivery_fee_cents INTO v_delivery_fee
  FROM orders
  WHERE id = p_order_id;

  -- Calculate tax (8%)
  v_tax := ROUND(v_subtotal * 0.08);

  UPDATE orders
  SET subtotal_cents = v_subtotal,
      tax_cents = v_tax,
      total_cents = v_subtotal + v_delivery_fee + v_tax,
      updated_at = NOW()
  WHERE id = p_order_id;

  -- 4) Return updated order summary
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

-- Grant execute permission to authenticated users (admins will be checked via RLS)
GRANT EXECUTE ON FUNCTION public.update_order_with_items(UUID, JSONB, JSONB) TO authenticated;

