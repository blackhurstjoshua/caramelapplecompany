import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { CheckoutService, type CheckoutRequest, type CheckoutItem } from '$lib/services/checkout';
import { normalizeUsPhoneE164 } from '$lib/phone-us';

// Initialize Stripe with latest API version
const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
});

function checkoutItemsFromStripeLineItems(lineItems: Stripe.LineItem[]): CheckoutItem[] {
  const items: CheckoutItem[] = [];
  for (const li of lineItems) {
    const price = li.price;
    if (!price || typeof price === 'string') continue;
    const product = price.product;
    if (!product || typeof product === 'string' || product.deleted) continue;
    const productId = product.metadata?.product_id;
    if (!productId) continue;
    const qty = li.quantity ?? 1;
    items.push({ product_id: productId, quantity: qty });
  }
  return items;
}

async function resolveCheckoutItems(
  sessionId: string,
  metadata: Stripe.Metadata | null
): Promise<CheckoutItem[]> {
  try {
    const list = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 100,
      expand: ['data.price.product']
    });
    const fromStripe = checkoutItemsFromStripeLineItems(list.data ?? []);
    if (fromStripe.length > 0) {
      return fromStripe;
    }
  } catch (e) {
    console.warn('Could not rebuild cart from Stripe line items; falling back to metadata.items:', e);
  }

  try {
    return JSON.parse(metadata?.items || '[]') as CheckoutItem[];
  } catch {
    return [];
  }
}

// GET handler for verification/health check
export const GET = async () => {
  return json({ 
    status: 'ok', 
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
};

export const POST = async ({ request }: RequestEvent) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return json({ error: 'No signature provided' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET!);
    console.log(`📨 Webhook received: ${event.type}`);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log('🎯 Webhook received: checkout.session.completed');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Payment Status: ${session.payment_status}`);

    try {
      // Extract order details from metadata
      const metadata = session.metadata;
      
      if (!metadata) {
        console.error('❌ No metadata found in session');
        throw new Error('No metadata found in session');
      }

      console.log('📦 Metadata found:', Object.keys(metadata));

      const items = await resolveCheckoutItems(session.id, metadata);

      if (items.length === 0) {
        console.error('❌ No items from Stripe line items or session metadata');
        throw new Error('No items in order');
      }

      console.log(`📦 Processing order with ${items.length} items`);

      // Fallbacks from Stripe session in case some customer fields weren't passed via metadata
      const stripeCustomerEmail =
        metadata.customer_email ||
        session.customer_details?.email ||
        (typeof session.customer_email === 'string' ? session.customer_email : undefined);

      const rawPhone =
        metadata.customer_phone?.trim() ||
        session.customer_details?.phone?.trim() ||
        '';
      const stripeCustomerPhone = rawPhone ? normalizeUsPhoneE164(rawPhone) ?? undefined : undefined;

      const customerName =
        metadata.customer_name ||
        session.customer_details?.name ||
        'Customer';

      // Reconstruct the checkout request
      const checkoutRequest: CheckoutRequest = {
        customer: {
          name: customerName,
          email: stripeCustomerEmail || '',
          phone: stripeCustomerPhone,
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
        items: items,
        stripeCheckoutSessionId: session.id,
      };

      console.log('💳 Creating order for:', customerName);
      console.log(`   Delivery: ${metadata.delivery_date} (${metadata.retrieval_method})`);

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
      console.error('❌ Error processing webhook:', error);
      console.error('   Session ID:', session.id);
      console.error('   Error details:', error instanceof Error ? error.message : 'Unknown error');
      // Still return 200 to prevent Stripe from retrying
      // But log the error for manual investigation
      return json({ received: true, error: 'Processing failed - logged for review' });
    }
  }

  // Return 200 for other event types
  return json({ received: true });
};
