-- Add product_snapshot and item_notes columns to order_items
-- This migration adds support for:
-- 1. product_snapshot: JSONB field to store product display data at time of order
-- 2. item_notes: TEXT field for admin notes on individual line items

-- Add new columns
ALTER TABLE order_items
  ADD COLUMN product_snapshot JSONB,
  ADD COLUMN item_notes TEXT;

-- Optional: lightweight check constraint to ensure core fields have expected types
ALTER TABLE order_items
  ADD CONSTRAINT chk_order_items_snapshot_types
  CHECK (
    product_snapshot IS NULL
    OR (
      (product_snapshot ? 'name') IS NOT TRUE OR jsonb_typeof(product_snapshot->'name') = 'string'
    )
  );

-- Create index for better query performance when filtering by product_snapshot fields
CREATE INDEX idx_order_items_product_snapshot ON order_items USING GIN (product_snapshot);

