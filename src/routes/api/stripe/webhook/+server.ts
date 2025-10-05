import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { CheckoutService, type CheckoutRequest, type CheckoutItem } from '$lib/services/checkout';

// Initialize Stripe with latest API version
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover'
});

export const POST = async ({ request }: RequestEvent) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return json({ error: 'No signature provided' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Extract order details from metadata
      const metadata = session.metadata;
      
      if (!metadata) {
        throw new Error('No metadata found in session');
      }

      // Parse items from metadata
      const items: CheckoutItem[] = JSON.parse(metadata.items || '[]');

      // Reconstruct the checkout request
      const checkoutRequest: CheckoutRequest = {
        customer: {
          name: metadata.customer_name,
          email: metadata.customer_email || undefined,
          phone: metadata.customer_phone || undefined,
        },
        order: {
          delivery_date: metadata.delivery_date,
          retrieval_method: metadata.retrieval_method as 'pickup' | 'delivery',
          payment_method: 'stripe',
          address: metadata.address_line1 ? {
            addressLine1: metadata.address_line1,
            addressLine2: metadata.address_line2 || undefined,
            city: metadata.address_city,
            state: metadata.address_state,
            zip: metadata.address_zip,
          } : undefined,
          customizations: metadata.customizations || undefined,
        },
        items: items
      };

      // Process the checkout (creates customer, order, and order items)
      const result = await CheckoutService.processCheckout(checkoutRequest);

      if (result.success) {
        console.log(`✅ Order created successfully from Stripe payment: ${result.orderId}`);
        console.log(`   Stripe Session ID: ${session.id}`);
        console.log(`   Payment Intent: ${session.payment_intent}`);
      } else {
        console.error(`❌ Failed to create order from Stripe payment:`, result.error);
        // Note: Payment was successful, but order creation failed
        // You should handle this edge case (e.g., retry logic, alert admin)
      }

      return json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  }

  // Return 200 for other event types
  return json({ received: true });
};
