import type { CheckoutCustomer, CheckoutOrder, CheckoutItem } from '$lib/services/checkout';
import { formatAddress, formatDate } from '$lib/email-templates/helpers';

const SUPPORT_PHONE = '(801) 787-7288';

export function orderConfirmationSmsBody(
  order: CheckoutOrder,
): string {
  const paymentMethodMsg = order.payment_method === 'stripe' ? 'paid online (Stripe)' : `will be paid on pickup`;

  return (
    `Thank you so much! Your caramel apple order has been received and ${paymentMethodMsg}!` + 
    ` If you have questions related to your order please contact ${SUPPORT_PHONE}.` +
    ` Our team will reach out shortly to confirm order details and answer questions.`
  );
}

export function adminOrderSmsBody(
  customer: CheckoutCustomer,
  order: CheckoutOrder,
  items: Array<CheckoutItem & { product_name: string }>,
  orderId: string
): string {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const lines = items.map((i) => `• ${i.product_name} ×${i.quantity}`).join('\n');
  const retrieval =
    order.retrieval_method === 'delivery'
      ? `Delivery\n${order.address ? formatAddress(order.address) : 'N/A'}`
      : 'Pickup';
  const pay =
    order.payment_method === 'stripe' ? 'Paid online (Stripe)' : `Pay on ${order.retrieval_method}`;

  let body =
    `New order #${shortId}\n` +
    `${customer.name}\n` +
    `${customer.email}` +
    (customer.phone ? `\n${customer.phone}` : '') +
    `\n${formatDate(order.delivery_date)} · ${retrieval}\n` +
    `${pay}\n\n` +
    `Items:\n${lines}`;

  if (order.customizations?.trim()) {
    body += `\n\nNotes: ${order.customizations.trim()}`;
  }

  body += `\n\nFull ID: ${orderId}`;
  return body;
}
