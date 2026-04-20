-- Run once on Supabase SQL editor (or your migration runner).
-- Enables idempotent Stripe webhook handling so the same Checkout Session is not processed twice.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_checkout_session_id_uidx
  ON orders (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
