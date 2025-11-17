### Admin Order Items Editing — Option B (Product Snapshot)

Goal
- Enable admins to edit items on an order (add/remove/replace, change qty and unit price, override displayed item name) without loading the full catalog client-side.
- Keep product linkage for reporting while allowing per-order overrides and stable rendering when products change later.

Scope Summary
- DB: Add `order_items.product_snapshot JSONB`, optional `order_items.item_notes TEXT`. Backfill snapshot for existing items.
- API: Create a Postgres function (RPC) `update_order_with_items` that applies order + items changes transactionally and recalculates totals.
- FE: Extend admin order details page to edit items with a typeahead product picker (server-filtered), quantity/price inputs, optional display name override, and add/remove controls.
- Services/Types: Add a search method for products, a single `OrderService.updateOrderWithItems` that calls the RPC, and extend types to include `productSnapshot`.

---

### 1) Current Schema (for reference)

Tables (existing):

```sql
-- orders (key fields used here)
id UUID PRIMARY KEY,
delivery_date DATE NOT NULL,
status VARCHAR(20) NOT NULL CHECK (status IN ('pending','processing','completed','cancelled')),
total_cents INTEGER NOT NULL,
subtotal_cents INTEGER NOT NULL DEFAULT 0,
retrieval_method VARCHAR(20) NOT NULL CHECK (retrieval_method IN ('pickup','delivery')),
delivery_fee_cents INTEGER NOT NULL DEFAULT 0,
payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('pickup','stripe')),
address JSONB,
customizations TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```

```sql
-- order_items
id UUID PRIMARY KEY,
order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
quantity INTEGER NOT NULL DEFAULT 1,
unit_price_cents INTEGER NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW()
```

```sql
-- products (key fields used here)
id UUID PRIMARY KEY,
name VARCHAR(255) NOT NULL,
description TEXT,
image_path VARCHAR(500),
price_cents INTEGER NOT NULL,
is_active BOOLEAN DEFAULT TRUE
```

---

### 2) Proposed Schema Changes (Option B)

Add per-line snapshot and optional notes:

```sql
-- 2.1 Add snapshot + notes columns
ALTER TABLE order_items
  ADD COLUMN product_snapshot JSONB,
  ADD COLUMN item_notes TEXT;

-- 2.2 Optional: lightweight check constraints (lenient on structure)
-- Ensures core fields—if present—are of expected types
ALTER TABLE order_items
  ADD CONSTRAINT chk_order_items_snapshot_types
  CHECK (
    product_snapshot IS NULL
    OR (
      (product_snapshot ? 'name') IS NOT TRUE OR jsonb_typeof(product_snapshot->'name') = 'string'
    )
  );
```

Backfill snapshots for existing items (best-effort):

```sql
-- 2.3 Backfill product_snapshot for existing rows
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
```

Notes
- Keep `product_id NOT NULL` for reporting and consistency.
- `product_snapshot` stores display fields for stability and optional overrides (at minimum include `name`; others are optional).

---

### 3) RPC: Transactional Update with Recalculation

Function name
- `public.update_order_with_items`

Parameters
- `p_order_id UUID`: target order ID.
- `p_order_updates JSONB`: partial order updates. Supported keys:
  - `delivery_date` (YYYY-MM-DD), `status`, `retrieval_method`, `payment_method`, `address` (JSON), `customizations`.
- `p_items JSONB`: array of item operations:
  - Each element shape:
    - `op`: 'upsert' | 'delete'
    - For 'upsert': `{ op: 'upsert', id?: UUID, product_id: UUID, quantity: number, unit_price_cents: number, product_snapshot?: JSONB, item_notes?: string }`
      - If `id` is present → update that row; else insert new row.
      - If `product_snapshot` not provided → server will snapshot from `products` by `product_id`.
    - For 'delete': `{ op: 'delete', id: UUID }` (removes that row).

Return
- JSONB with updated order summary and items (or just `{ success: true }`). Returning data is optional since the UI can reload; include data for convenience.

Implementation (PL/pgSQL)

```sql
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

      IF v_snapshot IS NULL THEN
        -- Snapshot from current product fields
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

  -- 3) Recalculate totals
  SELECT COALESCE(SUM(quantity * unit_price_cents), 0) INTO v_subtotal
  FROM order_items
  WHERE order_id = p_order_id;

  UPDATE orders
  SET subtotal_cents = v_subtotal,
      total_cents = v_subtotal + delivery_fee_cents,
      updated_at = NOW()
  WHERE id = p_order_id;

  -- 4) Return updated order summary (optional)
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
```

Security/Ownership
- Mark as `SECURITY DEFINER` and ensure the function owner has privileges to bypass RLS or that your RLS allows admins to perform updates. Limit access to this RPC to admin contexts.

---

### 4) Frontend/Service Changes

Types
- Extend item type to include `productSnapshot` (note: in `src/lib/services/orders.ts`, items are currently joined with `product` but do not expose `product_snapshot`).

