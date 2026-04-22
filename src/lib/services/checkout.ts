import { normalizeUsPhoneE164 } from '$lib/phone-us';
import { createServiceRoleClient } from '$lib/supabase-service-role';
import { CustomerService } from './customers';
import { OrderService, type CreateOrderItemData } from './orders';
import { EmailService } from './email';

function checkoutDb() {
  return createServiceRoleClient();
}

// Clean request interfaces
export interface CheckoutCustomer {
  name: string;
  email: string;
  phone?: string;
}

export interface CheckoutOrder {
  delivery_date: string; // YYYY-MM-DD format from selectedDate
  retrieval_method: 'pickup' | 'delivery';
  payment_method: 'pickup' | 'stripe';
  address?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zip: string;
  };
  customizations?: string;
}

export interface CheckoutItem {
  product_id: string;
  quantity: number;
}

export interface CheckoutRequest {
  customer: CheckoutCustomer;
  order: CheckoutOrder;
  items: CheckoutItem[];
  /**
   * Stripe `checkout.session.completed` only — set by the verified webhook handler.
   * Do not accept from the browser; the checkout route strips it for non-Stripe flows.
   */
  stripeCheckoutSessionId?: string;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
  errorType?: 'validation' | 'database' | 'network' | 'unknown';
}

/**
 * Main CheckoutService class - handles complete order creation flow
 */
export class CheckoutService {
  
