import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

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
      const customerId = await this.upsertCustomer(request.customer);

      // Step 5: Create order
      const orderId = await this.createOrder(customerId, request.order, totals);

      // Step 6: Create order items
      await this.createOrderItems(orderId, itemsWithPrices);

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

  /**
   * Find or create customer
   */
  private static async upsertCustomer(customer: CheckoutCustomer): Promise<string> {
    let customerId: string | null = null;

    // Try to find existing customer by email
    if (customer.email) {
      const { data: existingByEmail, error: emailErr } = await supabaseClient
        .from('customers')
        .select('id')
        .eq('email', customer.email)
        .maybeSingle();
      
      if (emailErr) throw emailErr;
      if (existingByEmail) customerId = existingByEmail.id;
    }

    // Try to find existing customer by phone if not found by email
    if (!customerId && customer.phone) {
      const { data: existingByPhone, error: phoneErr } = await supabaseClient
        .from('customers')
        .select('id')
        .eq('phone', customer.phone)
        .maybeSingle();
      
      if (phoneErr) throw phoneErr;
      if (existingByPhone) customerId = existingByPhone.id;
    }

    // Create new customer if not found
    if (!customerId) {
      const { data: inserted, error: insertErr } = await supabaseClient
        .from('customers')
        .insert({
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone || null
        })
        .select('id')
        .single();
      
      if (insertErr) throw insertErr;
      if (!inserted) throw new Error('Failed to create customer');
      customerId = inserted.id;
    }

    if (!customerId) throw new Error('Failed to get customer ID');
    return customerId;
  }

  /**
   * Create order record
   */
  private static async createOrder(
    customerId: string, 
    order: CheckoutOrder, 
    totals: { subtotal_cents: number; delivery_fee_cents: number; total_cents: number }
  ): Promise<string> {
    const { data: orderRecord, error: orderErr } = await supabaseClient
      .from('orders')
      .insert({
        customer_id: customerId,
        delivery_date: order.delivery_date,
        status: 'pending',
        total_cents: totals.total_cents,
        subtotal_cents: totals.subtotal_cents,
        retrieval_method: order.retrieval_method,
        delivery_fee_cents: totals.delivery_fee_cents,
        payment_method: order.payment_method,
        address: order.address || null,
        customizations: order.customizations || null
      })
      .select('id')
      .single();

    if (orderErr) throw orderErr;
    if (!orderRecord) throw new Error('Failed to create order');
    
    return orderRecord.id;
  }

  /**
   * Create order items
   */
  private static async createOrderItems(
    orderId: string, 
    items: Array<CheckoutItem & { price_cents: number }>
  ): Promise<void> {
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      unit_price_cents: item.price_cents,
      quantity: item.quantity
    }));

    const { error: itemsErr } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsErr) throw itemsErr;
  }
}
