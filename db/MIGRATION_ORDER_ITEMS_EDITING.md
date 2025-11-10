# Migration Guide: Order Items Editing Feature

This guide explains how to apply the database migrations for the Order Items Editing feature (Option B - Product Snapshot).

## Overview

This feature enables admins to:
- Edit items on an order (add/remove/replace)
- Change quantity and unit price for each item
- Override displayed item names
- Add notes to individual items
- Edit delivery fees
- Mark orders as "refund_due"

## Migration Files

The following migration files need to be run in order:

1. **orders_add_refund_status.sql** - Adds 'refund_due' status to orders
2. **order_items_add_snapshot.sql** - Adds product_snapshot and item_notes columns
3. **order_items_backfill_snapshot.sql** - Backfills snapshots for existing items
4. **update_order_with_items_rpc.sql** - Creates the RPC function for transactional updates

## How to Apply Migrations

### Option 1: Via Supabase SQL Editor (Recommended)

1. Log into your Supabase dashboard
2. Go to the SQL Editor
3. Run each migration file in order:

```sql
-- Step 1: Add refund_due status
-- Copy and paste contents of orders_add_refund_status.sql

-- Step 2: Add snapshot columns
-- Copy and paste contents of order_items_add_snapshot.sql

-- Step 3: Backfill existing data
-- Copy and paste contents of order_items_backfill_snapshot.sql

-- Step 4: Create RPC function
-- Copy and paste contents of update_order_with_items_rpc.sql
```

### Option 2: Via psql Command Line

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations in order
\i db/orders_add_refund_status.sql
\i db/order_items_add_snapshot.sql
\i db/order_items_backfill_snapshot.sql
\i db/update_order_with_items_rpc.sql
```

## Verification

After running the migrations, verify everything is set up correctly:

### 1. Check Column Additions

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
  AND column_name IN ('product_snapshot', 'item_notes');
```

Expected output:
```
column_name       | data_type
------------------+----------
product_snapshot  | jsonb
item_notes        | text
```

### 2. Check Status Constraint

```sql
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'orders_status_check';
```

Should include 'refund_due' in the status options.

### 3. Check RPC Function

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'update_order_with_items';
```

Expected output:
```
routine_name              | routine_type
--------------------------+-------------
update_order_with_items   | FUNCTION
```

### 4. Test Snapshot Backfill

```sql
SELECT 
  oi.id,
  oi.product_snapshot->>'name' as snapshot_name,
  p.name as product_name
FROM order_items oi
JOIN products p ON p.id = oi.product_id
LIMIT 5;
```

The `snapshot_name` should match `product_name` for existing items.

## Rollback (if needed)

If you need to rollback these changes:

```sql
-- Drop RPC function
DROP FUNCTION IF EXISTS public.update_order_with_items(UUID, JSONB, JSONB);

-- Remove columns from order_items
ALTER TABLE order_items DROP COLUMN IF EXISTS product_snapshot;
ALTER TABLE order_items DROP COLUMN IF EXISTS item_notes;

-- Restore original status constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'));
```

## Frontend Changes

The following frontend files have been updated:
- `src/lib/services/orders.ts` - Added types and RPC method
- `src/lib/services/products.ts` - Added product search method
- `src/routes/admin/orders/[id]/+page.svelte` - Complete UI overhaul for item editing

No additional configuration is needed for the frontend changes.

## Security Notes

1. The RPC function is marked as `SECURITY DEFINER` and granted to `authenticated` users
2. RLS policies already restrict order modifications to admins via the `is_admin()` function
3. Only admin users can access the admin order editing UI

## Testing Checklist

After migration, test the following:

- [ ] View an existing order in admin panel
- [ ] Click "Edit" on an order
- [ ] Add a new item to the order
- [ ] Remove an item from the order
- [ ] Replace an item with a different product
- [ ] Change quantity and price of an item
- [ ] Edit the display name of an item
- [ ] Add notes to an item
- [ ] Change the delivery fee
- [ ] Set status to "Refund Due"
- [ ] Save changes and verify totals recalculate correctly
- [ ] Verify the order displays correctly after refresh

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs for RPC errors
3. Verify RLS policies allow admin access
4. Ensure migrations were applied in the correct order