  /**
   * Process a complete checkout request
   */
  static async processCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
    try {
      // Step 1: Validate the request
      const validation = this.validateCheckoutRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          errorType: 'validation'
        };
      }

      const db = checkoutDb();

      if (request.stripeCheckoutSessionId) {
        const existingId = await OrderService.getOrderIdByStripeSession(request.stripeCheckoutSessionId, db);
        if (existingId) {
          console.log(
            `Skipping checkout: Stripe session ${request.stripeCheckoutSessionId} already processed as order ${existingId}`
          );
          return { success: true, orderId: existingId };
        }
      }

      const phoneNormalized = request.customer.phone?.trim()
        ? normalizeUsPhoneE164(request.customer.phone)
        : undefined;
      const requestForNotifications: CheckoutRequest = {
        ...request,
        customer: {
          ...request.customer,
          phone: phoneNormalized ?? undefined
        }
      };

      // Step 2: Fetch current product prices from database (security)
      const itemsWithPrices = await this.enrichItemsWithPrices(request.items, db);
      if (!itemsWithPrices) {
        return {
          success: false,
          error: 'One or more products not found or inactive',
          errorType: 'validation'
        };
      }

      // Step 3: Calculate totals
      const totals = this.calculateTotals(itemsWithPrices, request.order.retrieval_method);

      // Step 4: Find or create customer
      const customerId = await CustomerService.upsertCustomer(
        {
          ...requestForNotifications.customer,
          phone: requestForNotifications.customer.phone ?? null
        },
        db
      );

      // Step 5: Create order
      let orderId: string;
      try {
        orderId = await OrderService.createOrder(
          {
            customer_id: customerId,
            delivery_date: request.order.delivery_date,
            total_cents: totals.totalCents,
            subtotal_cents: totals.subtotalCents,
            tax_cents: totals.taxCents,
            retrieval_method: request.order.retrieval_method,
            delivery_fee_cents: totals.deliveryFeeCents,
            payment_method: request.order.payment_method,
            address: request.order.address,
            customizations: request.order.customizations,
            stripe_checkout_session_id: request.stripeCheckoutSessionId ?? null
          },
          db
        );
      } catch (err: unknown) {
        const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: string }).code) : '';
        if (code === '23505' && request.stripeCheckoutSessionId) {
          const existingId = await OrderService.getOrderIdByStripeSession(request.stripeCheckoutSessionId, db);
          if (existingId) {
            console.log(
              `Race on Stripe session ${request.stripeCheckoutSessionId}; order ${existingId} already created — skipping notifications`
            );
            return { success: true, orderId: existingId };
          }
        }
        throw err;
      }

      // Step 6: Create order items
      const orderItems: CreateOrderItemData[] = itemsWithPrices.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_cents: item.price_cents
      }));

      await OrderService.createOrderItems(orderItems, db);

      const invoiceAttachment = await EmailService.generateInvoiceAttachment(orderId, db);

      await Promise.all([
        EmailService.sendOrderConfirmationToCustomer(requestForNotifications, orderId, invoiceAttachment),
        EmailService.sendOrderNotificationToAdmin(requestForNotifications, orderId, invoiceAttachment)
      ]);

      // SMS: set SMS_ORDER_NOTIFICATIONS_ENABLED=true and wire SmsService when Twilio / 10DLC is approved.

      return {
        success: true,
        orderId
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('CheckoutService error:', error);
      if (
        message.includes('stripe_checkout_session') ||
        message.includes('column') ||
        message.includes('schema cache')
      ) {
        console.error(
          'Hint: If you added Stripe idempotency, run the SQL in db/add_stripe_checkout_session_id.sql on your Supabase database.'
        );
      }
      return {
        success: false,
        error: message || 'An unexpected error occurred',
        errorType: 'unknown'
      };
    }
  }

  /**
   * Validate the checkout request
   */
  private static validateCheckoutRequest(request: CheckoutRequest): { isValid: boolean; error?: string } {
    // Customer validation
    if (!request.customer.name?.trim()) {
      return { isValid: false, error: 'Customer name is required' };
    }

    if (!request.customer.email?.trim()) {
      return { isValid: false, error: 'Email address is required' };
    }

    if (request.customer.phone?.trim()) {
      if (!normalizeUsPhoneE164(request.customer.phone)) {
        return {
          isValid: false,
          error: 'Enter a valid US phone number (10 digits), or leave the field blank.'
        };
      }
    }

    // Order validation
    if (!request.order.delivery_date) {
      return { isValid: false, error: 'Delivery date is required' };
    }

    if (request.order.retrieval_method === 'delivery' && !request.order.address) {
      return { isValid: false, error: 'Address is required for delivery orders' };
    }

    // Items validation
    if (!request.items?.length) {
      return { isValid: false, error: 'At least one item is required' };
    }

    for (const item of request.items) {
      if (!item.product_id || item.quantity < 1) {
        return { isValid: false, error: 'Invalid item data' };
      }
    }

    return { isValid: true };
  }

  /**
   * Fetch current prices from database and enrich items
   */
  private static async enrichItemsWithPrices(
    items: CheckoutItem[],
    db: ReturnType<typeof checkoutDb>
  ): Promise<Array<CheckoutItem & { price_cents: number; product_name: string }> | null> {
    const productIds = items.map((item) => item.product_id);

    const { data: products, error } = await db
      .from('products')
      .select('id, name, price_cents, is_active')
      .in('id', productIds)
      .eq('is_active', true);

    if (error) throw error;
    if (!products || products.length !== productIds.length) {
      return null; // Some products not found or inactive
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    return items.map((item) => {
      const p = productMap.get(item.product_id)!;
      return {
        ...item,
        price_cents: p.price_cents,
        product_name: p.name
      };
    });
  }

  /**
   * Calculate order totals including tax
   */
  private static calculateTotals(
    items: Array<CheckoutItem & { price_cents: number; product_name: string }>,
    retrievalMethod: string
  ) {
    const subtotal_cents = items.reduce((sum, item) => 
      sum + (item.price_cents * item.quantity), 0);
    
    const delivery_fee_cents = retrievalMethod === 'delivery' ? 1000 : 0; // $10.00 in cents
    
    // Use OrderService to calculate tax and total
    return OrderService.calculateOrderTotals(subtotal_cents, delivery_fee_cents);
  }

}
