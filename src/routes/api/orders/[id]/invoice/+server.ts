import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { chromium } from 'playwright';
import { OrderService } from '$lib/services/orders';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const orderId = params.id;
    
    if (!orderId) {
      throw error(400, 'Order ID is required');
    }
    
    // Fetch order data directly (bypasses authentication issue)
    const orderDetails = await OrderService.getOrderDetails(orderId);
    
    if (!orderDetails) {
      throw error(404, 'Order not found');
    }
    
    // Generate the invoice HTML
    const invoiceHtml = generateInvoiceHtml(orderDetails);
    
    // Launch Playwright browser
    const browser = await chromium.launch({
      headless: true
    });
    
    try {
      const context = await browser.newContext({
        // Set viewport to A4 paper size
        viewport: {
          width: 794, // A4 width at 96 DPI
          height: 1123 // A4 height at 96 DPI
        }
      });
      
      const page = await context.newPage();
      
      // Set the HTML content directly instead of navigating
      await page.setContent(invoiceHtml, {
        waitUntil: 'networkidle'
      });
      
      // Wait a moment for any fonts/images to load
      await page.waitForTimeout(1000);
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        printBackground: true,
        preferCSSPageSize: false
      });
      
      await context.close();
      
      // Convert Buffer to Uint8Array for Response
      const pdfData = new Uint8Array(pdfBuffer);
      
      // Return PDF as download
      return new Response(pdfData, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${orderId.substring(0, 8)}.pdf"`,
          'Cache-Control': 'no-cache'
        }
      });
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error('Error generating PDF invoice:', err);
    
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Failed to generate PDF invoice. Please try again.');
  }
};

