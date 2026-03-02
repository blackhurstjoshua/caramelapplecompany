import type { CheckoutCustomer, CheckoutOrder } from '$lib/services/checkout';
import { formatAddress, formatDate } from './helpers';

export function orderConfirmationEmail(
  customer: CheckoutCustomer,
  order: CheckoutOrder,
  orderId: string
): { subject: string; html: string } {
  const shortId = orderId.slice(0, 8);

  const retrieval = order.retrieval_method === 'delivery'
    ? `Delivery to: ${order.address ? formatAddress(order.address) : 'address on file'}`
    : 'Pickup';

  const subject = `Order Confirmed – Caramel Apple Co. (#${shortId})`;

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
      <h1 style="color: #222; font-size: 24px;">Thank you, ${customer.name}!</h1>
      <p>Your order with Caramel Apple Co. has been confirmed.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Order ID</td>
          <td style="padding: 8px 0;">${shortId}</td>
        </tr>
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
          <td style="padding: 8px 0;">${order.payment_method === 'stripe' ? 'Paid online' : 'Pay on ' + order.retrieval_method}</td>
        </tr>
      </table>

      ${order.customizations ? `<p><strong>Special instructions:</strong> ${order.customizations}</p>` : ''}

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

      <h2 style="font-size: 16px; color: #222;">What happens next?</h2>
      <ol style="padding-left: 20px; line-height: 1.8;">
        <li>We'll prepare your order for ${formatDate(order.delivery_date)}.</li>
        <li>${order.retrieval_method === 'delivery' ? "We'll deliver it to the address you provided." : "Pick up your order at:<br/><strong>6229 West 10830 North<br/>Highland, UT 84003</strong>"}</li>
        <li>If we have any questions, we'll reach out to you.</li>
      </ol>

      <p style="margin-top: 24px; font-size: 14px; color: #666;">
        Questions? Reply to this email or call us at (801) 787-7288.
      </p>

      <p style="margin-top: 32px; font-size: 13px; color: #999;">
        &mdash; Caramel Apple Co.
      </p>
    </div>
  `;

  return { subject, html };
}
