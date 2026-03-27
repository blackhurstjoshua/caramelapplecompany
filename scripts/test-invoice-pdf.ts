/**
 * Quick smoke test: generates a sample invoice PDF to verify pdfkit works locally.
 * Run with: npx tsx scripts/test-invoice-pdf.ts
 * Opens the resulting PDF file automatically on macOS.
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Minimal mock that satisfies OrderDetails
const mockOrder = {
  id: 'abcd1234-5678-9012-3456-789012345678',
  customer_id: 'cust-001',
  order_date: new Date().toISOString(),
  delivery_date: '2026-04-02',
  status: 'pending' as const,
  total_cents: 5180,
  subtotal_cents: 4500,
  tax_cents: 360,
  retrieval_method: 'delivery' as const,
  delivery_fee_cents: 1000,
  payment_method: 'stripe' as const,
  address: {
    addressLine1: '6229 West 10830 North',
    addressLine2: null,
    city: 'Highland',
    state: 'UT',
    zip: '84003'
  },
  customizations: 'Extra caramel drizzle on the green apple ones please!',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  customer: {
    id: 'cust-001',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '(801) 555-1234'
  },
  order_items: [
    {
      id: 'item-1',
      order_id: 'abcd1234-5678-9012-3456-789012345678',
      product_id: 'prod-1',
      quantity: 3,
      unit_price_cents: 1000,
      product_snapshot: { id: 'prod-1', name: 'Classic Caramel Apple' },
      item_notes: null,
      created_at: new Date().toISOString(),
      product: { id: 'prod-1', name: 'Classic Caramel Apple', description: null, image_path: null }
    },
    {
      id: 'item-2',
      order_id: 'abcd1234-5678-9012-3456-789012345678',
      product_id: 'prod-2',
      quantity: 1,
      unit_price_cents: 1500,
      product_snapshot: { id: 'prod-2', name: 'Turtle Pecan Caramel Apple' },
      item_notes: 'No nuts on one side',
      created_at: new Date().toISOString(),
      product: { id: 'prod-2', name: 'Turtle Pecan Caramel Apple', description: null, image_path: null }
    }
  ]
};

async function main() {
  // Dynamic import so SvelteKit env aliases don't matter for this script
  const { generateInvoicePdf } = await import('../src/lib/services/invoice-pdf.js');
  const pdfBuffer = await generateInvoicePdf(mockOrder as any);

  const outPath = resolve('test-invoice.pdf');
  writeFileSync(outPath, pdfBuffer);
  console.log(`PDF written to ${outPath} (${pdfBuffer.length} bytes)`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
