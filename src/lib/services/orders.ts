import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Use raw Supabase client for this service to avoid wrapper issues
const supabaseClient = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

// Types for order creation
export interface CustomerData {
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface OrderAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface RetrievalData {
  method: 'pickup' | 'delivery';
  address?: OrderAddress | null;
  deliveryFee: number;
}

export interface CartItemData {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  total: number;
}

export interface CreateOrderRequest {
  customer: CustomerData;
  retrieval: RetrievalData;
  payment: { method: 'pickup' | 'stripe' };
  cart: CartItemData[];
  totals: OrderTotals;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Find or create a customer by email or phone
 */
async function upsertCustomer(customer: CustomerData): Promise<string> {
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
        email: customer.email ?? null,
        phone: customer.phone ?? null
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
 * Create a new order with items
 */
export async function createOrder(orderRequest: CreateOrderRequest): Promise<OrderResult> {
  try {
    // Upsert customer
    const customerId = await upsertCustomer(orderRequest.customer);

    // Create order
    const { data: order, error: orderErr } = await supabaseClient
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        retrieval_method: orderRequest.retrieval.method,
        delivery_fee: orderRequest.retrieval.deliveryFee,
        address: orderRequest.retrieval.address ?? null,
        subtotal: orderRequest.totals.subtotal,
        total: orderRequest.totals.total,
        payment_method: orderRequest.payment.method
      })
      .select('id')
      .single();

    if (orderErr) throw orderErr;
    if (!order) throw new Error('Failed to create order');


    // Create order items
    const orderItems = orderRequest.cart.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      unit_price_cents: Math.round(item.unitPrice * 100),
      quantity: item.quantity
    }));

    const { error: itemsErr } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsErr) throw itemsErr;

    return {
      success: true,
      orderId: order.id
    };

  } catch (error) {
    console.error('Order creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get order details by ID
 */
export async function getOrderById(orderId: string) {
  const { data: order, error: orderErr } = await supabaseClient
    .from('orders')
    .select(`
      *,
      customers (
        name,
        email,
        phone
      ),
      order_items (
        *,
        products (
          name,
          description
        )
      )
    `)
    .eq('id', orderId)
    .single();

  if (orderErr) throw orderErr;
  return order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: 'pending' | 'processing' | 'completed' | 'cancelled') {
  const { data, error } = await supabaseClient
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select('id, status')
    .single();

  if (error) throw error;
  return data;
}
