<script lang="ts">
  import type { OrderDetails } from '$lib/services/orders';
  import { formatPrice } from '$lib/utils/currency';
  
  interface Props {
    order: OrderDetails;
    invoiceNumber?: string;
  }
  
  let { order, invoiceNumber = `INV-${order.id.substring(0, 8).toUpperCase()}` }: Props = $props();
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function formatAddress(address: any): string[] {
    if (!address) return [];
    
    const lines = [
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.zip}`
    ].filter(Boolean);
    
    return lines;
  }
</script>

<div class="invoice-container">
  <!-- Header with Logo -->
  <header class="invoice-header">
    <img src="/logo.svg" alt="Caramel Apple Company" class="company-logo" />
    <div class="company-text">CARAMEL APPLE COMPANY</div>
    <div class="company-url">www.caramelapplecompany.com</div>
  </header>
  
  <!-- Customer and Invoice Info -->
  <section class="info-section">
    <div class="issued-to">
      <h3 class="section-title">ISSUED TO:</h3>
      <p class="customer-name">{order.customer.name}</p>
      {#if order.address && order.retrieval_method === 'delivery'}
        {#each formatAddress(order.address) as line}
          <p class="customer-detail">{line}</p>
        {/each}
      {/if}
      {#if order.customer.phone}
        <p class="customer-detail">{order.customer.phone}</p>
      {/if}
    </div>
    
    <div class="invoice-info">
      <h3 class="section-title">INVOICE NO:</h3>
      <p class="invoice-number">#{invoiceNumber}</p>
      <p class="invoice-date">{formatDate(order.order_date)}</p>
    </div>
  </section>
  
  <!-- Items Table -->
  <section class="items-section">
    <table class="items-table">
      <thead>
        <tr>
          <th class="th-description">DESCRIPTION</th>
          <th class="th-price">UNIT PRICE</th>
          <th class="th-qty">QTY</th>
          <th class="th-total">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {#each order.order_items as item}
          <tr>
            <td class="td-description">
              <div class="item-name">
                {item.product_snapshot?.name || item.product?.name || 'Unknown Product'}
              </div>
              {#if item.item_notes}
                <div class="item-notes">{item.item_notes}</div>
              {/if}
            </td>
            <td class="td-price">{formatPrice(item.unit_price_cents)}</td>
            <td class="td-qty">{item.quantity}</td>
            <td class="td-total">{formatPrice(item.unit_price_cents * item.quantity)}</td>
          </tr>
        {/each}
        
        {#if order.delivery_fee_cents > 0}
          <tr>
            <td class="td-description">
              <div class="item-name">Delivery charge</div>
            </td>
            <td class="td-price"></td>
            <td class="td-qty">n/a</td>
            <td class="td-total">{formatPrice(order.delivery_fee_cents)}</td>
          </tr>
        {/if}
        
        {#if order.customizations}
          <tr>
            <td class="td-description">
              <div class="item-name">Special Instructions</div>
              <div class="item-notes">{order.customizations}</div>
            </td>
            <td class="td-price"></td>
            <td class="td-qty"></td>
            <td class="td-total">Included</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </section>
  
  <!-- Totals Section -->
  <section class="totals-section">
    <div class="total-row main-total">
      <span class="total-label">TOTAL</span>
      <span class="total-value">{formatPrice(order.total_cents)}</span>
    </div>
    
    <div class="subtotals">
      <div class="subtotal-row">
        <span class="subtotal-label">Taxes</span>
        <span class="subtotal-value">$0.00</span>
      </div>
      <div class="subtotal-row">
        <span class="subtotal-label">Total</span>
        <span class="subtotal-value">{formatPrice(order.total_cents)}</span>
      </div>
      <div class="amount-due-row">
        <span class="amount-label">Amount due</span>
        <span class="amount-value">{formatPrice(order.total_cents)}</span>
      </div>
    </div>
  </section>
  
  <!-- Payment Details -->
  <section class="payment-section">
    <h3 class="payment-title">PAYMENT DETAILS</h3>
    <p class="payment-text">
      Payment Method: {order.payment_method === 'stripe' ? 'Card (Stripe)' : 'Pay on ' + (order.retrieval_method === 'pickup' ? 'Pickup' : 'Delivery')}
    </p>
    {#if order.retrieval_method === 'pickup'}
      <p class="payment-text">Pickup at store location</p>
    {:else}
      <p class="payment-text">Delivery Date: {formatDate(order.delivery_date)}</p>
    {/if}
  </section>
</div>

<style>
  .invoice-container {
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.5in 0.75in;
    background: white;
    color: #3a3a3a;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 10pt;
    line-height: 1.5;
  }
  
  /* Header with Logo */
  .invoice-header {
    text-align: center;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .company-logo {
    width: 120px;
    height: 120px;
    margin-bottom: 0.5rem;
    border: none;
    outline: none;
    display: block;
    shape-rendering: geometricPrecision;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .company-text {
    font-size: 9pt;
    letter-spacing: 2px;
    margin-top: 0.5rem;
    color: #3a3a3a;
  }
  
  .company-url {
    font-size: 8pt;
    color: #666;
    margin-top: 0.25rem;
  }
  
  /* Customer and Invoice Info Section */
  .info-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #3a3a3a;
  }
  
  .issued-to {
    flex: 1;
  }
  
  .invoice-info {
    text-align: right;
  }
  
  .section-title {
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 1px;
    margin: 0 0 0.75rem 0;
    color: #3a3a3a;
  }
  
  .customer-name {
    font-size: 10pt;
    margin: 0 0 0.25rem 0;
    color: #3a3a3a;
  }
  
  .customer-detail {
    font-size: 10pt;
    margin: 0.125rem 0;
    color: #3a3a3a;
  }
  
  .invoice-number {
    font-size: 10pt;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #3a3a3a;
  }
  
  .invoice-date {
    font-size: 10pt;
    margin: 0;
    color: #3a3a3a;
  }
  
  /* Items Table */
  .items-section {
    margin-bottom: 1.5rem;
  }
  
  .items-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
  }
  
  .items-table thead {
    border-bottom: 1px solid #3a3a3a;
  }
  
  .items-table th {
    padding: 0.5rem 0.5rem 0.75rem 0;
    text-align: left;
    font-weight: 600;
    font-size: 9pt;
    letter-spacing: 1px;
    color: #3a3a3a;
  }
  
  .items-table th.th-price,
  .items-table th.th-qty,
  .items-table th.th-total {
    text-align: right;
  }
  
  .items-table tbody tr {
    border-bottom: none;
  }
  
  .items-table td {
    padding: 1rem 0.5rem 1rem 0;
    color: #3a3a3a;
    vertical-align: top;
  }
  
  .td-price,
  .td-qty,
  .td-total {
    text-align: right;
  }
  
  .item-name {
    font-weight: 400;
    margin-bottom: 0.25rem;
  }
  
  .item-notes {
    font-size: 9pt;
    color: #666;
    margin-top: 0.25rem;
  }
  
  /* Totals Section */
  .totals-section {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #3a3a3a;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  
  .total-row.main-total {
    padding-bottom: 1rem;
    border-bottom: 1px solid #3a3a3a;
  }
  
  .total-label {
    font-size: 10pt;
    font-weight: 600;
    letter-spacing: 1px;
    color: #3a3a3a;
  }
  
  .total-value {
    font-size: 12pt;
    font-weight: 400;
    text-align: right;
    color: #3a3a3a;
  }
  
  .subtotals {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .subtotal-row,
  .amount-due-row {
    display: flex;
    justify-content: space-between;
    min-width: 250px;
  }
  
  .subtotal-label,
  .amount-label {
    font-size: 10pt;
    color: #3a3a3a;
  }
  
  .subtotal-value,
  .amount-value {
    font-size: 10pt;
    text-align: right;
    color: #3a3a3a;
  }
  
  .amount-due-row {
    margin-top: 0.5rem;
  }
  
  .amount-label {
    font-weight: 600;
  }
  
  .amount-value {
    font-weight: 600;
  }
  
  /* Payment Section */
  .payment-section {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .payment-title {
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 1px;
    margin: 0 0 0.75rem 0;
    color: #3a3a3a;
  }
  
  .payment-text {
    font-size: 10pt;
    margin: 0.25rem 0;
    color: #3a3a3a;
  }
  
  /* Print Styles */
  @media print {
    .invoice-container {
      padding: 0.5in;
      page-break-after: avoid;
    }
  }
</style>

