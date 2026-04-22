import type { PageLoad } from './$types';
import { OrderService } from '$lib/services/orders';

export const load: PageLoad = async () => {
  try {
    const orders = await OrderService.getAllOrdersWithCustomer();
    
    return {
      orders
    };
  } catch (error) {
    console.error('Error loading orders:', error);
    return {
      orders: [],
      error: 'Failed to load orders'
    };
  }
};

// Load runs in the browser so Supabase has the admin session; SSR uses anon and RLS returns no rows
export const ssr = false;
export const prerender = false;

