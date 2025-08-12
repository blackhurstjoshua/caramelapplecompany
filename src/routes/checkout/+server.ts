import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

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

  const { customer, retrieval, totals, cart } = body as {
    customer: { name: string; email?: string | null; phone?: string | null };
    retrieval: {
      method: 'pickup' | 'delivery';
      address?:
        | null
        | {
            addressLine1: string;
            addressLine2?: string;
            city: string;
            state: string;
            zip: string;
          };
      deliveryFee: number;
    };
    payment: { method: 'pickup' | 'stripe' };
    cart: Array<{
      id: string;
      flavorId: string;
      name: string;
      unitPrice: number;
      quantity: number;
    }>;
    totals: { subtotal: number; total: number };
  };

  try {
    // Upsert customer by email or phone
    let customerId: string | null = null;
    if (customer.email) {
      const { data: existingByEmail, error: emailErr } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customer.email)
        .maybeSingle();
      if (emailErr) throw emailErr;
      if (existingByEmail) customerId = existingByEmail.id;
    }
    if (!customerId && customer.phone) {
      const { data: existingByPhone, error: phoneErr } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customer.phone)
        .maybeSingle();
      if (phoneErr) throw phoneErr;
      if (existingByPhone) customerId = existingByPhone.id;
    }
    if (!customerId) {
      const { data: inserted, error: insertErr } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          email: customer.email ?? null,
          phone: customer.phone ?? null
        })
        .select('id')
        .single();
      if (insertErr) throw insertErr;
      customerId = inserted.id;
    }

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        retrieval_method: retrieval.method,
        delivery_fee: retrieval.deliveryFee,
        address: retrieval.address ?? null,
        subtotal: totals.subtotal,
        total: totals.total,
        payment_method: 'pickup'
      })
      .select('id')
      .single();
    if (orderErr) throw orderErr;

    const orderItems = cart.map((ci) => ({
      order_id: order.id,
      flavor_id: ci.flavorId,
      name: ci.name,
      unit_price: ci.unitPrice,
      quantity: ci.quantity
    }));
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) throw itemsErr;

    return json({ ok: true, orderId: order.id });
  } catch (e) {
    console.error('Checkout error', e);
    return new Response('Failed to save order', { status: 500 });
  }
};


