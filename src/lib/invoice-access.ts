export function invoiceNumber(orderId: string): string {
  return `INV-${orderId.slice(0, 8).toUpperCase()}`;
}

function toBase64(value: string): string {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(value);
  }
  return Buffer.from(value).toString('base64');
}

export function createInvoiceAccessToken(orderId: string): string {
  return toBase64(`${orderId}:${Date.now()}`);
}

export function buildInvoiceUrl(orderId: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const token = createInvoiceAccessToken(orderId);
  return `${base}/invoice/${orderId}?token=${token}`;
}
