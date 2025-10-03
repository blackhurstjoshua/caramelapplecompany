import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { CheckoutService, type CheckoutRequest } from '$lib/services/checkout';

export const POST = async ({ request, url }: RequestEvent) => {
  const isStripe = url.searchParams.has('stripe');
  
  try {
    const body = await request.json();
    
    if (!body) {
      return json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    if (isStripe) {
      // TODO: Create Stripe Checkout Session and return URL
      return json({ checkoutUrl: null });
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


