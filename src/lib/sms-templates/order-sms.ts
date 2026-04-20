import type { CheckoutCustomer, CheckoutOrder, CheckoutItem } from '$lib/services/checkout';
import { formatAddress, formatDate } from '$lib/email-templates/helpers';

const SUPPORT_PHONE = '(801) 787-7288';

export function orderConfirmationSmsBody(
  customer: CheckoutCustomer,
  order: CheckoutOrder,
  orderId: string
): string {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const when = formatDate(order.delivery_date);
  const retrieval =
    order.retrieval_method === 'delivery'
      ? 'Delivery — see your email for address details.'
      : 'Pickup at 6229 West 10830 North, Highland, UT 84003';

  return (
    `Thanks ${customer.name}! Order #${shortId} is confirmed for ${when}. ${retrieval} ` +
    `Questions? ${SUPPORT_PHONE} — Caramel Apple Co.`
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
