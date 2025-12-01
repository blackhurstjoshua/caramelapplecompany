import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Use raw Supabase client for this service
const supabaseClient = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

// Order interfaces
export interface Order {
  id: string;
  customer_id: string;
  order_date: string;
  delivery_date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refund_due';
  total_cents: number;
  subtotal_cents: number;
  retrieval_method: 'pickup' | 'delivery';
  delivery_fee_cents: number;
  payment_method: 'pickup' | 'stripe';
  address: any; // JSONB
  customizations: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithCustomer extends Order {
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

export interface ProductSnapshot {
  id: string;
  name: string;
  description?: string | null;
  image_path?: string | null;
  price_cents?: number | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  product_snapshot?: ProductSnapshot | null;
  item_notes?: string | null;
  created_at: string;
}

export interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string;
    name: string;
    description: string | null;
    image_path: string | null;
  };
}

export interface OrderDetails extends OrderWithCustomer {
  order_items: OrderItemWithProduct[];
}

export interface CreateOrderData {
  customer_id: string;
  delivery_date: string;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refund_due';
  total_cents: number;
  subtotal_cents: number;
  retrieval_method: 'pickup' | 'delivery';
  delivery_fee_cents: number;
  payment_method: 'pickup' | 'stripe';
  address?: any;
  customizations?: string | null;
}

export interface CreateOrderItemData {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Order service - handles all order CRUD operations
 */
export class OrderService {

  /**
   * Get all orders with customer info (for admin orders list)
   */
  static async getAllOrdersWithCustomer(): Promise<OrderWithCustomer[]> {
    const { data, error } = await supabaseClient
      .from('orders')
      .select(`
        *,
        customer:customers (
          id,
          name,
          email,
          phone
        )
      `)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get order by ID (basic info only)
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  /**
   * Get order details with customer and order items (for order details view)
   */
  static async getOrderDetails(orderId: string): Promise<OrderDetails | null> {
    try {
      // Get the order first
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        if (orderError.code === 'PGRST116') return null; // Not found
        throw orderError;
      }

      if (!order) return null;

      // Get the customer
      const { data: customer, error: customerError } = await supabaseClient
        .from('customers')
        .select('id, name, email, phone')
        .eq('id', order.customer_id)
        .single();

      if (customerError) {
        console.error('Error fetching customer:', customerError);
        throw customerError;
      }

      // Get the order items with products
      const { data: orderItems, error: itemsError } = await supabaseClient
        .from('order_items')
        .select(`
          *,
          products (
            id,
            name,
            description,
            image_path
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        throw itemsError;
      }

      // Combine the data
      const result: OrderDetails = {
        ...order,
        customer,
        order_items: (orderItems || []).map(item => ({
          ...item,
          product: item.products
        }))
      };

      return result;
    } catch (error) {
      console.error('Error in getOrderDetails:', error);
      throw error;
    }
  }

  /**
   * Create new order (used by checkout service)
   */
  static async createOrder(orderData: CreateOrderData): Promise<string> {
    const { data, error } = await supabaseClient
      .from('orders')
      .insert({
        customer_id: orderData.customer_id,
        delivery_date: orderData.delivery_date,
        status: orderData.status || 'pending',
        total_cents: orderData.total_cents,
        subtotal_cents: orderData.subtotal_cents,
        retrieval_method: orderData.retrieval_method,
        delivery_fee_cents: orderData.delivery_fee_cents,
        payment_method: orderData.payment_method,
        address: orderData.address || null,
        customizations: orderData.customizations || null
      })
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create order');
    
    return data.id;
  }

  /**
   * Create order items (used by checkout service)
   */
  static async createOrderItems(orderItems: CreateOrderItemData[]): Promise<void> {
    const { error } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (error) throw error;
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refund_due'): Promise<Order> {
    const { data, error } = await supabaseClient
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update order details
   */
  static async updateOrder(orderId: string, updates: Partial<CreateOrderData>): Promise<Order> {
    const { data, error } = await supabaseClient
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete order (admin only - be careful!)
   */
  static async deleteOrder(orderId: string): Promise<void> {
    // Order items will be deleted automatically due to CASCADE
    const { error } = await supabaseClient
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;
  }

  /**
   * Search orders by customer name, email, or phone
   */
  static async searchOrders(query: string): Promise<OrderWithCustomer[]> {
    const searchTerm = `%${query}%`;
    
    // Search customers by name, email, or phone
    const { data: customersData } = await supabaseClient
      .from('customers')
      .select('id')
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`);

    const customerIds = customersData?.map(c => c.id) || [];
    
    // If customers found, fetch their orders
    if (customerIds.length > 0) {
      const { data, error } = await supabaseClient
        .from('orders')
        .select(`
          *,
          customer:customers (
            id,
            name,
            email,
            phone
          )
        `)
        .in('customer_id', customerIds)
        .order('order_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
    
    return [];
  }

  /**
   * Update order with items using RPC (transactional)
   * This method allows updating order header and items in a single atomic transaction
   */
  static async updateOrderWithItems(
    orderId: string,
    orderUpdates: OrderUpdatesPayload,
    itemOps: ItemOp[]
  ): Promise<any> {
    const { data, error } = await supabaseClient.rpc(
      'update_order_with_items',
      {
        p_order_id: orderId,
        p_order_updates: orderUpdates,
        p_items: itemOps
      }
    );
    if (error) throw error;
    return data;
  }
}

// Types for updateOrderWithItems RPC
export type ItemOp =
  | { op: 'delete'; id: string }
  | {
      op: 'upsert';
      id?: string;
      product_id: string;
      quantity: number;
      unit_price_cents: number;
      product_snapshot?: ProductSnapshot;
      item_notes?: string | null;
    };

export type OrderUpdatesPayload = Partial<{
  delivery_date: string; // YYYY-MM-DD
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refund_due';
  retrieval_method: 'pickup' | 'delivery';
  payment_method: 'pickup' | 'stripe';
  address: any;
  customizations: string | null;
  delivery_fee_cents: number;
}>;
