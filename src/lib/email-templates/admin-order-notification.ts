import type { CheckoutCustomer, CheckoutOrder, CheckoutItem } from '$lib/services/checkout';
import { formatAddress, formatDate, formatItemsHtml } from './helpers';

export function adminOrderNotificationEmail(
  customer: CheckoutCustomer,
  order: CheckoutOrder,
  items: CheckoutItem[],
  orderId: string
): { subject: string; html: string } {
  const shortId = orderId.slice(0, 8);

  const retrieval = order.retrieval_method === 'delivery'
    ? `Delivery to:\n${order.address ? formatAddress(order.address) : 'N/A'}`
    : 'Pickup';

  const subject = `New Order #${shortId} – ${customer.name}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
      <h1 style="color: #222; font-size: 24px;">New Order Received</h1>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Order ID</td>
          <td style="padding: 8px 0;">${orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Customer</td>
          <td style="padding: 8px 0;">${customer.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Email</td>
          <td style="padding: 8px 0;"><a href="mailto:${customer.email}">${customer.email}</a></td>
        </tr>
        ${customer.phone ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Phone</td>
          <td style="padding: 8px 0;"><a href="tel:${customer.phone}">${customer.phone}</a></td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">${order.retrieval_method === 'delivery' ? 'Delivery' : 'Pickup'} Date</td>
          <td style="padding: 8px 0;">${formatDate(order.delivery_date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Retrieval</td>
          <td style="padding: 8px 0;">${retrieval}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Payment</td>
          <td style="padding: 8px 0;">${order.payment_method === 'stripe' ? 'Paid online (Stripe)' : 'Pay on ' + order.retrieval_method}</td>
        </tr>
      </table>

      <h2 style="font-size: 16px; color: #222;">Items</h2>
      <ul style="padding-left: 20px; line-height: 1.8;">
        ${formatItemsHtml(items)}
      </ul>

      ${order.customizations ? `<p><strong>Special instructions:</strong> ${order.customizations}</p>` : ''}
    </div>
  `;

  return { subject, html };
}
