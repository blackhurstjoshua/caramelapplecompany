import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { CustomerService } from './customers';
import { OrderService, type CreateOrderItemData } from './orders';

// Use raw Supabase client for this service
const supabaseClient = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

// Clean request interfaces
export interface CheckoutCustomer {
  name: string;
  email?: string;
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

      // Step 2: Fetch current product prices from database (security)
      const itemsWithPrices = await this.enrichItemsWithPrices(request.items);
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
      const customerId = await CustomerService.upsertCustomer(request.customer);

      // Step 5: Create order
      const orderId = await OrderService.createOrder({
        customer_id: customerId,
        delivery_date: request.order.delivery_date,
        total_cents: totals.total_cents,
        subtotal_cents: totals.subtotal_cents,
        retrieval_method: request.order.retrieval_method,
        delivery_fee_cents: totals.delivery_fee_cents,
        payment_method: request.order.payment_method,
        address: request.order.address,
        customizations: request.order.customizations
      });

      // Step 6: Create order items
      const orderItems: CreateOrderItemData[] = itemsWithPrices.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_cents: item.price_cents
      }));
      
      await OrderService.createOrderItems(orderItems);

      return {
        success: true,
        orderId
      };

    } catch (error) {
      console.error('CheckoutService error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
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

    if (!request.customer.email?.trim() && !request.customer.phone?.trim()) {
      return { isValid: false, error: 'Either email or phone is required' };
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
  private static async enrichItemsWithPrices(items: CheckoutItem[]): Promise<Array<CheckoutItem & { price_cents: number }> | null> {
    const productIds = items.map(item => item.product_id);
    
    const { data: products, error } = await supabaseClient
      .from('products')
      .select('id, price_cents, is_active')
      .in('id', productIds)
      .eq('is_active', true);

    if (error) throw error;
    if (!products || products.length !== productIds.length) {
      return null; // Some products not found or inactive
    }

    // Create map for quick lookup
    const priceMap = new Map(products.map(p => [p.id, p.price_cents]));

    // Enrich items with current prices
    return items.map(item => ({
      ...item,
      price_cents: priceMap.get(item.product_id)!
    }));
  }

  /**
   * Calculate order totals
   */
  private static calculateTotals(items: Array<CheckoutItem & { price_cents: number }>, retrievalMethod: string) {
    const subtotal_cents = items.reduce((sum, item) => 
      sum + (item.price_cents * item.quantity), 0);
    
    const delivery_fee_cents = retrievalMethod === 'delivery' ? 1000 : 0; // $10.00 in cents
    const total_cents = subtotal_cents + delivery_fee_cents;

    return {
      subtotal_cents,
      delivery_fee_cents,
      total_cents
    };
  }

}
