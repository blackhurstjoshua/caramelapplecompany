import type { CheckoutRequest } from '$lib/services/checkout';

export function formatAddress(address: NonNullable<CheckoutRequest['order']['address']>): string {
  let line = address.addressLine1;
  if (address.addressLine2) line += `, ${address.addressLine2}`;
  line += `\n${address.city}, ${address.state} ${address.zip}`;
  return line;
}

export function formatItemsHtml(items: CheckoutRequest['items']): string {
  return items
    .map(item => `<li>Product ID: ${item.product_id} &times; ${item.quantity}</li>`)
    .join('\n');
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
