-- Backfill product_snapshot for existing order_items
-- This populates the snapshot from the current product data (best-effort)

UPDATE order_items oi
SET product_snapshot = jsonb_strip_nulls(jsonb_build_object(
  'id', p.id,
  'name', p.name,
  'description', p.description,
  'image_path', p.image_path,
  'price_cents', p.price_cents
))
FROM products p
WHERE oi.product_id = p.id
  AND (oi.product_snapshot IS NULL OR oi.product_snapshot = 'null'::jsonb);

