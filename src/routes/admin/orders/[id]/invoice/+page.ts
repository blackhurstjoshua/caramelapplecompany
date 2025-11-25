import type { PageLoad } from './$types';
import { OrderService } from '$lib/services/orders';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
  try {
    const orderId = params.id;
    
    // Load order details with customer and order items
    const orderDetails = await OrderService.getOrderDetails(orderId);
    
    if (!orderDetails) {
      throw error(404, 'Order not found');
    }
    
    return {
      order: orderDetails
    };
  } catch (err) {
    console.error('Error loading order details for invoice:', err);
    if (err && typeof err === 'object' && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    throw error(500, 'Failed to load order details');
  }
};

export const ssr = true;
export const prerender = false;