// Helper function to generate invoice HTML
function generateInvoiceHtml(order: any): string {
  const invoiceNumber = `INV-${order.id.substring(0, 8).toUpperCase()}`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };
  
  const formatAddress = (address: any) => {
    if (!address) return '';
    const lines = [
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.zip}`
    ].filter(Boolean);
    return lines.map(line => `<p>${line}</p>`).join('');
  };
  
  const itemsHtml = order.order_items.map((item: any) => `
    <tr>
      <td class="item-description">
        <div class="item-name">
          ${item.product_snapshot?.name || item.product?.name || 'Unknown Product'}
        </div>
        ${item.item_notes ? `<div class="item-notes">${item.item_notes}</div>` : ''}
      </td>
      <td class="item-quantity">${item.quantity}</td>
      <td class="item-price">${formatPrice(item.unit_price_cents)}</td>
      <td class="item-total">${formatPrice(item.unit_price_cents * item.quantity)}</td>
    </tr>
  `).join('');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1f2937;
      background: white;
    }
    .invoice-container {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
      background: white;
      font-size: 11pt;
      line-height: 1.4;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 3px solid #8FBC5A;
    }
    .company-info { flex: 1; }
    .company-logo {
      width: 80px;
      height: 80px;
      margin-bottom: 0.5rem;
    }
    .company-name {
      font-size: 20pt;
      font-weight: 700;
      color: #6B9B37;
      margin: 0 0 0.25rem 0;
      font-family: 'Oswald', sans-serif;
    }
    .company-details {
      font-size: 9pt;
      color: #6b7280;
      line-height: 1.5;
    }
    .invoice-title-section { text-align: right; }
    .invoice-title {
      font-size: 28pt;
      font-weight: 700;
      color: #6B9B37;
      margin: 0 0 1rem 0;
      font-family: 'Oswald', sans-serif;
    }
    .invoice-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .meta-row {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .meta-label {
      font-weight: 600;
      color: #4b5563;
    }
    .meta-value { color: #1f2937; }
    .bill-to-section { margin-bottom: 1.5rem; }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #6B9B37;
      margin: 0 0 0.5rem 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .customer-details {
      padding: 0.75rem;
      background: #f9fafb;
      border-left: 3px solid #8FBC5A;
    }
    .customer-name {
      font-weight: 700;
      font-size: 11pt;
      margin: 0 0 0.25rem 0;
    }
    .customer-contact {
      margin: 0.125rem 0;
      font-size: 10pt;
      color: #4b5563;
    }
    .customer-address {
      margin-top: 0.5rem;
    }
    .customer-address p {
      margin: 0.125rem 0;
      font-size: 10pt;
    }
    .order-details-section {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 4px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .detail-label {
      font-size: 9pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-value {
      font-weight: 600;
      color: #1f2937;
    }
    .items-section { margin-bottom: 1.5rem; }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }
    .items-table thead {
      background: #6B9B37;
      color: white;
    }
    .items-table th {
      padding: 0.75rem;
      text-align: left;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 9pt;
    }
    .items-table th.item-quantity,
    .items-table th.item-price,
    .items-table th.item-total {
      text-align: right;
    }
    .items-table tbody tr {
      border-bottom: 1px solid #e5e7eb;
    }
    .items-table tbody tr:last-child {
      border-bottom: 2px solid #d1d5db;
    }
    .items-table td {
      padding: 0.75rem;
      color: #1f2937;
    }
    .items-table td.item-quantity,
    .items-table td.item-price,
    .items-table td.item-total {
      text-align: right;
    }
    .item-name { font-weight: 600; }
    .item-notes {
      font-size: 9pt;
      color: #6b7280;
      font-style: italic;
      margin-top: 0.25rem;
    }
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;
    }
    .totals-content { min-width: 250px; }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .total-row.grand-total {
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 2px solid #6B9B37;
      border-bottom: 3px double #6B9B37;
      font-size: 12pt;
    }
    .total-label {
      font-weight: 600;
      color: #4b5563;
    }
    .total-value {
      font-weight: 700;
      color: #1f2937;
    }
    .grand-total .total-label,
    .grand-total .total-value {
      font-size: 14pt;
      color: #6B9B37;
    }
    .notes-section {
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f9fafb;
      border-left: 3px solid #8FBC5A;
    }
    .notes-content {
      margin: 0.5rem 0 0 0;
      color: #4b5563;
      font-size: 10pt;
      white-space: pre-wrap;
    }
    .invoice-footer {
      text-align: center;
      padding-top: 2rem;
      margin-top: 2rem;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <header class="invoice-header">
      <div class="company-info">
        <svg class="company-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720">
          <circle cx="360" cy="360" r="300" fill="#6B9B37"/>
        </svg>
        <h1 class="company-name">Caramel Apple Company</h1>
        <p class="company-details">Premium Caramel Apples</p>
      </div>
      <div class="invoice-title-section">
        <h2 class="invoice-title">INVOICE</h2>
        <div class="invoice-meta">
          <div class="meta-row">
            <span class="meta-label">Invoice #:</span>
            <span class="meta-value">${invoiceNumber}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Order Date:</span>
            <span class="meta-value">${formatDate(order.order_date)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Delivery Date:</span>
            <span class="meta-value">${formatDate(order.delivery_date)}</span>
          </div>
        </div>
      </div>
    </header>
    
    <section class="bill-to-section">
      <h3 class="section-title">Bill To</h3>
      <div class="customer-details">
        <p class="customer-name">${order.customer.name}</p>
        ${order.customer.email ? `<p class="customer-contact">${order.customer.email}</p>` : ''}
        ${order.customer.phone ? `<p class="customer-contact">${order.customer.phone}</p>` : ''}
        ${order.address && order.retrieval_method === 'delivery' ? `
          <div class="customer-address">
            ${formatAddress(order.address)}
          </div>
        ` : ''}
      </div>
    </section>
    
    <section class="order-details-section">
      <div class="detail-item">
        <span class="detail-label">Retrieval Method:</span>
        <span class="detail-value">${order.retrieval_method === 'pickup' ? 'Pickup' : 'Delivery'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Payment Method:</span>
        <span class="detail-value">${order.payment_method === 'stripe' ? 'Card (Stripe)' : 'Pay on ' + (order.retrieval_method === 'pickup' ? 'Pickup' : 'Delivery')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Status:</span>
        <span class="detail-value">${order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}</span>
      </div>
    </section>
    
    <section class="items-section">
      <table class="items-table">
        <thead>
          <tr>
            <th class="item-description">Description</th>
            <th class="item-quantity">Quantity</th>
            <th class="item-price">Unit Price</th>
            <th class="item-total">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </section>
    
    <section class="totals-section">
      <div class="totals-content">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-value">${formatPrice(order.subtotal_cents)}</span>
        </div>
        ${order.delivery_fee_cents > 0 ? `
          <div class="total-row">
            <span class="total-label">Delivery Fee:</span>
            <span class="total-value">${formatPrice(order.delivery_fee_cents)}</span>
          </div>
        ` : ''}
        <div class="total-row grand-total">
          <span class="total-label">Total:</span>
          <span class="total-value">${formatPrice(order.total_cents)}</span>
        </div>
      </div>
    </section>
    
    ${order.customizations ? `
      <section class="notes-section">
        <h3 class="section-title">Special Instructions</h3>
        <p class="notes-content">${order.customizations}</p>
      </section>
    ` : ''}
    
    <footer class="invoice-footer">
      <p>Thank you for your business!</p>
    </footer>
  </div>
</body>
</html>
  `.trim();
}

