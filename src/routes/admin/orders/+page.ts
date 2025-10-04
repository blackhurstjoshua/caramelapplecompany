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

// Disable prerendering for admin pages
export const ssr = true;
export const prerender = false;

