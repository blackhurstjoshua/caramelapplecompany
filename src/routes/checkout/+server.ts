import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { CheckoutService, type CheckoutRequest } from '$lib/services/checkout';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with latest API version
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover'
});

// Initialize Supabase client for fetching product data
const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export const POST = async ({ request, url }: RequestEvent) => {
  const isStripe = url.searchParams.has('stripe');
  
  try {
    const body = await request.json();
    
    if (!body) {
      return json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    if (isStripe) {
      // Create Stripe Checkout Session
      const checkoutRequest = body as CheckoutRequest;
      
      // Validate required fields
      if (!checkoutRequest.customer || !checkoutRequest.order || !Array.isArray(checkoutRequest.items)) {
        return json({ 
          success: false, 
          error: 'Invalid payload structure' 
        }, { status: 400 });
      }

      // Fetch actual product data from database for security
      const productIds = checkoutRequest.items.map(item => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price_cents, is_active')
        .in('id', productIds)
        .eq('is_active', true);

      if (productsError || !products || products.length !== productIds.length) {
        return json({ 
          success: false, 
          error: 'One or more products not found or unavailable' 
        }, { status: 400 });
      }

      // Create a map for quick product lookup
      const productMap = new Map(products.map(p => [p.id, p]));

      // Calculate totals and create line items
      const deliveryFee = checkoutRequest.order.retrieval_method === 'delivery' ? 10 : 0;
      
      // Create line items for Stripe with actual product data
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      
      // Add product line items with real prices from database
      for (const item of checkoutRequest.items) {
        const product = productMap.get(item.product_id);
        if (!product) {
          return json({ 
            success: false, 
            error: `Product ${item.product_id} not found` 
          }, { status: 400 });
        }

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
            },
            unit_amount: product.price_cents,
          },
          quantity: item.quantity,
        });
      }
      
      // Add delivery fee if applicable
      if (deliveryFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Delivery Fee',
            },
            unit_amount: deliveryFee * 100, // Convert to cents
          },
          quantity: 1,
        });
      }

      // Get the origin for redirect URLs
      const origin = url.origin;

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout`,
        customer_email: checkoutRequest.customer.email,
        metadata: {
          // Store order details in metadata to retrieve in webhook
          customer_name: checkoutRequest.customer.name,
          customer_email: checkoutRequest.customer.email || '',
          customer_phone: checkoutRequest.customer.phone || '',
          delivery_date: checkoutRequest.order.delivery_date,
          retrieval_method: checkoutRequest.order.retrieval_method,
          payment_method: 'stripe',
          address_line1: checkoutRequest.order.address?.addressLine1 || '',
          address_line2: checkoutRequest.order.address?.addressLine2 || '',
          address_city: checkoutRequest.order.address?.city || '',
          address_state: checkoutRequest.order.address?.state || '',
          address_zip: checkoutRequest.order.address?.zip || '',
          customizations: checkoutRequest.order.customizations || '',
          // Store cart items as JSON string (Stripe metadata has 500 char limit per value)
          items: JSON.stringify(checkoutRequest.items),
        },
      });

      return json({ checkoutUrl: session.url });
    }

    // Validate required fields for checkout request
    if (!body.customer || !body.order || !Array.isArray(body.items)) {
      return json({ 
        success: false, 
        error: 'Invalid payload structure. Expected customer, order, and items fields.' 
      }, { status: 400 });
    }

    const checkoutRequest = body as CheckoutRequest;
    const result = await CheckoutService.processCheckout(checkoutRequest);
    
    if (result.success) {
      return json({ 
        success: true, 
        orderId: result.orderId 
      });
    } else {
      // Return appropriate status based on error type
      const status = result.errorType === 'validation' ? 400 : 500;
      return json({ 
        success: false, 
        error: result.error,
        errorType: result.errorType 
      }, { status });
    }
    
  } catch (error) {
    console.error('Checkout server error:', error);
    return json({ 
      success: false, 
      error: 'An unexpected error occurred while processing your order',
      errorType: 'unknown'
    }, { status: 500 });
  }
};


