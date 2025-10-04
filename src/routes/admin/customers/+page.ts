import type { PageLoad } from './$types';
import { CustomerService } from '$lib/services/customers';

export const load: PageLoad = async () => {
  try {
    const customers = await CustomerService.getAllCustomers();
    
    return {
      customers
    };
  } catch (error) {
    console.error('Error loading customers:', error);
    return {
      customers: [],
      error: 'Failed to load customers'
    };
  }
};

// Disable prerendering for admin pages
export const ssr = true;
export const prerender = false;

