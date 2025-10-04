import type { PageLoad } from './$types';
import { CustomerService } from '$lib/services/customers';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
  try {
    const customerId = params.id;
    
    // Load customer with stats and their orders
    const [customerWithStats, customerOrders] = await Promise.all([
      CustomerService.getCustomerWithStats(customerId),
      CustomerService.getCustomerOrders(customerId)
    ]);
    
    if (!customerWithStats) {
      throw error(404, 'Customer not found');
    }
    
    return {
      customer: customerWithStats,
      orders: customerOrders
    };
  } catch (err) {
    console.error('Error loading customer details:', err);
    if (err && typeof err === 'object' && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    throw error(500, 'Failed to load customer details');
  }
};

export const ssr = true;
export const prerender = false;