```ts
// src/lib/services/orders.ts additions (types)
export interface ProductSnapshot {
  id: string;
  name: string;
  description?: string | null;
  image_path?: string | null;
  price_cents?: number | null;
}

export interface OrderItemWithProductAndSnapshot extends OrderItemWithProduct {
  product_snapshot?: ProductSnapshot | null;
  item_notes?: string | null;
}
```

Product search (server-filtered, small result set)

```ts
// New helper in products service
// Returns minimal fields needed for replace flow
async function searchProductsByName(term: string): Promise<Array<{
  id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  price_cents: number;
}>> {
  const { data, error } = await supabaseClient
    .from('products')
    .select('id, name, description, image_path, price_cents')
    .ilike('name', `%${term}%`)
    .eq('is_active', true)
    .limit(10);
  if (error) throw error;
  return data || [];
}
```

Order update with items (RPC)

```ts
// src/lib/services/orders.ts additions
type ItemOp =
  | { op: 'delete'; id: string }
  | {
      op: 'upsert';
      id?: string;
      product_id: string;
      quantity: number;
      unit_price_cents: number;
      product_snapshot?: ProductSnapshot;
      item_notes?: string | null;
    };

type OrderUpdatesPayload = Partial<{
  delivery_date: string; // YYYY-MM-DD
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  retrieval_method: 'pickup' | 'delivery';
  payment_method: 'pickup' | 'stripe';
  address: any;
  customizations: string | null;
}>;

export async function updateOrderWithItems(
  orderId: string,
  orderUpdates: OrderUpdatesPayload,
  itemOps: ItemOp[]
): Promise<any> {
  const { data, error } = await supabaseClient.rpc(
    'update_order_with_items',
    {
      p_order_id: orderId,
      p_order_updates: orderUpdates,
      p_items: itemOps
    }
  );
  if (error) throw error;
  return data;
}
```

UI updates (admin order details page)
- In `src/routes/admin/orders/[id]/+page.svelte`, when `isEditMode`:
  - Replace the static items table with an editable table:
    - Fields per row: Product label (from `product_snapshot.name` if set else `product.name`), Quantity (number), Unit Price (money), Subtotal (read-only), Actions (Replace, Remove), optional “Edit label” input bound to `product_snapshot.name`.
  - Add “Add Item” button → opens a modal with typeahead search using `searchProductsByName`.
  - “Replace” opens the same modal to swap the product (updates `product_id` and refreshes snapshot/price).
  - Recalculate subtotal/total client-side for preview; final source of truth is server recalculation.
  - On Save, build `itemOps` delta:
    - Existing rows changed → `op: 'upsert', id`
    - New rows → `op: 'upsert'` (no `id`)
    - Removed rows → `op: 'delete', id`
  - Call `updateOrderWithItems` with order header updates + `itemOps`; on success, refresh.

Validation rules (client)
- `quantity >= 1`
- `unit_price_cents >= 0`
- Optional warning if `payment_method='stripe'` and `status='completed'` while changing prices.

---

### 5) Authorization & Policies

- Prefer calling the RPC from a trusted context (admin or server-only). If calling directly from the browser:
  - Ensure RLS allows admin users to update `orders` and `order_items` (check `db/rls_policies.sql`).
  - The function is `SECURITY DEFINER`; restrict RPC execute permission to admin role only.
- If you manage admins via Supabase Auth, grant execute on `update_order_with_items` to the admin Postgres role or expose via a server-side endpoint.

---

### 6) Migration Order

1) Add columns (`product_snapshot`, `item_notes`).
2) Backfill snapshots from `products`.
3) Create the RPC function.
4) Grant execute privileges on the function to the admin role.
5) Deploy FE changes (types, services, UI).

Rollback
- Safe to drop the function, drop the new columns. Recompute totals not required for rollback (no change to data semantics).

---

### 7) Edge Cases

- Replacing product after typing a custom label: keep the custom label unless the admin deliberately resets it.
- Products deactivated after ordering: still selectable via ID if replacing with a precise search? Recommended: only show `is_active = true` in search.
- Delivery fee changes: totals recompute uses current `delivery_fee_cents`, so ensure the header updates reflect intended fee before save.
- Concurrent admin edits: last save wins. Consider disabling Save if stale (`updated_at` mismatch) or show a warning.

---

### 8) QA Checklist

- Add, update, and remove items; verify DB rows in `order_items` reflect changes.
- Change quantity and unit price; verify `subtotal_cents` and `total_cents` recompute correctly.
- Replace product and confirm snapshot is updated; edit snapshot name and verify the label persists after product edits in catalog.
- Switch retrieval method pickup/delivery; address optionality behaves as expected.
- Stripe/completed orders: price change flow displays the intended warnings (business rule).
- RLS: Non-admin cannot call the RPC; admin can.

---

### 9) Implementation Notes

- Keep `product_id` as the canonical linkage for reporting; use `product_snapshot` only for display and stability.
- The RPC recalculation is authoritative; client preview is just for UX.
- If needed later, add an index on `order_items(order_id)` (likely already present via FK) for performance; current dataset should be fine.


