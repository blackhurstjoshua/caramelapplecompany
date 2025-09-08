import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { createOrder, type CreateOrderRequest } from '$lib/services/orders';

export const POST = async ({ request, url }: RequestEvent) => {
  const isStripe = url.searchParams.has('stripe');
  const body = await request.json().catch(() => null);

  if (!body || !body.customer || !Array.isArray(body.cart)) {
    return new Response('Invalid payload', { status: 400 });
  }

  if (isStripe) {
    // TODO: Create Stripe Checkout Session and return URL
    return json({ checkoutUrl: null });
  }

  const orderRequest = body as CreateOrderRequest;

  try {
    const result = await createOrder(orderRequest);
    
    if (result.success) {
      return json({ ok: true, orderId: result.orderId });
    } else {
      return new Response(result.error || 'Failed to save order', { status: 500 });
    }
  } catch (e) {
    console.error('Checkout error', e);
    return new Response('Failed to save order', { status: 500 });
  }
};


