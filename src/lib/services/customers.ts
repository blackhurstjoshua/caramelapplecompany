import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Use raw Supabase client for this service
const supabaseClient = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

// Customer interfaces
export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithStats {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  join_date: string;
  created_at: string;
  updated_at: string;
  total_orders: number;
  total_spent_cents: number;
  last_order_date: string | null;
}

export interface CreateCustomerData {
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string | null;
  phone?: string | null;
}

/**
 * Customer service - handles all customer CRUD operations
 */
export class CustomerService {

  /**
   * Get all customers (basic info only)
   */
  static async getAllCustomers(): Promise<Customer[]> {
    const { data, error } = await supabaseClient
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get customer by ID (basic info only)
   */
  static async getCustomerById(customerId: string): Promise<Customer | null> {
    const { data, error } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  /**
   * Get customer with statistics (for customer details view)
   */
  static async getCustomerWithStats(customerId: string): Promise<CustomerWithStats | null> {
    // Get customer basic info
    const customer = await this.getCustomerById(customerId);
    if (!customer) return null;

    // Get customer statistics from orders
    const { data: stats, error: statsError } = await supabaseClient
      .from('orders')
      .select('total_cents, order_date')
      .eq('customer_id', customerId);

    if (statsError) throw statsError;

    const orders = stats || [];
    const total_orders = orders.length;
    const total_spent_cents = orders.reduce((sum, order) => sum + order.total_cents, 0);
    const last_order_date = orders.length > 0 
      ? orders.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())[0].order_date
      : null;

    return {
      ...customer,
      total_orders,
      total_spent_cents,
      last_order_date
    };
  }

  /**
   * Get customer's orders
   */
  static async getCustomerOrders(customerId: string) {
    const { data, error } = await supabaseClient
      .from('orders')
      .select(`
        id,
        order_date,
        delivery_date,
        status,
        total_cents,
        subtotal_cents,
        delivery_fee_cents,
        retrieval_method,
        payment_method,
        customizations
      `)
      .eq('customer_id', customerId)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Find or create customer (used by checkout)
   */
  static async upsertCustomer(customerData: CreateCustomerData): Promise<string> {
    let customerId: string | null = null;

    // Try to find existing customer by email
    if (customerData.email) {
      const { data: existingByEmail, error: emailErr } = await supabaseClient
        .from('customers')
        .select('id')
        .eq('email', customerData.email)
        .maybeSingle();
      
      if (emailErr) throw emailErr;
      if (existingByEmail) customerId = existingByEmail.id;
    }

    // Try to find existing customer by phone if not found by email
    if (!customerId && customerData.phone) {
      const { data: existingByPhone, error: phoneErr } = await supabaseClient
        .from('customers')
        .select('id')
        .eq('phone', customerData.phone)
        .maybeSingle();
      
      if (phoneErr) throw phoneErr;
      if (existingByPhone) customerId = existingByPhone.id;
    }

    // Create new customer if not found
    if (!customerId) {
      const { data: inserted, error: insertErr } = await supabaseClient
        .from('customers')
        .insert({
          name: customerData.name,
          email: customerData.email || null,
          phone: customerData.phone || null
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
   * Create new customer
   */
  static async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    const { data, error } = await supabaseClient
      .from('customers')
      .insert({
        name: customerData.name,
        email: customerData.email || null,
        phone: customerData.phone || null
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update customer
   */
  static async updateCustomer(customerId: string, updates: UpdateCustomerData): Promise<Customer> {
    const { data, error } = await supabaseClient
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete customer (admin only - be careful with orders!)
   */
  static async deleteCustomer(customerId: string): Promise<void> {
    // Check if customer has orders first
    const { data: orders, error: ordersError } = await supabaseClient
      .from('orders')
      .select('id')
      .eq('customer_id', customerId)
      .limit(1);

    if (ordersError) throw ordersError;
    
    if (orders && orders.length > 0) {
      throw new Error('Cannot delete customer with existing orders');
    }

    const { error } = await supabaseClient
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) throw error;
  }

  /**
   * Search customers by name, email, or phone
   */
  static async searchCustomers(query: string): Promise<Customer[]> {
    const { data, error } = await supabaseClient
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
